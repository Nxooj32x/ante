package org.ante.dwr.controller;

import org.ante.dwr.utils.DwrScriptSessionManagerUtil;
import org.directwebremoting.annotations.RemoteMethod;
import org.directwebremoting.annotations.RemoteProxy;
import org.springframework.stereotype.Controller;

import javax.servlet.ServletException;
@RemoteProxy(name = "messagepush")
public class MessagePush {
    @RemoteMethod
    public void onPageLoad(String userId) {
        DwrScriptSessionManagerUtil dwrScriptSessionManagerUtil = DwrScriptSessionManagerUtil.getInstance();
        try {
            dwrScriptSessionManagerUtil.init();
        } catch (ServletException e) {
            e.printStackTrace();
        }
    }
}