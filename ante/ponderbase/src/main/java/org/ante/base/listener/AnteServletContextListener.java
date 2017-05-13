package org.ante.base.listener;

import org.ante.base.service.GlobalConfigService;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.IOException;

/**
 * Created by tao on 2017/3/30.
 */
public class AnteServletContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        WebApplicationContext applicationContext = WebApplicationContextUtils.getWebApplicationContext(servletContextEvent.getServletContext());
        if (applicationContext != null) {
            GlobalConfigService globalConfigService = applicationContext.getBean(GlobalConfigService.class);
            ServletContext servletContext = servletContextEvent.getServletContext();
            try {
                globalConfigService.reloadGlobalConfig(servletContext);
            } catch (IOException e) {
            }
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }
}
