<template>
  <div class="flex flex-col my-3" style="width:500px;">
   <div class="flex w-full mb-5 h-10 items-center justify-center" style="position: relative;">
    <div class="back-button w-10 h-10 flex items-center rounded-lg pointer active-button justify-center" style="background: var(--secondary-bg);" @click="backButton">
     <LeftOutlined style="font-size: 1.25em;" />
    </div>
    <span class="font-16-400" style="color:var(--primary-text);">选择分组</span>
    <div class="close-channel w-10 h-10 flex items-center rounded-lg pointer active-button justify-center"  style="background: var(--secondary-bg);" @click="closeChannel">
     <CloseOutlined  style="font-size: 1.25em;"/>
    </div>
   </div>
 
   <div class="px-6 flex flex-col">
    <vue-custom-scrollbar :settings="settingsScroller" style="height:350px;">
     <div class="px-4 py-3 flex items-center font-14-400 mb-4 justify-center rounded-lg" style="background: var(--secondary-bg);color:var(--secondary-text);">
      不选择分类默认会将频道添加在最外层第一个位置；支持拖拽排序。
     </div>
     <div class="flex items-center rounded-lg py-3 pointer mb-4 active-button justify-center" style="border: 1px dashed var(--divider);" @click="addClassItem">
      <PlusOutlined style="font-size: 1.25em;"/>
      <span class="font-16-400 ml-2" style="color:var(--primary-text);">添加新分组</span>
     </div>
 
     <div class="flex flex-col" ref="classSortTab">
      <!-- id="classSortTab" -->
       <div v-for="(item,index) in categoryClass" class="flex pointer  rounded-lg items-center px-5 mb-4"
        style="background:var(--secondary-bg);height: 60px;" :class="{'select-bg':statusIndex === index}"
        @click.stop="listClick(item,index)" :key="index"
       >
 
       <template v-if="isEditing && editIndex === index">
         <div class="flex w-full justify-between items-center">
           <a-input style="width:210px;padding: 0;" id="classInputRef" v-model:value="item.name" :bordered="false"></a-input>
           <div class="flex">
             <ClassIcon icon="fluent:checkmark-16-filled" class="pointer" style="font-size: 1.5em;" @click.stop="saveEdit"></ClassIcon>
             <ClassIcon icon="fluent:dismiss-16-filled" class="ml-4 pointer" style="font-size: 1.5em;" @click.stop="exitEdit"></ClassIcon>
           </div>
         </div>
       </template>
 
       <template v-else>
         <div class="flex w-full justify-between">
           <span class="font-16-400" style="color:var(--primary-text);">{{ item.name }}</span>
           <div class="flex">
            <ClassIcon icon="akar-icons:edit" class="pointer" style="font-size: 1.5em;" @click.stop="edit(index)"></ClassIcon>
            <ClassIcon icon="akar-icons:trash-can" class="ml-4 pointer" style="font-size: 1.5em;" @click.stop="deleted(item)"></ClassIcon>
           </div>
         </div>
       </template>
 
       </div>
     </div>
 
    </vue-custom-scrollbar>
   </div>
 
   <div class="flex items-center px-6 justify-end mt-4">
     <XtButton style="width: 64px;height:40px;margin-right: 12px;" @click="closeChannel">取消</XtButton>
     <XtButton style="width: 64px;height:40px; background: var(--active-bg);color:var(--active-text);" @click="finshCategoryCreate">确定</XtButton>
   </div>
 
  </div>


 </template>
 
 <script>
//  import { defineComponent, onMounted, reactive, toRefs,ref,nextTick,computed,watchEffect } from 'vue'
import { mapActions,mapWritableState } from 'pinia'
import { LeftOutlined,CloseOutlined,PlusOutlined } from '@ant-design/icons-vue'
import Sortable from 'sortablejs';
import { Icon as ClassIcon} from '@iconify/vue'
import { communityStore } from '../../store/communityStore'
import { channelClass } from '../../../../js/chat/createChannelClass' 
import { message,Modal as ClassModal} from 'ant-design-vue'
import _ from 'lodash-es'
 
export default {
  props:['no','data','type'],
  components:{
   LeftOutlined,CloseOutlined,PlusOutlined,
   ClassIcon,
  },

  async mounted (){
    await this.getChannelList(this.no)

    // const el = document.querySelector('#classSortTab')
    const el = this.$refs.classSortTab
    new Sortable(el,{
      group: 'sortableGroup',
      onEnd:this.onSortEnd // 拖拽结束时触发的回调函数
    })

  },

  data(){
    return{
      settingsScroller: {
       useBothWheelAxes: true,
       swipeEasing: true,
       suppressScrollY: false,
       suppressScrollX: true,
       wheelPropagation: true
      },

      classItem:'', // 接收选中的分组名称
      statusIndex:-1, // 点击选中下标
      isHover:false, // 判断是否悬浮
      isEditing:false, // 是否这种编辑
      hoverIndex:-1,
      editIndex:-1,

    }
  },

  computed:{
    ...mapWritableState(communityStore,['categoryClass'])
  },

  methods:{
    ...mapActions(communityStore,[
      'getChannelList','getCategoryData',
      'removeCategory','secondaryChannel','updateCategoryClass'
    ]),


    // 拖拽排序
    onSortEnd(evt){
      // console.log('排查问题',evt)

      let newIndex = evt.newIndex , oldIndex = evt.oldIndex
      let newItem = this.$refs.classSortTab.children[newIndex]
      let oldItem = this.$refs.classSortTab.children[oldIndex]
      this.$refs.classSortTab.removeChild(newItem)

      if(newIndex > oldIndex){
       this.$refs.classSortTab.insertBefore(newItem,oldItem)
      }else{
       this.$refs.classSortTab.insertBefore(newItem,oldItem.nextSibling)
      }

      let cloneTemp = [...this.categoryClass]   // 将原数据进行复制
      let temp = cloneTemp[evt.oldIndex]  // 获取旧的下标
      cloneTemp.splice(evt.oldIndex, 1)   // 移除旧的下标
      cloneTemp.splice(evt.newIndex, 0, temp) // 将旧的下标进行替换
      this.updateCategoryClass(cloneTemp)
    },


    closeChannel(){  // 关闭
      this.$emit('close')
    },
    backButton(){  // 返回
      this.$emit('classBack')
    },

    
    listClick(item,index){  // 选中当前频道目录分类
      if(this.statusIndex === index){
       this.statusIndex = -1
      }else{
       this.statusIndex = index
       this.classItem = item
      }
    },


    deleted(item){  // 删除
      ClassModal.confirm({
        content:'确定要删除该分类吗 !!!',
        centered:true,
        onOk: async ()=>{
          const result = await this.removeCategory(item.id)
          if(result?.status === 1){
           await this.getChannelList(this.no)
           await this.getCategoryData(this.no)
          }
        }
      })
      
    },
    addClassItem(){  // 新增

    },
    saveEdit(){  // 保存编辑

    },
    exitEdit(){  // 退出编辑

    },
    edit(index){  // 编辑中
     this.isEditing = true
     this.editIndex = index
     nextTick(()=>{
       const classRef = document.querySelector('#classInputRef')
       classRef.focus()
       classRef.select()
     })
    },





    async finshCategoryCreate(){  // 完成频道目录创建
      const option = { type:this.type,id:this.classItem.id,no:this.no,content:this.data}
      const createRes = await channelClass.secondaryChannel(option)
      if(createRes?.status === 1){
        message.success(`${createRes?.info}`)
        await this.getCategoryData(this.no)
        this.closeChannel()
      }
    }
    

   
  
  },

}
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
 </style>
 