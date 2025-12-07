import vuetify from './vuetify'
import { createPinia } from 'pinia'
import type { App } from 'vue'

const pinia = createPinia()

export function registerPlugins(app: App) {
  app.use(pinia)
  app.use(vuetify)
}

