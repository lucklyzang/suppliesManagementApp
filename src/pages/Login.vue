<template>
	<div class="container">
    	<van-loading size="24px" vertical v-show="showLoadingHint">{{ infoText }}</van-loading>
		<van-dialog v-model="modalShow" :title="modalContent"
		 show-cancel-button @confirm="sureCancel" @cancel="cancelSure">
		</van-dialog>
		<div class="top-background-area">
			<img src="@/common/images/home/login-background-image.png" />
			<div class="title-area">
				<img src="@/common/images/home/login-icon.png" />
				<span>物资管理系统</span>
			</div>
		</div>
		<div class="container-content">
			<div class="form-box">
				<van-field
					left-icon="contact"
          			:border="false"
					placeholder="请输入账号"
					v-model="form.username"
					type="text"
					clearable
				>
				</van-field>
				<van-field
					left-icon="lock"
          			:border="false"
					placeholder="请输入密码"
					v-model="form.password"
					type="password"
					clearable
				>
				</van-field>
			</div>
      <div class="remember-password">
        <div class="remember-password-content">
          <van-checkbox v-model="checked" checked-color="#1864FF">记住账号密码</van-checkbox>
         </div>
      </div>
	<div class="form-btn">
        <div v-preventReClick @click="loginHandle">登 录</div>
	</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapMutations } from 'vuex'
	import { logIn, getUserInfo, getAppPermission } from '@/api/login.js'
	import { setStore, getStore, removeStore } from '@/common/js/utils'
	export default {
	components: {
	},
		data() {
			return {
				showLoadingHint: false,
				infoText: '登录中···',
				form: {
					username: '',
					password: ''
				},
                checked: false,
				rememberAccountMessage: false,
				modalShow: false,
				modalContent: ''
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'userTokenInfo',
				'baseURL'
			])
		},
		mounted () {
			this.form.username = getStore('userName') ? getStore('userName') : '';
			this.form.password = getStore('userPassword') ? getStore('userPassword') : '';
			// 监控键盘弹起
			// let originalHeight = document.documentElement.clientHeight || document.body.clientHeight;
			// window.onresize = ()=> {
			// 	let resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
			// 	if (resizeHeight < originalHeight) {
			// 		return (()=>{
			// 		this.$refs['bgIconWrapper'].style.cssText='flex:none;height:220px'
			// 		})()
			// 	} else {
			// 		this.$refs['bgIconWrapper'].style.cssText='flex:1;height:0'
			// 	}
			// };
			let me = this;
			window['setDeviceInfo'] = (val) => {
				me.setDeviceInfo(val);
			};
		},
		methods: {
			...mapMutations([
				'storeUserInfo',
				'storeUserTokenInfo',
				'changeOverDueWay',
				'changeToken',
				'changeIsLogin',
				'storeAppPermission'
			]),

			// 获取用户详情
			getUserInfoEvent () {
				return new Promise((resolve,reject) => {
					this.showLoadingHint = true;
					this.infoText = '获取中···';
					getUserInfo(this.userTokenInfo['userId'])
					.then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						if (res && res.data.code == 0) {
							resolve();
							this.storeUserInfo(res.data.data);
						} else {
							reject(res.data.msg);
							this.$dialog.alert({
								message: `${res.data.msg}`,
								closeOnPopstate: true
							}).then(() => {})
						}
					})
					.catch((err) => {
						reject(err);
						this.showLoadingHint = false;
						this.infoText = '';
						this.$dialog.alert({
							message: `${err}`,
							closeOnPopstate: true
						}).then(() => {})
					})
				})
			},

			// 获取用户权限
			getappPermissionEvent () {
				return new Promise((resolve,reject) => {
					this.showLoadingHint = true;
					this.infoText = '查询中···';
					getAppPermission(this.userInfo['worker']['account'])
					.then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						if (res && res.data.code == 0) {
							resolve();
							this.storeAppPermission(res.data.data);
						} else {
							reject(res.data.msg);
							this.$dialog.alert({
								message: `${res.data.msg}`,
								closeOnPopstate: true
							}).then(() => {})
						}
					})
					.catch((err) => {
						reject(err);
						this.showLoadingHint = false;
						this.infoText = '';
						this.$dialog.alert({
							message: `${err}`,
							closeOnPopstate: true
						}).then(() => {})
					})
				})
			},
				
			// 账号密码登录事件
			authLoginEvent () {
				return new Promise((resolve,reject)=> {
					let loginMessage ={
						username: this.form.username,
						password: this.form.password
					};
					this.showLoadingHint = true;
					this.infoText = '登录中···';
					logIn(loginMessage).then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						if (res) {
							if (res.data.code == 0) {
								resolve();
								// 判断是否勾选记住用户名密码
								if (this.checked) {
									setStore('userName', this.form.username);
									setStore('userPassword', this.form.password);
								} else {
									removeStore('userName');
									removeStore('userPassword');
								};
								// 登录用户token信息存入store
								this.storeUserTokenInfo(res.data.data);
								// 存入token
								this.changeToken(res.data.data['accessToken']);
							} else {
								reject(res.data.msg);
								this.$dialog.alert({
									message: `${res.data.msg}`,
									closeOnPopstate: true
								}).then(() => {})
							}
						}
					})
					.catch((err) => {
						reject(err);
						this.showLoadingHint = false;
						this.infoText = '';
						this.$dialog.alert({
							message: `${err}`,
							closeOnPopstate: true
						}).then(() => {})
					})
				})	
			},

			// 登录事件
			async loginHandle () {
				if (this.form.username === '' || this.form.password === '') {
					this.$toast({
						message: '账号或密码不能为空'
					});
					return;
				};
				try {
					// 账号密码登录
					await this.authLoginEvent();
					// 获取用户详情
					await this.getUserInfoEvent();
					// 获取用户权限
					// await this.getappPermissionEvent();
					this.changeIsLogin(true);
					this.changeOverDueWay(false);
					this.$router.push({ path: "/suppliesHome" })
				} catch (err) {
					this.$dialog.alert({
						message: `${err}`,
						closeOnPopstate: true
					}).then(() => {})
				}
			},
			
			// 弹框确定事件
			sureCancel () {
				this.modalShow = false;
			},
			
			// 弹框取消事件
			cancelSure () {
				this.modalShow = false;
			}
		}
	}
