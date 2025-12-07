import { createApp } from 'vue'
import { registerPlugins } from '@/app'
import App from '@/app/App.vue'
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
