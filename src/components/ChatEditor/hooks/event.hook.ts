import { onMounted, onUnmounted, type Ref } from 'vue'

export type EventKey = keyof GlobalEventHandlersEventMap

export type EventRecord = Partial<{
  [key in EventKey]: (event: Event) => void
}>

export const registerEvents = (element: Ref<HTMLElement | null>) => {
  const register = (record: EventRecord) => {
    onMounted(() => {
      for (const [key, value] of Object.entries(record)) {
        element.value?.addEventListener(key, value)
      }
    })
    onUnmounted(() => {
      for (const [key, value] of Object.entries(record)) {
        element.value?.removeEventListener(key, value)
      }
    })
  }
  return { register }
}
