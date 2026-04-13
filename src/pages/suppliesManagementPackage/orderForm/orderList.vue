<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="订单" left-text="返回" left-arrow @click-left="onClickLeft" @click-right="enterHistoryOrderEvent"  :border="false">
            <template #right>
                <van-icon name="underway-o" size="18" color="#fff" />
                <span class="history-span">历史</span>
            </template>
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-box">
          <div class="status-date-box">
				<div class="status-box" ref="myElement">
					<div class="status-span" @click="orderStatusListShow = !orderStatusListShow">
						<span>{{ currentStatusText }}</span>
						<van-icon :name="orderStatusListShow ? 'arrow-down' : 'arrow-up'" color="#101010" size="16" />
					</div>
					<div class="status-list-box" v-show="orderStatusListShow">
						<div class="status-list" v-for="(item,index) in orderStatusList" @click="statusListEvent(item,index)" :key="index">
							<span :class="{'statusspanStyle': index == currentStatusIndex }">{{ item.text }}</span>
						</div>
					</div>
				</div>
				<div class="data-box">
					<div class="date-span">
						<span>日期:</span>
					</div>
					<div class="date-choose" @click="showCalendar = true">
						<span>{{ startDate }}</span>
						<van-icon name="minus" color="#CACACA" size="18" />
						<span>{{ endDate }}</span>
						<van-icon name="notes-o" color="#CACACA" size="20" />
					</div>
				</div>
			</div>
            <div class="order-list-box" ref="scrollBacklogTask">
				<div class="order-list" v-for="(item,index) in fullOrderList" :key="index" @click="enterOrderDetailsEvent(item,index)">
					<div class="order-list-top">
						<div class="order-type">
							<span>{{ item.orderTypeName }}</span>
							<span>{{ item.no }}</span>
						</div>
						<div class="order-status"
						:class="{
							'staySureStyle ' : item.status == 20, 
							'stayDeliveryStyle' : item.status == 30,
							}"
						>
							<span>{{ stateTransfer(item.status) }}</span>
						</div>
					</div>
					<div class="order-list-center">
						<div class="product-list">
							<span>产品清单:</span>
							<span>{{ extractProductInventoryMessage(item['items']) }}</span>
						</div>
						<div class="create-delivery-date">
							<div class="create-delivery-date-left">
								<span>创建时间:</span>
								<span>{{ item.createTime }}</span>
							</div>
							<div class="create-delivery-date-left">
								<span>交货日期:</span>
								<span>{{ item.orderTime }}</span>
							</div>
						</div>
						<div class="create-delivery-date delivery-address">
                            <div class="create-delivery-date-left">
								<span>下单医院:</span>
								<span></span>
							</div>
							<div class="create-delivery-date-left">
								<span>送货地址:</span>
								<span>{{ item.address }}</span>
							</div>
						</div>
						<div class="product-list remark-box">
							<span>备注:</span>
							<span>{{ item.remark ? item.remark : '无' }}</span>
						</div>
					</div>
					<div class="order-list-bottom">
						<div class="order-list-btn">
							<div class="delete-left" v-show="item.status == 30" @click.stop="revocationSureEvent(item,index)">
								<span>撤销确认</span>
							</div>
							<div class="delete-left" v-show="item.status == 20"  @click.stop="refuseEvent(item,index)">
								<span>拒绝订单</span>
							</div>
							<div class="edit-right" v-show="item.status == 30" @click.stop="createDeliveryOrderEvent(item,index)">
								<span>生成送货单</span>
							</div>
							<div class="edit-right" v-show="item.status == 20" @click.stop="sureEvent(item,index)">
								<span>确认订单</span>
							</div>
						</div>
					</div>
				</div>
                <van-empty description="您还没有相关订单" v-show="isShowNoData" />
                <div v-show="bottomLoadingShow" class="bottom-loading-show">
                    加载中...
                </div>
                <div class="no-more-data" v-show="isShowNoMoreData && !loadingShow && !isShowNoData">没有更多数据了!</div>
			</div>
        </div>
    </div>
    <!-- 拒绝弹框	 -->
    <div class="refuse-modal">
        <van-dialog v-model="refuseModalShow" :showConfirmButton="false">
            <div class="evaluate-model-content">
                <div class="evaluate-modal-top">
                    <span>拒绝订单</span>
                    <van-icon name="cross" color="#101010" size="20" @click="refuseModalShow = false" />
                </div>
                <div class="evaluate-modal-center">
                    <div class="evaluate-box">
                        <div class="evaluate-span">
                            <span>*</span>
                            <span>拒绝理由:</span>
                        </div>
                        <div class="evaluate-content">
                            <van-field
                                v-model="refuseReasonValue"
                                type="textarea"
                                placeholder="请输入"
                            />
                        </div>
                    </div>
                </div>
                <div class="evaluate-modal-bottom">
                    <div class="evaluate-modal-btn">
                        <div class="cancel-left" @click.stop="refuseModalCancelEvent">
                            <span>取消</span>
                        </div>
                        <div class="submit-right" @click.stop="refuseModalSubmitEvent">
                            <span>提交</span>
                        </div>
                    </div>
                </div>
            </div>
        </van-dialog>
    </div>
      <!-- 撤销确认送货单弹框	 -->
    <div class="revocation-delivery-order-modal">
        <van-dialog v-model="revocationDeliveryOrderModalShow" :showConfirmButton="false">
            <div class="evaluate-model-content">
                <div class="evaluate-modal-top">
                    <span>撤销确认</span>
                    <van-icon name="cross" color="#101010" size="20" @click="revocationDeliveryOrderModalShow = false" />
                </div>
                <div class="evaluate-modal-center">
                  <img :src="revocationInfoImage"  />
                  <div class="modal-center-content">请再次确认是否要撤销确认订单？</div>
                </div>
                <div class="evaluate-modal-bottom">
                    <div class="evaluate-modal-btn">
                        <div class="cancel-left" @click.stop="revocationDeliveryOrderModalShowCancelEvent">
                            <span>取消</span>
                        </div>
                        <div class="submit-right" @click.stop="revocationDeliveryOrderModalShowSureEvent">
                            <span>确定</span>
                        </div>
                    </div>
                </div>
            </div>
        </van-dialog>
    </div>
    <!-- 日历 --> 
    <van-calendar v-model="showCalendar" :min-date="minDate" :max-date="maxDate" :default-date="defaultDateArr" type="range" @confirm="calendarConfirm" />
  </div>
