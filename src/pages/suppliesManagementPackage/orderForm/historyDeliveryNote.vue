<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="送货单" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-box">
           <div class="delivery-number">
				<span>送货单号:</span>
				<span>{{ saleReturnOrderDetailsList.id }}</span>
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
						<span>发货数</span>
					</div>
					<div class="sales-return-cell">
						<span>退货数</span>
					</div>
					<div class="barter-cell">
						<span>换货数</span>
					</div>
					<div class="unit-cell">
						<span>单位</span>
					</div>
				</div>
				<div class="delivery-list-box">
					<div class="delivery-list" v-for="(item) in saleReturnOrderDetailsList['items']" :key="item.id">
						<div class="product-content">
							<span>{{ item.productName }}</span>
						</div>
						<div class="specification-content">
							<span>{{ item.model }}</span>
						</div>
						<div class="deliver-number-content">
							<span>{{ item.count }}</span>
						</div>
						<div class="sales-return-content">
                <span>{{ item.returnCount }}</span>
						</div>
						<div class="barter-content">
							<span>{{ item.exchangeCount }}</span>
						</div>
						<div class="unit-content">
							<span>{{ item.productUnitName }}</span>
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
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getSaleReturn } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
export default {
  name: "historyDeliveryNote",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      infoText: '加载中···',
      saleReturnOrderDetailsList: {
        items: []
      },
      saleReturnOrderMessage: {},
      orderId: '',
      sourcePath: ''
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn(this.sourcePath);
    this.orderId = this.$route.query.orderId;
    this.getSaleReturnEvent(Number(this.orderId))
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
         this.$router.push({
            path: this.sourcePath, 
            query: {
                orderId: this.orderId
            }
        })
    },
     
    // 查询出库单详情
    getSaleReturnEvent(data) {
        this.loadingShow = true;
        this.infoText = '加载中···';
        this.saleReturnOrderDetailsList = {
            items: []
        };
        getSaleReturn(data).then((res) => {
            this.infoText = '';
            this.loadingShow = false;
            if ( res && res.data.code == 0) {
                this.saleReturnOrderDetailsList = res.data.data;
            } else {
              this.$dialog.alert({
                message: `${res.data.msg}`,
                closeOnPopstate: true
              }).then(() => {})
            }
        })
        .catch((err) => {
            this.infoText = '';
            this.loadingShow = false;
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
        .delivery-number {
				padding: 10px 6px;
				box-sizing: border-box;
				>text {
					font-size: 14px;
					color: #101010;
					&:nth-child(1) {
						margin-right: 2px;
					}
				}
			};
			.delivery-table {
				width: 98%;
				margin: 0 auto;
				flex: 1;
				border-radius: 6px;
				background: #F0F2FE;
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
						}
					}
				}
			}
    }
  }
}
</style>