</script>

<style lang="less" scoped>
  @import "~@/common/stylus/variable.less";
  @import "~@/common/stylus/mixin.less";
  @import "~@/common/stylus/modifyUi.less";
	.container {
		.content-wrapper();
		font-size: 14px;
		padding-top: 50vh;
		box-sizing: border-box;
		.top-background-area {
			width: 100%;
			height: 50vh;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10;
			>img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
        height: 100%;
			};
			.title-area {
				width: 100%;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				>img {
					width: 64px;
				};
				>span {
					margin-top: 22px;
					font-size: 20px;
					color: #fff
				}
			}
		};
		.container-content {
			height: 50vh;
			background: #fff;
			position: relative;
			padding-top: 40px;
			box-sizing: border-box;
			.form-box {
        width: 80%;
        margin: 0 auto;
				/deep/ .van-cell {
          height: 40px;
          padding: 0 10px;
          box-sizing: border-box;
          border-bottom: 1px solid #B6B6B6;
          .van-field__left-icon {
            margin-right: 10px;
            .van-icon {
              font-size: 22px;
              color: #B6B6B6;
            }
          };
          .van-cell__value {
            font-size: 16px;
            color: #B6B6B6;
            .van-field__control {
              color: #B6B6B6 !important;
            }
          };
          &:first-child {
            margin-bottom: 20px;
          }
        }
			};
      .remember-password {
        width: 80%;
        margin: 0 auto;
        height: 20px;
				margin-top: 20px;
        position: relative;
        .remember-password-content {
          position: absolute;
          top: 0;
          right: 0;
          /deep/ .van-checkbox {
            .van-checkbox__label {
              font-size: 14px;
              color: #565656;
            }
          }
        }
      };
			.form-btn {
        width: 75%;
        margin: 0 auto;
        margin-top: 50px;
				>div {
					height: 48px;
					line-height: 48px;
          text-align: center;
					font-size: 16px;
          color: #fff;
          background: linear-gradient(to right, #6ED3F7,#218FFF);
          border-radius: 26px;
					box-shadow: 0pt 2pt 6pt 0pt rgba(36,149,213,1);
				}
			}
		}
	}
</style>
