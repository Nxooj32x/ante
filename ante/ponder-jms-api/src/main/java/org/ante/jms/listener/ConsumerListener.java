package org.ante.jms.listener;

import org.ante.jms.bean.EmailBean;
import org.ante.jms.utils.EmailUtil;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by ante on 2016/9/27.
 */
public class ConsumerListener {

    @Autowired
    private EmailUtil emailUtil;
    private static final Logger logger = Logger.getLogger(ConsumerListener.class);
    public void handleMessage(String message) {
    }

    public String receiveMessage(String message) {
        logger.info("ConsumerListener通过receiveMessage接收到一个纯文本消息，消息内容是：" + message);
        return "这是ConsumerListener对象的receiveMessage方法的返回值。";
    }

    public String receiveMessage(EmailBean mailBean){
        logger.info("ConsumerListener通过receiveMessagee接收到一个Serializable消息，消息内容是：" + mailBean);
        emailUtil.sendSimpleMail(mailBean.getTo(),mailBean.getContent());
        return "系统完成发送!";
    }

}