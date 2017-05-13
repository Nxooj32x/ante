package org.ante.base.controller;

import org.ante.base.model.MessageBean;
import org.ante.base.service.GlobalConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Created by tao on 2017/3/31.
 */
@Controller
@RequestMapping(value = "/api")
public class GlobalConfigController {

    @Autowired
    GlobalConfigService globalConfigService;

    @RequestMapping(value = "/globalconfig", method = RequestMethod.GET)
    @ResponseBody
    public Object reloadGlobalConfig(HttpServletRequest request) {
        ServletContext servletContext = request.getSession().getServletContext();
        try {
            globalConfigService.reloadGlobalConfig(servletContext);
        } catch (IOException e) {
            return new MessageBean(true, "fetch is error");
        }
        return new MessageBean(true, "fetch is success");
    }
}
