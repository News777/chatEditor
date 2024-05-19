<template>
  <div class="editor-container" id="editor-container">
    <!-- <div class="editor-tools">
      <div class="upload">
        <div class="upload-tip" v-if="fileOverTipShow">一次仅支持{{ limit }}个文件上传！</div>
        <new-upload
          :limit="limit"
          @on-exceed="handleUploadFileOver"
          @on-change="handleUploadFileChange"
          v-model:file-list="fileList"
          ref="upload"
          class="upload-demo"
          :accept="accept"
          :multiple="multiple"
        >
          <img class="upload-btn" src="../../assets/images/file.svg" alt="" />
        </new-upload>
      </div>
    </div> -->
    <div
      class="editor-content"
      v-on:paste="ecpaste($event)"
      contenteditable="true"
      ref="eleRefs"
    ></div>

    <slot name="footer">
      <div class="editor-footer">
        <div class="footer-menu">
          <emoji />
          <Upload
            :limit="uploadConfig.limit!"
            :accept="uploadConfig.accept!"
            :multiple="uploadConfig.multiple!"
            v-model:file-list="fileList"
            ref="upload"
            class="upload-demo"
            @on-change="handleUploadFileChange"
          >
            <file />
          </Upload>
        </div>
        <div class="foot-btn">
          <button class="btn-cancel" v-on:click="cancel">重置</button>
          <button class="btn-send" v-on:click="send">发送(Enter)</button>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="tsx">
import Upload from '@/components/Upload/index.vue'
import { reactive, ref, toRefs, onMounted, watch, onUnmounted, computed, type VNode } from 'vue'
import { useMenu } from './hooks/menu.hook'
import { registerEvents } from './hooks/event.hook'
import type { RemoveInputElement } from './type'
import { convertFileToElement, convertStringToImg, fileToBase64 } from './utils'

const props = withDefaults(
  defineProps<{
    uploadConfig?: {
      limit?: number
      accept?: string
      multiple?: boolean
    }
    width?: number | string
    height?: number | string
  }>(),
  {
    uploadConfig: () => ({
      limit: 3,
      accept: '',
      multiple: false
    }),
    width: 600,
    height: 260
  }
)

const emits = defineEmits<{
  (event: 'message', message: string, fileList: File[]): void
}>()

const eleRefs = ref<HTMLElement | null>(null)

const { emoji, file } = useMenu()

const { register } = registerEvents(eleRefs)

const fileList = ref<File[]>([])

const observe = ref<MutationObserver | null>(null)

const upload = ref()

const keydownHandler = (event: Event) => {
  const e = event as KeyboardEvent
  if (!e.shiftKey && e.keyCode === 13) {
    e.cancelBubble = true // ie
    e.preventDefault()
    e.stopPropagation()
    send()
  }
}

const dropHandler = (event: Event) => {
  const e = event as DragEvent
  e.preventDefault()
  // 从事件中提取files，这里不需要类型断言
  const files = e.dataTransfer?.files[0]

  if (files) {
    if (fileList.value.length < props.uploadConfig.limit!) {
      // 使用 Vue 推荐的方式更新响应式状态
      // 创建一个新文件对象，并添加uid属性
      const fileWithUid = Object.assign(files, {
        uid: new Date().getTime()
      })

      // 更新 fileList
      fileList.value.push(fileWithUid)
    } else {
      // 处理文件数量超限的情况
      // handleUploadFileOver()
    }
  }
}

const ecpaste = async (e: ClipboardEvent) => {
  const clp = e.clipboardData
  const text = clp?.getData('text/plain')

  console.log(text, 'text')
  e.preventDefault()
  if (text) {
    const newNode = document.createElement('span')
    newNode.innerHTML = text
    const selection = window.getSelection()
    if (!selection) throw new Error('get selection error')
    const rg = selection.getRangeAt(0)

    rg.deleteContents()
    rg.insertNode(newNode)
    rg.collapse(false)

    selection.removeAllRanges()
    selection.addRange(rg)
  }

  let file = null
  const items = clp?.items

  console.log(items, 'items')

  if (items && items.length) {
    console.log(items[0].kind)
    console.log(items[0].type)

    for (let i = 0; i < items.length; i++) {
      file = items[i].getAsFile()

      if (!(file instanceof File)) continue
      if (items[i].type.indexOf('image') !== -1) {
        const src = await fileToBase64(file)
        console.log(src)
        addMessage(convertStringToImg(src))
      } else {
        fileList.value.push(file)
        addMessage(convertFileToElement(file))
      }
      // 将光标移至末尾
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(eleRefs.value!) // 选择整个可编辑 div 内容
      range.collapse(false) // 将范围折叠到末尾，参数 false 意味着折叠到末端
      selection?.removeAllRanges() // 清除当前的选择范围
      selection?.addRange(range) // 添加新的范围，光标位于末尾
    }
  }

  if (!file) {
    return
  }
}

