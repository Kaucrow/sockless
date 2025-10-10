import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import forgotPass from '../views/ForgotPass.vue'
import ResetPass from '../views/ResetPass.vue'
import { authService } from '@/services/auth'


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
      component: Login,
      meta: { layout: 'auth'}
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: forgotPass,
      meta: { layout: 'auth'}
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPass,
      meta: { layout: 'auth'}
    }
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  if (to.name !== 'login' && to.name !== 'forgot-password' && to.name !== 'reset-password') {
    if (!isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    if (isAuthenticated && to.name === 'login') {
      next('/home');
    } else {
      next();
    }
  }
})

export default router
