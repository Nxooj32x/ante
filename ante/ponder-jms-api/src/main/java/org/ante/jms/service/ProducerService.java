package org.ante.jms.service;

import javax.jms.Destination;
import java.io.Serializable;

/**
 * Created by ante on 2016/9/27.
 */
public interface ProducerService {
    public void sendMessage(Destination destination, final String message);

    public void sendEmailMessage(Destination destination, final Serializable obj);
}
