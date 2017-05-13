package org.ante.controller;

import org.ante.base.model.MessageBean;
import org.ante.user.model.UserProperty;
import org.ante.user.model.User;
import org.ante.user.service.UserPropertyService;
import org.ante.user.service.UserService;
import org.ante.base.controller.BaseController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by tao on 2017/3/20.
 */
@Controller
@RequestMapping("/user")
public class UserPropertyController extends BaseController {
    @Autowired
    private UserPropertyService userPropertyService;

    @Autowired
    private UserService userService;

    @RequestMapping(value = "/{userid}/property/{type}",method = RequestMethod.GET)
    @ResponseBody
    private Object getUserSkillByUser(HttpServletRequest request, HttpServletResponse response, @PathVariable Integer userid,@PathVariable String type ){
        User user = userService.getUserById(userid);
        UserProperty userProperty = userPropertyService.getPropertyByUserAndType(user,type);
        return  new MessageBean(true,userProperty);
    }
}
