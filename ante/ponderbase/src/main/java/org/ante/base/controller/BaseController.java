/*
 * Copyright (C), 2002-2013, 苏宁易购电子商务有限公司
 * FileName: BaseController.java
 * Author:   12061772
 * Date:     2013-7-22 上午9:33:11
 * Description: Controller基类     
 * History: //修改记录
 * <author>      <time>      <version>    <desc>
 * 修改人姓名             修改时间            版本号                  描述
 */
package org.ante.base.controller;

import com.google.gson.Gson;
import org.ante.base.exception.AppException;
import org.ante.base.exception.DaoException;
import org.ante.base.exception.ServiceException;
import org.ante.base.exception.WebException;
import org.ante.base.model.ErrorMsg;
import org.ante.base.utils.StringUtil;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.ServletRequestDataBinder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.InitBinder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.beans.PropertyEditorSupport;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * 〈Controller基类〉
 * 
 * @author 12061772
 * @see [相关类/方法]（可选）
 * @since [产品/模块版本] （可选）
 */
public class BaseController {

    protected static final String FORWARD_PATH = "forward:";
    /**
     *
     * 功能描述: <br>
     * 〈转化表单中时间格式〉
     *
     * @param request
     * @param binder
     * @throws Exception
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    @InitBinder
    protected void initBinder(HttpServletRequest request, ServletRequestDataBinder binder) throws Exception {
        binder.registerCustomEditor(Timestamp.class, new PropertyEditorSupport() {
            /**
             * Sets the property value by parsing a given String. May raise java.lang.IllegalArgumentException if either
             * the String is badly formatted or if this kind of property can't be expressed as text.
             *
             * @param value The string to be parsed.
             */
            public void setAsText(String value) {
                Date parsedDate = null;
                if (StringUtil.isEmpty(value)) {
                    setValue(null);
                } else if (10 == value.length()) {// 年月日
                    try {
                        parsedDate = new SimpleDateFormat("yyyy-MM-dd").parse(value);
                        setValue(new Timestamp(parsedDate.getTime()));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                } else if (19 == value.length()) {// 到秒
                    try {
                        parsedDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(value);
                        setValue(new Timestamp(parsedDate.getTime()));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                } else {
                    setValue(null);
                }
            }
        });
    }


    @ExceptionHandler
    public String exception(HttpServletRequest request,HttpServletResponse response, Exception e){
        //这里进行通用处理，如日志记录等...

        //如果是json格式的ajax请求
        if (request.getHeader("accept").indexOf("application/json") > -1
                || (request.getHeader("X-Requested-With")!= null && request.getHeader("X-Requested-With").indexOf("XMLHttpRequest") > -1)) {
            Class<?> superclass = e.getClass().getSuperclass();
            if(superclass == AppException.class){
                AppException appException = (AppException)e;
                ErrorMsg emsg = appException.getEmsg();
                HttpStatus httpStatus = appException.getHttpStatus();
                outActionError(response,emsg,httpStatus);
            }else{
                outActionError(response,new ErrorMsg("服务器错误:"+e.getLocalizedMessage()),HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return null;
        }
        else{//如果是普通请求
            request.setAttribute("exceptionMessage", e.getMessage());
            // 根据不同的异常类型可以返回不同界面
            if(e instanceof SQLException)
                return "testerror";
            else
                return "error";
        }
    }

    private void outActionError(HttpServletResponse response, ErrorMsg errorMsg,HttpStatus status) {
        Object obj = this.outActionReturn(response,errorMsg,status);
        Gson gson = new Gson();
        String reStr = gson.toJson(obj);
        try {
            PrintWriter writer = response.getWriter();
            writer.write(reStr);
            writer.flush();
        } catch (IOException e1) {
            e1.printStackTrace();
        }
    }

    public Object outActionReturn(HttpServletResponse response,Object obj,HttpStatus status){
        return outActionReturn(response,obj,status.value());
    }

    public Object outActionReturn(HttpServletResponse response,Object obj,int status){
        try {
            HttpStatus.valueOf(status);
        }catch (IllegalArgumentException ie){
            status = HttpStatus.INTERNAL_SERVER_ERROR.value();
        }
        response.setStatus(status);
        response.setContentType("application/json;charset=utf-8");
        return obj;
    }

    /**
     * 功能描述: <br>
     * 〈重定向链接〉
     * 
     * @param url 链接
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    protected void redirectUrl(String url, HttpServletResponse response) {
        try {
            response.sendRedirect(url);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}