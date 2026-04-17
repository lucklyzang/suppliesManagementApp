import request from '@/utils/request'
import qs from 'qs'

// 上传文件
export function fileUpload(data) {
	return request({
	    url: '/spd/admin-api/infra/file/upload',
	    method: 'post',
		data
	  })
}

// 各任务类型数量统计
export function getSaleStatisticsStatusSummary() {
	return request({
	    url: '/spd/admin-api/erp/sale-statistics/status-summary',
	    method: 'get'
	  })
}

// 获取计划订单分页
export function getPlanOrderPage(data) {
	if (data.orderTime && Array.isArray(data.orderTime)) {
	  data.orderTime = data.orderTime.map(function(date,index,array){
			if (index == 0) {
				return date + ' 00:00:00'
			} else if (index == 1) {
				return date + ' 23:59:59'
			}
		})
	};
	return request({
	    url: '/spd/admin-api/erp/plan-order/page',
	    method: 'get',
			params: data,
			paramsSerializer: function (params) {
				return qs.stringify(params, { arrayFormat: 'repeat' })
			}
	  })
}

// 获得计划订单详情
export function getPlanOrder(id) {
	return request({
	    url: `/spd/admin-api/erp/plan-order/get?id=${id}`,
	    method: 'get'
	  })
}

// 根据订单查询出货单
export function getSaleReturnPage(id) {
	return request({
	    url: `/spd/admin-api/erp/sale-out/query-by-orderId?orderId=${id}`,
	    method: 'get'
	  })
}

// 获得出货单详情
export function getSaleReturn(id) {
	return request({
	    url: `/spd/admin-api/erp/sale-out/get?id=${id}`,
	    method: 'get'
	  })
}

// 创建退换货
export function createSaleReturn(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-return/create',
	    method: 'post',
		data
	  })
}

// 创建出库
export function createSaleOut(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/create',
	    method: 'post',
		data
	  })
}

// 更新订单状态
export function checkOrder(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-order/update-status',
	    method: 'put',
		params: data
	})
}

// 查询订单操作记录
export function queryorderOperationLog(orderId) {
	return request({
	    url: `/spd/admin-api/erp/order-operation-log/list-by-order-id?orderId=${orderId}`,
	    method: 'get'
	  })
}

// 查询仓库信息
export function getwarehouseInfo() {
	return request({
	    url: '/spd/admin-api/erp/warehouse/simple-list',
	    method: 'get'
	  })
}

// 获取产品库存分页
export function getStockPage(data) {
	return request({
	    url: '/spd/admin-api/erp/stock/page',
	    method: 'get',
		params: data,
	})	
}

// 获取出库分页
export function getSaleOutPage(data) {
	if (data.outTime && Array.isArray(data.outTime)) {
	  data.outTime = data.outTime.map(function(date,index,array){
			if (index == 0) {
				return date + ' 00:00:00'
			} else if (index == 1) {
				return date + ' 23:59:59'
			}
		})
	};
	return request({
	    url: '/spd/admin-api/erp/sale-out/page',
	    method: 'get',
			params: data,
			paramsSerializer: function (params) {
				return qs.stringify(params, { arrayFormat: 'repeat' })
			}
	  })
}

// 获取用户列表
export function queryUserList(type) {
	return request({
	    url: `/spd/admin-api/system/user/simple-list?type=${type}`,
	    method: 'get'
	  })
}

// 配送订单
export function saleOutDistributiony(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/delivery',
	    method: 'put',
		data
	})
}

// 取消送货单
export function saleOutCancel(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/cancel',
	    method: 'put',
		params: data
	})
}

// 撤销送货单
export function saleOutRevoke(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/revoke',
	    method: 'put',
		params: data
	})
}

// 送货单送达确认
export function saleOutDeliveryConfirm(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-out/delivery-confirm',
	    method: 'put',
		data
	})
}

// 获取退换货分页
export function getSaleReturnBarterPage(data) {
	if (data.returnTime && Array.isArray(data.returnTime)) {
	  data.returnTime = data.returnTime.map(function(date,index,array){
			if (index == 0) {
				return date + ' 00:00:00'
			} else if (index == 1) {
				return date + ' 23:59:59'
			}
		})
	};
	return request({
	    url: '/spd/admin-api/erp/sale-return/page',
	    method: 'get',
			params: data,
			paramsSerializer: function (params) {
				return qs.stringify(params, { arrayFormat: 'repeat' })
			}
	  })
}


// 获得退换货详情
export function getSaleReturnBarter(id) {
	return request({
	    url: `/spd/admin-api/erp/sale-return/get?id=${id}`,
	    method: 'get'
	  })
}

// 更新退换货状态
export function updateSaleReturOrder(data) {
	return request({
	    url: '/spd/admin-api/erp/sale-return/update-status',
	    method: 'put',
		params: data
	})
}

// 获取评价分页
export function getEvaluatePage(data) {
	if (data.createTime && Array.isArray(data.createTime)) {
	  data.createTime = data.createTime.map(function(date,index,array){
			if (index == 0) {
				return date + ' 00:00:00'
			} else if (index == 1) {
				return date + ' 23:59:59'
			}
		})
	};
	return request({
	    url: '/spd/admin-api/erp/order-evaluate/page',
	    method: 'get',
			params: data,
			paramsSerializer: function (params) {
				return qs.stringify(params, { arrayFormat: 'repeat' })
			}
	  })
}

// 创建产品盘点单
export function createStockCheck(data) {
	return request({
	    url: '/spd/admin-api/erp/stock-check/create',
	    method: 'post',
		data
	})	
}

// 更新库存盘点单
export function updateStockCheck(data) {
	return request({
	    url: '/spd/admin-api/erp/stock-check/update',
	    method: 'put',
		data
	})	
}

// 更新库存盘点单状态
export function updateStockCheckStatus(data) {
	return request({
		url: '/spd/admin-api/erp/stock-check/update-status',
		method: 'put',
		params: data,
		paramsSerializer: function (params) {
			return qs.stringify(params, { arrayFormat: 'repeat' })
		}
	})
}

// 删除库存盘点单
export function deleteStockCheckStatus(data) {
	return request({
		url: '/spd/admin-api/erp/stock-check/delete',
		method: 'put',
		params: data,
		paramsSerializer: function (params) {
			return qs.stringify(params, { arrayFormat: 'repeat' })
		}
	})
}

// 获得产品盘点单记录分页
export function getStockCheckRecordsPage(data) {
	if (data.checkTime && Array.isArray(data.checkTime)) {
		data.checkTime = data.checkTime.map(function(date,index,array){
			if (index == 0) {
				return date + ' 00:00:00'
			} else if (index == 1) {
				return date + ' 23:59:59'
			}
		})
	};
	return request({
		url: '/spd/admin-api/erp/stock-check/page',
	    method: 'get',
		params: data,
		paramsSerializer: function (params) {
			return qs.stringify(params, { arrayFormat: 'repeat' })
		}
	})	
}

// 获得产品盘点单记录
export function getStockCheckRecord(id) {
	return request({
	    url: `/spd/admin-api/erp/stock-check/get?id=${id}`,
	    method: 'get'
	})	
}