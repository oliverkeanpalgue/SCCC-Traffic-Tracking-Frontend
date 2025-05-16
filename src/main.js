import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router.js";
import { createPinia } from "pinia";
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
});

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .mount("#app");
