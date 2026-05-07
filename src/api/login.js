import request from '@/utils/request'
// 账号密码登录
export function logIn(data) {
	return request({
	    url: 'spd/admin-api/system/auth/login',
	    method: 'post',
	    data
	  })
}

// 获取用户详情
export function getUserInfo(userId) {
	return request({
	    url: `spd/admin-api/system/user/get-profile?id=${userId}`,
	    method: 'get'
	  })
}

// 获取登录用户的权限信息
export function getPermissionInfo() {
	return request({
	    url: '/spd/admin-api/system/auth/get-permission-info',
	    method: 'get'
	  })
}


// 用户退出登录
export function userSignOut() {
  return request({
    url: 'spd/admin-api/system/auth/logout',
    method: 'post'
  })
};

// 修改密码
export function modificationPassword(data) {
  return request({
    url: '/spd/admin-api/system/user/profile/update-password',
    method: 'put',
    data
  })
};