import Vue from 'vue'
import Router from 'vue-router'
import { getStore } from '@/common/js/utils.js'
import store from '@/store' 
const Login = () => import ('@/pages/Login')
const MyInfo = () => import ('@/pages/MyInfo')
const ModificationPassword = () => import ('@/pages/ModificationPassword')
const SuppliesHome = () =>
    import ('@/pages/suppliesManagementPackage/Home')  
const SuppliesOrderList= () =>
    import ('@/pages/suppliesManagementPackage/orderForm/orderList')
const SuppliesHistoryOrderList= () =>
    import ('@/pages/suppliesManagementPackage/orderForm/historyOrderList')
const SuppliesOrderDetails= () =>
    import ('@/pages/suppliesManagementPackage/orderForm/OrderDetails')
const SuppliesCreateDeliveryOrder= () =>
    import ('@/pages/suppliesManagementPackage/orderForm/createDeliveryOrder')
const SuppliesHistoryDeliveryNote= () =>
    import ('@/pages/suppliesManagementPackage/orderForm/historyDeliveryNote')
const SuppliesDeliverGoodsList= () =>
    import ('@/pages/suppliesManagementPackage/deliverGoods/deliverGoodsList')
const SuppliesDeliverHistoryGoodsList= () =>
    import ('@/pages/suppliesManagementPackage/deliverGoods/deliverHistoryGoodsList')
const SuppliesDeliverGoodsDetails= () =>
    import ('@/pages/suppliesManagementPackage/deliverGoods/deliverGoodsDetails')
const SuppliesDelivery= () =>
    import ('@/pages/suppliesManagementPackage/deliverGoods/delivery')
const SuppliesChangingOrRefundingList= () =>
    import ('@/pages/suppliesManagementPackage/changingOrRefundingGoods/changingOrRefundingList')
const SuppliesChangingOrRefundingDetails= () =>
    import ('@/pages/suppliesManagementPackage/changingOrRefundingGoods/changingOrRefundingDetails')
const SuppliesMyEvaluate= () =>
    import ('@/pages/suppliesManagementPackage/myEvaluate/myEvaluate')
const SuppliesTakeStock= () =>
    import ('@/pages/suppliesManagementPackage/takeStock/takeStock')
const SuppliesTakeStockRecord= () =>
    import ('@/pages/suppliesManagementPackage/takeStock/takeStockRecord')
const SuppliesTakeStockRecordDetails= () =>
    import ('@/pages/suppliesManagementPackage/takeStock/takeStockRecordDetails')
const SuppliesEditTakeStock= () =>
    import ('@/pages/suppliesManagementPackage/takeStock/editTakeStock')                                                
Vue.use(Router)
let baseRoute = [{
        path: '/',
        name: 'login',
        component: Login,
        meta: { index: 0 }
    },
    {
      path: '/suppliesHome',
      name: 'suppliesHome',
      component: SuppliesHome,
      meta: { index: 1 }
    },
    {
        path: '/myInfo',
        name: 'myInfo',
        component: MyInfo,
        meta: { index: 2 }
    },
    {
        path: '/modificationPassword',
        name: 'modificationPassword',
        component: ModificationPassword,
        meta: { index: 3 }
    },
  {
    path: '/suppliesOrderList',
    name: 'suppliesOrderList',
    component: SuppliesOrderList,
    meta: { index: 3 }
  },
  {
    path: '/suppliesHistoryOrderList',
    name: 'suppliesHistoryOrderList',
    component: SuppliesHistoryOrderList,
    meta: { index: 4 }
  },
  {
    path: '/suppliesOrderDetails',
    name: 'suppliesOrderDetails',
    component: SuppliesOrderDetails,
    meta: { index: 4 }
  },
  {
    path: '/suppliesHistoryDeliveryNote',
    name: 'suppliesHistoryDeliveryNote',
    component: SuppliesHistoryDeliveryNote,
    meta: { index: 5 }
  },
  {
    path: '/suppliesCreateDeliveryOrder',
    name: 'suppliesCreateDeliveryOrder',
    component: SuppliesCreateDeliveryOrder,
    meta: { index: 4 }
  },
  {
    path: '/suppliesDeliverGoodsList',
    name: 'suppliesDeliverGoodsList',
    component: SuppliesDeliverGoodsList,
    meta: { index: 3 }
  },
  {
    path: '/suppliesDeliverHistoryGoodsList',
    name: 'suppliesDeliverHistoryGoodsList',
    component: SuppliesDeliverHistoryGoodsList,
    meta: { index: 4 }
  },
  {
    path: '/suppliesDeliverGoodsDetails',
    name: 'suppliesDeliverGoodsDetails',
    component: SuppliesDeliverGoodsDetails,
    meta: { index: 4 }
  },
  {
    path: '/suppliesDelivery',
    name: 'suppliesDelivery',
    component: SuppliesDelivery,
    meta: { index: 4 }
  },
  {
    path: '/suppliesChangingOrRefundingList',
    name: 'suppliesChangingOrRefundingList',
    component: SuppliesChangingOrRefundingList,
    meta: { index: 3 }
  },
  {
    path: '/suppliesChangingOrRefundingDetails',
    name: 'suppliesChangingOrRefundingDetails',
    component: SuppliesChangingOrRefundingDetails,
    meta: { index: 4 }
  },
  {
    path: '/suppliesMyEvaluate',
    name: 'suppliesMyEvaluate',
    component: SuppliesMyEvaluate,
    meta: { index: 3 }
  },
  {
    path: '/suppliesTakeStock',
    name: 'suppliesTakeStock',
    component: SuppliesTakeStock,
    meta: { index: 3 }
  },
  {
    path: '/suppliesTakeStockRecord',
    name: 'suppliesTakeStockRecord',
    component: SuppliesTakeStockRecord,
    meta: { index: 4 }
  },
  {
    path: '/suppliesTakeStockRecordDetails',
    name: 'suppliesTakeStockRecordDetails',
    component: SuppliesTakeStockRecordDetails,
    meta: { index: 5 }
  },
  {
    path: '/suppliesEditTakeStock',
    name: 'suppliesEditTakeStock',
    component: SuppliesEditTakeStock,
    meta: { index: 5 }
  },
];
let router = new Router({
    routes: baseRoute,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            // return {
            //     x: 0,
            //     y: 0
            // }
        }
    }
});
router.beforeEach((to, from, next) => {
    let login = getStore('isLogin');
    let name = to.name;
    if (name === 'login') {
        if (login) {
            next({ path: '/suppliesHome' })
        } else {
            next()
        }
    } else {
        if (login) {
            next()
        } else {
            next({ path: '/' })
        }
    }
});
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
};
export default router