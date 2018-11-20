import Vue from 'vue'
import App from './App.vue'
import router from './router'
const config = require('../config/settings');
import Vuelidate from 'vuelidate'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueSocketIO from 'vue-socket.io'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTrash,
  faCheck,
  faUser,
  faStepForward,
  faStepBackward,
  faPlay,
  faPause,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import VueWait from 'vue-wait'
Vue.use(VueWait);

Vue.use(new VueSocketIO({
  connection: config.baseURL+config.serverPort,
}));

library.add(faTrash);
library.add(faCheck);
library.add(faUser);
library.add(faStepForward);
library.add(faStepBackward);
library.add(faPlay);
library.add(faPause);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(BootstrapVue);
Vue.use(Vuelidate);
Vue.use(VueMaterial);

Vue.config.productionTip = false

new Vue({
  router,
  wait: new VueWait(),
  render: h => h(App)
}).$mount('#app')
