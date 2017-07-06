package org.ante.base.model;

import java.io.Serializable;
import java.util.List;

public class ErrorMsg implements Serializable {
    private static final long serialVersionUID = -4990285241322786879L;

    private int errorNum = -10086;

    private List<String> errorArgs;

    private String errorMsg;

    public ErrorMsg(){

    }

    public ErrorMsg(String errorMsg){
        this.errorMsg = errorMsg;
    }

    public ErrorMsg(int errorNum,String errorMsg,List<String> errorArgs){
        this.errorNum = errorNum;
        this.errorMsg = errorMsg;
        this.errorArgs = errorArgs;
    }

    public ErrorMsg(int errorNum,String errorMsg){
        this.errorNum = errorNum;
        this.errorMsg = errorMsg;
    }

    public int getErrorNum() {
        return errorNum;
    }

    public void setErrorNum(int errorNum) {
        this.errorNum = errorNum;
    }

    public List<String> getErrorArgs() {
        return errorArgs;
    }

    public void setErrorArgs(List<String> errorArgs) {
        this.errorArgs = errorArgs;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    @Override
    public String toString() {
        return "ErrorMsg{" +
                "errorNum=" + errorNum +
                ", errorArgs=" + errorArgs +
                ", errorMsg='" + errorMsg + '\'' +
                '}';
    }
}
