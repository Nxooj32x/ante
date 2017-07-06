package org.ante.base.exception;

import org.ante.base.model.ErrorMsg;

public class ServiceException extends AppException {

    private static final long serialVersionUID = -495887611342199794L;

    public ServiceException() {
        super();
        super.emsg = new ErrorMsg();
    }

    public ServiceException(String message) {
        super(message);
        super.emsg = new ErrorMsg(message);
    }

    public ServiceException(String message,int errorNum) {
        super(message);
        super.emsg = new ErrorMsg(errorNum,message);
    }
    public ServiceException(String message, Throwable cause) {
        super(message,cause);
    }

    public ServiceException(Throwable cause) {
        super(cause);
    }
}
