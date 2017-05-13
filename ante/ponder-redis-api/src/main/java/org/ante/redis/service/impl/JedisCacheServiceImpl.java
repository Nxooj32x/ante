package org.ante.redis.service.impl;

import java.util.Date;

import org.ante.redis.utils.Constant;
import org.ante.redis.service.CacheService;
import org.ante.redis.utils.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;

public class JedisCacheServiceImpl  implements CacheService {

	@Autowired
	private RedisUtil redisUtil;

	@Override
	public boolean set(String key, Object obj, Date expireTime) {
		//设置值
		String ok = redisUtil.setObject(Constant.App.appId + ":" + key, obj);
		if(!"OK".equals(ok)){
			return false;
		}

		//永不过期
		if(expireTime == null){
			return true;
		}

		//过期时间
		long success = redisUtil.expireAt(Constant.App.appId + ":" + key, expireTime);
		if(success > 0){
			return true;
		}else{
			redisUtil.del(key);
			return false;
		}
	}

	@Override
	public Object get(String key) {
		return redisUtil.getObject(Constant.App.appId + ":" + key);
	}

	@Override
	public boolean delete(String key) {
		long success = redisUtil.del(Constant.App.appId + ":" + key);
		return success > 0;
	}
}