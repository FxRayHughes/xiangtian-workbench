<template>
 <div class="flex flex-col my-3" style="width:667px;" v-if="nextShow === false">
  <div class="flex w-full mb-5 h-10 items-center justify-center" style="position: relative;">
   <div class="back-button w-10 h-10 flex items-center rounded-lg pointer active-button justify-center" style="background: var(--secondary-bg);" @click="backChannel">
    <LeftOutlined style="font-size: 1.25em;"></LeftOutlined>
   </div>
   <span class="font-16-400" style="color:var(--primary-text);">选择群聊</span>
   <div class="close-channel w-10 h-10 flex items-center rounded-lg pointer active-button justify-center"  style="background: var(--secondary-bg);" @click="closeChannel">
    <CloseOutlined  style="font-size: 1.25em;"/>
   </div>
  </div>

  <div class="flex px-6">
   <div class="flex flex-col" style="width: 293px;">
    <a-input class="h-10 search" style="border-radius: 12px;" placeholder="搜索">
     <template #suffix>
       <SearchOutlined style="font-size: 1.5em;color:var(--secondary-text);" class="pointer"/>
     </template>
    </a-input>

    <span class="my-4 font-14-400" style="color:var(--secondary-text);">我创建的群聊</span>

    <vue-custom-scrollbar :settings="settingsScroller" style="height:335px;">
     <div class="flex flex-col">
       <div v-for="(item,index) in filterList" :class="{'select-bg':isSelected(index)}" class="flex rounded-lg items-center px-4 py-3 mb-3" @click="leftListClick(item)">
        <a-avatar shape="square" :size="40" :src="item.avatar"></a-avatar>
        <span class="font-16-400 ml-4" style="color:var(--primary-text);">{{ item.name }}</span>
       </div>
     </div>
    </vue-custom-scrollbar>
   </div>
   
   <a-divider type="vertical" style="height:442px; margin: 0 16px; background-color:var(--divider);" />
   
   <div class="flex flex-col justify-between" style="width: 293px;">
    <span class="">已选({{ selectGroup.length }}个)</span>
    <vue-custom-scrollbar :settings="settingsScroller" style="height:335px;">
     <div class="flex flex-col">
      <div v-for="item in selectGroup" class="flex  items-center justify-between px-4 py-3 mb-2">
        <div class="flex items-center">
         <a-avatar shape="square" :size="40" :src="item.avatar"></a-avatar>
         <span class="font-16-400 ml-4" style="color:var(--primary-text);">{{ item.name }}</span>
        </div>
        <div class="flex items-center pointer justify-center" @click="removeGroup(item)">
         <MinusCircleFilled  style="font-size:1.5em;color:var(--secondary-text);"/>
        </div>
      </div>
     </div>
    </vue-custom-scrollbar>
     
    <div class="flex items-center justify-end">
     <XtButton style="width: 64px;height:40px;margin-right: 12px;" @click="closeChannel">
      取消
     </XtButton>
 
     <XtButton style="width: 64px;height:40px; background: var(--active-bg);color:var(--active-text);" @click="selectSubmit">
      选择
     </XtButton>
    </div>
   </div>
  </div>

  

 </div>

 <SelectClassification v-if="nextShow === true" :no="no" :type="type" :data="selectGroup"  @close="closeChannel" @classBack="nextShow = false"></SelectClassification>
</template>

<script>
import { computed, defineComponent,reactive,toRefs} from 'vue'
import { CloseOutlined,LeftOutlined,SearchOutlined,MinusCircleFilled } from '@ant-design/icons-vue'
import _ from 'lodash-es'
import { message } from 'ant-design-vue'
import { communityStore } from '../../store/communityStore'


import SelectClassification from './selectClassification.vue'


export default defineComponent({
 components:{
  CloseOutlined,LeftOutlined,SearchOutlined,MinusCircleFilled,
  SelectClassification
 },

 props:['no','type'],

 setup (props,ctx) {

  const tui = window.$TUIKit
  const community = communityStore()

  const data = reactive({
   settingsScroller: {
    useBothWheelAxes: true,
    swipeEasing: true,
    suppressScrollY: false,
    suppressScrollX: true,
    wheelPropagation: true
   },
   selectGroup:[],
   nextShow:false,
   option:{
    communityNo:props.no,
    cache:1
   }
  })
  
  // 返回上一层
  const backChannel = ()=>{
   ctx.emit('back')
  }

  // 关闭和取消
  const closeChannel = () =>{
   ctx.emit('close')
  }

  // 过滤自己创建的群聊
  const filterList = computed(()=>{
   const list = tui.TUIServer.TUIGroup.store.groupList
   const arr = _.filter(list,function(o){
    return o.selfInfo.role !== 'Member'
   })
   return arr
  })

  // 点击左侧选中
  const leftListClick = (item) =>{
   const index = _.findIndex(data.selectGroup,function(o){ return o.groupID === item.groupID })
   if(index === -1){
    data.selectGroup.push(item)
   }else{
    return;
   }
  }

  // 判断是否选中状态
  const isSelected = (index)=>{
   return data.selectGroup.includes(filterList.value[index])
  }
  
  // 清除选中的群聊
  const removeGroup = (item) =>{
   const index = _.findIndex(data.selectGroup,function(o){ return o.groupID === item.groupID })
   data.selectGroup.splice(index,1) 
  }

  // 选择下一步
  const selectSubmit = (evt) =>{
    if(data.selectGroup.length !== 0){
      data.nextShow = true
     //  community.getChannel(data.option)
    }else{
      message.warn('没有选择指定的群')
      evt.preventDefault();
    }
  }

  return {
   filterList,
   ...toRefs(data),
   backChannel,closeChannel,leftListClick,isSelected,removeGroup,
   selectSubmit
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

.back-button{
 position: absolute;
 top: 1px ;
 left: 12px;
}

.select-bg{
 background: var(--active-secondary-bg) !important;
 border:1px solid var(--active-bg) !important;
}

:deep(.ant-input){
 font-size: 1.15em;
 &::placeholder{
   color: var(--secondary-text) !important;
 }
}
</style>
