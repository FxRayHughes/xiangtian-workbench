<template>
 <div class="flex flex-col my-3" style="width:500px;" v-if="nextShow === false">
  <div class="flex w-full mb-5 h-10 items-center justify-center" style="position: relative;">
   <span class="font-16-400" style="color:var(--primary-text);">添加新频道</span>
   <div class="close-channel w-10 h-10 flex items-center rounded-lg pointer active-button justify-center"  style="background: var(--secondary-bg);" @click="closeChannel">
    <CloseOutlined  style="font-size: 1.25em;"/>
   </div>
  </div>

  <div class="flex flex-col px-6">
   <div class="p-4 flex rounded-lg flex-col" style="background: var(--secondary-bg);">
    <span class="font-16-400 mb-2.5" style="color:var(--primary-text);">选择类型</span>
    <span class="font-14-400" style="color:var(--secondary-text)">
     你可以选择添加桌面，关联工作台内部的社区，也可以选择关联你的群聊，还支持自定义添加网页应用链接，把需要的资源全部整合到社群当中，与你的小伙伴们一起分享和协作。
    </span>
   </div>

   <div class="flex flex-col mt-4">
    <div v-for="item in channelList" class="flex items-center pointer rounded-lg px-6 py-5 mb-4" 
     style="background: var(--secondary-bg);" :class="{'select-bg':selectIndex === item.type}" @click="selectChannel(item)">
     <MenuIcon :icon="item.icon" style="font-size: 2.5em;"></MenuIcon>
     <span class="pl-4 font-16-400" style="color:var(--primary-text);">{{ item.name }}</span>
    </div>
   </div>

  </div>

  <div class="px-6">
   <div class="flex items-center justify-end">
    <XtButton style="width: 64px;height:40px;margin-right: 12px;" @click="closeChannel">取消</XtButton>
    <XtButton style="width: 64px;height:40px; background: var(--active-bg);color:var(--active-text);" @click="selectSubmit">选择</XtButton>
   </div>
  </div>

 </div>

 <SelectMenuWebLink v-else-if="selectIndex === 'link'" type="link" :no="no" @close="closeChannel" @back="nextShow=false"></SelectMenuWebLink>
 <SelectGroupChat v-else-if="selectIndex === 'chat'" type="group" :no="no" @close="closeChannel" @back="nextShow=false"></SelectGroupChat>
 <SelectCommunity v-else-if="selectIndex === 'community'" :no="no" @close="closeChannel" @back="nextShow=false"></SelectCommunity>
</template>

<script>
import { defineComponent, reactive, toRefs } from 'vue'
import { Icon as  MenuIcon } from '@iconify/vue'
import { CloseOutlined } from '@ant-design/icons-vue'

import SelectGroupChat from './channelSelect/selectGroupChat.vue'
import SelectMenuWebLink from './channelSelect/selectWebLink.vue'
import SelectCommunity from './channelSelect/selectCommunity.vue'

export default defineComponent({
 components:{
  CloseOutlined,
  MenuIcon,SelectGroupChat,SelectMenuWebLink,SelectCommunity
 },

 props:['no'],

 setup (props,ctx) {
  const data = reactive({
   channelList:[
    // { icon:'fluent-emoji-flat:desktop-computer',name:'桌面',type:'desk'},
    { icon:'fluent-emoji-flat:placard',name:'社区',type:'community' },
    { icon:'fluent-emoji-flat:thought-balloon',name:'群聊',type:'chat' },
    { icon:'fluent-emoji-flat:globe-with-meridians',name:'网页链接',type:'link' }
   ],

   selectIndex:'community',

   nextShow:false, // 选择完第一步的是否进入第二步

   type:'',

  })


  // 关闭
  const closeChannel = () =>{
   ctx.emit('close')
  }


  // 选择频道
  const selectChannel = (item) =>{
   data.selectIndex = item.type
   data.type = item.type
  }

  
  
  // 选择完进入下一步
  const selectSubmit = () =>{
   data.nextShow = true
  }


  return {
   ...toRefs(data),closeChannel,selectChannel,selectSubmit
  }
 }
})
</script>



<style lang="scss" scoped>
.font-16-400{
 font-family: PingFangSC-Regular;
 font-size: 16px;
 font-weight: 400;
}

.close-channel{
 position: absolute;
 top:1px;
 right:12px;
}

.active-button{
 &:active{
  filter: brightness(0.8);
  opacity: 0.8;
 }
 &:hover{
  opacity: 0.8;
 }
}

.font-14-400{
 font-family: PingFangSC-Regular;
 font-size: 14px;
 font-weight: 400;
}

.select-bg{
 background: var(--active-secondary-bg) !important;
 border:1px solid var(--active-bg) !important;
}
</style>