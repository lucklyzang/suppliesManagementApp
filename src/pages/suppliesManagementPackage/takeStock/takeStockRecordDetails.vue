<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="盘点单" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-box">
            <div class="take-stock-record-title">
                <div class="take-stock-record-title-top">
                    <div class="take-stock-date">
                        <span>盘点日期:</span>
                        <span>{{ orderMessage.checkTime }}</span>
                    </div>
                    <div class="take-stock-warehouse">
                        <span>盘点库房:</span>
                        <span>{{ orderMessage.warehouseName ?  orderMessage.warehouseName : ''}}</span>
                    </div>
                </div>
                <div class="take-stock-record-title-bottom">
                     <div class="take-stock-person">
                        <span>盘点人:</span>
                        <span>{{ orderMessage.creatorName }}</span>
                    </div>
                </div>
            </div>
            <div class="delivery-table">
				<div class="delivery-table-title">
					<div class="product-cell">
						<span>产品</span>
					</div>
					<div class="specification-cell">
						<span>规格型号</span>
					</div>
					<div class="deliver-number-cell">
						<span>账面数</span>
					</div>
					<div class="sales-return-cell">
						<span>实盘数</span>
					</div>
					<div class="unit-cell">
						<span>单位</span>
					</div>
				</div>
				<div class="delivery-list-box">
                    <van-empty description="暂无产品数据" v-show="isShowNoData" />
					<div class="delivery-list" v-for="(item) in orderMessage['items']" :key="item.id">
						<div class="product-content">
							<span>{{ item['productName'] }}</span>
						</div>
						<div class="specification-content">
							<span>{{ item['productStandard'] ? item['productStandard'] : '无'}}</span>
						</div>
						<div class="deliver-number-content">
							<span>{{ item['stockCount'] }}</span>
						</div>
						<div  class="sales-return-content">
                            <van-popover
                                v-model="showPopoverStatus[item.id]"
                                placement="top"
                                trigger="click"
                                @open="showPopoverEvent"
                                get-container="parent" 
                            >
                                <div>
                                    <p class="p-one">盈亏说明</p>
                                    <p class="p-two">{{ item['remark'] }}</p>
                                </div>
                                <template #reference>
                                    <span :class="{'underSpan': item['stockCount'] > item['actualCount'],'moreSpan': item['stockCount'] < item['actualCount']}">
                                        {{ item['actualCount'] }}
                                    </span>
                                </template>
                            </van-popover>
						</div>
						<div class="unit-content">
							<span>{{ item['productUnitName'] }}</span>
						</div>
					</div>
				</div>
			</div> 
        </div>
        <div class="btn-box" v-show="orderMessage['status'] == 10">
            <div class="btn-center" @click.stop="auditEvent()">
                <span>审核</span>
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
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getStockCheckRecord, updateStockCheckStatus } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesTakeStockRecordDetails",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      infoText: '加载中...',
      isShowNoData: false,
      showPopoverStatus: {},
      auditModalShow: false,
      orderId: '',
      orderMessage: {
        items: []
      }
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/suppliesTakeStockRecord');
    this.orderId = this.$route.query.orderId;
    this.getStockCheckRecordEvent()
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
        this.$router.push({path: '/suppliesTakeStockRecord'})
    },
    
    // popover打开事件
    showPopoverEvent () {
    },

    // 审核盘点单事件
    auditEvent() {
        this.auditModalShow = true;
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

    // 更新盘点单状态(20-通过30-未通过)
    updateStockCheckStatusEvent(status) {
      this.loadingShow = true;
      this.infoText = '审核中···';
      updateStockCheckStatus({
        ids: [this.orderId],
        status
      }).then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
            if (res.data.data) {
                this.$router.push({
                    path: '/suppliesTakeStockRecord', 
                    query: {
                        orderId: this.orderId,
                        status
                    }
                });
                this.$toast({
                    type: 'success',
                    message: '审核成功'
                })
            } else {
                this.$dialog.alert({
                    message: `${res.data.msg}`,
                    closeOnPopstate: true
                }).then(() => {})
            }
          } else {
            this.$dialog.alert({
                message: `${res.data.msg}`,
                closeOnPopstate: true
            }).then(() => {})
          }
      })
      .catch((err) => {
        this.loadingShow = false;
        this.infoText = '';
        this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
        }).then(() => {})
      })
    },


    // 查询盘点单详情
    getStockCheckRecordEvent() {
        this.loadingShow = true;
        this.isShowNoData = false;
        this.infoText = '加载中···';
        getStockCheckRecord(this.orderId).then((res) => {
            this.loadingShow = false;
            this.infoText = '';
            if ( res && res.data.code == 0) {
                this.orderMessage = res.data.data;
                this.orderMessage['checkTime'] = this.orderMessage['checkTime'] ? SOtime.time8(this.orderMessage['checkTime']) : '';
                if (this.orderMessage['items'].length == 0) {
                    this.isShowNoData = true;
                } else {
                    this.isShowNoData = false;
                }
            } else {
                this.$dialog.alert({
                    message: `${res.data.msg}`,
                    closeOnPopstate: true
                }).then(() => {})
            }
        })
        .catch((err) => {
            this.loadingShow = false;
            this.infoText = '';
            this.$dialog.alert({
                message: `${err}`,
                closeOnPopstate: true
            }).then(() => {})
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
  .nav {
    width: 100%;
    background: #3B9DF9;
    /deep/ .van-nav-bar {
        background: transparent !important;
        .van-nav-bar__left {
            .van-nav-bar__span {
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
        padding: 0 6px 20px 6px;
        .take-stock-record-title {
            padding: 10px;
            box-sizing: border-box;
            .take-stock-record-title-top {
                display: flex;
                align-items: center;
                .take-stock-date {
                    flex: 1;
                    width: 0;
                    display: flex;
                    align-items: center;
                    margin-right: 4px;
                    >span {
                        font-size: 14px;
                        color: #101010;
                        &:nth-child(2) {
                            word-break: break-all;
                            margin-left: 4px;
                            flex: 1;
                        }
                    }
                };
                .take-stock-warehouse {
                    flex: 1;
                    width: 0;
                    display: flex;
                    align-items: center;
                    >span {
                        font-size: 14px;
                        color: #101010;
                        &:nth-child(2) {
                            word-break: break-all;
                            margin-left: 4px;
                            flex: 1;
                        }
                    }
                }
            };
            .take-stock-record-title-bottom {
                margin-top: 10px;
                .take-stock-person {
                    display: flex;
                    align-items: center;
                    >span {
                        font-size: 14px;
                        color: #101010;
                        &:nth-child(2) {
                            word-break: break-all;
                            margin-left: 4px;
                            flex: 1;
                        }
                    }
                }
            }
        };
        .delivery-table {
            flex: 1;
            border-radius: 6px;
            height: 0;
            display: flex;
            flex-direction: column;
            .delivery-table-title {
                height: 30px;
                display: flex;
                flex-wrap: nowrap;
                background: #f5f5f5;
                border-bottom: 1px solid #d8d0d0;
                >div {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    height: 30px;
                    .no-wrap;
                    >span {
                        width: 100%;
                        text-align: center;
                        display: inline-block;
                        .no-wrap;
                        font-size: 12px;
                        color: #101010;
                    }
                };
                .specification-cell {
                    width: 70px !important;
                    flex: none !important;
                }
            };
            .delivery-list-box {
                flex: 1;
                overflow: auto;
                position: relative;
                .delivery-list {
                    height: 30px;
                    display: flex;
                    flex-wrap: nowrap;
                    border-bottom: 1px solid #d8d0d0;
                    >div {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex: 1;
                        height: 30px;
                        .no-wrap;
                        >span {
                            width: 100%;
                            text-align: center;
                            display: inline-block;
                            .no-wrap;
                            font-size: 12px;
                            color: #101010;
                        };
                        .moreSpan {
                            color: #11D183 !important
                        };
                        .underSpan {
                            color: #E86F50 !important
                        }
                    };
                    .product-content {
                        >span {
                            font-weight: bold;
                        }
                    };
                    .specification-content {
                        width: 70px !important;
                        flex: none !important;
                    };
                    .sales-return-content {
                        /deep/ .van-popover {
                            background: #fff !important;
                            top: 29px !important;
                            .van-popover__content {
                                border-radius: 5px !important;
                                box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.1) !important;
                                >div {
                                    width:120px;
                                    padding: 10px 8px;
                                    box-sizing: border-box;
                                    >p {
                                        font-size:12px;
                                        word-break:break-all;
                                    };
                                    .p-one {
                                        color:#E8CB51;
                                        margin-bottom:8px  
                                    };
                                    .p-two {
                                        color:#101010;
                                        line-height: 18px; 
                                    }
                                }
                            }
                        }
                    };
                    .barter-content {
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
    };
    .btn-box {
          height: 80px;
          padding: 0 14px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          .btn-center {
              width: 116px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              background: #11D183;
              >span {
                  font-size: 12px;
                  color: #fff;
              }
          }
      }
  }
}
</style>