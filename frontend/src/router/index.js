import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/auth/Home.vue'
import Login from '../views/auth/Login.vue'
import forgotPass from '../views/ForgotPass.vue'
import ResetPass from '../views/ResetPass.vue'
import MethodPermissions from '../views/maintenance/methodPermission.vue'
import menuPermission from '../views/maintenance/menuPermission.vue'
import MethodManagement from '../views/maintenance/methodMaintenance.vue'
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
    },
    {
      path: '/method-permissions',
      name: 'method-permissions',
      component: MethodPermissions,
    },
    {
      path: '/menu-permissions',
      name: 'menu-permissions',
      component: menuPermission,
    },
    {
      path: '/method-management',
      name: 'method-management',
      component: MethodManagement,
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
