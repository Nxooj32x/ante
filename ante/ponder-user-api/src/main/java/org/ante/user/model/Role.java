/*
 * Copyright (c) 2014, 2015, XIANDIAN and/or its affiliates. All rights reserved.
 * XIANDIAN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 */
package org.ante.user.model;

import org.ante.base.model.BaseEntity;

import javax.persistence.Entity;
import javax.persistence.Table;


/**
 * 角色
 *
 * @author
 * @since  V1.0
 * 
 */
@Entity
@Table(name = "t_role")
public class Role extends BaseEntity {

	private String name;
	private String rolekey;
	public String getRolekey() {
		return rolekey;
	}
	public void setRolekey(String rolekey) {
		this.rolekey = rolekey;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
}
