import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import '../src/index.css'
import 'primeicons/primeicons.css';

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    },
    ripple: true
})
app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass);
app.mount('#app')
