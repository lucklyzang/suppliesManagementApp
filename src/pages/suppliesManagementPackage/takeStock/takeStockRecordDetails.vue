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
                    <van-empty description="暂无产品数据" v-show="orderMessage['items'].length == 0" />
					<div class="delivery-list" v-for="(item) in orderMessage['items']" :key="item.id">
						<div class="product-content">
							<span>{{ item['productName'] }}</span>
						</div>
						<div class="specification-content">
							<span>{{ item['standard'] ? item['standard'] : '无'}}</span>
						</div>
						<div class="deliver-number-content">
							<span>{{ item['count'] }}</span>
						</div>
						<div class="sales-return-content">
                            <van-popover
                                v-model="showPopover"
                                placement="top"
                                trigger="click"
                                @open="showPopoverEvent"
                                get-container=".sales-return-content"
                                >
                                <div>
                                    <p class="p-one">盈亏说明</p>
                                    <p class="p-two">{{ item['remark'] }}</p>
                                </div>
                                <template #reference>
                                    {{ item['stockCount'] }}
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
            <div class="btn-center">
                <span>审核</span>
            </div>
        </div> 
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getStockCheckRecord } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
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
      showPopover: false,
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
        console.log(1);
    },

    // 查询盘点单详情
    getStockCheckRecordEvent() {
        this.loadingShow = true;
        this.infoText = '加载中···';
        getStockCheckRecord(this.orderId).then((res) => {
            this.loadingShow = false;
            this.infoText = '';
            if ( res && res.data.code == 0) {
                this.orderMessage = res.data.data;
                this.orderMessage['checkTime'] = this.orderMessage['checkTime'] ? SOtime.time8(this.orderMessage['checkTime']) : ''
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