<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="详情" left-text="返回" left-arrow @click-left="onClickLeft"  :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-box">
            <div class="order-details-top">
               <van-divider dashed :style="{ color: orderMessage['type']  == 1 ? '#E8CB51':'#EB7D61', borderColor: orderMessage['type']  == 1 ? '#E8CB51':'#EB7D61', padding: '0 16px' }">
                   {{ orderMessage['type']  == 1 ? '换货' : '退货' }}
               </van-divider>
            </div>
            <div class="order-details-title">
				<div class="content-top-left">
					<span>退货清单</span>
				</div>
			</div>
			<div class="order-details-center">
				<div class="empty-info" v-if="materialList.length == 0">
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
						<span>{{ orderMessage['requestTime'] }}</span>
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
                <div class="create-delivery-date">
					<div class="create-delivery-date-left">
						<span>科室电话:</span>
						<span>{{ orderMessage['mobile'] }}</span>
					</div>
					<div class="create-delivery-date-left">
						<span>关联订单:</span>
						<span>{{ orderMessage['orderNo'] }}</span>
					</div>
				</div>
			</div>
            <div class="dashed-box"></div>
            <div class="order-message">
				<div class="create-delivery-date">
					<div class="create-delivery-date-left">
						<span>配送人:</span>
						<span>{{ orderMessage['courierName'] ? orderMessage['courierName'] : ''}}</span>
					</div>
					<div class="create-delivery-date-left">
						<span>联系方式:</span>
						<span>{{ orderMessage['courierMobile'] ? orderMessage['courierMobile'] : ''}}</span>
					</div>
				</div>
				<div class="product-list remark-box">
					<span>备注:</span>
					<span>{{ orderMessage['remark'] }}</span>
				</div>
                <div class="product-list remark-box delivery-time">
					<span>送货时间:</span>
					<span>{{ orderMessage['outTime'] }}</span>
				</div>
			</div>
            <div class="dashed-box"></div>
            <div class="signature-message">
                <div class="signature-title">
                    签字:
                </div>
                <div class="signature-content" v-show="orderMessage['signatureImage']">
                    <img :src="orderMessage['signatureImage']" alt="">
                </div>
            </div>
            <div class="photograph-message">
                <div class="photograph-title">
                    拍照:
                </div>
                <div class="photograph-content" v-show="orderMessage['deliveryImages']">
                    <div class="image-list">
                        <img :src="productDefaultImage" />
                    </div>
                </div>
            </div>
            <div class="delivery-time-message">
                <div class="delivery-time-title">
                    送达时间:
                </div>
                <div class="delivery-time-content">{{ orderMessage['deliveryTime'] }}</div>
            </div>
            <div class="dashed-box"></div>
            <div class="changing-refunding-message">
                <div class="changing-refunding-reason">
                    <span>退换原因:</span>
                    <span>{{ orderMessage['remark'] }}</span>
                </div>
                <div class="changing-refunding-date">
                    <span>{{ orderMessage['type']  == 1 ? '换货时间:' : '退货时间:'}}</span>
                    <span>{{ orderMessage['returnTime'] }}</span>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getSaleReturnBarter } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesChangingOrRefundingDetails",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      infoText: '加载中...',
      allChooseProductPrice: 0,
      productDefaultImage: require('@/common/images/home/revocation-info-icon.png'),
      orderMessage: {},
      orderId: '',
      sourcePath: '',
      materialList: []
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

    // 保留两位小数，返回数字类型，修复精度问题
    formatPrice(num) {
        if (typeof num !== 'number' || isNaN(num)) return "0.00";
            const value = Math.round(num * 100) / 100;
            return value.toFixed(2);
    },

    // 查询退换货单详情
    getSaleReturnBarterEvent() {
        return new Promise((resolve,reject) => {
            getSaleReturnBarter(this.orderId).then((res) => {
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

    // 并行查询退换货单详情
	parallelFunction () {
        this.loadingShow = false;
        this.infoText = '加载中···';
        Promise.all([this.getSaleReturnBarterEvent()])
        .then((res) => {
            this.loadingShow = false;
            this.infoText = '';
            if (res && res.length > 0) {
                this.orderMessage = {};
                let [item1] = res;
                if (item1) {
                    this.orderMessage = item1;
                    this.materialList = this.orderMessage['items'];
                    this.allChooseProductPrice = this.orderMessage['totalProductPrice'];
                    this.orderMessage['createTime'] = SOtime.time3(this.orderMessage['createTime']);
                    this.orderMessage['requestTime'] = this.orderMessage['requestTime'] ? SOtime.time8(this.orderMessage['requestTime']) : '';
                    this.orderMessage['deliveryTime'] = this.orderMessage['deliveryTime'] ? SOtime.time3(this.orderMessage['deliveryTime']) : '';
                    this.orderMessage['returnTime'] = this.orderMessage['returnTime'] ? SOtime.time8(this.orderMessage['returnTime']) : '';
                    this.orderMessage['outTime'] = this.orderMessage['outTime'] ? SOtime.time3(this.orderMessage['outTime']) : '';
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
            padding: 0 12px;
            box-sizing: border-box;
            /deep/ .van-divider {
                width: 100%;
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
            height: 460px;
            margin: 0 auto;
            border-radius: 6px;
            background: #F0F2FE;
            overflow: auto;
            position: relative;
            margin-bottom: 10px;
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
            padding: 0 6px 16px 6px;
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
                        align-items: center;
                        >span {
                            display: inline-block;
                            font-size: 12px;
                            &:nth-child(1) {
                                color: #9E9E9A;
                                margin-right: 6px;
                            };
                            &:nth-child(2) {
                                .no-wrap;
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
                            color: #000000 !important;
                            margin-right: 6px;
                        };
                        &:nth-child(2) {
                            word-break: break-all;
                            flex: 1;
                            color: #000000 !important;
                        }
                }
            };
            .delivery-time {
                display: flex;
                margin-top: 16px;
                >span {
                        display: inline-block;
                        font-size: 12px;
                        &:nth-child(1) {
                            color: #9C9C9C !important;
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
        .dashed-box {
            border: 1px dashed #BBBBBB;
        };
        .signature-message {
            display: flex;
            margin: 16px 0;
            padding: 0 6px;
            box-sizing: border-box;
            .signature-title {
                font-size: 12px;
                color: #9C9C9C;
                margin-right: 6px;
            };
            .signature-content {
                flex: 1;
            }
        };
        .photograph-message {
            display: flex;
            padding: 0 6px;
            box-sizing: border-box;
            .photograph-title {
                font-size: 12px;
                color: #9C9C9C;
                margin-right: 6px;
            };
            .photograph-content {
                flex: 1;
                display: flex;
                flex-wrap: wrap;
                .image-list {
                    width: 24%;
                    height: 70px;
                    margin-right: 1%;
                    margin-bottom: 6px;
                    >img {
                        width: 100%;
                        height: 100%;
                    }
                    &:nth-child(4n) {
                        margin-right: 0 !important;
                    }
                }
            }
        };
        .delivery-time-message {
            display: flex;
            margin: 16px 0;
            padding: 0 6px;
            box-sizing: border-box;
            .delivery-time-title {
                font-size: 12px;
                color: #9C9C9C;
                margin-right: 6px;
            };
            .delivery-time-content {
                font-size: 12px;
                color: #000000;
                flex: 1;
                .no-wrap();
            }
        };
        .changing-refunding-message {
            margin-top: 16px;
            padding: 0 6px;
            box-sizing: border-box;
            .changing-refunding-reason {
                display: flex;
                >span {
                    font-size: 12px;
                    color: #9C9C9C;
                    &:nth-child(2) {
                      margin-left: 6px;  
                     flex: 1;
                     word-break: break-all;
                    } 
                }
            };
            .changing-refunding-date {
                margin-top: 20px;
                display: flex;
                >span {
                    font-size: 12px;
                    color: #9C9C9C;
                    &:nth-child(2) {
                      margin-left: 6px;    
                     color: #000000 !important; 
                     flex: 1;
                     word-break: break-all;
                    } 
                }
            }
        }
    }
  }
}
</style>