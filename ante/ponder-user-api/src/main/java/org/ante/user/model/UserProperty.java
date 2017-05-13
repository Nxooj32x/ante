package org.ante.user.model;

import org.ante.base.model.BaseEntity;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by tao on 2017/3/20.
 */
@Entity
@Table(name = "t_userproperty")
public class UserProperty extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userid")
    private User user;
    /**
     * 属性类型[boolean,list,int,json,map so on]
     */
    private String propertyType;

    /**
     * 配置选项类型[workhistory,profile,skill,support,project,education]
     */
    private String itemType;


    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date ctime;

    @Temporal(TemporalType.TIMESTAMP)
    private Date utime;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getCtime() {
        return ctime;
    }

    public void setCtime(Date ctime) {
        this.ctime = ctime;
    }

    public Date getUtime() {
        return utime;
    }

    public void setUtime(Date utime) {
        this.utime = utime;
    }
}
