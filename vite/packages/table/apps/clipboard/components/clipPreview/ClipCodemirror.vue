<template>
  <!-- 代码块高亮  代码块-->
  <div ref="myClip" class="h-full"></div>
</template>

<script>
import { mapWritableState,mapActions } from 'pinia'
import { clipboardStore } from '../../store';
import CodeMirror from 'codemirror'

export default {
  props:{
    editorContent:{
      type:String,
    }
  },
  computed:{
    ...mapWritableState(clipboardStore,['settings']),
  },
  mounted(){
    const {clipMode,clipTheme,previewShow,showLineNumber,clipSize}=this.settings
    this.myClipRefs = CodeMirror(this.$refs.myClip,{
      value:this.editorContent,
      theme:clipTheme,
      smartIndent:true,
      tabSize:clipSize,
      indentWithTabs:true,
      lineWrapping: true,
      lineNumbers: showLineNumber,
      direction: "ltr",
      singleCursorHeightPerLine:true,
      autocorrect:true,
      viewportMargin:10,
      spellcheck:true,
      mode:clipMode
    })
  }
}
</script>

<style lang="scss" scoped>
:deep(.CodeMirror-vscrollbar){
  display: none !important;
}
:deep(.CodeMirror-hscrollbar){
  display: none !important;
}
:deep(.CodeMirror-scrollbar-filler){
  display: none !important;
}

.CodeMirror {
  width: 100%;
  height: 300px;
  white-space: pre-wrap; /* 设置代码内容换行 */
}
</style>

<style>
.CodeMirror-gutters{
  background: none !important;
}
</style>
