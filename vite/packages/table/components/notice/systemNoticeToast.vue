<template>
 <div class="flex" style="width: 380px;">
  <div class="flex flex-col w-full">
    <div class="flex items-center justify-between" style="margin-bottom: 13px;">
      <div class="flex items-center">
        <div class="flex items-center justify-center" style="width: 32px;height: 32px;">
          <img :src="content.icon" class="w-full rounded-full h-full object-cover" alt="">
        </div>
        <div class="font-16 ml-3" style="color: var(--primary-text);">{{ content.title }}</div>
      </div>

      <div class="flex items-center active-button pointer justify-center" v-if="styles" style="width:21px;height:21px;" >
        <img src="/img/icon/close-circle-fill1.png" class="w-full rounded-full h-full object-cover" alt="">
      </div>
      <div class="flex items-center pointer active-button justify-center" v-else style="width:21px;height:21px;">
        <img src="/img/icon/close-circle-fill.png" class="w-full rounded-full h-full object-cover" alt="">
      </div>
    </div>
    
    <div class="font-16" style="color: var(--secondary-text);margin-bottom: 24px;">{{content.body}}</div>

    <div class="flex items-center justify-between">
      <div class="font-16" style="color:var(--secondary-text);">{{formatTime(parseInt(content.time) * 1000)}}</div>
      <div class="px-5 py-2 rounded-lg flex pointer items-center justify-center active-button" style="background: var(--active-bg);color: var(--active-text);" @click="viewNow" >查看</div>
    </div>
  </div>
   <!--
     <div class="flex ">
         <div class="mr-3 px-5 py-2 rounded-lg pointer flex items-center justify-center pointer active-button" style="background: var(--secondary-bg);color: var(--primary-text);"  @click="talkLater">稍后再说</div>
         
       </div>
    -->

 </div>

 <audio ref="notice" src="/sound/notice.mp3"></audio>
</template>

<script>
import { defineComponent,ref,toRefs,computed, } from 'vue'
import { mapWritableState,mapActions} from 'pinia'
import { formatTime } from '../../util'
import { noticeStore } from '../../store/notice'

export default defineComponent({
 props:['content','noticeType','isPlay'],

 computed:{
  ...mapWritableState(noticeStore,['noticeSettings'])
 },
  methods:{
    ...mapActions(noticeStore,['setNoticePlay']),
  },
 watch:{
  'noticeType':{
    handler(newVal){
      if(this.noticeType === 'notice' && this.isPlay){
        this.setNoticePlay()
        if(this.noticeSettings.noticePlay){
          this.$nextTick(()=>{
          this.$refs.notice.play()
          })
        }else{
         this.$nextTick(()=>{
          this.$refs.notice.pause()
         })
        }
      }
    },
    immediate:true,
    deep:true,
  }
 },

 setup(props,ctx){
   
   const talkLater = () =>{  // 点击稍后再说按钮
    ctx.emit('closeToast')
    ctx.emit('nowCheck')
   }

   const viewNow = () =>{  // 点击立即查看
    ctx.emit('closeToast')
    ctx.emit('systemExamine')
   }

   return{
     formatTime,
     talkLater,
     viewNow
   }
 }
})

</script>

<style lang="scss" scoped>
.active-button{
 &:active{
   filter: brightness(0.8);
   opacity: 0.8;
 }
 &:hover{
   opacity: 0.8;
 }
}


.font-16{
 font-family: PingFangSC-Regular;
 font-size: 16px;
 font-weight: 400;
}
</style>