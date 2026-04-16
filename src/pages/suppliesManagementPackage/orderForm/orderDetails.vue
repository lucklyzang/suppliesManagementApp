<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="订单详情" left-text="返回" left-arrow @click-left="onClickLeft"  :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-box">
            <div class="order-details-top">
                <div class="order-type">
                    <span>{{ orderMessage['orderTypeName'] }}</span>
                    <span>{{ orderMessage['no'] }}</span>
                </div>
                <div class="order-status"
                    :class="{
                    'staySureStyle ' : orderMessage.status == 20, 
                    'stayDeliveryStyle' : orderMessage.status == 30,
                    'stayCompleteStyle' : orderMessage.status == 50
                    }"
                >
                    <span>{{ stateTransfer(orderMessage['status']) }}</span>
                </div>
            </div>
            <div class="order-details-title">
				<div class="content-top-left">
					<span>产品清单</span>
				</div>
			</div>
			<div class="order-details-center">
				<div class="empty-info" v-show="materialList.length == 0">
					<van-empty description="暂无产品" />
				</div>
				<div class="product-list" v-for="(item) in materialList" :key="item.productName">
					<div class="product-left">
                        <img :src="item['images'] ? item['images'] : productDefaultImage" />
					</div>
					<div class="product-center">
						<div class="product-name">
							<span>
								{{ item.productName }}
							</span>
						</div>
						<div class="product-specification">
							<div class="product-specification-left">
								<span>
									{{ item.specification ? item.specification : '无' }}
								</span>
							</div>
							<div class="product-specification-right">
								<span>￥</span>
								<span>
									{{ formatPrice(item.productPrice) }}
								</span>
								<span>
									{{ `/${item.productUnitName}` }}
								</span>
							</div>
						</div>
					</div>
					<div class="product-right">
						<div class="product-number-box">
							<span>数量:</span>
							<span>{{ item.count }}</span>
						</div>
						<div class="product-total-price">
							<span>总额:</span>
							<span>{{ `￥${formatPrice(item.totalPrice)}` }}</span>
						</div>
					</div>
				</div>
			</div>
            <div class="order-message">
				<div class="create-delivery-date">
					<div class="create-delivery-date-left">
						<span>创建时间:</span>
						<span>{{ orderMessage['createTime'] }}</span>
					</div>
					<div class="create-delivery-date-left">
						<span>交货日期:</span>
						<span>{{ orderMessage['checkTime'] }}</span>
					</div>
				</div>
				<div class="create-delivery-date">
					<div class="create-delivery-date-left">
						<span>下单医院:</span>
						<span></span>
					</div>
					<div class="create-delivery-date-left">
						<span>送货地址:</span>
						<span>{{ orderMessage['address'] ? orderMessage['address'] : '无' }}</span>
					</div>
				</div>
				<div class="product-list remark-box">
					<span>备注:</span>
					<span>{{ orderMessage['remark'] ? orderMessage['remark'] : '无' }}</span>
				</div>
			</div>
            <div class="delivery-information-list" v-show="orderMessage['status'] == 50">
				<div class="delivery-information-text">
					<span>送货信息:</span>
				</div>
				<div class="delivery-information-box">
					<div class="delivery-information" v-for="(item,index) in saleReturnOrderList" :key="item.id" @click="enterChangingOrRefundingDetailsEvent(item,index)">
						<div class="delivery-information-left">
							<div class="delivery-number-message">
								<div class="delivery-number">
									<span>送货单号:</span>
									<span>{{ item.id }}</span>
								</div>
								<div class="harvest-date">
									<span>收货日期:</span>
									<span></span>
								</div>
							</div>
							<div class="related-order-number-message">
								<div class="related-order-number">
									<span>关联单号:</span>
									<span>{{ item.orderId }}</span>
								</div>
								<div class="delivery-date">
									<span>送货日期:</span>
									<span>{{ item.outTime }}</span>
								</div>
							</div>
						</div>
						<div class="delivery-information-right">
							<span :class="{'aleradyCompleteStyle' : item.status == 60}">{{ saleOutOrderStateTransfer(item.status) }}</span>
						</div>
					</div>
				</div>
			</div>
            <div class="order-status-record">
				<div class="order-status-record-text">
					<span>订单状态记录:</span>
				</div>
				<div class="order-status-record-list-wrapper">
					<div class="order-status-record-list" v-for="(item,index) in orderStatusRecordList" :key="item.id">
						<div class="order-status-record-list-line" v-show="index != orderStatusRecordList.length-1"></div>
						<div class="order-status-record-left">
							<span></span>
						</div>
						<div class="order-status-record-right">
							<div class="order-status-text"
							:class="{
								'noPassStyle ' : item.status == 21,
								'stayAuditStyle' : item.status == 10,
								'stayConfirmedStyle' : item.status == 20,
								'alreadyRefuseStyle' : item.status == 31,
								'stayDeliverStyle' : item.status == 30,
								'alreadyDeliverStyle' : item.status == 40,
								'afterSaleIngStyle' : item.status == 41,
								'alreadyCompletedStyle' : item.status == 50,
								'alreadyevaluatedStyle' : item.status == 51
								}"
							>
								<span>{{ stateTransfer(item.status) }}</span>
							</div>
							<div class="commom-view operation-time">
								<span>操作时间:</span>
								<span>{{ item.createTime }}</span>
							</div>
							<div class="commom-view operation-people">
								<span>操作人:</span>
								<span>{{ item.creatorName }}</span>
							</div>
							<div class="commom-view audit-opinion" v-show="item.status == 21">
								<span>审核意见:</span>
								<span>{{ item.content }}</span>
							</div>
							<div class="commom-view refuse-reason" v-show="item.status == 31">
								<span>拒绝理由:</span>
								<span>{{ item.content }}</span>
							</div>
							<div class="commom-view sales-return-reason" v-show="item.status == 41 || item.status == 50">
								<span>退货原因:</span>
								<span>{{ item.content }}</span>
							</div>
							<div class="commom-view score-box" v-show="item.status == 51">
								<span>评分:</span>
								<span>{{ item.content }}</span>
							</div>
							<div class="commom-view evaluate-box" v-show="item.status == 51">
								<span>评价:</span>
								<span>{{ item.content }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
        </div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import { getPlanOrder, queryorderOperationLog, getSaleReturnPage } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesOrderDetails",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
        loadingShow: false,
        infoText: '加载中...',
        allChooseProductPrice: 0,
        orderId: '',
        sourcePath: '',
        saleReturnOrderList: [],
        saleReturnOrderList: [],
        productDefaultImage: require('@/common/images/home/revocation-info-icon.png'),
        orderMessage: {},
        materialList: [],
        orderStatusRecordList: []
    }
  },

  mounted() { 
    // 控制设备物理返回按键
    this.deviceReturn(this.sourcePath);
    this.orderId = this.$route.query.orderId;
    this.parallelFunction();
  },

  beforeRouteEnter(to, from, next) {
     next(vm=>{
        vm.sourcePath = from.path
    });
    next()  
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo"]),
    userName() {
        return this.userInfo['nickname']
    },
    userAccount() {
        return this.userInfo['username']
    },
    workerId() {
        return this.userInfo['id']
    },
    proName () {
        return this.userInfo['deptName']
    },
    proId() {
        return this.userInfo['deptId']
    },
    depId() {
        return this.userInfo['departmentId']
    },
    depName() {
        return ''
    }
  },

  methods: {
    ...mapMutations([]),

    onClickLeft () {
        this.$router.push({path: this.sourcePath})
    },

    // 求和函数(计算所有添加产品总数量)
    reduceTotal() {
        let targetMsg = this.chooseMaterialList.filter((item) => {
            return item.quantity > 0
        });
        this.allChooseProductPrice = targetMsg.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.totalPrice
        }, 0)
    },

    //任务状态转换
    stateTransfer (num) {
        switch(num) {
            case 10:
                return '待审核'
                break;
            case 20:
                    return '待确认'
                    break;
            case 21:
                    return '未通过'
                    break;
            case 30:
                    return '待送货'
                    break;
            case 31:
                    return '已拒绝'
                    break;
            case 40:
                    return '已发货'
                    break;
            case 41:
                    return '售后中'
                    break;
            case 50:
                    return '已完成'
                    break;
        } 
    },
    
    //出库单任务状态转换
    saleOutOrderStateTransfer (num) {
        switch(num) {
            case 10:
                return '待送货'
                break;
            case 20:
                    return '已发货'
                    break;
            case 30:
                    return '退换货'
                    break;
            case 40:
                    return '已取消'
                    break;
            case 50:
                    return '已撤销'
                    break;
            case 60:
                    return '已确认'
                    break;
        } 
    },

    // 进入历史退换货详情事件
    enterChangingOrRefundingDetailsEvent (item,index) {
         this.$router.push({
            path: '/suppliesHistoryDeliveryNote', 
            query: {
                id: item.id,
                orderId: this.orderId,
                status: item.status
            }
        })
    },

    // 保留两位小数，返回数字类型，修复精度问题
    formatPrice(num) {
        if (typeof num !== 'number' || isNaN(num)) return "0.00";
            const value = Math.round(num * 100) / 100;
            return value.toFixed(2);
    },

    // 查询订单详情
    getPlanOrderEvent() {
        return new Promise((resolve,reject) => {
            getPlanOrder(this.orderId).then((res) => {
                this.loadingShow = false;
                this.infoText = '';
                if ( res && res.data.code == 0) {
                    resolve(res.data.data);
                } else {
                    reject(res.data.msg);
                    this.$toast({
                        type: 'fail',
                        message: res.data.msg
                    })
                }
            })
            .catch((err) => {
                reject(err)
            })
        })
    },
    
    // 查询订单操作记录
    queryorderOperationLogEvent () {
        return new Promise((resolve,reject) => {
            queryorderOperationLog(this.orderId)
            .then((res) => {
                this.loadingText = '';
                this.loadingShow = false;
                if (res && res.data.code == 0) {
                    resolve(res.data.data)
                } else {
                    reject(res.data.msg);
                    this.$toast({
                        type: 'fail',
                        message: res.data.msg
                    })
                }
            })
            .catch((err) => {
                reject(err)
            })
        })
    },
    
    // 查询出货单列表
    getSaleReturnPageEvent() {
        return new Promise((resolve,reject) => {
            getSaleReturnPage(this.orderId).then((res) => {
                this.loadingText = '';
                this.loadingShow = false;
                if ( res && res.data.code == 0) {
                    resolve(res.data.data)
                } else {
                    reject(res.data.msg);
                    this.$toast({
                        type: 'fail',
                        message: res.data.msg
                    })
                }
            })
            .catch((err) => {
                reject(err)
            })
        })
    },

    // 并行查询订单详情、订单操作记录、出货单列表
	parallelFunction () {
        this.loadingShow = false;
        this.infoText = '加载中···';
        Promise.all([this.getPlanOrderEvent(),this.queryorderOperationLogEvent(),this.getSaleReturnPageEvent()])
        .then((res) => {
            this.loadingShow = false;
            this.infoText = '';
            if (res && res.length > 0) {
                this.saleReturnOrderList = [];
                this.orderStatusRecordList = [];
                this.orderMessage = {};
                let [item1,item2,item3] = res;
                if (item1) {
                    this.orderMessage = item1;
                    this.materialList = this.orderMessage['items'];
                    this.allChooseProductPrice = this.orderMessage['totalProductPrice'];
                    this.orderMessage['createTime'] = this.orderMessage['createTime'] ? SOtime.time3(this.orderMessage['createTime']) : '';
                    this.orderMessage['checkTime'] = this.orderMessage['checkTime'] ? SOtime.time8(this.orderMessage['checkTime']) : '';
                };
                if (item2) {
                    this.orderStatusRecordList = item2;
                    this.orderStatusRecordList.forEach((item)=>{
                        item.createTime = SOtime.time3(item.createTime)
                    })
                };
                if (item3) {
                    this.saleReturnOrderList = item3;
                    if (this.saleReturnOrderList.length == 0) {
                        this.isShowNoData = true
                    } else {
                        this.saleReturnOrderList.forEach((item)=>{
                            item.outTime = SOtime.time8(item.outTime)
                        });
                        this.isShowNoData = false
                    }
                }
            }
        })
        .catch((err) => {
            this.loadingShow = false;
            this.infoText = '';
            this.$toast({
                type: 'fail',
                message: err
            })
        })
    }
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  .content-wrapper();
  .nav {
    width: 100%;
    background: #3B9DF9;
    /deep/ .van-nav-bar {
        background: transparent !important;
        .van-nav-bar__left {
            .van-nav-bar__text {
              color: #fff !important;
              margin-left: 8px !important;
            };
            .van-icon {
              color: #fff !important;
            }
        };
        .van-nav-bar__title {
          color: #fff !important;
          font-size: 16px !important;
        }
    }
  };
  /deep/ .van-loading {
    z-index: 1000000
  };  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: auto;
    .content-box {
        flex: 1;
        box-sizing: border-box;
        background: #fff;
        display: flex;
        flex-direction: column;
        padding: 0px 6px 20px 6px;
        .order-details-top {
            display: flex;
            height: 50px;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            box-sizing: border-box;
            .order-type {
                flex: 1;
                margin-right: 10px;
                .no-wrap();
                >span {
                    font-size: 16px;
                    color: #3B9DF9;
                }
            };
            .order-status {
                display: flex;
                height: 40px;
                align-items: center;
                justify-content: center;
                width: 67px;
                height: 25px;
                background: rgba(232,203,81,0.16);
                border-radius: 4px;
            };
            .staySureStyle {
                background: rgba(232,203,81,0.16) !important;
                color: #E8CB51 !important;
            };
            .stayDeliveryStyle {
                background: #E7F3FE !important;
                color: #3B9DF9 !important;
            };
            .stayCompleteStyle {
                color: #101010 !important;
                background: rgba(158,161,182,1) !important
            }
        };
        .order-details-title {
            padding: 0 12px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            .content-top-left {
                >span {
                font-size: 14px;
                color: #777575; 
                }
            };
            .content-top-right {
                width: 84px;
                height: 27px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                background: #3B9DF9;
                >span {
                    font-size: 12px;
                    color: #fff;
                    margin-left: 4px;
                }
            }
        };
        .order-details-center {
            width: 99%;
            padding: 0 10px;
            box-sizing: border-box;
            height: 564px;
            margin: 0 auto;
            border-radius: 6px;
            background: #F0F2FE;
            overflow: auto;
            position: relative;
            /deep/ .van-empty {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%)
            };
            .product-list {
                padding: 10px 0;
                box-sizing: border-box;
                border-bottom: 1px solid #BBBBBB;
                display: flex;
                align-items: center;
                .product-left {
                    margin-right: 10px;
                    img {
                        width: 54px;
                        height: 54px;
                    }
                };
                .product-center {
                    flex: 1;
                    margin-right: 10px;
                     .no-wrap;
                    .product-name {
                        .no-wrap;
                        margin-bottom: 8px;
                        >span {
                            width: 100%;
                            display: inline-block;
                            .no-wrap;
                            font-size: 14px;
                            color: #3B9DF9;
                        }
                    };
                    .product-specification {
                        display: flex;
                        .no-wrap;
                        .product-specification-left {
                            margin-right: 10px;
                            >span {
                                font-size: 12px;
                                color: #777575;
                            }
                        };
                        .product-specification-right {
                            flex: 1;
                            .no-wrap;
                            >span {
                                font-size: 12px;
                                color: #F44E23;
                            }
                        }
                    }
                };
                .product-right {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    .product-number-box {
                        margin-bottom: 12px;
                        >span {
                            font-size: 12px;
                            color: #101010;
                            &:nth-child(1) {
                                margin-right: 10px;
                            }
                        }
                    };
                    .product-total-price {
                        text-align: center;
                        >span {
                            font-size: 12px;
                            color: #101010;
                            &:nth-child(1) {
                                margin-right: 10px;
                            };
                            &:nth-child(2) {
                                color: #F44E23;							
                            }
                        }
                    }
                }
            }
        };
        .order-message {
            margin: 10px 0;
            padding: 0 6px;
            box-sizing: border-box;
            .create-delivery-date {
                    display: flex;
                    margin-top: 16px;
                    .create-delivery-date-left {
                        flex: 1;
                        width: 0;
                        display: flex;
                        >span {
                            display: inline-block;
                            font-size: 12px;
                            &:nth-child(1) {
                                color: #9E9E9A;
                                margin-right: 6px;
                            };
                            &:nth-child(2) {
                                word-break: break-all;
                                flex: 1;
                                color: #101010;
                            }
                        }
                    };
                    .create-delivery-date-right {
                        flex: 1;
                        width: 0;
                        display: flex;
                        >span {
                            display: inline-block;
                            font-size: 12px;
                            &:nth-child(1) {
                                color: #9E9E9A;
                                margin-right: 6px;
                            };
                            &:nth-child(2) {
                                word-break: break-all;
                                flex: 1;
                                color: #101010;
                            }
                        }
                    }
            };
            .remark-box {
                display: flex;
                margin-top: 16px;
                >span {
                        display: inline-block;
                        font-size: 12px;
                        &:nth-child(1) {
                            color: #000000;
                            margin-right: 6px;
                        };
                        &:nth-child(2) {
                            word-break: break-all;
                            flex: 1;
                            color: #000000 !important;
                        }
                }
            }	
        };
        .delivery-information-list {
            padding: 0 6px;
            box-sizing: border-box;
            margin-bottom: 10px;
            max-height: 250px;
            display: flex;
            flex-direction: column;
            .delivery-information-text {
                margin-bottom: 6px;
                padding: 0 3px 0 0;
                box-sizing: border-box;
                >span {
                    font-size: 14px;
                    color: #101010;
                }
            };
            .delivery-information-box {
                flex: 1;
                overflow: auto;
                .delivery-information {
                    border-radius: 6px;
                    background-color: rgba(255,255,255,1);
                    box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.07);
                    padding: 6px 3px;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    .delivery-information-left {
                        flex: 1;
                        width: 0;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        .delivery-number-message {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 10px;
                            .delivery-number {
                                flex: 1;
                                margin-right: 10px;
                                width: 0;
                                display: flex;
                                align-items: center;
                                >span {
                                    font-size: 14px;
                                    color: #101010;
                                    &:nth-child(1) {
                                        margin-right: 4px;
                                    };
                                    &:nth-child(2) {
                                        .no-wrap;
                                        flex: 1;
                                    }
                                }
                            };
                            .harvest-date {
                                flex: 1;
                                width: 0;
                                display: flex;
                                align-items: center;
                                >span {
                                    font-size: 12px;
                                    color: #777575;
                                    &:nth-child(1) {
                                        margin-right: 4px;
                                    };
                                    &:nth-child(2) {
                                        .no-wrap;
                                        flex: 1;
                                    }
                                }
                            }
                        };
                        .related-order-number-message {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            .related-order-number {
                                flex: 1;
                                margin-right: 10px;
                                width: 0;
                                display: flex;
                                align-items: center;
                                >span {
                                    font-size: 12px;
                                    color: #777575;
                                    &:nth-child(1) {
                                        margin-right: 4px;
                                    };
                                    &:nth-child(2) {
                                        .no-wrap;
                                        flex: 1;
                                    }
                                }
                            };
                            .delivery-date {
                                flex: 1;
                                width: 0;
                                display: flex;
                                align-items: center;
                                >span {
                                    font-size: 12px;
                                    color: #777575;
                                    &:nth-child(1) {
                                        margin-right: 4px;
                                    };
                                    &:nth-child(2) {
                                        .no-wrap;
                                        flex: 1;
                                    }
                                }
                            }
                        }
                    };
                    .delivery-information-right {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 60px;
                        >span {
                            display: inline-block;
                            width: 52px;
                            height: 26px;
                            text-align: center;
                            line-height: 26px;
                            border-radius: 4px;
                            background: #E8CB51;
                            color: #fff;
                            font-size: 12px;
                        };
                        .aleradyCompleteStyle {
                            background: #9EA1B6 !important
                        }
                    }
                }
            }
        };
        .order-status-record {
            padding: 0 3px;
            box-sizing: border-box;
            margin-bottom: 6px;
            .order-status-record-text {
                margin-bottom: 10px;
                padding: 0 3px;
                box-sizing: border-box;
                >span {
                    font-size: 14px;
                    color: #101010;
                }
            };
            .order-status-record-list-wrapper {
                .order-status-record-list {
                    display: flex;
                    padding-bottom: 10px;
                    box-sizing: border-box;
                    position: relative;
                    .order-status-record-list-line {
                        position: absolute;
                        top: 10px;
                        left: 6px;
                        width: 1px;
                        height: 100%;
                        background: rgba(59,157,249,0.19);
                    };
                    .order-status-record-left {
                        display: flex;
                        justify-content: center;
                        margin-right: 10px;
                        padding-top: 3px;
                        box-sizing: border-box;
                        >span {
                            width: 14px;
                            height: 14px;
                            z-index: 10;
                            border-radius: 50%;
                            background-color: #3370FF;
                        }
                    };
                    .order-status-record-right {
                        flex: 1;
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        >div {
                            padding: 4px 0;
                            box-sizing: border-box;
                            margin-right: 4px;
                        };
                        .order-status-text {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 4px 8px;
                            box-sizing: border-box;
                            background: #3370FF;
                            border-radius: 4px;
                            >span {
                                font-size: 10px;
                                color: #fff;
                            }
                        };
                        .stayAuditStyle {
                            background: #3370FF !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .noPassStyle {
                            background: #F14A33 !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .stayConfirmedStyle {
                            background: #289E8E !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .alreadyRefuseStyle {
                            background: #F14A33 !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .stayDeliverStyle {
                            background: #3370FF !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .alreadyDeliverStyle {
                            background: #289E8E !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .afterSaleIngStyle {
                            background: #F2A15F !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .alreadyCompletedStyle {
                            background: #101010 !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .alreadyevaluatedStyle {
                            background: #3B9DF9 !important;
                            >span {
                                color: #fff !important;
                            }
                        };
                        .commom-view {
                            >span {
                                font-size: 12px;
                                color: #BBBBBB;
                                &:nth-child(1) {
                                    margin-right: 2px;
                                }
                            }
                        }
                    }
                }
            }	
        }
    }
  }
}
</style>