</template>
<script>
import NavBar from "@/components/NavBar"
import { mapGetters, mapMutations } from "vuex"
import { mixinsDeviceReturn } from '@/mixins/deviceReturnFunction'
import { getPlanOrderPage, checkOrder } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesOrderList",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      bottomLoadingShow: false,
      infoText: '加载中...',
      isShowNoData: false,
      isShowNoMoreData: false,
      currentPageNum: 1,
      pageSize: 20,
      totalCount: 0,
      refuseModalShow: false,
      showCalendar: false,
      revocationDeliveryOrderModalShow: false,
      revocationInfoImage: require('@/common/images/home/revocation-info-icon.png'),
      sourcePath: '',
      defaultDateArr: [],
      startDate: '',
      endDate: '',
      minDate: new Date('2026-03-16'),
      maxDate: new Date('2027-03-16'),
      currentStatusText: '全部状态',
      currentStatusIndex: 0,
      currentStatusValue: '',
      needQueryStatusList: [20,30],
      orderStatusListShow: false,
      refuseReasonValue: '',
      currentOrderIndex: '',
      currentOrderId: '',
      orderStatusList: [
        {
            value: '',
            text: '全部状态'
		},
        {
            value: 20,
            text: '待确认'
        },
        {
            value: 30,
            text: '待送货'
        }
      ],
      eventTime: 0,
      orderList: [],
      fullOrderList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/suppliesHome');
    this.$nextTick(()=> {
      this.initScrollChange()
    });
    this.getDateRange();
    this.getPlanOrderPageEvent({
        pageNo: this.currentPageNum,
        pageSize: this.pageSize,
        status: '',
        statusList: this.currentStatusValue === '' ? this.needQueryStatusList : [this.currentStatusValue],
        orderTime: [`${this.startDate}`,`${this.endDate}`],
        creator: ''// this.userAccount
    },true)
    const el = this.$refs.myElement;
    //点击状态栏区域以外的地方时，库房列表收起
    document.addEventListener('click', (event) => {
        if (el && !el.contains(event.target)){
            this.orderStatusListShow = false;
        }
    }, false)
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
        this.$router.push({path: '/suppliesHome'})
    },

    // 进入历史订单事件
    enterHistoryOrderEvent () {
        this.$router.push({path: '/suppliesHistoryOrderList'})
    },

    // 事件列表注册滚动事件
    initScrollChange () {
      let boxBackScroll = this.$refs['scrollBacklogTask'];
      boxBackScroll.addEventListener('scroll',this.eventListLoadMore,true)
    },

    // 事件列表加载事件
    eventListLoadMore () {
      let boxBackScroll = this.$refs['scrollBacklogTask'];
      if (Math.ceil(boxBackScroll.scrollTop) + boxBackScroll.offsetHeight >= boxBackScroll.scrollHeight) {
        // 点击筛选确定后，不加载数据
        if (this.eventTime) {return};
        this.eventTime = 1;
        this.timeTwo = setTimeout(() => {
          let totalPage = Math.ceil(this.totalCount/this.pageSize);
          if (this.currentPageNum >= totalPage) {
           this.isShowNoMoreData = true;
          } else {
            this.isShowNoMoreData = false;
            this.currentPageNum = this.currentPageNum + 1;
            this.getPlanOrderPageEvent({
                pageNo: this.currentPageNum,
                pageSize: this.pageSize,
                status: '',
                statusList: this.currentStatusValue === '' ? this.needQueryStatusList : [this.currentStatusValue],
                orderTime: [`${this.startDate}`,`${this.endDate}`],
                creator: '' // this.userAccount
            },false)
          };
          this.eventTime = 0;
          console.log('事件列表滚动了',boxBackScroll.scrollTop, boxBackScroll.offsetHeight, boxBackScroll.scrollHeight)
        },300)
      }
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

    // 提取产品清单信息
    extractProductInventoryMessage (items) {
        if (items.length == 0) {
            return ''
        };
        let temporaryArray = [];
        for (let item of items) {
            temporaryArray.push(item.productName);
        };
        return temporaryArray.join("、")
    },

    // 撤销生成送货单确认弹框取消事件
    revocationDeliveryOrderModalShowCancelEvent () {
      this.revocationDeliveryOrderModalShow = false;
    },

    // 撤销生成送货单确认弹框确认事件
    revocationDeliveryOrderModalShowSureEvent () {
      this.revocationDeliveryOrderModalShow = false;
      this.checkOrderEvent({
        id: this.currentOrderId,
        status: 20
      },30)
    },

    // 拒绝弹框取消事件
    refuseModalCancelEvent () {
        this.refuseModalShow = false
    },
    
    // 拒绝弹提交事件
    refuseModalSubmitEvent () {
        this.refuseModalShow = false;
        if (this.refuseReasonValue === '') {
            this.$toast({
                type: 'fail',
                message: '拒绝理由不能为空'
            });
            return
        };
        this.checkOrderEvent({
            id: this.currentOrderId ,
            status: 31,
            content: this.refuseReasonValue
        },30)
    },

    // 更新订单状态(拒绝-31、确认-30、撤销确认-20)
    checkOrderEvent(data,status) {
        this.loadingShow = true;
        this.infoText = '提交中···';
        checkOrder(data).then((res) => {
            this.infoText = '';
            this.loadingShow = false;
            if ( res && res.data.code == 0) {
                if (res.data.data) {
                    if (status == 31) {
                        this.fullOrderList.splice(this.currentOrderIndex,1);
                    } else if (status == 30) {
                        if (this.currentStatusValue === '') {
                            this.fullOrderList.forEach((item,index) => {
                                if (item.id == this.currentOrderId) {
                                    item.status = 30
                                }
                            })
                        } else {
                            this.fullOrderList.splice(this.currentOrderIndex,1);
                        }
                    } else if (status == 20) {
                         if (this.currentStatusValue === '') {
                            this.fullOrderList.forEach((item,index) => {
                                if (item.id == this.currentOrderId) {
                                    item.status = 20
                                }
                            })
                        } else {
                            this.fullOrderList.splice(this.currentOrderIndex,1);
                        }
                    };
                    this.$toast({
                        type: 'success',
                        message: '提交成功!'
                    })
                } else {
                    this.$toast({
                        type: 'fail',
                        message: res.data.msg
                    })
                }
            } else {
               this.$toast({
                    type: 'fail',
                    message: res.data.msg
                })
            }
        })
        .catch((err) => {
            this.infoText = '';
            this.loadingShow = false;
            this.$toast({
                type: 'fail',
                message: err
            })
        })
    },

    // 查询订单列表
    getPlanOrderPageEvent(data,flag) {
        this.orderList = [];
        this.isShowNoData = false;
        if (flag) {
            this.fullOrderList = [];
            this.loadingShow = true;
            this.infoText = '加载中···';
            this.bottomLoadingShow = false;
        } else {
            this.loadingShow = false;
            this.infoText = '';
            this.bottomLoadingShow = true;
        };
        getPlanOrderPage(data).then((res) => {
            if ( res && res.data.code == 0) {
                this.orderList = res.data.data.list;
                this.totalCount = res.data.data.total;
                this.orderList.forEach((item)=>{
                    item.createTime = SOtime.time3(item.createTime);
                    item.orderTime = SOtime.time8(item.orderTime);
                });
                this.fullOrderList = this.fullOrderList.concat(this.orderList);
                if (this.fullOrderList.length == 0) {
                    this.isShowNoData = true
                } else {
                    this.isShowNoData = false
                };
            } else {
                this.$toast({
                    type: 'fail',
                    message: res.data.msg
                })
            };
            if (flag) {
                this.loadingShow = false;
                this.infoText = '';
            } else {
                this.bottomLoadingShow = false;
                let totalPage = Math.ceil(this.totalCount/this.pageSize);
                if (this.currentPageNum >= totalPage) {
                    this.isShowNoMoreData = true;
                } else {
                    this.isShowNoMoreData = false;
                }	
            }
        })
        .catch((err) => {
            if (flag) {
                this.loadingShow = false;
                this.infoText = '';
            } else {
                this.bottomLoadingShow = false;
            };
            this.$toast({
                type: 'fail',
                message: err
            })
        })
    },
			
    
    // 日历日期选择确认事件
    calendarConfirm(e) {
        this.showCalendar = false;
        this.startDate = SOtime.time8(new Date(e[0]).getTime());
        this.endDate = SOtime.time8(new Date(e[e.length-1]).getTime());
        this.currentPageNum = 1;
        this.getPlanOrderPageEvent({
            pageNo: this.currentPageNum,
            pageSize: this.pageSize,
            status: '',
            statusList: this.currentStatusValue === '' ? this.needQueryStatusList : [this.currentStatusValue],
            orderTime: [`${this.startDate}`,`${this.endDate}`],
            creator: '' // this.userAccount
        },true)
    },
    
    // 将时间戳转换为当天的 00:00:00
    normalizeTimestamp () {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return Number(date)
    },

    // 获取开始和结束日期(中间相隔一个月)
    getDateRange() {
        this.defaultDateArr = [];
        const end = new Date(); 
        const start = new Date(end);
        start.setMonth(end.getMonth() - 1);
        start.setHours(23, 59, 59, 999);
        this.startDate = this.formatDate(start);
        this.endDate = this.formatDate(end);
        this.defaultDateArr.push(new Date(this.startDate));
        this.defaultDateArr.push(new Date(this.endDate))
    },
    
    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },
    
    // 订单状态列表点击事件
    statusListEvent(item,index) {
        this.currentStatusText = item.text;
        this.currentStatusValue = item.value,
        this.currentStatusIndex = index;
        this.orderStatusListShow = false;
        this.currentPageNum = 1;
        this.getPlanOrderPageEvent({
            pageNo: this.currentPageNum,
            pageSize: this.pageSize,
            status: '',
            statusList: this.currentStatusValue === '' ? this.needQueryStatusList : [this.currentStatusValue],
            orderTime: [`${this.startDate}`,`${this.endDate}`],
            creator: '' // this.userAccount
        },true)
    },
    
    //进入订单详情事件
    enterOrderDetailsEvent(item,index) {
        this.$router.push({
            path: '/suppliesOrderDetails', 
            query: {
                orderId: item.id
            }
        })
    },
    
    // 撤销确认订单事件
    revocationSureEvent(item,index) {
        this.currentOrderIndex = index;
        this.currentOrderId = item['id'];
        this.revocationDeliveryOrderModalShow = true;
    },
    
    // 生成送货单事件
    createDeliveryOrderEvent(item,index) {
         this.$router.push({
            path: '/suppliesCreateDeliveryOrder', 
            query: {
                orderId: item.id
            }
        })
    },

    // 拒绝订单事件
    refuseEvent(item,index) {
        this.currentOrderIndex = index;
        this.currentOrderId = item['id'];
        this.refuseModalShow = true 
    },

    // 确认订单事件
    sureEvent(item,index) {
        this.currentOrderIndex = index;
        this.currentOrderId = item['id'];
        this.checkOrderEvent({
            id: this.currentOrderId ,
            status: 30
        },30)
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
   .refuse-modal {
        /deep/ .van-dialog {
            border-top-left-radius: 4px !important;
            border-top-right-radius: 4px !important;
            border-bottom-left-radius: 4px !important;
            border-bottom-right-radius: 4px !important;
            .van-dialog__content {
                .evaluate-model-content {
                    width: 100%;
                    .evaluate-modal-top {
                        height: 37px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 10px;
                        box-sizing: border-box;
                        background: #F6F9FB;
                        >span {
                            font-size: 14px;
                            color: #101010;
                        }
                    };
                    .evaluate-modal-center {
                        padding: 10px 40px;
                        box-sizing: border-box;
                        .evaluate-box {
                            display: flex;
                            flex-direction: column;
                            .evaluate-span {
                                margin-bottom: 10px;
                                >span {
                                   font-size: 14px;
                                   color: #101010;
                                    &:nth-child(1) {
                                        color: red !important;
                                    };
                                }
                            };
                            .evaluate-content {
                                flex: 1;
                                border: 1px solid #888888;
                                .van-cell {
                                    padding: 6px !important;
                                }
                            }
                        }
                    };
                    .evaluate-modal-bottom {
                        padding: 15px 70px;
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        .evaluate-modal-btn {
                            width: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            .cancel-left {
                                width: 74px;
                                height: 28px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1px solid #BBBBBB;
                                box-sizing: border-box;
                                border-radius: 5px;
                                >span {
                                    font-size: 12px;
                                    color: #BBBBBB;
                                }
                            };
                            .submit-right {
                                width: 74px;
                                height: 28px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: #3B9DF9;
                                border-radius: 5px;
                                >span {
                                    font-size: 12px;
                                    color: #fff
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    .revocation-delivery-order-modal {
      /deep/ .van-dialog {
          border-top-left-radius: 4px !important;
          border-top-right-radius: 4px !important;
          border-bottom-left-radius: 4px !important;
          border-bottom-right-radius: 4px !important;
          .van-dialog__content {
              .evaluate-model-content {
                  width: 100%;
                  .evaluate-modal-top {
                      height: 37px;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      padding: 0 10px;
                      box-sizing: border-box;
                      background: #F6F9FB;
                      >span {
                          font-size: 14px;
                          color: #101010;
                      }
                  };
                  .evaluate-modal-center {
                      padding: 20px 40px;
                      box-sizing: border-box;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      >img {
                        width: 70px;
                        height: 70px;
                      };
                     .modal-center-content {
                       margin-top: 20px;
                       font-size: 14px;
                       color: #101010;
                     }
                  };
                  .evaluate-modal-bottom {
                      padding: 15px 70px;
                      box-sizing: border-box;
                      display: flex;
                      align-items: center;
                      .evaluate-modal-btn {
                          width: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          .cancel-left {
                              width: 74px;
                              height: 28px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border: 1px solid #BBBBBB;
                              box-sizing: border-box;
                              border-radius: 5px;
                              >span {
                                  font-size: 12px;
                                  color: #BBBBBB;
                              }
                          };
                          .submit-right {
                              width: 74px;
                              height: 28px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              background: #3B9DF9;
                              border-radius: 5px;
                              >span {
                                  font-size: 12px;
                                  color: #fff
                              }
                          }
                      }
                  }
              }
          }
      }
  };
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
        .van-nav-bar__right {
          .history-span {
            color: #fff;
            margin-left: 4px;
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
    .content-box {
        flex: 1;
        box-sizing: border-box;
        background: #fff;
        display: flex;
        flex-direction: column;
        height: 0;
        padding: 0px 10px 10px 10px;
        .status-date-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
            .status-box {
                width: 70px;
                margin-right: 20px;
                position: relative;
                .status-span {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    >span {
                        margin-right: 4px;
                        font-size: 12px;
                        color: #101010
                    }
                };
                .status-list-box {
                    width: 70px;
                    background: #fff;
                    position: absolute;
                    left: 0;
                    top: 20px;
                    max-height: 160px;
                    overflow: auto;
                    .status-list {
                        height: 30px;
                        width: 70px;
                        display: flex;
                        align-items: center;
                        >span {
                            font-size: 12px;
                            color: #101010
                        };
                        .statusspanStyle {
                            color: #3B9DF9 !important;
                        }
                    }
                }
            };
            .data-box {
                width: 0;
                display: flex;
                align-items: center;
                flex: 1;
                .date-span {
                    font-size: 12px;
                    color: #101010;
                    margin-right: 4px;
                };
                .date-choose {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 4px;
                    box-sizing: border-box;
                    height: 24px;
                    border: 1px solid #BBBBBB;
                    border-radius: 3px;
                    font-size: 12px;
                    color: #101010;
                }
            }
        };
        .order-list-box {
            flex: 1;
            overflow: auto;
            padding-bottom: 10px;
            box-sizing: border-box;
            .order-list {
                padding: 0 6px 20px 6px;
                box-sizing: border-box;
                background-color: rgba(255,255,255,1);
                box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.23);
                border-radius: 7px;
                margin-bottom: 10px;
                &:nth-child(1) {
                    margin-top: 10px;
                };
                .order-list-top {
                    display: flex;
                    height: 50px;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 6px;
                    box-sizing: border-box;
                    border-bottom: 1px solid rgba(0,0,0,0.23);
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
                };
                .order-list-center {
                    margin: 10px 0;
                    padding: 0 6px;
                    box-sizing: border-box;
                    .product-list {
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
                    .create-delivery-date {
                        display: flex;
                        margin-top: 10px;
                        .create-delivery-date-left {
                            flex: 1;
                            width: 0;
                            display: flex;
                            margin-right: 4px;
                            >span {
                                display: inline-block;
                                font-size: 14px;
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
                            align-items: center;
                            >span {
                                display: inline-block;
                                font-size: 14px;
                                &:nth-child(1) {
                                    color: #9E9E9A;
                                    margin-right: 6px;
                                };
                                &:nth-child(2) {
                                    .no-wrap();
                                    flex: 1;
                                    color: #101010;
                                }
                            }
                        }
                    };
                    .delivery-address {
                        margin-top: 10px;
                    };
                    .remark-box {
                        margin-top: 10px;
                        >span {
                            &:nth-child(2) {
                                color: #9E9E9A !important;
                            }
                        }
                    }
                };
                .order-list-bottom {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    .order-list-btn {
                        display: flex;
                        align-items: center;
                        .delete-left {
                                padding: 0 6px;
                                height: 28px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 1px solid #E86F50;
                                box-sizing: border-box;
                                border-radius: 4px;
                                margin-right: 10px;
                                >span {
                                    font-size: 12px;
                                    color: #E86F50
                                }
                        };
                        .edit-right {
                                padding: 0 6px;
                                height: 28px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: #3B9DF9;
                                border-radius: 4px;
                                margin-right: 10px;
                                >span {
                                    font-size: 12px;
                                    color: #fff
                                }
                        }
                    }
                }
            };
            .bottom-loading-show {
              font-size: 12px;
              color: #BEC7D1;
              width: 100%;
              text-align: center;
              line-height: 30px
            };
            .no-more-data {
              font-size: 12px;
              color: #BEC7D1;
              width: 100%;
              text-align: center;
              line-height: 30px
          }
        }
    }
  }
}
</style>