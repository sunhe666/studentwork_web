import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import mitt from 'mitt'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const emitter = mitt()
app.config.globalProperties.emitter = emitter
app.use(router)
app.use(ElementPlus)
app.mount('#app')
