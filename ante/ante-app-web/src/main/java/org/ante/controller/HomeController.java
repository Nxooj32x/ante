package org.ante.controller;

import org.ante.base.model.MessageBean;
import org.ante.base.controller.BaseController;
import org.ante.user.model.Role;
import org.ante.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by tao on 2016/11/19.
 */
@Controller
public class HomeController extends BaseController {


//    @Autowired
//    private ProducerService producerService;
//
//    @Qualifier("adapterQueue")
//    @Autowired
//    private Destination adapterQueue;
//
//    @Autowired
//    private CacheService cacheService;

    @Autowired
    private UserService userService;

    @RequestMapping(value = "/welcome",method = RequestMethod.GET)
    public String welcome(HttpServletRequest request, HttpServletResponse response){
//        EmailBean mailBean = new EmailBean("136992347@qq.com","1154016697@qq.com","主题","内容");
//        producerService.sendEmailMessage(adapterQueue,mailBean);
        return "/index";
    }


    @RequestMapping(value = "/visit",method = RequestMethod.GET)
    public String visit(HttpServletRequest request, HttpServletResponse response){
        return "/view/index";
    }

    @RequestMapping(value = "/template",method = RequestMethod.GET)
    public String profile(HttpServletRequest request, HttpServletResponse response){
        return "/view/main/template";
    }

    @RequestMapping(value = "/container/{m}",method = RequestMethod.GET)
    public String container(HttpServletRequest request, HttpServletResponse response,@PathVariable String m){
        request.setAttribute("module",m);
        return "/view/main/sub/container";
    }


    @RequestMapping(value = "/admin",method = RequestMethod.GET)
    public String admin(HttpServletRequest request, HttpServletResponse response){
        return "/admin/index";
    }


    @RequestMapping(value = "/type/{t}",method = RequestMethod.GET)
    public String type(HttpServletRequest request, HttpServletResponse response, @PathVariable String t){
        request.setAttribute("test",t);
        return "/admin/store/common/sub/container";
    }



    //------------------------------------------ajax------------------------------------------------------------

    @RequestMapping(value = "/resource/{id}",method = RequestMethod.GET,consumes="application/json",produces="application/json")
    @ResponseBody
    public Object get(HttpServletRequest request, HttpServletResponse response, @PathVariable String id,@RequestParam String a,@RequestParam String b){

        return new MessageBean(true,new String[]{a,b});
    }


    @RequestMapping(value = "/resource/{id}",method = RequestMethod.PUT,consumes="application/json",produces="application/json")
    @ResponseBody
    public Object put(HttpServletRequest request, HttpServletResponse response, @PathVariable String id,@RequestBody Role role){

        return new MessageBean(true,role);
    }


    @RequestMapping(value = "/resource/{id}",method = RequestMethod.POST,consumes="application/json",produces="application/json")
    @ResponseBody
    public Object post(HttpServletRequest request, HttpServletResponse response, @PathVariable String id,@RequestBody Role role){
        return new MessageBean(true,role);
    }


    @RequestMapping(value = "/resource/{id}",method = RequestMethod.DELETE,consumes="application/json",produces="application/json")
    @ResponseBody
    public Object delete(HttpServletRequest request, HttpServletResponse response, @PathVariable String id,@RequestBody Role role){
        return new MessageBean(true,role);
    }

}
