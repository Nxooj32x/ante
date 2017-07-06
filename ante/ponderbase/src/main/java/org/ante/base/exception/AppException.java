package org.ante.base.exception;

import org.ante.base.model.ErrorMsg;
import org.springframework.http.HttpStatus;

public abstract class AppException extends Exception {

    private static final long serialVersionUID = -1356456179572681099L;

    public ErrorMsg emsg;

    public HttpStatus httpStatus = HttpStatus.BAD_REQUEST;

    public AppException(){
        super();
    }

    public AppException(String message){
        super(message);
    }

    public AppException(String message, Throwable cause) {
        super(message,cause);
        if(cause instanceof DaoException){
            DaoException exp = (DaoException)cause;
            emsg = exp.getEmsg();
        }else if(cause instanceof ServiceException){
            ServiceException exp = (ServiceException)cause;
            emsg = exp.getEmsg();
        }else if(cause instanceof WebException){
            WebException exp = (WebException)cause;
            emsg = exp.getEmsg();
        }else{
            emsg = new ErrorMsg(message);
        }
    }

    public AppException(Throwable cause) {
        super(cause);
        if(cause instanceof DaoException){
            DaoException exp = (DaoException)cause;
            emsg = exp.getEmsg();
        }else if(cause instanceof ServiceException){
            ServiceException exp = (ServiceException)cause;
            emsg = exp.getEmsg();
        }else if(cause instanceof WebException){
            WebException exp = (WebException)cause;
            emsg = exp.getEmsg();
        }else{
            emsg = new ErrorMsg(cause.getMessage());
        }
    }

    public ErrorMsg getEmsg() {
        return emsg;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }
}
