import App from './App'
const host = 'http://0.0.0.0:7000/api/';
const appId = 'weixin';
const appSecret = 'grSDG234';
const appToken = 'abcdefg';
// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
Vue.prototype.$host = host;
Vue.prototype.$appId = appId;
Vue.prototype.$appSecret = appSecret;
Vue.prototype.$appToken = appToken;
import {request} from './common/request.js'
Vue.prototype.$request = request
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif
// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif