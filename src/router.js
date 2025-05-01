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
      { path: '/', name: 'Dashboard', component: Traffic, meta: { permission: 'for_dashboard' }},
      { path: '/users', name: 'Users', component: Users, meta: { permission: 'for_users' }},
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
      try {
        const userStore = useUserStore();
        await userStore.fetchUser();
        if (userStore.user.for_inventory === 0){
          console.log('userStore.user.for_inventory', userStore.user.for_inventory)
          next('/no_inventory_access');
        } 
        else if (userStore.user.email_verified_at === null){
          console.log('userStore.user.email_verified_at', userStore.user.email_verified_at)
          next('/email_not_verified');
        } 
        next();
      } catch (error) {
        next('/login');
      }
    },
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

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // No special permission needed, allow
  if (!to.meta.permission) {
    return next();
  }

  try {
    // Make sure user and access info is loaded
    if (!userStore.user || !userStore.inventoryAccess) {
      await userStore.fetchUser();
      if (!userStore.user) {
        return next("/login");
      }
    }

    const permissionKey = to.meta.permission;
    const access = userStore.inventoryAccess;

    if (access && access[permissionKey] === 1) {
      return next();
    } else {
      return next({ name: "NoAccess" });
    }
  } catch (err) {
    console.error("Navigation guard error:", err);
    return next("/login");
  }
});


export default router