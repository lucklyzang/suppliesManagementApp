<template>
  <div class="page-box" ref="wrapper">
    <!-- 顶部导航栏 -->
    <div class="nav">
        <HeaderTop title="物资管理系统">
        </HeaderTop>
    </div>
    <div class="content">
        <div class="content-top-area">
		</div>
        <div class="user-box" @click="userInfoEvent">
            <div class="user-photo">
                <img :src="avatar ? avatar : 'defaultPersonPng'" />
            </div>
            <div class="user-message">
                <div class="user-name">
                    {{ userName }}
                </div>
                <div class="account-name">
                    {{ loginDate }}
                </div>
            </div>
		</div>
        <div class="task-board">
            <h2>待办事项</h2>
            <div class="subproject-list-box">
                <div class="subproject-list" v-for="(item,index) in backlogList" 
                    :key="index"
                    @click="backlogListEvent(item,index)"
                >
                    <span>{{ item.name }}</span>
                    <p class="message-number">
                        <span>{{ item.value }}</span>
                    </p>
                </div> 
            </div>
        </div>
        <div class="functional-zone">
            <div class="service-list" v-for="(item,index) in functionalZoneList" :key="index" @click="functionalZoneEvent(item,index)">
                <div class="list-top">
                    <img :src="item.url" />
                </div>
                <div class="list-bottom">{{ item.text }}</div>
            </div>
        </div>
    </div>
  </div>
</template>
<script>
    import HeaderTop from '@/components/HeaderTop'
    import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
    import SOtime from '@/common/js/SOtime.js'
    import {
        mapGetters,
        mapMutations
    } from 'vuex'
    let windowTimer;
    export default {
        name: 'suppliesHome',
        components: {
            HeaderTop
        },
        mixins:[mixinsDeviceReturn],
        data() {
            return {
                loadingShow: false,
                overlayShow: false,
                quitInfoShow: false,
                messageNumber: 0,
                currentMessageNumber: 0,
                isShowMessageNumber: false,
                isTimeoutContinue: true,
                backlogList: [
                    {
                        name: '待送货',
                        state: 0,
                        value: 0
                    },
                    {
                        name: '待确认',
                        state: 1,
                        value: 0
                    }
                ],
                functionalZoneList: [
					{
						text: '订单',
						url: require('@/common/images/home/supplies-order-icon.png')
					},
					{
						text: '送货',
						url: require('@/common/images/home/supplies-delivery-icon.png')
					},
                    {
						text: '退换货',
						url: require('@/common/images/home/supplies-barter-icon.png')
					},
					{
						text: '盘点',
						url: require('@/common/images/home/supplies-stock-tacking-icon.png')
					},
                    {
						text: '评价',
						url: require('@/common/images/home/supplies-evaluate-icon.png')
					}
				],
                defaultPersonPng: require("@/common/images/home/supplies-default-person.png")
            }
        },

        beforeDestroy () {
            if (this.suppliesHomeGlobalTimer) {
                clearTimeout(this.suppliesHomeGlobalTimer);
                windowTimer = null;
                this.changeSuppliesHomeGlobalTimer(null)
            }
        },

        mounted() {
            this.backlogList.forEach((item,index) => {
                if (item.name == '待送货') {
                    item.value = 4;
                } else if (item.name == '待确认') {
                    item.value = 18;
                }
            });
            // 获取任务数量
            // if (!this.suppliesHomeGlobalTimer) {
            //     windowTimer = window.setInterval(() => {
            //     if (this.isTimeoutContinue) {
            //         setTimeout(this.getTaskCount(this.proId,this.workerId), 0);
            //         this.changeSuppliesHomeGlobalTimer(windowTimer)
            //     } else {
            //         this.changeSuppliesHomeGlobalTimer(null)
            //     }
            //     }, 3000)
            // }
        },

        watch: {},

        computed: {
            ...mapGetters([
                'userInfo',
                'isLogin',
                'hospitalMessage',
                'suppliesHomeGlobalTimer',
                'isEnterGuestBookPageFromHomePage',
                'lastMessageNumber',
                'chooseHospitalArea'
            ]),
            userName() {
			  return this.userInfo['nickname']
			},
            userAccount() {
				return this.userInfo['username']
			},
			workerId() {
				return this.userInfo['id']
			},
            avatar () {
                return this.userInfo['avatar']
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
			},
            loginDate() {
                return SOtime.time8(this.userInfo['loginDate'])
            }
        },

        methods: {
            ...mapMutations([
                "changeChooseProject",
                'changeIsEnterGuestBookPageFromHomePage',
                'changeLastMessageNumber',
                'changeOverDueWay',
                'changeSuppliesHomeGlobalTimer'
            ]),
            
            // 查询待办事项中各类型任务数量
            getTaskCount (proId,workerId) {
                queryTaskCount(proId,workerId).then((res) => {
                    if (res && res.data.code == 200) {
                        this.backlogList.forEach((item,index) => {
                            if (item.name == '待送货') {
                                item.value = ''
                            } else if (item.name == '待确认') {
                                item.value = ''
                            }
                        })
                    }
                })
                .catch((err) => {
                    this.$dialog.alert({
                        message: `${err.message}`,
                        closeOnPopstate: true
                    }).then(() => {
                    })
                })
            },

            // 头像点击事件
            userInfoEvent () {
                this.$router.push({path: '/myInfo'})
            },

            // 待办事项列表点击事件
            backlogListEvent (item,index) {
                if (item.name == '待送货') {
                    this.$router.push({
                        path: '/suppliesDeliverGoodsList',
                        query: {
                            status: '待送货'
                        }
                    })
                } else if(item.name == '待确认') {
                    this.$router.push({
                        path: '/suppliesOrderList',
                        query: {
                            status: '待确认'
                        }
                    })
                }
            },

            // 功能区点击事件
            functionalZoneEvent (item, index) {
                if (item.text == '订单') {
                    this.$router.push({path: '/suppliesOrderList'})
                } else if(item.text == '送货') {
                    this.$router.push({path: '/suppliesDeliverGoodsList'})
                } else if(item.text == '退换货') {
                    this.$router.push({path: '/suppliesChangingOrRefundingList'})
                } else if(item.text == '评价') {
                    this.$router.push({path: '/suppliesMyEvaluate'})
                } else if(item.text == '盘点') {
                    this.$router.push({path: '/suppliesTakeStock'})
                } 
            }
        }
    }
