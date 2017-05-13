package org.ante.redis.service;

import java.util.Date;

/**
 * cache服务接口
 * @author guodong
 *
 */
public interface CacheService {

	/**
	 * 设置key的值
	 * @param key
	 * @param obj
	 * @param expireTime
	 */
	boolean set(String key, Object obj, Date expireTime);

	/**
	 * 获取对象
	 * @param key
	 * @return
	 */
	Object get(String key);
	
	/**
	 * 删除key对应的对象
	 * @param key
	 * @return
	 */
	boolean delete(String key);

	
}
