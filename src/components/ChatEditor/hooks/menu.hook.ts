import { h } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

export const useMenu = () => {
  const emoji = () =>
    h(SvgIcon, {
      name: 'emoji',
      width: 25,
      height: 25,
      hover: '#4e9def',
      class: 'pointer',
      color: '#4b4b4b'
    })
  const file = () =>
    h(SvgIcon, {
      name: 'file',
      width: 25,
      height: 25,
      hover: '#4e9def',
      class: 'pointer ml-md',
      color: '#4b4b4b'
    })
  return { emoji, file }
}
