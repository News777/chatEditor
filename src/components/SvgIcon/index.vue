<template>
  <svg class="svg-icon" :style="{ width: `${width}px`, height: `${height}px` }">
    <use :xlink:href="iconText" :fill="color" />
  </svg>
</template>

<script setup lang="tsx" name="SvgIcons">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    color?: string
    width?: number | string
    height?: number | string
    hover?: string
  }>(),
  {
    name: '',
    color: '#000000',
    width: 24,
    height: 24,
    hover: 'blue'
  }
)

const iconText = computed<string>(() => `#icon-${props.name}`)
</script>

<style lang="scss">
.svg-icon {
  &:hover {
    use {
      fill: v-bind('props.hover') !important;
    }
  }
}
</style>
