import { h } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

export const useMenu = () => {
  const emoji = () =>
    h(SvgIcon, {
      name: 'emoji',
      width: 25,
      height: 25,
      class: ''
    })
  const file = () =>
    h(SvgIcon, {
      name: 'img',
      width: 25,
      height: 25,
      class: ''
    })
  return { menuList: [emoji, file] }
}
