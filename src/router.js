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
      {path: '/', name: 'Dashboard', component: Dashboard},
      {path: '/upload', name: 'Upload', component: Upload},
      {path: '/images', name: 'MyImages', component: MyImages},
      {path: '/reports', name: 'Reports', component: Reports},
      {path: '/inventory', name: 'Inventory', component: Inventory},
      {path: '/borrowed', name: 'Borrowed', component: Borrowed},
      {path: '/categories', name: 'Categories', component: Categories},
      {path: '/borrowers', name: 'Borrowers', component: Borrowers},
      {path: '/users', name: 'Users', component: Users},
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
        next(false);
      }
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
  },
  {
    path: '/forgotpassword',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage
  },
  {path: '/main', name: 'Main', component: MainLayout},
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router