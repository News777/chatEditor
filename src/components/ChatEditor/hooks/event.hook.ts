import { onMounted, onUnmounted, type Ref } from 'vue'

export type EventKey = keyof GlobalEventHandlersEventMap

export type EventRecord = Partial<{
  [key in EventKey]: { func: (event: Event) => void; passive?: boolean }
}>

export const registerEvents = (element: Ref<HTMLElement | null>) => {
  const register = (record: EventRecord) => {
    onMounted(() => {
      for (const [key, { func, passive }] of Object.entries(record)) {
        element.value?.addEventListener(key, func, passive ?? true)
      }
    })
    onUnmounted(() => {
      for (const [key, { func, passive }] of Object.entries(record)) {
        element.value?.addEventListener(key, func, passive ?? true)
      }
    })
  }
  return { register }
}
