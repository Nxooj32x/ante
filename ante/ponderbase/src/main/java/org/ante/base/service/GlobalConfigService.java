package org.ante.base.service;

import org.ante.base.utils.Constant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.support.ResourcePropertySource;
import org.springframework.stereotype.Service;

import javax.servlet.ServletContext;
import java.io.IOException;
import java.net.URL;
import java.util.Map;

/**
 * Created by tao on 2017/3/31.
 */
@Service
public class GlobalConfigService {
    private static Logger log = LoggerFactory.getLogger(GlobalConfigService.class);

    @Autowired
    Environment environment;

    public void reloadGlobalConfig(ServletContext servletContext) throws IOException {
        String path = environment.getProperty(Constant.SystemParam.CONTEXT_PARAM_PROPERTIES);
        ResourcePropertySource propertySource = new ResourcePropertySource(path);
        String value = (String) propertySource.getProperty(Constant.SystemParam.LOAD_CONFIGS);
        String[] paths = value.split(Constant.SystemParam.SPILT_CONFIGS);

        if (paths != null) {
            for (String p : paths) {
                ResourcePropertySource resourcePropertySource = new ResourcePropertySource("classpath:properties/" + p + "/me.properties");
                Map<String, Object> source = resourcePropertySource.getSource();
                log.info("init system config "+p+" {}",source);
                servletContext.removeAttribute(p);
                servletContext.setAttribute(p, source);
            }
        }
    }
}
