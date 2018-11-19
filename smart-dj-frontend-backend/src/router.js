import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/success',
      name: 'success',
      component: () => import('./views/AuthPage.vue')
    },
    {
      path: '/account/:username',
      name: 'account',
      component: () => import('./views/SpotifyProfile.vue'),
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('./views/AccountSignIn.vue'),
    },
    {
      path: '/system_settings',
      component: () => import('./views/SystemSettings.vue'),
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
