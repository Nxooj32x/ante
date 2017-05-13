package org.ante.dwr.controller;

import org.ante.dwr.model.DtoBean;
import org.directwebremoting.annotations.RemoteMethod;
import org.directwebremoting.annotations.RemoteProxy;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by tao on 2016/11/5.
 */
@RemoteProxy(name="appjs")
public class DwrController {

    @RemoteMethod
    public DtoBean getDto(){
        DtoBean bean = new DtoBean();
        bean.setCity("南京");
        bean.setStreet("油坊桥");
        bean.setState("soul.info-1");
        return bean;
    }

    @RemoteMethod
    public Map initMenue(){
        Map<String, String[]> map = new LinkedHashMap<String, String[]>();
        map.put("all",new String[]{"glyphicon-home","/type/all","全部文件"});
        map.put("doc",new String[]{"glyphicon-file","/type/doc","我的文档"});
        map.put("image",new String[]{"glyphicon-picture","/type/image","我的图片"});
        map.put("video",new String[]{"glyphicon-film","/type/video","我的视频"});
        map.put("music",new String[]{"glyphicon-music","/type/music","我的音乐"});
        map.put("share",new String[]{"glyphicon-share","/type/share","我的分享"});
        map.put("garbage",new String[]{"glyphicon-trash","/type/garbage","垃圾箱"});
        map.put("other",new String[]{"glyphicon-inbox","/type/other","其他"});
        return map;
    }
}
