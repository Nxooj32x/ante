package org.ante.base.exception;

import org.ante.base.model.ErrorMsg;
import org.springframework.http.HttpStatus;

public class WebException extends AppException{
    private static final long serialVersionUID = -3296233182538268589L;

    public WebException() {
        super();
        super.emsg = new ErrorMsg();
        super.httpStatus = HttpStatus.BAD_REQUEST;
    }

    public WebException(String message) {
        super(message);
        super.emsg = new ErrorMsg(message);
        super.httpStatus = HttpStatus.BAD_REQUEST;
    }

    public WebException(String message,HttpStatus httpStatus) {
        super(message);
        super.emsg = new ErrorMsg(message);
        super.httpStatus = httpStatus;
    }

    public WebException(String message, int errorNum) {
        super(message);
        super.emsg = new ErrorMsg(errorNum,message);
        super.httpStatus = HttpStatus.BAD_REQUEST;
    }

    public WebException(String message, int errorNum,HttpStatus httpStatus) {
        super(message);
        super.emsg = new ErrorMsg(errorNum,message);
        this.httpStatus = httpStatus;
    }

    public WebException(String message, Throwable cause) {
        super(message,cause);
        this.httpStatus = HttpStatus.BAD_REQUEST;
    }

    public WebException(String message, Throwable cause,HttpStatus httpStatus) {
        super(message,cause);
        this.httpStatus = httpStatus;
    }

    public WebException(Throwable cause) {
        super(cause);
        this.httpStatus = HttpStatus.BAD_REQUEST;
    }

    public WebException(Throwable cause,HttpStatus httpStatus) {
        super(cause);
        this.httpStatus = httpStatus;
    }

}
