import {createRouter, createWebHistory} from "vue-router";
import DefaultLayout from "./components/DefaultLayout.vue";
import Upload from "./pages/Upload.vue";
import MyImages from "./pages/MyImages.vue";
import Login from "./pages/auth/Login.vue";
import Signup from "./pages/auth/Signup.vue";
import NotFound from "./pages/auth/NotFound.vue";
import useUserStore from "./stores/user.js";
import Dashboard from "./pages/Dashboard.vue";
import Reports from "./pages/Reports.vue";
import Inventory from "./pages/Inventory.vue";
import Borrowed from "./pages/Borrowed.vue";
import Offices from "./pages/Offices.vue";
import MainLayout from "./components/MainLayout.vue";
import Categories from "./pages/Categories.vue";
import Borrowers from "./pages/Borrowers.vue";
import Users from "./pages/Users.vue";
import NotFoundPage from "./pages/NotFound.vue";
import ForgotPassword from "./pages/auth/ForgotPassword.vue";

const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: '/', name: 'Dashboard', component: Dashboard, meta: { permission: 'for_dashboard' }},
      { path: '/upload', name: 'Upload', component: Upload },
      { path: '/images', name: 'MyImages', component: MyImages },
      { path: '/reports', name: 'Reports', component: Reports },
      { path: '/inventory', name: 'Inventory', component: Inventory, meta: { permission: 'for_inventory' }},
      { path: '/borrowed', name: 'Borrowed', component: Borrowed },
      { path: '/categories', name: 'Categories', component: Categories, meta: { permission: 'for_categories' }},
      { path: '/borrowers', name: 'Borrowers', component: Borrowers, meta: { permission: 'for_borrowers' }},
      { path: '/offices', name: 'Offices', component: Offices, meta: { permission: 'for_offices' }},
      { path: '/users', name: 'Users', component: Users, meta: { permission: 'for_users' }},
      {
        path: '/forgotpassword',
        name: 'ForgotPassword',
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
        next();
      } catch (error) {
        next('/login');
      }
    },
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/forgotpassword', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
];


const router = createRouter({
  history: createWebHistory(),
  routes
})

import {useDatabaseStore} from "./stores/databaseStore.js";

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const databaseStore = useDatabaseStore();

  // No access restriction on this route
  if (!to.meta.permission) {
    return next();
  }

  try {
    // Load user and inventory access if not yet loaded
    if (!userStore.user) await userStore.fetchUser();
    if (databaseStore.inventoryAccesses.length === 0) {
      await databaseStore.fetchData();
    }

    const userAccess = databaseStore.inventoryAccesses.find(
      access => access.user_id === userStore.user.id
    );

    const permissionKey = to.meta.permission;

    if (userAccess && userAccess[permissionKey] === 1) {
      return next();
    } else {
      return next({ name: 'NotFound' }); // or a 403 page
    }
  } catch (err) {
    console.error("Navigation guard error:", err);
    return next('/login');
  }
});

export default router