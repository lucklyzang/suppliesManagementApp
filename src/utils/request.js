import axios from 'axios'
import store from '@/store'
import router from '../router'
import Vue from 'vue';
import { removeAllLocalStorage, IsPC } from "@/common/js/utils";
import { Dialog, Toast } from 'vant';
// 全局注册
Vue.use(Dialog);
// 开发环境： http://blink.blinktech.cn
// 测试环境：http://show.blinktech.cn
// 准生产环境：http://ver.blinktech.cn
// 生产环境：http://blinktech.cn
// 新测试环境  http://act.blinktech.cn
const service = axios.create({
    baseURL: `${store.getters.baseURL}`, //接口基础地址
    retry: 2, // 网络请求异常后，重试次数
    retryDelay: 1000, // 每次重试间隔时间
    shouldRetry: (err) => true // 重试条件
});

// request interceptor
service.interceptors.request.use(
    config => {
        config.headers['tenant-id'] = 1;
        // 请求头添加token
        if (store.getters.token) {
            config.headers['Authorization'] = store.getters.token
        };
        return config;
      }, function (error) {
        //处理请求错误
        return Promise.reject(error.response);
    }
);

// response interceptor
service.interceptors.response.use(
    response => {
        if (response.headers['token']) {
            store.commit('changeToken', response.headers['token'])
        };
        return response
    },
    (error) => {
        if (error.response) {
            if (Object.prototype.toString.call(error.response) === '[object Object]') {
                if (error.response.hasOwnProperty('status')) {
                    if (error.response.status === 401) {
                        store.dispatch('resetLoginState');
                        store.dispatch('resetSuppliesManagementInfoState');
                        removeAllLocalStorage();
                        if(store.getters.suppliesHomeGlobalTimer) {window.clearInterval(store.getters.suppliesHomeGlobalTimer)};
                        if (!store.getters.overDueWay) { 
                            Toast({
                                message: 'token已过期,请重新登录',
                                duration: 1000
                            });
                            setTimeout(() => {
                                router.push({
                                    path: "/"
                                })
                            },2000);
                        } else {
                            router.push({
                                path: "/"
                            })
                        }
                    }
                }
            }
        } else if (error.request) {
            return Promise.reject(error.message)
        } else {
            return Promise.reject('请求配置错误')
        };		
      // 处理响应错误
        var config = error.config;
        // 判断是否配置了重试
        if(!config || !config.retry) {
            if (error.response) {
                if (Object.prototype.toString.call(error.response) === '[object Object]') {
                    if (error.response.hasOwnProperty('data')) {
                        if (error.response.data.hasOwnProperty('msg')) {
                            return Promise.reject(error.response.data.msg)
                        } else if (error.response.data.hasOwnProperty('message')) {
                            return Promise.reject(error.response.data.message)
                        } else {
                            return Promise.reject(error.response.data)
                        }
                    } else {
                        return Promise.reject(error.response)
                    }
                }	else {
                    return Promise.reject(error)
                }
            }  else if (error.request) {
                return Promise.reject(error.message)
            } else {
                return Promise.reject('请求配置错误')
            }		  
        };
        if(!config.shouldRetry || typeof config.shouldRetry != 'function') {
            if (error.response) {
                if (Object.prototype.toString.call(error.response) === '[object Object]') {
                    if (error.response.hasOwnProperty('data')) {
                        if (error.response.data.hasOwnProperty('msg')) {
                            return Promise.reject(error.response.data.msg)
                        } else if (error.response.data.hasOwnProperty('message')) {
                            return Promise.reject(error.response.data.message)
                        } else {
                            return Promise.reject(error.response.data)
                        }
                    } else {
                        return Promise.reject(error.response)
                    }
                }	else {
                    return Promise.reject(error)
                }
            }  else if (error.request) {
                return Promise.reject(error.message)
            } else {
                return Promise.reject('请求配置错误')
            }		  
        };
        //判断是否满足重试条件
        if(!config.shouldRetry(error)) {
            if (error.response) {
                if (Object.prototype.toString.call(error.response) === '[object Object]') {
                    if (error.response.hasOwnProperty('data')) {
                        if (error.response.data.hasOwnProperty('msg')) {
                            return Promise.reject(error.response.data.msg)
                        } else if (error.response.data.hasOwnProperty('message')) {
                            return Promise.reject(error.response.data.message)
                        } else {
                            return Promise.reject(error.response.data)
                        }
                    } else {
                        return Promise.reject(error.response)
                    }
                }	else {
                    return Promise.reject(error)
                }
            }  else if (error.request) {
                return Promise.reject(error.message)
            } else {
                return Promise.reject('请求配置错误')
            }		  
        };
        // 设置重置次数，默认为0
        config.__retryCount = config.__retryCount || 0;
        // 判断是否超过了重试次数
         if(config.__retryCount > config.retry) {
            if (error.response) {
                if (Object.prototype.toString.call(error.response) === '[object Object]') {
                    if (error.response.hasOwnProperty('data')) {
                        if (error.response.data.hasOwnProperty('msg')) {
                            return Promise.reject(error.response.data.msg)
                        } else if (error.response.data.hasOwnProperty('message')) {
                            return Promise.reject(error.response.data.message)
                        } else {
                            return Promise.reject(error.response.data)
                        }
                    } else {
                        return Promise.reject(error.response)
                    }
                }	else {
                    return Promise.reject(error)
                }
            }  else if (error.request) {
                return Promise.reject(error.message)
            } else {
                return Promise.reject('请求配置错误')
            }		  
         };
        //重试次数自增
        config.__retryCount += 1;
        //延时处理
        var backoff = new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, config.retryDelay || 1);
        });
        //重新发起axios请求
        return backoff.then(function() {
            return service(config);
        })
    }
);

export default service