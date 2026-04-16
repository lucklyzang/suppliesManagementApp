<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="盘点" left-text="返回" left-arrow @click-left="onClickLeft" @click-right="enterTakeStockRecordEvent" :border="false">
            <template #right>
                <span class="history-span">盘点记录</span>
            </template>
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-box">
          <div class="take-stock-title">
            <div class="product-code">
              <div class="product-code-text">产品编码:</div>
              <div class="product-code-input">
                <van-field v-model="productCodeValue" placeholder="请输入" />
              </div>
            </div>
            <div class="scan-code">
              <van-icon name="scan" color="#3B9DF9" size="26" />
            </div>
          </div>
          <div class="take-stock-nex-title">
            <div class="take-stock-warehouse">
              <div class="take-stock-warehouse-text">
                盘点库房:
              </div>
              <div class="take-stock-warehouse-content" ref="myElement" @click="warehouseListShow = !warehouseListShow">
                <div class="warehouse-message">
                  <span>{{ currentWarehouseName }}</span>
						      <van-icon :name="warehouseListShow ? 'arrow-down' : 'arrow-up'" color="#101010" size="16" />
                </div>
                <div class="warehouse-list-box" v-if="warehouseListShow">
                  <div class="warehouse-list" v-for="(item,index) in shipmentWarehouseList" @click.stop="warehouseListtEvent(item,index)" :key="index">
                    <span :class="{'warehouseSpanStyle': index === currentWarehouseIndex }">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="take-stock-date">
              <div class="take-stock-date-text">
                盘点日期:
              </div>
              <div class="take-stock-date-content">
                {{ takeStockDate }}
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
              <van-empty description="暂无产品数据" v-show="stockProductList.length == 0" />
              <div class="delivery-list" @click="takeStockProductClickEvent(item,index)" v-for="(item,index) in stockProductList" :key="item.id">
                <div class="product-content">
                  <span>{{ item['productName'] }}</span>
                </div>
                <div class="specification-content">
                  <span>{{ item['standard'] ? item['standard'] : '无'}}</span>
                </div>
                <div class="deliver-number-content">
                  <span>{{ item['count'] }}</span>
                </div>
                <div class="sales-return-content" :class="{'underSpan': item['practicalTakeStockValue'] < item['count'],'moreSpan': item['practicalTakeStockValue'] > item['count']}">
                  {{ item['practicalTakeStockValue'] }}
                </div>
                <div class="unit-content">
                  <span>{{ item['unitName'] }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="page-break">
           <van-pagination
            v-model="currentPageNum"
            :total-items="totalCount"
            :items-per-page="pageSize"
            :page-count="totalPage"
            force-ellipses
            @change="stockPageChangeEvent"
          />
          </div>
          <div class="btn-box">
              <div class="btn-left" @click="resetDataEvent">
                <span>重置</span>
              </div>
              <div class="btn-center" @click="saveDataEvent">
                <span>保存</span>
              </div>
              <div class="btn-right" @click="submitDataEvent">
                <span>提交</span>
              </div>
          </div> 
        </div>
    </div>
    <!-- 盘点弹框 -->
    <div class="deliver-goods-modal">
        <van-dialog v-model="takeStockModalShow" :showConfirmButton="false">
            <div class="evaluate-model-content">
                <div class="evaluate-modal-top">
                  <div class="product-name">
                    <span>产品:</span>
                    <span>{{ stockDialogMessage['productName'] }}</span>
                  </div>
                  <div class="specification-name">
                    <span>规格型号:</span>
                    <span>{{ stockDialogMessage['standard'] ? stockDialogMessage['standard'] : '无'}}</span>
                  </div>
                  <div class="unit-name">
                    <span>单位:</span>
                    <span>{{ stockDialogMessage['unitName'] }}</span>
                  </div>
                </div>
                <div class="evaluate-modal-center">
                    <div class="evaluate-box delivery-person">
                        <div class="evaluate-span">
                          账面数:
                        </div>
                        <div class="evaluate-content">
                          {{ stockDialogMessage['count'] }}
                        </div>
                    </div>
                    <div class="evaluate-box contact-information">
                        <div class="evaluate-span">
                            <span>实盘数:</span>
                        </div>
                        <div class="evaluate-content">
                            <van-field
                                type="digit"
                                v-model="stockDialogMessage['practicalTakeStockValue']"
                                placeholder="请输入"
                            />
                        </div>
                    </div>
                    <div class="evaluate-box contact-information">
                        <div class="evaluate-span">
                            <span>盈亏说明:</span>
                        </div>
                        <div class="evaluate-content">
                             <van-field
                                v-model="stockDialogMessage['breakEvenexplainValue']"
                                placeholder="请输入"
                            />
                        </div>
                    </div>
                </div>
                <div class="evaluate-modal-bottom">
                    <div class="evaluate-modal-btn">
                        <div class="cancel-left" @click.stop="takeStockModalCancelEvent">
                            <span>取消</span>
                        </div>
                        <div class="submit-right" @click.stop="takeStockModalSubmitEvent">
                            <span>提交</span>
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
import { getwarehouseInfo, getStockPage, createStockCheck } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
import _ from 'lodash'
export default {
  name: "suppliesTakeStock",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      infoText: '加载中...',
      currentPageNum: 1,
      pageSize: 20,
      totalCount: 0,
      totalPage: '',
      productCodeValue: '',
      warehouseListShow: false,
      currentWarehouseName: '请选择',
      currentShipmentWarehouseValue: '',
      currentWarehouseIndex: '',
      shipmentWarehouseList: [],
      stockProductList: [],
      takeStockModalShow: false,
      practicalTakeStockValue: '',
      breakEvenexplainValue: '',
      takeStockDate: '',
      takeStockIndex: '',
      stockDialogMessage: {}
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/suppliesHome');
    this.takeStockDate = SOtime.time8(new Date().getTime());
    const el = this.$refs.myElement;
    //点击库房区域以外的地方时，库房列表收起
		document.addEventListener('click', (event) => {
			if (el && !el.contains(event.target)){
				this.warehouseListShow = false;
			}
		}, false);
    this.getWarehouseInfoEvent()
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
      this.$router.push({path: '/suppliesHome'})
    },

    // 进入盘点记录事件
    enterTakeStockRecordEvent () {
       this.$router.push({path: '/suppliesTakeStockRecord'})
    },

    // 重置数据事件
    resetDataEvent () {
      this.getStockPageEvent({
        pageNo: this.currentPageNum,
        pageSize: this.pageSize,
        productId: this.productCodeValue, // 产品编号
        warehouseId: this.currentShipmentWarehouseValue //仓库编号
      })
    },

    // 保存数据事件(待审核)
    saveDataEvent () {
      // 只需要提交账面数与实盘数不一致的产品
      let temporaryList = this.stockProductList.filter((item) => { return Number(item['count']) !== Number(item['practicalTakeStockValue'])});
      if (temporaryList.length == 0) {
        this.$toast({
          type: 'fail',
          message: '账面数与实盘数一致,无需盘点'
        });
        return
      };
      let needItems = [];
      for (let item of temporaryList) {
        needItems.push({
          warehouseId: item['warehouseId'], //仓库编号
          productId: item['productId'], // 产品编号
          productPrice: item['salePrice'], // 产品单价
          stockCount: Number(item['count']), //账面数量
          actualCount: Number(item['practicalTakeStockValue']), //实际数量
          count: Math.floor(Number(item['practicalTakeStockValue']) - Number(item['count'])), // 盈亏数量
          remark: item['breakEvenexplainValue']// 备注
        })
      };
      this.createStockCheckEvent(10,needItems)
    },

    // 提交数据事件
    submitDataEvent () {
      this.createStockCheckEvent();
    },

    // 库房下拉框点击事件
    warehouseListtEvent (item,index) {
      this.currentWarehouseName = item.name;
      this.currentShipmentWarehouseValue = item.id;
      this.currentWarehouseIndex = index;
      this.warehouseListShow = false;
      this.currentPageNum = 1;
      this.getStockPageEvent({
        pageNo: this.currentPageNum,
        pageSize: this.pageSize,
        productId: this.productCodeValue, // 产品编号
        warehouseId: this.currentShipmentWarehouseValue //仓库编号
      })
    },

    // 产品库存分页变化事件
    stockPageChangeEvent (value) {
      this.currentPageNum = value;
      this.getStockPageEvent({
        pageNo: this.currentPageNum,
        pageSize: this.pageSize,
        productId: this.productCodeValue, // 产品编号
        warehouseId: this.currentShipmentWarehouseValue //仓库编号
      })
    },

    // 盘点弹框取消事件
    takeStockModalCancelEvent () {
      this.takeStockModalShow = false;
    },

    // 盘点弹框提交事件
    takeStockModalSubmitEvent () {
      this.takeStockModalShow = false;
      this.$set(this.stockProductList[this.takeStockIndex],'practicalTakeStockValue',this.stockDialogMessage['practicalTakeStockValue']);
      this.$set(this.stockProductList[this.takeStockIndex],'breakEvenexplainValue',this.stockDialogMessage['breakEvenexplainValue']);
    },

    // 盘点产品点击事件
    takeStockProductClickEvent (item,index) {
      this.takeStockModalShow = true;
      this.stockDialogMessage = {};
      this.takeStockIndex = index;
      this.stockDialogMessage = _.cloneDeep(item)
    },

    // 查询仓库信息
    getWarehouseInfoEvent() {
      this.loadingShow = true;
      this.infoText = '加载中···';
      getwarehouseInfo().then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
            this.shipmentWarehouseList = res.data.data;
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

    // 获取产品库存列表
    getStockPageEvent(data) {
      this.loadingShow = true;
      this.infoText = '加载中···';
      this.stockProductList = [];
      getStockPage(data).then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
            this.stockProductList = res.data.data.list;
            this.stockProductList.forEach(item => {
              item['practicalTakeStockValue'] = item['count'];
              item['breakEvenexplainValue'] = ''
            });
            this.totalCount = res.data.data.total;
            this.totalPage = Math.ceil(this.totalCount/this.pageSize);
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

    // 创建盘点单
    createStockCheckEvent(status,items) {
      this.loadingShow = true;
      this.infoText = '提交中···';
      createStockCheck({
        checkTime: this.takeStockDate + " 00:00:00", // 出库时间
        warehouseId: this.currentShipmentWarehouseValue, // 仓库编号
        items, //出库项列表
        status 
      }).then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
             this.getStockPageEvent({
                pageNo: this.currentPageNum,
                pageSize: this.pageSize,
                productId: this.productCodeValue, // 产品编号
                warehouseId: this.currentShipmentWarehouseValue //仓库编号
              });
              this.$toast({
                type: 'success',
                message: '保存成功'
              })
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
   .deliver-goods-modal {
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
                        padding: 0 4px;
                        box-sizing: border-box;
                        background: #F6F9FB;
                        >div {
                          flex: 1;
                          width: 0;
                          display: flex;
                          align-items: center;
                          margin-right: 4px;
                          &:last-child {
                            flex: none !important;
                            margin-right: 0 !important;
                            width: 80px !important;
                          };
                          >span {
                            font-size: 14px;
                            color: #101010;
                            &:nth-child(2) {
                              margin-left: 4px;
                              flex: 1;
                              .no-wrap;
                            }
                          }
                        }
                    };
                    .evaluate-modal-center {
                        padding: 15px 40px 10px 40px;
                        box-sizing: border-box;
                        .delivery-person {
                            .evaluate-span {
                              font-size: 14px;
                              color: #101010;
                              margin-right: 4px;
                            };
                            .evaluate-content {
                              font-size: 14px;
                              color: #101010;
                              border: none !important;
                            }
                        };
                        .contact-information {
                            margin: 20px 0;
                            .evaluate-content {
                                border: none !important;
                                display: flex;
                                .van-cell {
                                    padding: 0 6px !important;
                                    line-height: 30px !important;
                                    height: 30px;
                                    border: 1px solid #888888 !important;
                                    border-radius: 3px !important;
                                    box-sizing: border-box;
                                }
                            }
                        };
                        .evaluate-box {
                            display: flex;
                            .evaluate-span {
                               width: 70px;
                               text-align: right;
                               margin-right: 4px;
                              display: flex;
                              justify-content: flex-end;
                              align-items: center;
                                >span {
                                   font-size: 14px;
                                   color: #101010;
                                }
                            };
                            .evaluate-content {
                                flex: 1;
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
        padding: 10px 6px 0 6px;
        .take-stock-title {
          padding:  0 10px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          height: 45px;
          .product-code {
            flex: 1;
            width: 0;
            display: flex;
            align-items: center;
            margin-right: 10px;
            .product-code-text {
              font-size: 14px;
              color: #101010;
              margin-right: 4px;
            };
            .product-code-input {
              flex: 1;
              height: 30px;
              /deep/ .van-cell {
                width: 100%;
                height: 30px;
                border-radius: 3px !important;
                border: 1px solid #888888;
                line-height: 30px !important;
                padding: 0 6px !important;
              }
            }
          };
          .scan-code {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        };
        .take-stock-nex-title {
          padding:  0 10px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          height: 40px;
          .take-stock-warehouse {
            flex: 1;
            width: 0;
            display: flex;
            align-items: center;
            margin-right: 10px;
            .take-stock-warehouse-text {
              font-size: 14px;
              color: #101010;
              margin-right: 4px;
            };
            .take-stock-warehouse-content {
              flex: 1;
              height: 30px;
              position: relative;
              .warehouse-message {
                width: 120px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border: 1px solid #BBBBBB;
                border-radius: 6px;
                height: 30px;
                padding: 0 4px;
                box-sizing: border-box;
                >span {
                  margin-right: 4px;
                  font-size: 12px;
                  color: #BBBBBB;
                  flex: 1;
                  .no-wrap()
                }
              };
              .warehouse-list-box {
                width: 120px;
                background: #fff;
                position: absolute;
                z-index: 10;
                left: 0;
                top: 34px;
                max-height: 160px;
                overflow: auto;
                .warehouse-list {
                  height: 30px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  >span {
                    font-size: 12px;
                    color: #101010
                  };
                  .warehouseSpanStyle {
                    color: #3B9DF9 !important;
                  }
                }
              }
            }
          };
          .take-stock-date {
            display: flex;
            align-items: center;
            justify-content: center;
            .take-stock-date-text {
              font-size: 14px;
              color: #101010;
              margin-right: 4px;
            };
            .take-stock-date-content {
              font-size: 14px;
              color: #101010;
            }
          }
        };
        .delivery-table {
            flex: 1;
            border-radius: 6px;
            height: 0;
            display: flex;
            flex-direction: column;
            margin-top: 10px;
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
                    };
                    .barter-content {
                    };
                    .moreSpan {
                      color: #11D183 !important
                    };
                    .underSpan {
                        color: #E86F50 !important
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
        };
        .page-break {
          height: 40px;
          margin-top: 10px;
        };
        .btn-box {
          height: 80px;
          padding: 0 14px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .btn-left {
              width: 84px;
              height: 44px;
              border: 1px solid #266FFF;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              >span {
              font-size: 12px;
              color: #3B9DF9;
              }
          };
          .btn-center {
              width: 100px;
              height: 44px;
              background: #3B9DF9;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              >span {
              font-size: 12px;
              color: #fff;
              }
          };
          .btn-right {
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
}
</style>