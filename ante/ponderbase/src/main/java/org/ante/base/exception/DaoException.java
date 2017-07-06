package org.ante.base.exception;

import org.ante.base.model.ErrorMsg;
import org.springframework.http.HttpStatus;

public class DaoException extends AppException {
    private static final long serialVersionUID = 2208403390025621670L;


    public DaoException() {
        super();
        super.emsg = new ErrorMsg();
        super.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    public DaoException(String message) {
        super(message);
        super.emsg = new ErrorMsg(message);
        super.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    public DaoException(String message,int errorNum) {
        super(message);
        super.emsg = new ErrorMsg(errorNum,message);
        super.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    public DaoException(String message, Throwable cause) {
        super(message,cause);
        super.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    }

    public DaoException(Throwable cause) {
        super(cause);
        super.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
