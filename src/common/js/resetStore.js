// 登录信息store的初始值
export function getDefaultLoginState() {
	return {
		userInfo: {},
		token: null, //请求token,
		affairToken: null, //事务订单专用token
		isLogin: false,
		overDueWay: false,
		isMedicalMan: true,
		templateType: '',
		socketOpen: false,
		appPermission: {},
		chooseHospitalArea: {},
		timeMessage: {},
		ossMessage: {}
	}	
}

// 公共信息store的初始值
export function getDefaultCommonState() {
	return {
		//状态栏高度
		statusBarHeight: 0,
		//导航栏栏高度
		navigationBarHeight: 0,
		// 胶囊信息
		capsuleMessage: {},
		// 开发环境： http://blink.blinktech.cn/nblink
		// 测试环境：http://show.blinktech.cn/nblink
		// 准生产环境：http://ver.blinktech.cn/nblink
		// 生产环境：http://blinktech.cn/nblink
		// 新测试环境  http://act.blinktech.cn/nblink
		baseURL: 'http://act.blinktech.cn/nblink'
	}
}