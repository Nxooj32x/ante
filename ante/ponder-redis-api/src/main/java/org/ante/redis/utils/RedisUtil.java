package org.ante.redis.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.*;

/**
 * @author
 * @email
 * @date 2015年2月9日 下午5:39:07
 * @description Redis缓存工具
 *
 */
public class RedisUtil {
	private JedisPool jedisPool;
	private Serializer g_ser;

	private static final Logger logger = LoggerFactory.getLogger(RedisUtil.class);
	
	public static final String R_OK = "OK";
	
    public static final Long R_1L = 1l;
	
	
    /**
     * 从连接池中获取jedis连接
     */
    public Jedis getJedis() {
        return jedisPool.getResource();
    }
 
    /**
     * 释放以损坏的jedis.
     */
    public void closeBroken(Jedis jedis) {
        if (jedis != null) {
            try {
                jedisPool.returnBrokenResource(jedis);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
 
    /**
     * 从连接池中释放jedis
     */
    public void close(Jedis jedis) {
        if (jedis != null) {
            try {
                jedisPool.returnResource(jedis);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
 
    /**
     * 判断事物执行后返回结果列表是否为期望的结果列表
     * 
     * @param results 事务执行结果
     * @param expects 期望的结果
     * @return
     */
    public static boolean expect(List<Object> results, Object... expects) {
        try {
            if (results != null && expects != null && results.size() == expects.length) {
                for (int i = 0; i < expects.length; i++) {
                    Object result = results.get(i);
                    if(result == null || !result.equals(expects[i])){
                        return false;
                    }
                }
                return true;
            }
        } catch (Exception e) {
            logger.error("对比失败:" + results + " @ " + Arrays.toString(expects), e);
        }
        return false;
    }

	/**
	 * 构造函数
	 * @throws Exception 
	 */
	public RedisUtil(JedisPool pool, String serializer) throws Exception{
		//连接池
		if(pool == null){
			String msg = "RedisUtil jedisPool is null, please check the config file.";
			logger.error(msg);
			throw new Exception(msg);
		}
		jedisPool = pool;

		//序列化
		if(serializer == null || serializer.isEmpty()){
			g_ser = new JavaSerializer();
			logger.warn("RedisUtil constructor param serializer is not set.");
		}else{
			if (serializer.equals("java")) {
				g_ser = new JavaSerializer();

			} else if (serializer.equals("fst")) {
				g_ser = new FSTSerializer();

			} else {
				g_ser = new JavaSerializer();
			}
			logger.info("RedisUtil serializer is " + g_ser.name());
		}
	}

	/**
	 * set 存储对象
	 * @param key
	 * @param value
	 * @return 返回OK表示执行成功；返回null表示exception
	 */
	public String setObject(String key, Object value) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.set(key.getBytes(), g_ser.serialize(value));
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return null;
	}

	/**
	 * get 获取Object对象
	 * @param key
	 * @return Object
	 * @throws Exception
	 */
	public Object getObject(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			byte[] b = jedis.get(key.getBytes());
			return g_ser.deserialize(b);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return null;
	}

	/**
	 * 存储单个值
	 * @param key
	 * @param value
	 * @return
	 */
	public boolean set(String key, String value) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			jedis.set(key, value);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return false;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return true;
	}
	
	/**
	 * 存储多个值
	 * @param keyvalues
	 * @return
	 */
	public boolean mset(String... keyvalues) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			jedis.mset(keyvalues);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return false;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return true;
	}
	
	/**
	 * 获取单个值
	 * @param key
	 * @return
	 */
	public String get(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.get(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 获取多个值
	 * @param keys
	 * @return
	 */
	public List<String> mget(String... keys) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			return jedis.mget(keys);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 删除单个
	 * @param key
	 * @return 实际删除个数(返回-1表示exception)
	 */
	public long del(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.del(key.getBytes());
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return -1;
	}

	/**
	 * 删除多个
	 * @param keys
	 * @return 实际删除个数(返回-1表示exception)
	 */
	public long del(String[] keys){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.del(keys);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return -1;
	}
	
	/**
	 * check 查看是否存在指定的缓存
	 * @param key
	 * @return
	 */
	public Boolean check(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.exists(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 获取hash表全部数据
	 * @param key
	 * @throws Exception
	 */
	public Map<String, String> hgetall(String key) {
		boolean success = true;
		Jedis jedis = null;
		Map<String, String> map = new HashMap<String, String>();
		try{
			jedis = jedisPool.getResource();
			
			map =  jedis.hgetAll(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return map;
	}
	
	/**
	 * hset 存储值
	 * @param key
	 * @param field
	 * @param value --> String
	 * @return
	 * @throws Exception
	 */
	public boolean hset(String key, String field, String value) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			jedis.hset(key, field, value);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return false;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return true;
	}
	
	/**
	 * hget 获取String值
	 * @param key
	 * @param field
	 * @return String
	 * @throws Exception
	 */
	public String hgetStr(String key, String field) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.hget(key, field);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * hcheck 查看字典中，是否存在指定的缓存
	 * @param key
	 * @param field
	 * @return
	 */
	public Boolean hcheck(String key, String field) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.hexists(key.getBytes(), field.getBytes());
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 删除缓存中指定字典中的单个对象
	 * @param key
	 * @param field
	 * @throws Exception
	 */
	public void hdel(String key, String field) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			jedis.hdel(key, field);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * List操作，lpush
	 * @param key
	 * @param value
	 * @return
	 */
	public long lpush(String key, String value){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			long count = jedis.lpush(key, value);
			return count;
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	/**
	 * List操作，rpush
	 * @param key
	 * @param value
	 * @return
	 */
	public long rpush(String key, String value){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			long count = jedis.rpush(key, value);
			return count;
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	/**
	 * List操作，lrange
	 * @param key
	 * @param start
	 * @param end
	 * @return
	 */
	public List<String> lrange(String key, long start, long end){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			return jedis.lrange(key, start, end);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	/**
	 * List操作，lrem
	 * @param key
	 * @return
	 */
	public long lrem(String key, String value){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			return jedis.lrem(key, 0, value);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	/**
	 * List操作，llen
	 * @param key
	 * @return
	 */
	public long llen(String key){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			return jedis.llen(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	/**
	 * 有序集合操作，zadd，新增一个
	 * 返回实际新增的个数（即1个）
	 * 返回-1说明操作失败
	 * @param key
	 * @param score
	 * @param member
	 * @return
	 */
	public long zadd(String key, double score, Object member){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			if (member instanceof String) {
				return jedis.zadd(key, score, (String)member);
			} else {
				return jedis.zadd(key.getBytes(), score, g_ser.serialize(member));
			}
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	/**
	 * 有序集合操作，zadd，新增一个
	 * 返回实际新增的个数（即1个）
	 * 返回-1说明操作失败
	 * @param key
	 * @param score
	 * @param member
	 * @return
	 */
	public long zadd(String key, double score, String member){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.zadd(key, score, member);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 有序集合操作，zrem，删除一个
	 * 返回实际被删除的个数（即1个）
	 * 返回-1说明操作失败
	 * @param key
	 * @param member
	 * @return
	 */
	public long zrem(String key, String member){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.zrem(key, member);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 有序集合操作，zcard，获取集合内成员数量
	 * key不存在，返回0
	 * 返回-1，说明操作失败
	 * @param key
	 * @return
	 */
	public long zcard(String key){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.zcard(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 有序集合操作，zscore
	 * 返回 member 成员的 score 值
	 * 如果 member 元素不是有序集 key 的成员，或 key 不存在，返回 null
	 * @param key
	 * @param member
	 * @return
	 */
	public Double zscore(String key, String member) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.zscore(key, member);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 有序集合操作，zrange
	 * 返回索引在start和stop之间的成员列表
	 * 当start = 0 & stop = -1时，返回全部
	 * @param key
	 * @return
	 */
	public Set<Object> zrangeRetObject(String key, long start, long stop){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			Set<byte[]> values =  jedis.zrange(key.getBytes(), start, stop);
			Set<Object> rets = new HashSet<Object>();
			for (byte[] v : values) {
				rets.add(g_ser.deserialize(v));
			}
			return rets;
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	/**
	 * 有序集合操作，zrange
	 * 返回索引在start和stop之间的成员列表
	 * 当start = 0 & stop = -1时，返回全部
	 * @param key
	 * @return
	 */
	public Set<String> zrange(String key, long start, long stop){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			return jedis.zrange(key, start, stop);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	
	/**
	 * 有序集合操作，zrange
	 * 返回索引在start和stop之间的成员列表
	 * 当start = 0 & stop = -1时，返回全部
	 * @param key
	 * @return
	 */
	public Set<String> zrevrange(String key, long start, long stop){
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();

			return jedis.zrevrange(key, start, stop);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 自然增长
	 * @param key
	 * @return
	 */
	public long incr(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			return jedis.incr(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 自然增长的当前值
	 * @param key
	 * @return
	 * @throws Exception
	 */
	public long currentIncr(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			
			String current = jedis.get(key);
			if(current != null){
				return new Long(current);
			}else{
				return -1;
			}
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return -1;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
	
	/**
	 * 设置过期时间(时间段)
	 * @param key
	 * @param seconds
	 * @return 成功设置返回1；当key不存在或者不能为key设置生存时间时返回0；exception返回-1
	 */
	public long expire(String key, int seconds) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.expire(key, seconds);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return -1;
	}

	/**
	 * 设置过期时间(具体时间点)
	 * @param key
	 * @param date
	 * @return 成功设置返回1；当key不存在或者不能为key设置生存时间时返回0；exception返回-1
	 */
	public long expireAt(String key, Date date) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.expireAt(key, date.getTime() / 1000);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return -1;
	}

	/**
	 * 查询剩余过期时间
	 * @param key
	 * @return
	 * >= 0 ： 正常
	 * -1 : exception
	 * -2 : 已过期
	 */
	public long ttl(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.ttl(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return -1;
	}
	
	
	/**
	 * set 存储值
	 * @param key
	 * @return
	 * @throws Exception
	 */
	public boolean sadd(String key, String... values) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();			
			jedis.sadd(key, values);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return false;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return true;
	}


	/**
	 * set 存储值
	 * @param key
	 * @param value --> String
	 * @return
	 * @throws Exception
	 */
	public boolean sadd (String key, Object value) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			if (value instanceof String) {
				jedis.sadd(key, (String)value);
			} else {
				jedis.sadd(key.getBytes(), g_ser.serialize(value));
			}
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return false;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return true;
	}

	public boolean srem(String key, String... values) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			jedis.srem(key, values);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return false;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
		return true;
	}
	
	/**
	 * set 值获取
	 * @param key
	 * @return String
	 * @throws Exception
	 */
	public Set<String> smembers(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.smembers(key);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	public Set<Object> smembersRetObject(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			Set<byte[]> values =  jedis.smembers(key.getBytes());
			Set<Object> rets = new HashSet<Object>();
			for (byte[] v : values) {
				rets.add(g_ser.deserialize(v));
			}
			return rets;
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return null;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	public boolean sismember(String key, String member) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			return jedis.sismember(key, member);
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return false;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}

	public long scard(String key) {
		boolean success = true;
		Jedis jedis = null;
		try{
			jedis = jedisPool.getResource();
			long ret =  jedis.scard(key.getBytes());

			return ret;
		}catch(Exception e){
			success = false;
			e.printStackTrace();
			return 0;
		}finally{
			if(success){
				jedisPool.returnResource(jedis);
			}else{
				if(jedisPool != null && jedis != null){
					jedisPool.returnBrokenResource(jedis);
				}
			}
		}
	}
}