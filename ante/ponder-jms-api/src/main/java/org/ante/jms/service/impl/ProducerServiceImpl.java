package org.ante.jms.service.impl;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.ante.jms.service.ProducerService;

import javax.jms.*;
import java.io.Serializable;

/**
 * Created by ante on 2016/9/27.
 */
//@Service
public class ProducerServiceImpl implements ProducerService{
    private static final Logger logger = Logger.getLogger(ProducerServiceImpl.class);

    @Autowired
    private JmsTemplate jmsTemplate;
    @Autowired
    @Qualifier("responseQueue")
    private Destination responseDestination;
    @Override
    public void sendMessage(Destination destination, final String message) {
        logger.info("生产者发了一个消息：" + message);
        jmsTemplate.send(destination, new MessageCreator() {
            public Message createMessage(Session session) throws JMSException {
                TextMessage textMessage = session.createTextMessage(message);
                textMessage.setJMSReplyTo(responseDestination);
                return textMessage;
            }
        });
    }

    @Override
    public void sendEmailMessage(Destination destination, final Serializable obj) {
        logger.info("生产者发了一个消息：" + obj);

        jmsTemplate.send(destination, new MessageCreator() {
            public Message createMessage(Session session) throws JMSException {
                ObjectMessage objectMessage = session.createObjectMessage(obj);
                objectMessage.setJMSReplyTo(responseDestination);
                return objectMessage;
            }
        });
    }
}
