<template>
  <!-- 预览 -->
  <div class="prompt-modal xt-mask" v-show="showModal">
    <div class="head-icon">
      <div class="icon" @click="close">
        <Icon icon="guanbi" style="width: 24px;height: 24px;"></Icon>
      </div>
      <div class="icon" @click="openDrawer = true">
        <Icon icon="tishi-xianxing" style="width: 24px;height: 24px;"></Icon>
      </div>
    </div>
    <div style="width:98%;height:80%;">
      <ShortcutKeyList :keyList="keyScheme.keyList" :keyBoxStyle="{background:'var(--primary-bg)'}"></ShortcutKeyList>
    </div>
    <div class="foot">
      <div>{{ keyScheme.number }}个快捷键</div>
    </div>
  </div>
  <!-- 预览添加抽屉 -->
  <a-drawer v-model:visible="openDrawer" style="z-index:9999;" width="320" placement="right">
    <template #closeIcon>
      <Icon icon="xiangyou"></Icon>
    </template>
     <template #extra v-if="!keyScheme.isMyCreate">
      <a-space>
        <div class="add-scheme" @click="addPlan(keyScheme)">立即添加</div>
      </a-space>
    </template>
    <div class="drawer-center">
      <span class="h-14 w-14 flex justify-center items-center">
        <a-avatar shape="square" :src="keyScheme.icon" :size="48"></a-avatar>
      </span>
      <span class="mt-4" style="font-size: 18px;color: var(--primary-text);font-weight: 500;">{{ keyScheme.name }}</span>
      <span class="mt-1" style="font-size: 16px;color: var(--secondary-text);">{{ keyScheme.commonUse }}</span>
      <span class="flex items-center my-4">
        <div>
          <a-avatar size="24">
              <template #icon><UserOutlined /></template>
          </a-avatar>
        </div>
        <span class="ml-3" style="color: var(--secondary-text);">{{ keyScheme.nickName }}</span>
      </span>
      <span style="color: var(--secondary-text);">
        <span>
          <Icon icon="dianzan" class="mr-2"></Icon>
          <span>{{ keyScheme.sumLikes }}</span>
        </span>
        <span class="ml-3">
          <Icon icon="xiazai" class="mr-2"></Icon>
          <span>{{ keyScheme.download }}</span>
        </span>
      </span>
    </div>
  </a-drawer>
</template>

<script>
import ShortcutKeyList from '../shortcutKey/ShortcutKeyList.vue';
import { message } from 'ant-design-vue';
import { mapActions, mapWritableState } from "pinia";
import { keyStore } from '../store'
import { appStore } from '../../../store';
export default {
  name: "Preview",
  components: {
    ShortcutKeyList
  },
  data() {
    return {
      // 快捷方案
      // keyScheme: {},
      // 预览
      // showModal: false,
      // 添加
      openDrawer: false
    }
  },
  props: {
    // 快捷方案
    keyScheme: {
      type: Object,
      default: {},
    },
    //显示与隐藏
    showModal: {
      type: Boolean,
      default: () => false
    }
  },
  computed: {
    ...mapWritableState(appStore, ['fullScreen']),
  },
  watch: {
    showModal(newVal){
      if(newVal)this.fullScreen = true
    }
  },
  methods: {
    ...mapActions(keyStore,['setShortcutKeyList']),
    addPlan(keyScheme){
      this.setShortcutKeyList(keyScheme)
      message.success('添加成功');
      this.openDrawer = false
      this.$emit('closePreview',false)
      this.fullScreen = false
    },
    close(){
      this.$emit('closePreview',false)
      this.fullScreen = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .prompt-modal{
      position: absolute;
      top:0;
      bottom:0;
      right:0;
      left:0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px;
      z-index: 99;
      .head-icon{
        width: 100%;
        display: flex;
        justify-content: space-between;
        height: 10%;
        .icon{
          background: var(--secondary-bg);
          color: var(--primary-text);
          border-radius: 12px;
          width: 48px;
          height: 48px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
      }
      .foot{
        display: flex;
        justify-items: center;
        align-items: end;
        height: 10%;
        >div{
          background: var(--mask-bg);
          border-radius: 12px;
          height: 48px;
          line-height: 48px;
          padding: 0 25px;
          font-size: 16px;
          color: var(--secondary-text);
        }
      }
    }
    .add-scheme{
      background: var(--active-bg);
      font-size: 16px;
      color: var(--primary-text);
      border-radius: 12px;
      width: 128px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .drawer-center{
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 30%;
    }
</style>
