<template>
  <a-config-provider :locale="locale">
  <div class="a-container" >
    <router-view></router-view>
  </div>
  <!--
     密码库解锁组件
     这里由于是静态页面先暂时隐藏掉
  -->
  </a-config-provider>
</template>

<script lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import PasswordBank from './page/PasswordBank.vue';
import {mapActions,mapWritableState} from 'pinia'
import  { appStore } from './store'
export default {
  components:{
    PasswordBank
  },
  async mounted() {
    window.ipc = window.$models.ipc
    window.kdbxModel = window.$models.kdbxModel
    window.passwordModel = window.$models.passwordModel
    this.loadDbList()


  },
  methods:{
    ...mapActions(appStore,['setDb','loadDbList','loadCurrentDb']),
  },
  data(){
    return {
      locale:zhCN
    }
  }
}
</script>

<style>
.a-container{
   width: 100%;
}
</style>
