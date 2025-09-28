import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import forgotPass from '../views/ForgotPass.vue'
import ResetPass from '../views/ResetPass.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: forgotPass
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPass
    }
  ],
})

export default router
