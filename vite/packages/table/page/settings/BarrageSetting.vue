<template>
 <div style="color:var(--primary-text)">
  <h2 class="s-text"  style="color:var(--primary-text)">弹幕设置</h2>
  <div style="padding: 1em;width: 30em">
    <div class="line">
      <a-alert v-if="!settings.enableBarrage" message="目前弹幕功能未开启，请点击下方开关启用。" type="warning" show-icon />
      <div class="mt-2" >开启弹幕： <a-switch v-model:checked="settings.enableBarrage"></a-switch></div>
    </div>
    <div class="line">

      页面允许渲染弹幕数：<a-input-number v-model:value="settings.barrage.limit" style="color: var(--primary-text)"></a-input-number>
    </div>
    <div class="line">
      轨道高度：<a-input-number v-model:value="settings.barrage.height" style="color: var(--primary-text)"></a-input-number>
    </div>
    <div class="line">
      同一个弹幕出现次数：<a-input-number v-model:value="settings.barrage.repeat" style="color: var(--primary-text)"></a-input-number>
    </div>
    <div class="line">
      弹幕方向：<a-radio-group v-model:value="settings.barrage.direction" style="color: var(--primary-text)"><a-radio
          value="right" style="color: var(--primary-text)">从右到左</a-radio> <a-radio value="left"
          style="color: var(--primary-text)">从左到右</a-radio></a-radio-group>
    </div>
    <div class="line">
      与内嵌浏览器当前页面联动：<a-switch v-model:checked="settings.barrage.browserLink"></a-switch>
    </div>
    <div class="line">
      <div @click="refresh" class="btn s-item" style="color:var(--primary-text);background: var(--active-bg);">
        <Icon icon="shuaxin"></Icon> 刷新测试
      </div>
    </div>
  </div>
 </div>
</template>

<script>
import { appStore } from '../../store'
import { mapWritableState } from 'pinia'
import { message, Modal } from 'ant-design-vue'
export default {
  name: 'BarrageSetting',
  computed: {
    ...mapWritableState(appStore, ['settings'])
  },
  methods: {
    refresh() {
      if(!this.settings.enableBarrage){
        Modal.confirm({
          centered:true,
          content:'当前未启用弹幕功能，需要启用后方可测试。',
          okText:'启用并测试',
          onOk:()=>{
            this.settings.enableBarrage=true
            window.$manager.setOptions(
              {
                ...this.settings.barrage
              }
            )
            window.$manager.test()
            message.success('刷新成功。')
          }
        })
      }else{
        window.$manager.setOptions(
          {
            ...this.settings.barrage
          }
        )
        window.$manager.test()
        message.success('刷新成功。')
      }

    }
  }
}
</script>

<style scoped></style>
