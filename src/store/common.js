import { setStore, getStore } from '@/common/js/utils'
import { getDefaultCommonState } from '@/common/js/resetStore.js'
export default {	
	state: getDefaultCommonState(),
	getters: {
		statusBarHeight:(state) => {
			state.statusBarHeight = getStore('statusBarHeight') ? getStore('statusBarHeight') : 47;
			return state.statusBarHeight
		},
		navigationBarHeight:(state) => {
			state.navigationBarHeight = getStore('navigationBarHeight') ? getStore('navigationBarHeight') : 46;
			return state.navigationBarHeight
		},
		capsuleMessage:(state) => {
			state.capsuleMessage = getStore('capsuleMessage') ? getStore('capsuleMessage') : {};
			return state.capsuleMessage
		},
		catch_components:(state) => {
			return state.catch_components
		},
		currentElectronicSignature: (state) => {
			return state.currentElectronicSignature
		},
		originalSignature: (state) => {
			return state.originalSignature
		},
		baseURL:(state) => {
			return state.baseURL
		}
	},
	mutations: {
		storeStatusBarHeight(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('statusBarHeight', playLoad);
				state.statusBarHeight = playLoad
			}
		},
		storeNavigationBarHeight(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('navigationBarHeight', playLoad);
				state.navigationBarHeight = playLoad
			}
		},
		storeCapsuleMessage(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setStore('capsuleMessage', playLoad);
				state.capsuleMessage = playLoad
			}
		},
		storeCatchComponents (state,playLoad) {
			if (playLoad && playLoad != 'null') {
				state.catch_components = playLoad
			}
		},
		// 改变当前电子签名状态
		changeCurrentElectronicSignature (state,payLoad) {
			if (payLoad && payLoad != 'null') {
				state.currentElectronicSignature = payLoad.DtMsg
			}
		},
		// 改变原始签名状态
		  changeOriginalSignature (state,payLoad) {
			state.originalSignature = payLoad
		},
		//重置公共信息的状态
		resetCommonInfoState(state) {
				Object.assign(state, getDefaultCommonState())
		}
	},
	actions: {
		resetCommitState({ commit }) {
			commit('resetCommonInfoState')
		}
	}
}
