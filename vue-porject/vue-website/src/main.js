import { createApp } from 'vue'
import App from './App.vue'
import router from './router'   // 导入上面创建的路由配置


const app = createApp(App)

app.use(router)   // 注册路由插件

app.mount('#app')