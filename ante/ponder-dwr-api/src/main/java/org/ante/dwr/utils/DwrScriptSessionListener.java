package org.ante.dwr.utils;

import org.ante.user.model.User;
import org.directwebremoting.ScriptSession;
import org.directwebremoting.WebContext;
import org.directwebremoting.WebContextFactory;
import org.directwebremoting.event.ScriptSessionEvent;
import org.directwebremoting.event.ScriptSessionListener;

import javax.servlet.http.HttpSession;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by tao on 2016/11/16.
 */
public class DwrScriptSessionListener implements ScriptSessionListener{

    /**
     * 维护一个Map kay为sesion的Id，value为ScriptSession对象
     */
    public static final Map<String,ScriptSession> scriptSessionMap = new HashMap<String,ScriptSession>();

    public static Collection<ScriptSession> getScriptSessionMap() {
        return scriptSessionMap.values();
    }

    @Override
    public void sessionCreated(ScriptSessionEvent scriptSessionEvent) {
        WebContext webContext = WebContextFactory.get();
        HttpSession session = webContext.getSession();
        ScriptSession scriptSession = scriptSessionEvent.getSession();
        String userId =((User) session.getAttribute("sessionUser")).getId()+"";
        scriptSession.setAttribute("userId", userId);
        scriptSessionMap.put(session.getId(),scriptSession);
    }

    @Override
    public void sessionDestroyed(ScriptSessionEvent scriptSessionEvent) {
        WebContext webContext = WebContextFactory.get();
        HttpSession session = webContext.getSession();
        scriptSessionMap.remove(session.getId());
    }
}
