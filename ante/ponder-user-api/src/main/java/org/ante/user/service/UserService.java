package org.ante.user.service;

import org.ante.user.dao.UserDao;
import org.ante.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by tao on 2016/11/20.
 */
@Service
public class UserService {
    @Autowired
    private UserDao userDao;

    public User getUserById(Integer userid){
        return userDao.getUserById(userid);
    }

    public User addUser(User user){
        return userDao.addUser(user);
    }
}
