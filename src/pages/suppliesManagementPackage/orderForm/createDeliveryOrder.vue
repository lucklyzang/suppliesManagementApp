<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="生成送货单" left-span="返回" left-arrow @click-left="onClickLeft"  :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
      <div class="content-box">
        <div class="content-top">
          <div class="content-top-left">
            <span>生成送货单</span>
          </div>
			  </div>
        <div class="content-center">
          <div class="empty-info" v-if="materialList.length == 0">
            <van-empty description="暂无产品" />
          </div>
          <div class="product-list" v-for="(item,index) in materialList" :key="item.productName">
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
              </div>
            </div>
            <div class="product-right">
              <div class="product-number-box">
                <van-stepper v-model="item.inputCount" @change="function(val){productNumberBoxChange(item,index,val)}" integer min="0" :max="Number(item['count'])-Number(item['outCount'])" />
              </div>
              <div class="product-total-price">
                <div class="total-demand">
                  <span>总需求数</span>
                  <span>{{ item.count }}</span>
                </div>
                <div class="surplus-demand">
                  <span>剩余需求数</span>
                  <span>{{ item.count - item.outCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="total-prices">
          <div class="total-prices-right">
            <span>总数量:</span>
            <span>{{ `${allCount}` }}</span>
          </div>
        </div>
        <div class="shipment-warehouse-box">
          <div class="shipment-warehouse-left">
            <span>*</span>
            <span>出货仓库</span>
          </div>
          <div class="shipment-warehouse-right" ref="myElement">
            <div class="shipment-warehouse-span" @click="shipmentWarehouseListShow = !shipmentWarehouseListShow">
              <span>{{ currentShipmentWarehouseText }}</span>
              <van-icon :name="shipmentWarehouseListShow ? 'arrow-down' : 'arrow-up'" color="#101010" size="16" />
            </div>
            <div class="shipment-warehouse-list-box" v-show="shipmentWarehouseListShow">
              <div class="shipment-warehouse-list" v-for="(item,index) in shipmentWarehouseListList" @click="shipmentWarehouseListEvent(item,index)" :key="index">
                <span :class="{'shipmentWarehouseSpanStyle': index === currentShipmentWarehouseIndex }">{{ item.name }}</span>
              </div>
            </div>
				  </div>
        </div>
        <div class="arrival-date-box">
          <div class="arrival-date-left">
            <span>要求到货日期:</span>
          </div>
          <div class="arrival-date-right" @click="arrivalDateShow = !arrivalDateShow">
            <span>{{ arrivalDate }}</span>
            <van-icon name="notes-o" color="#CACACA" size="20" />
          </div>
        </div>
        <div class="remark-box">
          <div class="remark-span">
              <span>备注:</span>
          </div>
          <div class="remark-content">
              <van-field
                v-model="remarkValue"
                type="textarea"
                placeholder="请输入"
              />
          </div>
        </div>
      </div>
      <div class="btn-box">
            <div class="btn-left" @click="quitEvent">
                <span>退出</span>
            </div>
            <div class="btn-right" @click="submitEvent">
                <span>提交</span>
            </div>
      </div>
    </div>
    <!-- 确定生成送货单弹框	 -->
    <div class="create-delivery-order-modal">
        <van-dialog v-model="createDeliveryOrderModalShow" :showConfirmButton="false">
            <div class="evaluate-model-content">
                <div class="evaluate-modal-top">
                    <span></span>
                    <van-icon name="cross" color="#101010" size="20" @click="createDeliveryOrderModalShow = false" />
                </div>
                <div class="evaluate-modal-center">
                   <div class="modal-center-title">
                     确定要生成送货单吗？
                   </div>
                   <div class="modal-center-content">
                     <span>
                       订单号不变，选中的物品生成新的送货单，新生成的送货单号为
                     </span>
                     <span>{{ newDeliveryNote }}</span>
                   </div>
                   <div class="modal-center-info">
                     您可以继续生成新的送货单
                   </div>
                </div>
                <div class="evaluate-modal-bottom">
                    <div class="evaluate-modal-btn">
                        <div class="cancel-left" @click.stop="createDeliveryOrderModalShowCancelEvent">
                            <span>取消</span>
                        </div>
                        <div class="submit-right" @click.stop="createDeliveryOrderModalShowSubmitEvent">
                            <span>生成</span>
                        </div>
                    </div>
                </div>
            </div>
        </van-dialog>
    </div>
    <!-- 到货日期选择器 -->
    <van-popup v-model="arrivalDateShow" position="bottom" :style="{ height: '40%' }">
       <van-datetime-picker
        v-model="currentDate"
        type="date"
        @cancel="arrivalDateShow = false"
        @confirm="arrivalDateSureEvent"
      />
    </van-popup>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getPlanOrder, getwarehouseInfo, createSaleOut } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesCreateDeliveryOrder",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      infoText: '生成中···',
      allCount: 0,
      createDeliveryOrderModalShow: false,
      newDeliveryNote: '',
      minDate: new Date(),
      isExceedStockQuantity: false,
      shipmentWarehouseListShow: false,
      currentShipmentWarehouseText: '请选择',
      arrivalDateShow: false,
      arrivalDate: SOtime.time8(new Date().getTime()),
      currentDate: new Date(),
      currentShipmentWarehouseIndex: '',
      currentShipmentWarehouseValue: '',
      shipmentWarehouseListList:[],
      remarkValue: '',
      productDefaultImage: require('@/common/images/home/revocation-info-icon.png'),
      orderId: '',
      chooseMaterialList: [],
      orderMessage: {},
      materialList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/suppliesOrderList');
    this.orderId = this.$route.query.orderId;
    this.parallelFunction();
    const el = this.$refs.myElement;
    //点击状态栏区域以外的地方时，库房列表收起
    document.addEventListener('click', (event) => {
        if (el && !el.contains(event.target)){
            this.shipmentWarehouseListShow = false;
        }
    }, false)
  },

  beforeRouteEnter(to, from, next) {
    next() 
  },

  watch: { 
      materialList: {
        handler(newVal, oldVal) {
          if (newVal.length > 0) {
            if (Number(newVal[0]['inputCount']) > Number(newVal[0]['count']) - Number(newVal[0]['outCount'])) {
              this.isExceedStockQuantity = true;
            } else {
              this.isExceedStockQuantity = false;
            }
          }	
        },
        deep: true,
        immediate: true
    }
  },

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

    // 重置数据
    resetData () {
      this.newDeliveryNote = '';
    },
    
    // 初始化送货日期
    getArrivalDate() {
      this.arrivalDate = SOtime.time8(new Date(this.orderMessage['confirmTime']).getTime());
      this.currentDate = new Date(this.orderMessage['confirmTime'])
    },

    // 求和函数(计算所有添加产品总数量)
    reduceTotal() {
        let targetMsg = this.materialList.filter((item) => {
          return item.inputCount > 0
        });
        this.allCount = targetMsg.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.inputCount
        }, 0)
    },

    // 保留两位小数，返回数字类型，修复精度问题
    formatPrice(num) {
        if (typeof num !== 'number' || isNaN(num)) return "0.00";
        const value = Math.round(num * 100) / 100;
        return value.toFixed(2);
    },

    // 产品步进器change事件
    productNumberBoxChange(item,index,val) {
        this.$set(this.materialList[index],'inputCount',val);
        this.reduceTotal();
    },

    // 确定生成送货单弹框取消事件
    createDeliveryOrderModalShowCancelEvent () {
      this.createDeliveryOrderModalShow = false;
    },

    // 确定继续生成送货单弹框确定事件
    createDeliveryOrderModalShowSubmitEvent () {
      this.createDeliveryOrderModalShow = false;
      this.submitEvent()
    },

    // 退出事件
    quitEvent() {
      this.$router.push({path: '/suppliesOrderList'});
    },

    // 提交事件
    submitEvent() {
      // 所有产品提交数量都为0时，禁止提交
      let isCanSubmit = this.materialList.every((item)=>{ return item.inputCount == 0 });
       if (isCanSubmit) {
        this.$toast({
          type: 'fail',
          message: '送货数量不能为0!'
        });
        return 
      };
      if (this.isExceedStockQuantity) {
        this.$toast({
          type: 'fail',
          message: '送货数量不能超过剩余需求数量!'
        });
        return 
      };
      if (this.currentShipmentWarehouseText == '请选择') {
        this.$toast({
          type: 'fail',
          message: '请选择出货仓库!'
        });
        return 
      };
      let deliveryOrderList = [];
      let temporaryMaterialList = this.materialList.filter((item) => { return Number(item.inputCount) > 0 });
      for (let item of temporaryMaterialList) {
        deliveryOrderList.push({
          orderItemId: item.id, //销售订单项编号
          warehouseId: this.currentShipmentWarehouseValue, // 仓库编号
          productId: item.productId, // 产品编号
          productUnitId: item.productUnitId, // 产品单位编号
          productPrice: item.productPrice, // 产品单价
          count: item.inputCount, // 产品数量
          taxPercent: item.taxPercent, // 税率，百分比
          remark: item.remark //备注
        }) 
      };
      this.createSaleOutEvent({
        orderId: Number(this.orderId), //销售订单编号
        outTime: this.arrivalDate + ' 00:00:00', //出库时间
        remark: this.remarkValue, //备注
        items: deliveryOrderList
      })
    },

    // 生成送货单事件
    createSaleOutEvent(data) {
      this.loadingShow = true;
      this.infoText = '生成中···';
      createSaleOut(data).then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
            this.getPlanOrderEventNext(); 
            this.newDeliveryNote = res.data.data;
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

    // 查询订单详情(生成送货单后查询使用)
    getPlanOrderEventNext() {
      this.loadingShow = false;
      this.infoText = '加载中···';
      getPlanOrder(this.orderId).then((res) => {
          this.loadingShow = false;
          this.infoText = '';
          if ( res && res.data.code == 0) {
            this.createDeliveryOrderModalShow = true;
            let temporaryMessage = res.data.data['items'];
            // 成功生成送货单后,更新该订单产品出库数量
            temporaryMessage.forEach((item,index) => {
              for (const [innerIndex, innerItem] of this.materialList.entries()) {
                if (innerItem['id'] == item.id) {
                  this.$set(this.materialList[innerIndex],'outCount',item['outCount']);
                  break
                }
              }
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

    // 查询仓库信息
    getWarehouseInfoEvent() {
        return new Promise((resolve,reject) => {
            getwarehouseInfo().then((res) => {
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

    // 并行查询订单详情
	  parallelFunction () {
        this.loadingShow = false;
        this.infoText = '加载中···';
        Promise.all([this.getPlanOrderEvent(),this.getWarehouseInfoEvent()])
        .then((res) => {
            this.loadingShow = false;
            this.infoText = '';
            if (res && res.length > 0) {
                this.orderMessage = {};
                this.shipmentWarehouseListList = [];
                let [item1,item2] = res;
                if (item1) {
                  this.orderMessage = item1;
                  this.materialList = this.orderMessage['items'];
                  this.materialList.forEach((item,index) => {
                    this.$set(this.materialList[index],'inputCount',0);
                  });
                  this.getArrivalDate()
                };
                if (item2) {
                  this.shipmentWarehouseListList = item2;
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
    },

    // 仓库列表点击事件
    shipmentWarehouseListEvent(item,index) {
      this.currentShipmentWarehouseText = item.name;
      this.currentShipmentWarehouseValue = item.id,
      this.currentShipmentWarehouseIndex = index;
      this.shipmentWarehouseListShow = false;
    },

    // 到货日期选择框确认事件
    arrivalDateSureEvent (value) {
      this.arrivalDateShow = false;
      this.arrivalDate = SOtime.time8(new Date(value).getTime());
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
   .create-delivery-order-modal {
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
                     .modal-center-title {
                       text-align: center;
                       font-size: 14px;
                       color: #101010;
                     };
                     .modal-center-content {
                       margin: 20px 0;
                       word-break: break-all;
                       >span {
                        font-size: 14px;
                        color: #989999;
                        &:nth-child(2) {
                          margin-left: 4px;
                          color: red;
                        }
                       }
                     };
                     .modal-center-info {
                       word-break: break-all;
                       font-size: 14px;
                       color: #989999;
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
        padding:  0 6px;
        overflow: auto;
      .content-top {
			 height: 40px;
			 padding: 0 4px;
			 box-sizing: border-box;
			 display: flex;
			 align-items: center;
			 justify-content: space-between;
			 .content-top-left {
				 >span {
					font-size: 14px;
					color: #777575; 
				 }
			 }
		 };
		 .content-center {
			 width: 99%;
			 flex: 1;
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
				 padding: 10px 4px;
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
					 .no-wrap;
					 .product-name {
						 .no-wrap;
						 margin-bottom: 10px;
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
							 >span {
								 font-size: 12px;
								 color: #777575;
							 }
						 }
					 }
				 };
				 .product-right {
					 display: flex;
					 flex-direction: column;
					 justify-content: center;
					 width: 180px;
					 .product-number-box {
						 margin-bottom: 4px;
             display: flex;
             justify-content: flex-end;
						 /deep/ .van-stepper{
                width: 70%;
                display: flex;
							 .van-stepper__minus {
								 background: transparent !important;
							 };
               .van-stepper__minus::before {
                 background: #3B9DF9 !important;
                 height: 2px;
               };
							 .van-stepper__input {
								 border-radius: 5px;
								 height: 25px !important;
								 border: 1px solid #9EA1B6 !important;
								 font-size: 14px !important;
								 color: #101010 !important;
								 flex: 1;
								 box-sizing: border-box;
							 };
							 .van-stepper__plus {
								background: transparent !important;
							 };
               .van-stepper__plus::before {
                 background: #3B9DF9 !important;
                 height: 2px;
               };
               .van-stepper__plus::after {
                 background: #3B9DF9 !important;
                 width: 2px;
               };
						 }
					 };
					 .product-total-price {
             display: flex;
             align-items: center;
             .total-demand {
               flex: 1;
               >span {
                font-size: 10px;
                color: #777575;
                &:nth-child(1) {
                  margin-right: 4px;
                }
               }
             };
             .surplus-demand {
               flex: 1;
                >span {
                font-size: 10px;
                color: #777575;
                &:nth-child(1) {
                  margin-right: 4px;
                }
               }
             }
					 }
				 }
			 }
		 };
		 .total-prices {
			 width: 96%;
			 height: 40px;
			 display: flex;
			 align-items: center;
			 justify-content: flex-end;
			 margin: 0 auto;
			 .total-prices-right {
				>span {
				 font-size: 14px;
				 color: #3B9DF9;
				 &:nth-child(1) {
					 margin-right: 4px;
				 }
				} 
			 }
		 };
     .shipment-warehouse-box {
       display: flex;
       align-items: center;
       .shipment-warehouse-left {
         width: 120px;
         margin-right: 10px;
         >span {
           &:first-child {
            color: red;
           };
           &:last-child {
            font-size: 14px;
            color: #101010;
           }
         }
       };
       .shipment-warehouse-right {
        flex: 1;
        position: relative;
        border-radius: 6px;
        border: 1px solid #BBBBBB;
        height: 30px;
        .shipment-warehouse-span {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 30px;
            padding: 0 10px;
            box-sizing: border-box;
            >span {
                margin-right: 4px;
                font-size: 14px;
                color: #101010
            }
        };
        .shipment-warehouse-list-box {
            width: 100%;
            background: #fff;
            position: absolute;
            left: 0;
            top: 35px;
            max-height: 160px;
            overflow: auto;
            padding: 0 10px;
            box-sizing: border-box;
            border: 1px solid #bbbbbb;
            z-index: 10;
            .shipment-warehouse-list {
                height: 30px;
                width: 100%;
                display: flex;
                align-items: center;
                >span {
                    width: 100%;
                    display: inline-block;
                    word-break: break-all;
                    font-size: 12px;
                    color: #101010
                };
                .shipmentWarehouseSpanStyle {
                    color: #3B9DF9 !important;
                }
            }
        }
       }
     };
     .arrival-date-box {
        margin: 10px 0;
        display: flex;
        align-items: center;
       .arrival-date-left {
         width: 120px;
         margin-left: 10px;
         >span {
            font-size: 14px;
            color: #101010;
         }
       };
       .arrival-date-right {
          flex: 1;
          border-radius: 3px;
          border: 1px solid #BBBBBB;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          box-sizing: border-box;
       }
     };
    .remark-box {
        display: flex;
        margin-bottom: 10px;
        .remark-span {
          width: 120px;
          margin-left: 10px;
            >span {
              font-size: 14px;
              color: #101010;
            }
        };
        .remark-content {
            flex: 1;
            border: 1px solid #888888;
            .van-cell {
                padding: 6px 10px !important;
            }
        }
      }
    };
    .btn-box {
        height: 60px;
        padding: 0 14px;
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        .btn-left {
            width: 45%;
            height: 32px;
            border: 1px solid #3B9DF9;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            >span {
            font-size: 12px;
            color: #3B9DF9;
            }
        };
        .btn-right {
            width: 45%;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            background: #3B9DF9;
            >span {
                font-size: 12px;
                color: #fff;
            }
        }
      }
  }
}
</style>