package org.ante.common;

/**
 * Created by tao on 2016/11/20.
 */
public class Constant {

    public interface App{
        public static String appId = "soul";
    }

    public interface Property{
        public static String skill = "skill";
        public static String profile = "profile";
        public static String workhistory = "workhistory";
        public static String support = "support";
        public static String project = "project";
        public static String education = "education";
    }

    public interface SystemParam{
        public static String CONTEXT_PARAM_PROPERTIES = "properties";

        public static String LOAD_CONFIGS = "load_configs";
        public static String SPILT_CONFIGS = ",";
    }
}