const send = () => {
  const message = eleRefs.value?.innerHTML?.replace(/<input.*?>/g, '') || ''
  /* for (const item of eleRefs.value.children) {
    if (item.nodeName === 'INPUT') {
      eleRefs.value.removeChild(item);
    }
  }
  console.log(eleRefs.value.innerHTML); */
  upload.value.submit()
  emits('message', message, fileList.value)
  eleRefs.value!.innerHTML = ''
  upload.value.clearFiles()
  fileList.value = []
}

const cancel = () => {
  eleRefs.value!.innerHTML = ''
  upload.value.clearFiles()
  fileList.value = []
}
const handleUploadFileChange = (file: File) => {
  if (!(file instanceof File)) return
  addMessage(convertFileToElement(file))
}

const addMessage = (val: string) => {
  eleRefs.value?.insertAdjacentHTML('beforeend', val)
}
/* const choseEmoji = (item) => {
  var s = require('../../icons/face/' + item.url);
  var imoj = "<span><img src='" + s + "'/></span>";
  eleRefs.value.insertAdjacentHTML('beforeend', imoj);
}; */

register({ keydown: { func: keydownHandler }, drop: { func: dropHandler, passive: false } })

onMounted(() => {
  // 针对 editor 清除文件类型输入
  observe.value = new MutationObserver(function (mutationsList) {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.removedNodes.length) {
        const rmList: RemoveInputElement[] = Array.from(
          mutation.removedNodes
        ) as RemoveInputElement[]
        const fileIndex = fileList.value.findIndex((file) =>
          rmList.some((rm) => rm.id === file.uid)
        )
        if (~fileIndex) {
          fileList.value.splice(fileIndex, 1)
        }
      }
      /* else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        } */
    }
  })
  observe.value?.observe(eleRefs.value!, {
    attributes: true,
    childList: true,
    subtree: true
  })
})
onUnmounted(() => {
  observe.value?.disconnect()
})

defineExpose({ addMessage })
</script>

<style scoped lang="scss">
.editor-container {
  box-shadow:
    rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  border-radius: 6px;
  width: 600px;
  height: 260px;
  position: relative;
  * {
    box-sizing: border-box;
  }
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  /* 滚动条里面滑块 */
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #aeaeae;
  }
  /*滚动条里面轨道*/
  ::-webkit-scrollbar-track {
    border-radius: 10px;
    box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.2);
    background: #eee;
  }
  // .editor-tools {
  //   width: 100%;
  //   height: 40px;
  //   display: flex;
  //   align-items: center;

  //   .upload {
  //     width: 40px;
  //     height: 40px;
  //     .upload-tip {
  //       position: absolute;
  //       top: -35px;
  //       width: fit-content;
  //       font-size: 12px;
  //       color: #5c5c66;
  //       font-weight: 700;
  //       height: fit-content;
  //       padding: 4px;
  //       border-radius: 4px;
  //       box-shadow:
  //         rgba(9, 30, 66, 0.25) 0px 4px 8px -2px,
  //         rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;
  //       &::before {
  //         position: absolute;
  //         bottom: -16px;
  //         left: 10px;
  //         display: block;
  //         width: 16px;
  //         height: 16px;
  //         pointer-events: none;
  //         content: ' ';
  //         // -webkit-clip-path: polygon(0 50%, 100% 0, 100% 100%);
  //         // clip-path: polygon(0 0, 100% 15%, 100% 85%);
  //         clip-path: polygon(20% 0, 0 100%, 100% 0);
  //         background-color: #dcdfe4;
  //       }
  //     }
  //     .upload-btn {
  //       padding: 4px;
  //     }
  //   }
  // }
  .editor-content {
    outline: 0;
    width: 100%;
    height: calc(100% - 50px);
    overflow: auto;
    padding: 4px 8px;
    box-sizing: border-box;
    border-top: 1px solid #ebebeb;
    border-radius: 6px;
    word-break: break-all;
    font-size: 14px;
    line-height: 1.2;
    &::-webkit-scrollbar {
      cursor: default;
    }
    & > img {
      max-width: 50%;
      border: 5px solid #d6d6d6;
      border-radius: 4px;
    }
    :deep(input) {
      box-sizing: border-box;
      width: 100px;
      height: 80px;
      pointer-events: none;
      cursor: pointer !important;
      writing-mode: inherit;
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      padding-top: 60px;
      background-image: url('@/assets/icons/upload-file.svg');
      background-repeat: no-repeat;
      background-position: center top;
      outline: none;
      border: none;
      position: relative;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0 1px;
    }
  }
  .editor-footer {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    position: absolute;
    bottom: 0;
    left: 0;
    button {
      padding: 6px 20px;
      background: transparent;
      outline: 0;
      border: none;
      border-radius: 4px;
      margin-left: 15px;
      cursor: pointer;
      &:first-of-type {
        margin-left: 0;
      }
    }
    .footer-menu {
      margin-top: 5px;
    }
    .foot-btn {
      .btn-cancel {
        border: 1px solid #cdcfd0;
      }
      .btn-send {
        background-color: #4e9def;
        color: #fff;
      }
    }
  }
}
</style>
