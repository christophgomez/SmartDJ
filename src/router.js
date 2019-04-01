import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Landing.vue')
    },
    {
      path: '/success',
      name: 'success',
      component: () => import('./views/AuthPage.vue')
    },
    {
      path: '/AccountCreation',
      name: 'AccountCreation',
      component: () => import('./views/AccountCreation.vue')
    },
    {
      path: '/system_settings',
      component: () => import('./views/Profile.vue'),
    },
    {
      path: '/visualizer',
      name: 'visualizer',
      component: () => import('./views/Visualizer.vue'),
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
