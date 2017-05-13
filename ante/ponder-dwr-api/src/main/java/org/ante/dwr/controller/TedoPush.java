package org.ante.dwr.controller;

import org.ante.dwr.utils.DwrScriptSessionListener;
import org.directwebremoting.Browser;
import org.directwebremoting.ScriptBuffer;
import org.directwebremoting.ScriptSession;
import org.directwebremoting.ScriptSessionFilter;
import org.directwebremoting.annotations.RemoteMethod;
import org.directwebremoting.annotations.RemoteProxy;

import java.util.Collection;

@RemoteProxy(name="tedoPush")


/**
 * <script type="text/javascript" src="${request.getContextPath()}/dwr/engine.js"></script>
 <script type="text/javascript" src="${request.getContextPath()}/dwr/util.js"></script>
 <script type="text/javascript" src="${request.getContextPath()}/dwr/interface/messagepush.js"></script>
 <script type="text/javascript" src="${request.getContextPath()}/dwr/interface/tedoPush.js"></script>
 <script>
 //通过该方法与后台交互，确保推送时能找到指定用户
 var userId = '${sessionUser.id}';
 if(userId!=""){
 dwr.engine.setActiveReverseAjax(true);dwr.engine.setNotifyServerOnPageUnload(true);
 messagepush.onPageLoad(userId);
 //推送信息
 function showMessage(autoMessage){
 console.log(autoMessage);
 }
 }

 </script>
 <script type="text/javascript" src="${request.getContextPath()}/dwr/interface/tedoPush.js"></script>
 <script>

 var id = window.prompt("id","enter userid")
 if(id!=""){
 tedoPush.sendMessageAuto(id,"www.yoodb.com");
 }
 </script>
 */
public class TedoPush {
    @RemoteMethod
    public void sendMessageAuto(String userid, String message){

        final String userId = userid;
        final String autoMessage = message;
        Browser.withAllSessionsFiltered(new ScriptSessionFilter() {
            public boolean match(ScriptSession session){
                if (session.getAttribute("userId") == null)
                    return false;
                else
                    return (session.getAttribute("userId")).equals(userId);
            }
        }, new Runnable(){

            private ScriptBuffer script = new ScriptBuffer();

            public void run(){

                script.appendCall("showMessage", autoMessage);

                Collection<ScriptSession> sessions = DwrScriptSessionListener.getScriptSessionMap();
                for (ScriptSession scriptSession : sessions){
                    scriptSession.addScript(script);
                }
            }
        });
    }
}
