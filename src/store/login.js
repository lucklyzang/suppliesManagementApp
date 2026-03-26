import { setStore, getStore } from '@/common/js/utils'
import { getDefaultLoginState } from '@/common/js/resetStore.js'
export default {	
	state: getDefaultLoginState(),
	getters: {
		timeMessage: (state) => {
			state.timeMessage = JSON.parse(getStore('timeMessage')) ? JSON.parse(getStore('timeMessage')) : {};
			return state.timeMessage
		},
		ossMessage:(state) => {
			state.ossMessage = JSON.parse(getStore('ossMessage')) ? JSON.parse(getStore('ossMessage')) : {};
			return state.ossMessage
		},
		userInfo:(state) => {
			state.userInfo = JSON.parse(getStore('userInfo')) ? JSON.parse(getStore('userInfo')) : null;
			return state.userInfo
		},
		userTokenInfo:(state) => {
			state.userTokenInfo = JSON.parse(getStore('userTokenInfo')) ? JSON.parse(getStore('userTokenInfo')) : null;
			return state.userTokenInfo
		},
		chooseHospitalArea:(state) => {
			state.chooseHospitalArea = JSON.parse(getStore('chooseHospitalArea')) ? JSON.parse(getStore('chooseHospitalArea')) : null;
			return state.chooseHospitalArea
		},
		appPermission:(state) => {
			state.appPermission = JSON.parse(getStore('appPermission')) ? JSON.parse(getStore('appPermission')) : null;
			return state.appPermission
		},
		isLogin: (state) => {
			state.isLogin = getStore('isLogin') ? getStore('isLogin') === 'false' ? false : true : false;
			return state.isLogin
		},
		token:(state) => {
			state.token = getStore('token') ? getStore('token') : null;
			return state.token
		},
		overDueWay: state => state.overDueWay
	},
	mutations: {
		//保存阿里云签名信息
		changeOssMessage (state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('ossMessage', playLoad);
				state.ossMessage = playLoad
			}
		},
		//保存阿里云签名过期日期
		changeTimeMessage (state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('timeMessage', playLoad);
				state.timeMessage = playLoad
			}
		},
		storeUserInfo(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('userInfo', playLoad);
				state.userInfo = playLoad
			}
		},
		storeUserTokenInfo(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('userTokenInfo', playLoad);
				state.userTokenInfo = playLoad
			}
		},
		storeChooseHospitalArea(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('chooseHospitalArea', playLoad);
				state.chooseHospitalArea = playLoad
			}
		},
		storeAppPermission(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('appPermission', playLoad);
				state.appPermission = playLoad
			}
		},
		// 修改token状态
		changeToken(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('token', playLoad);
				state.token = playLoad
			}
		},
		// 修改是否登录状态
		changeIsLogin(state, playLoad) {
			if (playLoad != 'null') {
				setStore('isLogin', playLoad);
				state.isLogin = playLoad
			}
		},
		// 修改过期方式
		changeOverDueWay(state, playLoad) {
			state.overDueWay = playLoad
		},
		//重置登录信息的状态
		resetLoginInfoState(state) {
			Object.assign(state, getDefaultLoginState())
		}
	},
	actions: {
		resetLoginState({ commit }) {
			commit('resetLoginInfoState')
		}
	}
}
