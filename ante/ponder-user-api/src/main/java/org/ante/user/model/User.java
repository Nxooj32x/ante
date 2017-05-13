/*
 * Copyright (c) 2014, 2015, XIANDIAN and/or its affiliates. All rights reserved.
 * XIANDIAN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 */
package org.ante.user.model;

import org.ante.base.model.BaseEntity;

import javax.persistence.*;
import java.util.Date;
import java.util.Set;


/**
 * 用户
 *
 * @author
 * @since  V1.0
 *
 */
@Entity
@Table(name = "t_user")
public class User extends BaseEntity {
	private String username;

	private String realname;

	private String password;

	private String qq;

	private String address;

	private String phone;

	private int age;


	private String email;

	private String url;

	private String job;

	@Temporal(TemporalType.TIMESTAMP)
	private Date ctime;

	@Temporal(TemporalType.TIMESTAMP)
	private Date utime;

	private String status;
	@ManyToMany(cascade=CascadeType.ALL,fetch = FetchType.EAGER)
	@JoinTable(name="t_userrole",
			joinColumns={@JoinColumn(name="userid")},
			inverseJoinColumns={@JoinColumn(name="roleid")})
	@OrderBy("id asc ")
	private Set<Role> role;
	public String getRealname() {
		return realname;
	}

	public void setRealname(String realname) {
		this.realname = realname;
	}

	public String getQq() {
		return qq;
	}

	public void setQq(String qq) {
		this.qq = qq;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getJob() {
		return job;
	}

	public void setJob(String job) {
		this.job = job;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Set<Role> getRole() {
		return role;
	}

	public void setRole(Set<Role> role) {
		this.role = role;
	}
}
