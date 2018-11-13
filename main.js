// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Vuelidate from 'vuelidate'

import { MdButton, MdContent, MdTabs, MdCard, MdField, MdInput, MdLayout, MdGutter } from 'vue-material/dist/components'
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

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
