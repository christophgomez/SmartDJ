import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuelidate from 'vuelidate'

import {
  MdButton,
  MdContent,
  MdTabs,
  MdCard,
  MdField,
  MdInput,
  MdLayout,
  MdGutter
} from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'

Vue.use(Vuelidate)
Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)
Vue.use(MdCard)
Vue.use(MdField)
Vue.use(MdInput)
Vue.use(MdLayout)
Vue.use(MdGutter)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
