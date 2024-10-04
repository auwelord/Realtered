import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createBootstrap } from 'bootstrap-vue-next'
import { createHead } from '@vueuse/head';
import Multiselect from '@vueform/multiselect'
import piniaPluginPersistedState from "pinia-plugin-persistedstate"
import FontAwesomeIcon from "@/utilities/fontawesome-icons";
import App from './App.vue'
import router from './routes/router'
import Toast from "vue-toastification";
import VueDatePicker from '@vuepic/vue-datepicker';

import "vue-toastification/dist/index.css";
import altered from './assets/js/altered';
import db from './assets/js/db';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import './assets/fonts/AlteredIcons.css'
import './assets/css/LineIcons.2.0.css'
import './assets/css/animate.css'
import './assets/css/adminlte.css'
import './assets/css/global.css'
import '@vuepic/vue-datepicker/dist/main.css'

import * as jqueryExports from "jquery";
window.$ = jqueryExports.default;

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const app = createApp(App)
    .component("FontAwesomeIcon", FontAwesomeIcon)
    .component("Multiselect", Multiselect)
    .component('VueDatePicker', VueDatePicker)
    .use(router)
    .use(pinia)
    .use(altered)
    .use(db)
    .use(Toast)
    .use(createHead())
    .use(createBootstrap());

app.directive('focus', {
    mounted(el) {
        el.focus(); // Automatically focus the element when it's mounted
    }
});
app.directive('visible', {
    mounted(el, binding) {
        el.style.visibility = !!binding.value ? 'visible' : 'hidden';
    },
    updated(el, binding) {
        el.style.visibility = !!binding.value ? 'visible' : 'hidden';
    },
});

app.mount('#app');
