import type { App, Component } from 'vue'
import Vue3EditorChat from '@/components/ChatEditor/index.vue'

const components: Record<string, Component> = {
  Vue3EditorChat
}

function install(App: App) {
  const keys = Object.keys(components)
  keys.forEach((name) => {
    const component = components[name]
    App.component(component.name || name, component)
  })
}

export { install, Vue3EditorChat }
