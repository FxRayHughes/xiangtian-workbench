<template>
  <Widget :options="options" :menu-list="menuList" :desk="desk">
    <div @click="go" class="content pointer" style="color:var(--primary-text)">
      <div><a-progress type="circle"  stroke-color="#FF9C00" :percent="GPUData.useGPU.value" :strokeWidth="10" :width="105" style="margin-top: 28px">
        <template #format="percent">
          <div style="color:var(--primary-text);font-size: 24px;font-weight: 700;">{{GPUData.useGPU.value}}%</div>
          <div style="color:var(--primary-text);font-size: 14px;margin-top: 6px">负载</div>
        </template>
      </a-progress>
      </div>
      <div class="right-content">
        <div class="cpu">
          <div class="cpu-number">
            <span>温度</span>
            <span style="font-weight: 700;">{{GPUData.warmGPU.value}}℃</span></div>
        </div>
        <a-progress :showInfo="false" :status="GPUData.warmGPU.value===0?'':'active'" :percent="GPUData.warmGPU.value" :stroke-color="{
        '0%': '#60BFFF',
        '100%': '#348FFF',
      }"/>

        <div class="cpu" style="margin-top: 13px">
          <div class="cpu-number">
            <span>显存</span>
            <span style="font-weight: 700;">{{GPUStorage}}GB</span></div>
        </div>


        <div style="margin-top: 13px;" class="text-left">GPU</div>
        <canvas id='myGPUCanvas' ref="myGPUCanvas" style='width:130px;height:40px;margin-top: 5px'> </canvas>
      </div>
    </div>
  </Widget>
</template>

<script>
import { mapActions, mapWritableState } from 'pinia'
import {cardStore} from "../../../store/card";
import {filterObjKeys,initCanvas} from "../../../util";
import Widget from "../../card/Widget.vue";
import { inspectorStore } from '../../../store/inspector'
import { message } from 'ant-design-vue'
export default {
  name: "SmallGPUCard",
  props:['desk'],
  data(){
    return {
      options:{
        className:'card small',
        title:'GPU',
        icon:'cpu',
        type:'smallGPUCard'
      },
      GPUData:{
        useGPU:{value:0},
        warmGPU:{value:0},
        videoStorage:{value:0}
      },
      GPUList:[999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999,999],
      menuList:[
        {
          title:'复制数据',
          icon:'fuzhi',
          fn:()=>{
            require('electron').clipboard.writeText(JSON.stringify(this.aidaData))
            message.success('复制成功')
          }
        }
      ]
    }
  },
  components:{
    Widget
  },
  computed:{
    ...mapWritableState(inspectorStore,['displayData','aidaData']),
    GPUStorage() {
      return this.GPUData.videoStorage.value>0?(this.GPUData.videoStorage.value / 1000).toFixed(2):this.GPUData.videoStorage.value
    }
  }, mounted () {
    this.startInspect()
  },
  unmounted () {
    this.stopInspect()
  },
  watch: {
    "displayData": {
      handler(newVal, oldVal) {
        let { useGPU, warmGPU, videoStorage} = this.displayData || {}
        this.GPUData = {
          useGPU:useGPU,
          warmGPU:warmGPU,
          videoStorage:videoStorage
        }
        this.GPUData.useGPU.value&& this.GPUList.push(this.GPUData.useGPU.value)
        this.GPUList.shift();
        this.initCanvas('myGPUCanvas',this.GPUList,6,12,"#515151","#3B8FFA")
      },
      deep: true,
    },
  },
  methods:{
    ...mapActions(inspectorStore, ['startInspect', 'stopInspect']),
    initCanvas,
    go(){
      this.$router.push({name:'inspector'})
    }
  }
}
</script>



<style lang="scss" scoped>
.content{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
  font-weight: 400;
  .right-content{
    margin-top: 8px;
  }
}

.cpu{
  display: flex;
  .cpu-number{
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

  }
}
</style>
