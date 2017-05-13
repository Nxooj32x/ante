package org.ante.base.utils;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


/**
 * 字符串处理工具类
 * 
 * @author 12110775
 * @see [相关类/方法]（可选）
 * @since [产品/模块版本] （可选）
 */
public class StringUtil {

    private static Random r = new Random(System.currentTimeMillis());

    private static final String regEx_script = "<script[^>]*?>[\\s\\S]*?<\\/script>"; // 定义script的正则表达式
    private static final String regEx_style = "<style[^>]*?>[\\s\\S]*?<\\/style>"; // 定义style的正则表达式
    private static final String regEx_html = "<[^>]+>"; // 定义HTML标签的正则表达式

    /**
     * 判断字符串是否为空
     * 
     * @param input 需要校验的参数
     * @return 是否为空
     */
    public static boolean isEmpty(String input) {
        return input == null || trim(input).length() == 0;
    }

    /**
     * 判断字符串是否为数字
     * 
     * <pre>
     * StringUtils.isNumeric(null)   = false
     * StringUtils.isNumeric(&quot;&quot;)     = false
     * StringUtils.isNumeric(&quot;  &quot;)   = false
     * StringUtils.isNumeric(&quot;123&quot;)  = true
     * StringUtils.isNumeric(&quot;12 3&quot;) = false
     * StringUtils.isNumeric(&quot;ab2c&quot;) = false
     * StringUtils.isNumeric(&quot;12-3&quot;) = false
     * StringUtils.isNumeric(&quot;12.3&quot;) = false
     * </pre>
     * 
     * @param
     * @return
     */
    public static boolean isNumeric(String input) {
        if (input == null || input.length() == 0) {
            return false;
        }
        int sz = input.length();
        for (int i = 0; i < sz; i++) {
            if (!Character.isDigit(input.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    /**
     * 将字符串字母转换成大写字母
     * 
     * @param src 需要处理的字符串
     * @return 处理后的字符串
     */
    public static String toUpperCase(String src) {
        return null == src ? "" : src.toUpperCase();
    }

    /**
     * 
     * 功能描述: <br>
     * 〈功能详细描述〉
     * 
     * @param obj
     * @return
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static boolean isNotEmpty(Object obj) {
        if (obj != null && !obj.equals("")) {
            return true;
        }
        return false;
    }

    /**
     * 去除字符串前后空格
     * 
     * @param input 需要处理的字符串
     * @return 去除前后空格结果
     */
    public static String trim(String input) {
        return null == input ? "" : input.trim();
    }

    /**
     * 根据格式格式化字符串
     * 
     * @param formate 字符串
     * @param patten 保留N位小数
     * @return 转化后的String类型
     */
    public static String formate(Double formate, String patten) {
        DecimalFormat df = new DecimalFormat(patten);// 保留N位小数
        return df.format(formate);
    }

    /**
     * 验证是否为小数,包括正负数;
     * 
     * @param source
     * @return true-isDecimal false-isNotDecimal
     */
    public static boolean isDecimal(String source) {
        boolean flag = false;
        Pattern pattern = Pattern.compile("^[-+]?[0-9]+(\\.[0-9]+)?$");
        if (!isEmpty(source)) {
            Matcher matcher = pattern.matcher(source);
            if (matcher.matches()) {
                flag = true;
            }
        }

        return flag;
    }

    /**
     * 功能描述: <br>
     * 〈获取字符串长度〉
     * 
     * @param str 字符串
     * @return 长度
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static int getStringLen(String str) {
        return isEmpty(str) ? 0 : str.length();
    }

    /**
     * 生成接口使用的UId
     * 
     * @return UUID
     */
    public static String getUUID() {
        return UUID.randomUUID().toString();
    }

    /**
     * 校验是否为EMAIL
     * 
     * @param email email地址
     * @return 是否为Email
     */
    public static boolean isEmail(String email) {
        String emailRegex = "^(\\w)+(\\.\\w+)*@(\\w)+((\\.\\w{2,3}){1,3})$";
        return Pattern.matches(emailRegex, email);
    }

    /**
     * 功能描述: <br>
     * 〈校验用户名，字母数字下划线，下划线不能在首尾〉
     * 
     * @param text
     * @return
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static boolean isUserName(String text) {
        String regex = "^(?!_)(?!.*_$)[a-zA-z0-9_]+$";
        return Pattern.matches(regex, text);
    }

    /**
     * 给字符串MD5加密
     * 
     * @param source 需要加密的字串
     * @return 加密后的字串
     */
    public static String md5(String source) {

        String md5Str = null;

        // 用于加密的字符
        char[] md5String = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' };

        try {
            // 使用平台的默认字符集将此 String 编码为 byte序列，并将结果存储到一个新的 byte数组中
            byte[] btInput = source.getBytes("UTF-8");

            // 获得指定摘要算法的 MessageDigest对象，此处为MD5
            // MessageDigest类为应用程序提供信息摘要算法的功能，如 MD5 或 SHA 算法。
            // 信息摘要是安全的单向哈希函数，它接收任意大小的数据，并输出固定长度的哈希值。
            MessageDigest mdInst = MessageDigest.getInstance("MD5");

            // MessageDigest对象通过使用 update方法处理数据， 使用指定的byte数组更新摘要
            mdInst.update(btInput);

            // 摘要更新之后，通过调用digest（）执行哈希计算，获得密文
            byte[] md = mdInst.digest();

            // 把密文转换成十六进制的字符串形式
            int j = md.length;
            char[] str = new char[j * 2];
            int k = 0;
            for (int i = 0; i < j; i++) { // i = 0
                byte byte0 = md[i]; // 95
                str[k++] = md5String[byte0 >>> 4 & 0xf]; // 5
                str[k++] = md5String[byte0 & 0xf]; // F
            }
            // 返回经过加密后的字符串
            md5Str = new String(str);
        } catch (RuntimeException e) {
        } catch (NoSuchAlgorithmException e) {
        } catch (UnsupportedEncodingException e) {
        }

        return md5Str;
    }

    /**
     * 功能描述: <br>
     * 〈功能详细描述〉
     * 
     * @return
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static String getRandomString() {
        return String.valueOf(r.nextInt(1000000));
    }

    /**
     * 功能描述: <br>
     * 〈获取字符串长度〉
     * 
     * @param text 字符串
     * @return 长度
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static int getTextLength(String text) {
        return isEmpty(text) ? 0 : text.trim().length();
    }

    /**
     * 替换一个字符串中的某些指定字符
     * 
     * @param strData String 原始字符串
     * @param regex String 要替换的字符串
     * @param replacement String 替代字符串
     * @return String 替换后的字符串
     */
    public static String replaceString(String strData, String regex, String replacement) {
        if (strData == null) {
            return null;
        }
        int index;
        index = strData.indexOf(regex);
        String strNew = "";
        if (index >= 0) {
            while (index >= 0) {
                strNew += strData.substring(0, index) + replacement;
                strData = strData.substring(index + regex.length());
                index = strData.indexOf(regex);
            }
            strNew += strData;
            return strNew;
        }
        return strData;
    }

    /**
     * 替换字符串中特殊字符
     */
    public static String encodeString(String strData) {

        if (isEmpty(strData)) {
            return "";
        }

        strData = replaceString(strData, "&", "&amp;");
        strData = replaceString(strData, "<", "&lt;");
        strData = replaceString(strData, ">", "&gt;");
        strData = replaceString(strData, "&apos;", "&apos;");
        strData = replaceString(strData, "\"", "&quot;");
        return strData;
    }

    /**
     * 还原字符串中特殊字符
     */
    public static String decodeString(String strData) {
        strData = replaceString(strData, "&lt;", "<");
        strData = replaceString(strData, "&gt;", ">");
        strData = replaceString(strData, "&apos;", "&apos;");
        strData = replaceString(strData, "&quot;", "\"");
        strData = replaceString(strData, "&amp;", "&");
        return strData;
    }

    /**
     * 拼接sql语句ID
     * 
     * @param strs
     * @return
     */
    public static String joinSqlInInt(String... strs) {

        StringBuffer sb = new StringBuffer();
        if (null != strs && strs.length > 0) {
            int stepsLen = strs.length;
            for (int i = 0; i < stepsLen; i++) {
                if (i == stepsLen - 1) {
                    sb.append(strs[i]);
                } else {
                    sb.append(strs[i]).append(",");
                }
            }
        }
        return sb.toString();
    }

    /**
     * 
     * 功能描述: <br>
     * 〈拼接字符串〉
     * 
     * @param strs
     * @return
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static String joinSqlString(List<String> strs) {
        StringBuffer sb = new StringBuffer("");
        if (strs != null && strs.size() > 0) {
            for (String str : strs) {
                if (sb.toString().equals("")) {
                    sb.append("'").append(str).append("'");
                } else {
                    sb.append(",").append("'").append(str).append("'");
                }
            }
        }
        return sb.toString();
    }

    /**
     * 功能描述: <br>
     * 〈计算两个日期之间有多少周〉
     * 
     * @param d1
     * @param d2
     * @return
     * @throws Exception
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static int getWeekDateDiff(Date d1, Date d2) {
        long n1 = d1.getTime();
        long n2 = d2.getTime();
        long diff = Math.abs(n1 - n2);
        diff /= 3600 * 1000 * 24;
        if (diff % 7 != 0)
            return (int) (diff / 7 + 1);
        return (int) (diff / 7);
    }

    /**
     * 获取文件扩展名
     * 
     * @param fileName 文件名
     * @return 文件扩展名
     */
    public static String getFileExt(String fileName) {

        String ext = "";
        if (!StringUtil.isEmpty(fileName)) {
            ext = fileName.substring(fileName.lastIndexOf(".") + 1);
        }

        return ext;
    }
    
    /**
     * 功能描述: <br>
     * 〈功能详细描述〉
     *
     * @param htmlStr
     * @return
     * @see [相关类/方法](可选)
     * @since [产品/模块版本](可选)
     */
    public static String delHTMLTag(String htmlStr) {
        Pattern p_script = Pattern.compile(regEx_script, Pattern.CASE_INSENSITIVE);
        Matcher m_script = p_script.matcher(htmlStr);
        htmlStr = m_script.replaceAll(""); // 过滤script标签
        Pattern p_style = Pattern.compile(regEx_style, Pattern.CASE_INSENSITIVE);
        Matcher m_style = p_style.matcher(htmlStr);
        htmlStr = m_style.replaceAll(""); // 过滤style标签
        Pattern p_html = Pattern.compile(regEx_html, Pattern.CASE_INSENSITIVE);
        Matcher m_html = p_html.matcher(htmlStr);
        htmlStr = m_html.replaceAll(""); // 过滤html标签
        return htmlStr.trim(); // 返回文本字符串
    }

    public static void main(String[] args) {
    	String beginDate="1452244160000";  
    	  
    	SimpleDateFormat sdf=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
    	  
    	String sd = sdf.format(new Date(Long.parseLong(beginDate)));  
    	  
    	System.out.println(sd); 
    	String md5 = StringUtil.md5("123456");
    	System.out.println(md5);
    }
}