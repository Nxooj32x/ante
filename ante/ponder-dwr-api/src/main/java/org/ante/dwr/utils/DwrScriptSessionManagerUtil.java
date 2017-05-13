package org.ante.dwr.utils;

import org.directwebremoting.Container;
import org.directwebremoting.ServerContextFactory;
import org.directwebremoting.extend.ScriptSessionManager;
import org.directwebremoting.servlet.DwrServlet;

import javax.servlet.ServletException;

public class DwrScriptSessionManagerUtil extends DwrServlet {

       private static final long serialVersionUID = -7504612622407420071L;

       private static DwrScriptSessionManagerUtil dwrScriptSessionManagerUtil = null;

       private DwrScriptSessionManagerUtil(){

       }

       public static DwrScriptSessionManagerUtil getInstance(){
              if(dwrScriptSessionManagerUtil == null){
                     dwrScriptSessionManagerUtil = new DwrScriptSessionManagerUtil();
              }
              return dwrScriptSessionManagerUtil;
       }
       public void init()throws ServletException {
              Container container = ServerContextFactory.get().getContainer();
              ScriptSessionManager manager = container.getBean(ScriptSessionManager.class);
              manager.addScriptSessionListener(new DwrScriptSessionListener());
       }
}