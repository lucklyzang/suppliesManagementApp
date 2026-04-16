<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="盘点记录" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
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
				<div class="order-list" v-for="(item,index) in fullOrderList" :key="index" @click="enterTakeStockOrderEvent(item,index)">
					<div class="order-list-top">
						<div class="order-type">
							<span>盘点单号</span>
							<span>{{ item.no }}</span>
						</div>
						<div class="order-status"
						:class="{
							'stayAuditStyle ' : item.status == 10, 
							'underAuditStyle' : item.status == 3,
							'passStyle' : item.status == 20,
							'noPassStyle' : item.status == 30
							}"
						>
							<span>{{ stateTransfer(item.status) }}</span>
						</div>
					</div>
					<div class="order-list-center">
						<div class="create-delivery-date">
							<div class="create-delivery-date-left">
								<span>盘点日期:</span>
								<span>{{ item.checkTime }}</span>
							</div>
							<div class="create-delivery-date-left">
								<span>盘点库房:</span>
								<span>{{ item['warehouseName'] }}</span>
							</div>
						</div>
						<div class="product-list remark-box">
							<span>盘点人:</span>
							<span>{{ item.creatorName }}</span>
						</div>
					</div>
					<div class="order-list-bottom">
						<div class="order-list-btn">
							<div class="delete-left" v-show="item.status == 10" @click.stop="deleteOrderEvent(item,index)">
								<span>删除</span>
							</div>
							<div class="edit-right" v-show="item.status == 10 || item.status == 30" @click.stop="editEvent(item,index)">
								<span>编辑</span>
							</div>
                            <div class="audit-right" v-show="item.status == 10" @click.stop="auditEvent(item,index)">
								<span>审核</span>
							</div>
						</div>
					</div>
				</div>
                <van-empty description="您还没有相关盘点记录" v-show="isShowNoData" />
                <div v-show="bottomLoadingShow" class="bottom-loading-show">
                    加载中...
                </div>
                <div class="no-more-data" v-show="isShowNoMoreData && !loadingShow && !isShowNoData">没有更多数据了!</div>
			</div>
        </div>
    </div>
    <!-- 审核记录弹框 -->
    <div class="revocation-delivery-order-modal">
        <van-dialog v-model="auditModalShow" :showConfirmButton="false">
            <div class="evaluate-model-content">
                <div class="evaluate-modal-top">
                    <span>审核</span>
                    <van-icon name="cross" color="#101010" size="20" @click="auditModalShow = false" />
                </div>
                <div class="evaluate-modal-center">
                  <van-icon name="checked" size="40" color="#289E8E" />
                  <div class="modal-center-content">请确认审核该记录?</div>
                </div>
                <div class="evaluate-modal-bottom">
                    <div class="evaluate-modal-btn">
                        <div class="cancel-left" @click.stop="auditModalShowNoPassEvent">
                            <span>不通过</span>
                        </div>
                        <div class="submit-right" @click.stop="auditModalShowPassEvent">
                            <span>通过</span>
                        </div>
                    </div>
                </div>
            </div>
        </van-dialog>
    </div>
    <!-- 确认删除弹框 -->
    <div class="delete-order-modal">
        <van-dialog v-model="deleteOrderModalShow" :showConfirmButton="false">
            <div class="evaluate-model-content">
                <div class="evaluate-modal-top">
                    <span></span>
                    <van-icon name="cross" color="#101010" size="20" @click="deleteOrderModalShow = false" />
                </div>
                <div class="evaluate-modal-center">
                  <img :src="revocationInfoImage"  />
                  <div class="modal-center-content">确定要删除吗吗？</div>
                </div>
                <div class="evaluate-modal-bottom">
                    <div class="evaluate-modal-btn">
                        <div class="cancel-left" @click.stop="deleteOrderModalShowCancelEvent">
                            <span>取消</span>
                        </div>
                        <div class="submit-right" @click.stop="deleteOrderModalShowSureEvent">
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
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getStockCheckRecordsPage, updateStockCheckStatus, deleteStockCheckStatus } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesTakeStockRecord",
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
      auditModalShow: false,
      revocationInfoImage: require('@/common/images/home/revocation-info-icon.png'),
      sourcePath: '',
      defaultDateArr: [],
      startDate: '',
      endDate: '',
      minDate: new Date('2025-03-16'),
      maxDate: new Date('2027-03-16'),
      refuseReasonValue: '',
      currentOrderIndex: '',
      currentOrderId: '',
      deleteOrderModalShow: false,
      eventTime: 0,
      orderList: [],
      fullOrderList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/suppliesTakeStock');
    this.getDateRange();
    this.$nextTick(()=> {
      this.initScrollChange()
    });
    this.getDateRange();
    this.getStockCheckRecordsPageEvent({
        pageNo: this.currentPageNum,
        pageSize: this.pageSize,
        status: '',
        checkTime: [`${this.startDate}`,`${this.endDate}`],
        creator:  '' // this.userAccount
    },true)
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
        this.$router.push({path: '/suppliesTakeStock'})
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
            this.getStockCheckRecordsPageEvent({
                pageNo: this.currentPageNum,
                pageSize: this.pageSize,
                status: '',
                checkTime: [`${this.startDate}`,`${this.endDate}`],
                creator: ''// this.userAccount
            },false)
          };
          this.eventTime = 0;
          console.log('事件列表滚动了',boxBackScroll.scrollTop, boxBackScroll.offsetHeight, boxBackScroll.scrollHeight)
        },300)
      }
    },

    // 查询盘点记录列表
    getStockCheckRecordsPageEvent(data,flag) {
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
        getStockCheckRecordsPage(data).then((res) => {
            if ( res && res.data.code == 0) {
                this.orderList = res.data.data.list;
                this.totalCount = res.data.data.total;
                this.orderList.forEach((item)=>{
                    item.checkTime = SOtime.time8(item.checkTime);
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

    // 更新盘点单状态(20-通过30-未通过)
    updateStockCheckStatusEvent(status) {
      this.loadingShow = true;
      this.infoText = '审核中···';
      updateStockCheckStatus({
        ids: [this.currentOrderId],
        status
      }).then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
            if (res.data.data) {
                this.fullOrderList.forEach((item,index) => {
                    if (item.id == this.currentOrderId) {
                        item.status = status
                    }
                });
                this.$toast({
                    type: 'success',
                    message: '审核成功'
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
        this.loadingShow = false;
        this.infoText = '';
        this.$toast({
          type: 'fail',
          message: err
        })
      })
    },

    // 删除库存盘点单
    deleteStockCheckStatusEvent() {
      this.loadingShow = true;
      this.infoText = '审核中···';
      deleteStockCheckStatus({
        ids: [this.currentOrderId],
      }).then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
            if (res.data.data) {
                this.fullOrderList.splice(this.currentOrderIndex,1);
                this.$toast({
                    type: 'success',
                    message: '删除成功'
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
        this.loadingShow = false;
        this.infoText = '';
        this.$toast({
          type: 'fail',
          message: err
        })
      })
    },

    //任务状态转换
    stateTransfer (num) {
        switch(num) {
            case 10:
                return '待审核'
                break;
            case 20:
                return '已通过'
                break;
            case 30:
                return '未通过'
                break;
        } 
    },

    // 审核记录弹框不通过事件
    auditModalShowNoPassEvent () {
      this.auditModalShow = false;
      this.updateStockCheckStatusEvent(30)
    },

    // 审核记录弹框通过事件
    auditModalShowPassEvent () {
      this.auditModalShow = false;
      this.updateStockCheckStatusEvent(20)
    },

    // 确认删除弹框取消事件
    deleteOrderModalShowCancelEvent () {
        this.deleteOrderModalShow = false
    },

    // 确认删除弹框确认事件
    deleteOrderModalShowSureEvent () {
        this.deleteOrderModalShow = false;
        this.deleteStockCheckStatusEvent()
    },

    // 进入盘点单详情事件
    enterTakeStockOrderEvent (item) {
        this.$router.push({
            path: '/suppliesTakeStockRecordDetails', 
            query: {
                orderId: item.id
            }
        })
    },
    
    // 日历日期选择确认事件
    calendarConfirm(e) {
        this.showCalendar = false;
        this.startDate = SOtime.time8(new Date(e[0]).getTime());
        this.endDate = SOtime.time8(new Date(e[e.length-1]).getTime());
        this.currentPageNum = 1;
        this.getStockCheckRecordsPageEvent({
            pageNo: this.currentPageNum,
            pageSize: this.pageSize,
            status: '',
            checkTime: [`${this.startDate}`,`${this.endDate}`],
            creator: '' //this.userAccount
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
    
    // 删除盘点单事件
    deleteOrderEvent(item,index) {
        this.currentOrderIndex = index;
        this.currentOrderId = item['id'];
        this.deleteOrderModalShow = true;
    },
    

    // 编辑盘点单事件
    editEvent(item,index) {
        this.$router.push({
            path: '/suppliesEditTakeStock', 
            query: {
                orderId: item.id
            }
        })
    },

    // 审核盘点单事件
    auditEvent(item,index) {
        this.currentOrderIndex = index;
        this.currentOrderId = item['id'];
        this.auditModalShow = true;
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
                      padding: 25px 40px;
                      box-sizing: border-box;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                     .modal-center-content {
                       margin-top: 30px;
                       font-size: 20px;
                       font-weight: bold;
                       color: #101010;
                     }
                  };
                  .evaluate-modal-bottom {
                      padding: 20px 40px;
                      box-sizing: border-box;
                      display: flex;
                      align-items: center;
                      .evaluate-modal-btn {
                          width: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          .cancel-left {
                              width: 100px;
                              height: 35px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border: 1px solid #3B9DF9;
                              box-sizing: border-box;
                              border-radius: 8px;
                              >span {
                                  font-size: 14px;
                                  color: #3B9DF9;
                              }
                          };
                          .submit-right {
                              width: 100px;
                              height: 35px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              background: #3B9DF9;
                              border-radius: 8px;
                              >span {
                                  font-size: 14px;
                                  color: #fff
                              }
                          }
                      }
                  }
              }
          }
      }
  };
  .delete-order-modal {
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
                      padding: 20px 10px;
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
                       margin: 20px 0;
                       font-size: 14px;
                       color: #101010;
                     };
                     .modal-center-info {
                        >span {
                           font-size: 12px;
                           color: #989999;
                           &:nth-child(2) {
                              margin-left: 4px;
                              color: #02e902; 
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
            .data-box {
                width: 70%;
                display: flex;
                align-items: center;
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
                        display: flex;
                        >span {
                            font-size: 16px;
                            color: #3B9DF9;
                            &:last-child {
                                flex: 1;
                                word-break: break-all;
                            }
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
                        color: #fff;
                        border-radius: 4px;
                    };
                    .stayAuditStyle {
                        background: rgba(251,229,223,1) !important;
                        color: #EB7D61 !important;
                    };
                    .underAuditStyle {
                        background: rgba(59,157,249,0.21) !important;
                        color: #3B9DF9 !important;
                    };
                    .passStyle {
                        background: rgba(203,245,228,0.56) !important;
                        color: #11D183 !important;
                    };
                    .noPassStyle {
                        background: rgba(251,229,223,1) !important;
                        color: #EB7D61 !important;
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
                                width: 65px;
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
                                width: 65px;
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
                        };
                        .audit-right {
                            width: 65px;
                            height: 28px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #11D183;
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
}
</style>