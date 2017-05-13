package org.ante.user.service;

import org.ante.user.dao.UserPropertyDao;
import org.ante.user.model.UserProperty;
import org.ante.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by tao on 2017/3/20.
 */
@Service
public class UserPropertyService {
    @Autowired
    private UserPropertyDao userPropertyDao;

    public UserProperty getPropertyByUserAndType(User user, String type) {
        return userPropertyDao. getPropertyByUserAndType( user,type);
    }
}
