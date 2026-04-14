<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ infoText }}</van-loading>
    <div class="nav">
        <van-nav-bar title="评价" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
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
				<div class="order-list" v-for="(item,index) in orderList" :key="index" @click="enterOrderDetailsEvent(item,index)">
					<div class="evaluate-date">
                        <div class="evaluate-date-left">
                            {{ item.orderType }}
                        </div>
                        <div class="evaluate-date-right">
                            <span>评价日期:</span>
                            <span>{{ item.deliveryDate }}</span>
                        </div>
					</div>
					<div class="evaluate-message">
                        <div class="evaluate-value">
                            <span>评分</span>
                            <van-rate v-model="item.value" color="#F2A15F" readonly />
                        </div>
                        <div class="related-order">
                            <span>关联订单:</span>
                            <span>{{ item.deliveryDate }}</span>
                        </div>
					</div>
					<div class="evaluate-content">
                        <div class="evaluate-content-left">
                           评价:
                        </div>
                        <div class="evaluate-content-right">
                            进行安理会的金卡伦敦黄金卡的哈考虑的话
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
    <!-- 日历 --> 
    <van-calendar v-model="showCalendar" :min-date="minDate" :max-date="maxDate" :default-date="defaultDateArr" type="range" @confirm="calendarConfirm" />
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { getEvaluatePage } from '@/api/suppliesManagement/materialApplicationOrderForm.js'
import SOtime from '@/common/js/SOtime.js'
export default {
  name: "suppliesMyEvaluate",
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
      eventTime: 0,
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
    this.getEvaluatePageEvent({
        pageNo: this.currentPageNum,
        pageSize: this.pageSize,
        status: '',
        returnTime: [`${this.startDate}`,`${this.endDate}`],
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
        this.$router.push({path: '/suppliesHome'})
    },
    
    // 日历日期选择确认事件
    calendarConfirm(e) {
        this.showCalendar = false;
        this.startDate = SOtime.time8(new Date(e[0]).getTime());
        this.endDate = SOtime.time8(new Date(e[e.length-1]).getTime());
        this.currentPageNum = 1;
        this.getEvaluatePageEvent({
            pageNo: this.currentPageNum,
            pageSize: this.pageSize,
            status: '',
            returnTime: [`${this.startDate}`,`${this.endDate}`],
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
            this.getEvaluatePageEvent({
                pageNo: this.currentPageNum,
                pageSize: this.pageSize,
                status: '',
                returnTime: [`${this.startDate}`,`${this.endDate}`],
                creator: '' // this.userAccount
            },false)
          };
          this.eventTime = 0;
          console.log('事件列表滚动了',boxBackScroll.scrollTop, boxBackScroll.offsetHeight, boxBackScroll.scrollHeight)
        },300)
      }
    },

    // 查询评价列表
    getEvaluatePageEvent(data,flag) {
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
        getEvaluatePage(data).then((res) => {
            if ( res && res.data.code == 0) {
                this.orderList = res.data.data.list;
                this.totalCount = res.data.data.total;
                this.orderList.forEach((item)=>{
                    item.createTime = SOtime.time3(item.createTime);
                    item.returnTime = SOtime.time8(item.returnTime);
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
            .order-list {
                padding: 20px 8px;
                box-sizing: border-box;
                background-color: rgba(255,255,255,1);
                box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.23);
                border-radius: 7px;
                margin-bottom: 10px;
                &:nth-child(1) {
                    margin-top: 10px;
                };
                .evaluate-date {
                    display: flex;
                    align-items: center;
                    .evaluate-date-left {
                        width: 60%;
                        font-size: 14px;
                        color: #3B9DF9;
                        margin-right: 6px;
                    };
                    .evaluate-date-right {
                        flex: 1;
                        display: flex;
                        width: 0;
                        >span {
                            font-size: 12px;
                            color: #9E9E9A;
                            &:nth-child(2) {
                                flex: 1;
                                margin-left: 6px;
                                word-break: break-all
                            }  
                        }
                    }
                };
                .evaluate-message {
                    margin: 10px 0;
                    display: flex;
                    align-items: center;
                    .evaluate-value {
                        width: 60%;
                        display: flex;
                        margin-right: 6px;
                        align-items: center;
                        >span {
                            margin-right: 6px;
                            font-size: 12px;
                            color: #9E9E9A;
                        }
                    };
                    .related-order {
                        flex: 1;
                        display: flex;
                        width: 0;
                        >span {
                            font-size: 12px;
                            color: #9E9E9A;
                            &:nth-child(2) {
                                flex: 1;
                                margin-left: 6px;
                                word-break: break-all
                            }  
                        }
                    }
                };
                .evaluate-content {
                    display: flex;
                    align-items: center;
                   .evaluate-content-left {
                        font-size: 12px;
                        color: #9E9E9A;
                        margin-right: 6px;
                    };
                    .evaluate-content-right {
                        font-size: 12px;
                        color: #9E9E9A;
                        flex: 1;
                        word-break: break-all
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
</style>