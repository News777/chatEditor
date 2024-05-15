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
          <showMenuList />
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
import newUpload from '@/components/Upload/index.vue'
import { reactive, ref, toRefs, onMounted, watch, onUnmounted, computed, type VNode } from 'vue'
import { useMenu } from './hooks/menu.hook'

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

const { menuList } = useMenu()

const showMenuList = computed<VNode>(() => <div>{menuList.map((menu) => menu())}</div>)

const emits = defineEmits(['sendMessage'])
const state = reactive({
  emitEvent: new Map([
    [
      'sendMessage',
      (message, fileList) => {
        emits('sendMessage', message, fileList)
      }
    ]
  ]),
  fileList: [],
  fileOverTipShow: false,
  fileListCssShow: 'none',
  observer: null
})
const { fileList, fileOverTipShow, fileListCssShow } = toRefs(state)

/* watch(
  () => state.fileList,
  (newVal) => {
    console.log(newVal);
  },
  {
    deep: true,
  }
); */

const eleRefs = ref()
/* watch(()=>eleRefs.value,(newVal)=>{
  console.log(newVal.children);
},{
  deep:true
}) */
const upload = ref()
onMounted(() => {
  eleRefs.value.addEventListener('keydown', (e) => {
    if (!e.shiftKey && e.keyCode == '13') {
      e.cancelBubble = true
      e.preventDefault()
      e.stopPropagation()
      send(e)
    }
  })
  eleRefs.value.addEventListener(
    'drop',
    (e) => {
      e.preventDefault()
      const files = e.dataTransfer.files[0]
      state.fileList.length < props.limit
        ? state.fileList.push(
            Object.assign(files, {
              uid: new Date().getTime()
            })
          )
        : handleUploadFileOver()
    },
    false
  )
  state.observer = new MutationObserver(function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.removedNodes.length) {
        const id = mutation.removedNodes[0].id
        id && (state.fileList = state.fileList.filter((o) => o.uid != Number(id)))
      }
      /* else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        } */
    }
  })
  state.observer.observe(eleRefs.value, {
    attributes: true,
    childList: true,
    subtree: true
  })
})
onUnmounted(() => {
  state.observer.disconnect()
})
const ecpaste = (e) => {
  var file = null
  var clp = e.clipboardData || window.clipboardData
  let text = clp.getData('text/plain')
  if (text !== '') {
    e.preventDefault()
    var newNode = document.createElement('span')
    newNode.innerHTML = text
    // window.getSelection().getRangeAt(0).insertNode(newNode);
    var selection = window.getSelection()
    var rg = selection.getRangeAt(0)
    /* var fragment = rg.createContextualFragment(newNode);
      console.log(fragment);
      var oLastNode = fragment.lastChild; */ //获得DocumentFragment的末尾位置
    rg.deleteContents()
    rg.insertNode(newNode)
    rg.collapse(false) //合并范围至末尾
    //
    selection.removeAllRanges() //清除range
    //
    selection.addRange(rg) //设置range
    /* if (window.getSelection) {
        var newNode = document.createElement('p');
        newNode.innerHTML = text;
        window.getSelection().getRangeAt(0).insertNode(newNode);
      } else {
        document.selection.createRange().pasteHTML(text);
      } */
  }
  let items = clp.items
  if (items && items.length) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        file = items[i].getAsFile()
        break
      }
    }
  }
  if (!file) {
    return
  }
}
const handleUploadFile = (file) => {
  /* const willUploadFile = this.fileList.some((o) => (o.name = file.name));
    if (!willUploadFile) {
      this.fileList.push(file);
    } */
}

const send = (e) => {
  const message = eleRefs.value.innerHTML.replace(/<input.*?>/g, '')
  /* for (const item of eleRefs.value.children) {
    if (item.nodeName === 'INPUT') {
      eleRefs.value.removeChild(item);
    }
  }
  console.log(eleRefs.value.innerHTML); */
  upload.value.submit()
  state.emitEvent.get('sendMessage')(message, state.fileList)
  eleRefs.value.innerHTML = ''
  upload.value.clearFiles()
  state.fileList = []
}
const deleteContent = (e) => {
  console.log(e)
}
const cancel = () => {
  eleRefs.value.innerHTML = ''
  upload.value.clearFiles()
  state.fileList = []
}
const handleUploadFileChange = (file, fileList) => {
  const fileInput = `<input type="text" disabled readonly title="${file.name}" value="${file.name}" id="${file.uid}">`
  addMessage(fileInput)
}
const handleUploadFileOver = (file) => {
  state.fileOverTipShow = true
  let timer = null
  if (timer) {
    clearTimeout(timer)
    timer = null
    state.fileOverTipShow = false
  } else {
    setTimeout(() => {
      state.fileOverTipShow = false
    }, 4000)
  }
}
const handleRemoveUploadFile = (file, fileList) => {
  const removeFile = state.fileList.find((o) => o.name === file.name)
  if (removeFile) {
    state.fileList = state.fileList.filter((o) => o != removeFile)
  }
}
const addMessage = (val) => {
  eleRefs.value.insertAdjacentHTML('beforeend', val)
}
/* const choseEmoji = (item) => {
  var s = require('../../icons/face/' + item.url);
  var imoj = "<span><img src='" + s + "'/></span>";
  eleRefs.value.insertAdjacentHTML('beforeend', imoj);
}; */

defineExpose({ addMessage })
</script>

<style scoped lang="scss">
@import '@/styles/chatEditor.scss';
</style>