</script>
<style lang='less' scoped>
    @import "~@/common/stylus/variable.less";
    @import "~@/common/stylus/mixin.less";
    @import "~@/common/stylus/modifyUi.less";
    .page-box {
        background: #fff;
        .content-wrapper();
        .nav {
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 10;
            left: 0;
        };
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 0;
            .content-top-area {
                position: relative;
                width: 100%;
                margin: 0 auto;
                height: 60px;
                background: #3B9DF9;
            };
            .user-box {
                width: 100%;
                padding: 16px;
                box-sizing: border-box;
                overflow: auto;
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                .user-photo {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 48px;
                    height: 48px;
                    margin-right: 10px;
                    border-radius: 50%;
                    background: #E5E5E5;
                    img {
                        vertical-align: middle;
                        width: 48px;
                        height: 48px;
                    }
                };
                .user-message {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    z-index: 100;
                    color: #101010;
                    height: 48px;
                    flex: 1;
                    font-size: 13px;
                    .user-name {
                        width: 98%;
                        word-break: break-all;
                    }
                    .account-name {
                        font-size: 12px;
                        width: 98%;
                        word-break: break-all;
                        margin-top: 4px;
                    }
                }
            };
           .task-board {
                width: 100%;
                padding: 0 16px 10px 16px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: center;
                h2 {
                    width: 100%;
                    height: 40px;
                    line-height: 40px;
                    font-size: 12px;
                    color: #101010;
                };
                .subproject-list-box {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    flex: 1;
                    align-content: flex-start;
                    .subproject-list {
                        position: relative;
                        width: 100px;
                        height: 50px;
                        margin-right: 20px;
                        display: flex;
                        background: #F0F2FE;
                        border-radius: 6px;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        >span {
                            &:nth-child(2){
                                margin-top: 14px;
                                font-size: 16px;
                                color: #101010;
                                text-align: center
                            }
                        };
                        .message-number {
                            position: absolute;
                            top: -10px;
                            right: 0;
                            display: inline-flex;
                            justify-content: center;
                            align-items: center;
                            vertical-align: middle;
                            background-color: #E86F50;
                            color: #ffffff;              
                            font-size: 12px;              
                            min-width: 17px;
                            max-width: 24px;
                            aspect-ratio: 1;
                            border-radius: 50%;
                            padding: 0 4px;
                            box-sizing: border-box;
                            >span {
                                .no-wrap();
                            }                      
                        }
                    };
                    >div:nth-child(5) {
                        width: 35% !important
                    }
                }
            };
            .functional-zone {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                margin-top: 20px;
                .service-list {
                    width: 25%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 20px;
                    .list-top {
                        width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #3B9DF9;
                        border-radius: 12px;
                        >img {
                            width: 25px;
                            height: 25px;
                        }
                    };
                    .list-bottom {
                        margin-top: 14px;
                        font-size: 12px;
                        color: #101010;
                    }
                }
            }
        }
    }
</style>