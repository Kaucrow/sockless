import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/auth/Home.vue'
import Login from '../views/auth/Login.vue'
import forgotPass from '../views/auth/ForgotPass.vue'
import ResetPass from '../views/auth/ResetPass.vue'
import MethodManagement from '../views/maintenance/methodMaintenance.vue'
import MenuMaintenance from '../views/maintenance/menuMaintenance.vue'
import Register from '../views/auth/Register.vue'
import EmailValidation from '../views/auth/Validation.vue'
import PermissionsConsole from '../views/maintenance/PermissionsConsole.vue'
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
      path: '/method-management',
      name: 'method-management',
      component: MethodManagement,
    },
    {
      path: '/menu-management',
      name: 'menu-management',
      component: MenuMaintenance,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { layout: 'auth'}
    },
    {
      path: '/validate-email',
      name: 'validate-email',
      component: EmailValidation,
      meta: { layout: 'auth'}
    },
    {
      path: '/permission-console',
      name: 'permission-console',
      component: PermissionsConsole,
    }
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  if (to.name !== 'login' && to.name !== 'forgot-password' && to.name !== 'reset-password' && to.name !== 'register' && to.name !== 'validate-email') {
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
