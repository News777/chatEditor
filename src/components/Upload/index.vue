<template>
  <div class="news-upload">
    <div class="upload__body" @click="clickUpload">
      <slot>
        <button class="upload-btn" style="display: block">上传文件</button>
      </slot>
    </div>
    <!--  <div
      class="upload__list"
      :style="{ display: fileList.length ? 'block' : 'none' }"
    >
      <div class="upload__list-item" v-for="(item, index) in fileList">
        <div class="item-name" :title="item.name">
          <span>✏</span> {{ item.name }}
        </div>
        <div class="item-size">{{ filterSize(item.size) }}</div>
        <div class="item-delete" @click="deleteFile(item, index)">✖</div>
      </div>
    </div> -->
    <input
      type="file"
      ref="inputRef"
      class="file-core"
      :multiple="multiple"
      @change="fileChange"
      :accept="accept"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
const props = withDefaults(
  defineProps<{
    multiple: boolean
    accept: string
    limit: number
    fileList: File[]
  }>(),
  {}
)
const emits = defineEmits<{
  (event: 'onExceed', file: File[]): void
  (event: 'onChange', file: File): void
  (event: 'update:file-list', file: File[]): void
}>()

const fileList = computed<File[]>({
  get() {
    return props.fileList
  },
  set(files: File[]) {
    emits('update:file-list', files)
  }
})

const inputRef = ref<HTMLInputElement | null>(null)

const clickUpload = () => {
  if (!inputRef.value) throw new Error('get Dom error')
  inputRef.value.click()
}
const fileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const { files } = target
  handlerFile(Array.from(files!))
}
const handlerFile = (files: File[]) => {
  if (props.limit && props.fileList.length + files.length > props.limit) {
    emits('onExceed', files)
    return
  }
  if (!props.multiple) {
    files.slice(0, 1)
  }
  files.map((o, index) => {
    const file = Object.assign(o, { uid: new Date().getTime() + index })
    fileList.value.push(file)
    emits('onChange', file)
  })
}

const submit = () => {}
// const deleteFile = (singlefile, i) => {
//   props.fileList.splice(i, 1)
//   const dt = new DataTransfer()
//   const { files } = inputRef.value
//   for (let i = 0; i < files.length; i++) {
//     const filedd = files[i]
//     if (filedd !== singlefile) dt.items.add(filedd) // here you exclude the file. thus removing it.
//   }
//   inputRef.value.files = dt.files
// }
const clearFiles = () => {
  if (!inputRef.value) throw new Error('get Dom error')
  const dt = new DataTransfer()
  inputRef.value.files = dt.files
}

// const filterSize = (number) => {
//   if (number < 1024) {
//     return `${number} B`
//   } else if (number >= 1024 && number < 1048576) {
//     return `${(number / 1024).toFixed(1)} KB`
//   } else if (number >= 1048576) {
//     return `${(number / 1048576).toFixed(1)} MB`
//   }
// }
onMounted(() => {})
/* const file = document.getElementById('file');
  const upload = document.getElementById('upload');
  const preview = document.getElementById('preview');
  file.style.display = 'none'; */

/* 触发上传按钮 */
/*  upload.addEventListener('click', () => {
    file.click();
  }); */

/* 触发文件更改按钮 */
/* input:file 有 change、input 事件 */
/*  file.addEventListener('change', uploadDisplay);
  file.addEventListener('input', uploadInput); */

// function uploadDisplay() {
//   while (preview.firstChild) {
//     preview.removeChild(preview.firstChild)
//   }
//   const curFiles = file.files
//   if (curFiles.length > 3) {
//     return
//   }
//   if (curFiles.length === 0) {
//     const para = document.createElement('p')
//     para.textContent = 'No files currently selected for upload'
//     preview.appendChild(para)
//   } else {
//     const list = document.createElement('ol')
//     preview.appendChild(list)

//     for (const file of curFiles) {
//       const listItem = document.createElement('li')
//       const para = document.createElement('p')
//       if (file) {
//         para.textContent = `File name ${file.name}, file size ${returnFileSize(file.size)}.`
//         const image = document.createElement('img')
//         image.src = URL.createObjectURL(file)
//         const button = document.createElement('button')
//         button.onclick = function () {
//           delFile(file)
//         }
//         // button.setAttribute('onclick', `delFile(file)`);
//         button.innerText = '删除'
//         listItem.appendChild(button)
//         listItem.appendChild(image)
//         listItem.appendChild(para)
//       } else {
//         para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`
//         listItem.appendChild(para)
//       }

//       list.appendChild(listItem)
//     }
//   }
// }
// function delFile(singlefile) {
//   const dt = new DataTransfer()
//   const input = document.getElementById('file')
//   const { files } = input
//   console.log(input.files)
//   for (let i = 0; i < files.length; i++) {
//     const filedd = files[i]
//     console.log(filedd === singlefile)
//     if (filedd !== singlefile) dt.items.add(filedd) // here you exclude the file. thus removing it.
//   }
//   input.files = dt.files
//   console.log(input.files)
// }
// function uploadInput(e) {
//   if (e.target.files.length > 5) {
//     e.preventDefault()
//   }
// }

defineExpose({ submit, clearFiles })
</script>

<style lang="scss" scoped>
.news-upload {
  display: inline-block;
  box-sizing: border-box;
  * {
    box-sizing: inherit;
  }
  .upload__body {
    cursor: pointer;
    .upload-btn {
      padding: 10px 18px;
      color: #fff;
      outline: 0;
      border: 1px solid rgb(216, 216, 216);
      border-radius: 4px;
      background: rgb(103, 205, 245);
    }
  }
  .upload__list {
    margin-top: 10px;
    width: fit-content;
    height: fit-content;
    .upload__list-item {
      padding: 3px 15px;
      font-size: 13px;
      color: #7b7e83;
      display: flex;
      position: relative;
      &:hover {
        .item-delete {
          display: block;
        }
      }
      .item-name {
        white-space: nowrap;
        width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-size {
        margin-left: 10px;
      }
      .item-delete {
        position: absolute;
        display: none;
        right: 5px;
        font-size: 18px;
        font-weight: 600;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }
  }
  .file-core {
    display: none;
  }
}
</style>
