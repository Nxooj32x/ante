package org.ante.util;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ObjectUtil {

    public static Object copy(Object obj1, Object obj2, List<String> ignoreFs) {
        Class type = obj1.getClass();
        Class type2 = obj2.getClass();
        ArrayList fields = new ArrayList();

        Class fname;
        Field[] getMethod;
        for (fname = obj1.getClass(); fname != Object.class; fname = fname.getSuperclass()) {
            getMethod = fname.getDeclaredFields();
            int setMethod = getMethod.length;

            for (int value = 0; value < setMethod; ++value) {
                Field i = getMethod[value];
                fields.add(i);
            }
        }
        fname = null;
        getMethod = null;
        Method var19 = null;
        Object var20 = null;
        for (int var21 = 0; var21 < fields.size(); ++var21) {

            try {
                String var17 = ((Field) fields.get(var21)).getName();
                if (ignoreFs == null || !ignoreFs.contains(var17)) {
                    Method var18 = type2.getMethod("get" + var17.substring(0, 1).toUpperCase() + var17.substring(1), new Class[0]);
                    if (var18 != null) {
                        var20 = var18.invoke(obj2, new Object[0]);
                    }
                    if (var20 != null) {
                        var19 = type.getMethod("set"+var17.substring(0,1).toUpperCase()+var17.substring(1),new Class[]{((Field)fields.get(var21)).getType()});
                        var19.invoke(obj1,new Object[]{var20});
                    }
                }
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
        return obj1;
    }

    public static void main(String[] args){
        Persion p1 = new Persion();
        p1.setId(1);
        p1.setName("wangtao");
        p1.setScore(1.99);
        p1.setStatus(false);
        p1.setCtime(new Date());
        Persion p2 = new Persion();
        p2.setId(2);
        p2.setName("liangqian");
        List<String> list = new ArrayList<String>();
        list.add("id");
        Object o =  ObjectUtil.copy(p1,p2,list);
        System.out.println(o.toString());
    }
}
