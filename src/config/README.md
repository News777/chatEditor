## Views

![views](https://img-blog.csdnimg.cn/9891dc568b3d44a0b9c41d6ee51cd427.png)

## install

 *You can use Yarn or NPM* 

```
npm install vue3-editor-chat
```

**OR**

```
yarn add vue3-editor-chat
```



## Usage

```
import { Vue3EditorChat } from 'vue3-editor-chat';

import 'vue3-editor-chat/vue3-editor-chat.css';
```

## Props

| Name  |  Type  | Default |   Description    |
| :---: | :----: | :-----: | :--------------: |
| limit | Number |    3    | 上传文件数量限制 |
| multiple | Boolean |    false    | 文件是否多选 |
| accept | String |        | 文件接受类型 |



## Methods

|    Name    |    Params     |      Description       |
| :--------: | :-----------: | :--------------------: |
| clearFiles |               |    清除上传文件列表    |
| addMessage | <HTMLElement> | 输入框插入HTML格式内容 |



## Events

|    Name     |      Params      |   Description    |
| :---------: | :--------------: | :--------------: |
| sendMessage | message,fileList | 发送消息按钮事件 |



## Slots

|  Name  | Params | Description |
| :----: | :----: | :---------: |
| header |        | 上方工具栏  |
| footer |        | 下方按钮栏  |



## Examples

```vue
<template>
  <div>
    <Vue3EditorChat :limit="3" />
  </div>
</template>

<script setup>
import { Vue3EditorChat } from 'vue3-editor-chat';
import 'vue3-editor-chat/vue3-editor-chat.css';
</script>

<style lang="scss" scoped></style>
```

