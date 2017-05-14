package org.ante.user.dao;

import org.ante.base.dao.BaseDao;
import org.ante.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Repository;

/**
 * Created by tao on 2016/11/20.
 */
@Repository
public class UserDao extends BaseDao<User> {

    @Autowired
    @Qualifier("userTemplate")
    private HibernateTemplate ht;

    public HibernateTemplate getHibernateTemplate(){
        return ht;
    }

    public User getUserById(Integer userid){
        User user = this.get(userid);
        return user;
    }

    public User addUser(User user){
        this.save(user);
        return user;
    }

}
