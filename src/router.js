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
import Traffic from "./pages/Traffic.vue"
const routes = [
  {
    path: "/",
    component: Traffic,
    
  },
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
      return next({ name: "NotFound" }); // or show 403
    }
  } catch (err) {
    console.error("Navigation guard error:", err);
    return next("/login");
  }
});


export default router