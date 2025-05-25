import {createRouter, createWebHistory} from "vue-router";
import Login from "./pages/auth/Login.vue";
import Signup from "./pages/auth/Signup.vue";
// import NotFound from "./pages/access/NotFound.vue";
import useUserStore from "./stores/user.js";
import Users from "./pages/Users.vue";
import NotFoundPage from "./pages/access/NotFound.vue";
import ForgotPassword from "./pages/auth/ForgotPassword.vue";
import EmailVerified from "./pages/access/EmailVerified.vue";
import EmailNotVerified from "./pages/access/EmailNotVerified.vue";
import NoAccess from "./pages/access/NoAccess.vue";
import NoInventoryAccess from "./pages/access/NoInventoryAccess.vue";
import Traffic from "./pages/Traffic.vue";

const routes = [
  {
    path: "/",
    component: Traffic,
    children: [
      { 
        path: '', 
        name: 'Dashboard', 
        component: Traffic,
        meta: { 
          allowGuest: true // Allow guest access by default
        }
      },
      { 
        path: '/users', 
        name: 'Users', 
        component: Users, 
        meta: { 
          requiresAuth: true 
        }
      },
      { path: '/forgotpassword', name: 'ForgotPassword', component: ForgotPassword},
      {
        path: '/password-reset',
        name: 'PasswordReset',
        component: ForgotPassword,
        props: route => ({
          token: route.query.token,
          email: route.query.email
        })
      },
    ],
    beforeEnter: async (to, from, next) => {
      const userStore = useUserStore();

      // If route allows guests, continue without auth check
      if (to.meta.allowGuest) {
        userStore.setGuestMode();
        return next();
      }

      // Only try to fetch user for protected routes
      if (to.meta.requiresAuth) {
        try {
          const isAuthenticated = await userStore.fetchUser(true);
          if (!isAuthenticated) {
            return next('/login');
          }
        } catch (error) {
          return next('/login');
        }
      }

      next();
    }
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/forgotpassword', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/email_verified', name: 'EmailVerified', component: EmailVerified },
  { path: '/email_not_verified', name: 'EmailNotVerified', component: EmailNotVerified },
  { path: '/no_access', name: 'NoAccess', component: NoAccess },
  { path: '/no_inventory_access', name: 'NoInventoryAccess', component: NoInventoryAccess },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Allow guest access to public routes
  if (to.meta.allowGuest) {
    return next();
  }

  // Handle auth pages
  const authPages = ['/login', '/signup', '/forgotpassword'];
  if (authPages.includes(to.path)) {
    const userStore = useUserStore();
    if (userStore.isLoggedIn) {
      return next('/');
    }
    return next();
  }

  next();
});

export default router