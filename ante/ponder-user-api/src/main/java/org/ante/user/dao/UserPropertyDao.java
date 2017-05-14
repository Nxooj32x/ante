package org.ante.user.dao;

import org.ante.base.dao.BaseDao;
import org.ante.user.model.UserProperty;
import org.ante.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Repository;

/**
 * Created by tao on 2017/3/20.
 */
@Repository
public class UserPropertyDao extends BaseDao<UserProperty> {

    @Autowired
    @Qualifier("userTemplate")
    private HibernateTemplate ht;

    public HibernateTemplate getHibernateTemplate(){
        return ht;
    }

    public UserProperty getPropertyByUserAndType(User user, String type) {
        String hql = "from UserProperty where user = ? and itemType = ?";
        return this.get(hql, new Object[]{user,type});
    }
}
