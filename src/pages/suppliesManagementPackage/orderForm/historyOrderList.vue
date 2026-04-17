<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="历史" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-box">
          <div class="status-date-box">
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
						<div class="order-status">
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
				</div>
                <van-empty description="您还没有相关历史订单" v-show="isShowNoData" />
                <div v-show="bottomLoadingShow" class="bottom-loading-show">
                    加载中...
                </div>
                <div class="no-more-data" v-show="isShowNoMoreData && !loadingShow && !isShowNoData">没有更多数据了!</div>
			</div>
        </div>
    </div>
    <!-- 日历 --> 
    <van-calendar v-model="showCalendar" :min-date="minDate" :max-date="maxDate" :default-date="defaultDateArr" type="range" @confirm="calendarConfirm" />
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getPlanOrderPage } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesHistoryOrderList",
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
      showCalendar: false,
      defaultDateArr: [],
      startDate: '',
      endDate: '',
      minDate: new Date('2025-03-16'),
      maxDate: new Date('2027-03-16'),
      orderList: [],
      fullOrderList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/suppliesOrderList');
    this.$nextTick(()=> {
      this.initScrollChange()
    });
    this.getDateRange();
    this.getPlanOrderPageEvent({
        pageNo: this.currentPageNum,
        pageSize: this.pageSize,
        status: 50,
        orderTime: [`${this.startDate}`,`${this.endDate}`],
        creator: ''// this.userAccount
    },true)
  },

  beforeRouteEnter(to, from, next) {
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
        this.$router.push({path: '/suppliesOrderList'})
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
                status: 50,
                orderTime: [`${this.startDate}`,`${this.endDate}`],
                creator: '' // this.userAccount
            },false)
          };
          this.eventTime = 0;
          console.log('事件列表滚动了',boxBackScroll.scrollTop, boxBackScroll.offsetHeight, boxBackScroll.scrollHeight)
        },300)
      }
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
            status: 50,
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
    
    //进入订单详情事件
    enterOrderDetailsEvent(item,index) {
       this.$router.push({
            path: '/suppliesOrderDetails', 
            query: {
                orderId: item.id
            }
        })
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
                    item.createTime = item.createTime ? SOtime.time3(item.createTime) : '';
                    item.orderTime = item.orderTime ? SOtime.time8(item.orderTime) : '';
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
            margin-top: 10px;
            .data-box {
                display: flex;
                align-items: center;
                width: 70%;
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
            position: relative;
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
                        background: #9EA1B6;
                        border-radius: 4px;
                        >span {
                            font-size: 14px;
                            color: #101010;
                        }
                    };
                    .stayCompleteStyle {
                      color: #101010 !important;
                      background: rgba(158,161,182,1) !important
                    }
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
        };
        /deep/ .van-empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
        }
    }
  }
}
</style>