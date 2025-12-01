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
import Assistance from '../views/event/Assistance.vue'
import Events from '../views/event/Events.vue'
import Management from '../views/event/Management.vue'
import StaffManagement from '../views/event/StaffManagement.vue'
import Payments from '../views/finance/Payments.vue'
import PayEvent from '../views/user/PayForEvent.vue'
import UsersConsole from '../views/maintenance/UsersConsole.vue'
import UserManagement from '../views/maintenance/usersManagement.vue'
import ProfileManagement from '../views/maintenance/ProfileManagement.vue'
import EventPayment from '../views/event/AdminPayTicket.vue'
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
    },
    {
      path: '/events/:id/assistance',
      name: 'event-assistance',
      component: Assistance,
      props: true
    },
    {
      path: '/events',
      name: 'events',
      component: Events,      
    },
    {
      path: '/events/:id/management',
      name: 'event-management',
      component: Management,
      props: true
    }, 
    {
      path: '/events/staff',
      name: 'staff-management',
      component: StaffManagement,
    }, 
    {
      path: '/finance/payment',
      name: 'payments-management',
      component: Payments,
    },
    {
      path: '/events/pay',
      name: 'pay-event',
      component: PayEvent,
    },
    {
      path: '/users/console',
      name: 'user-console',
      component: UsersConsole,
    },
    {
      path: '/users/Profile-Management',
      name: 'ProfileManagement',
      component: ProfileManagement,
    },
    {
      path: '/users/Management',
      name: 'UserManagement',
      component: UserManagement
    }, {
      path: '/events/admin/event-payment',
      name: 'event-payment',
      component: EventPayment,
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
