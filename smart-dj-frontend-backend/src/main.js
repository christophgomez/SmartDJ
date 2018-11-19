import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuelidate from 'vuelidate'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import VueWait from 'vue-wait'
Vue.use(VueWait)

library.add(faTrash);

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
