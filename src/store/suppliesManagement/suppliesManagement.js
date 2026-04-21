import { setStore, getStore } from '@/common/js/utils'
import { getDefaultSuppliesManagementState } from '@/common/js/resetStore.js'
export default {	
	state: getDefaultSuppliesManagementState(),
	getters: {
		suppliesHomeGlobalTimer: (state) => {
            return state.suppliesHomeGlobalTimer
        },
		takeStockOrderMessage: (state) => {
            return state.takeStockOrderMessage
        },
		takeStockEditOrderMessage: (state) => {
            return state.takeStockEditOrderMessage
        },
	},
	mutations: {
		// 保存全局物资管理首页
		changeSuppliesHomeGlobalTimer (state, payLoad) {
            state.suppliesHomeGlobalTimer = payLoad
        },
		// 保存盘点信息
		changeTakeStockOrderMessage (state, payLoad) {
            state.takeStockOrderMessage = payLoad
        },
		// 保存编辑盘点信息
		changeTakeStockEditOrderMessage (state, payLoad) {
            state.takeStockEditOrderMessage = payLoad
        },
		//重置公共信息的状态
		resetSuppliesManagementInfoState(state) {
			Object.assign(state, getDefaultSuppliesManagementState())
		}
	},
	actions: {
		resetSuppliesManagementState({ commit }) {
			commit('resetSuppliesManagementInfoState')
		}
	}
}
