<template>
  <div class="mt-3">
    <div class="flex justify-between justify-center" v-if="size.width === 2 && size.height === 2">
      <div class="flex flex-col" style="width:73.53%;">
        <div class=" relative" style="width:400px;height:188px;">
          <img class="rounded-lg" style="width: 100%;height: 100%; object-fit: cover;" :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamDetail.appid}/header.jpg`" alt="">
          <div class="in-run" v-if="isRunGame === true">正在运行</div>
        </div>
        <span class="my-4">{{steamDetail.name}}</span>
        <div class="flex">
          <div class="flex flex-col">
            <span class="show-time mb-2">最近游玩 : {{ getDateMyTime(steamDetail.time) }}</span>
            <span class="show-time">M站评分 : {{ steamDetail.metacritic_score ? steamDetail.metacritic_score : '-' }}</span>
          </div>
          <div class="flex flex-col ml-32">
            <span class="show-time mb-2">过去两周 : {{ twoWeekTime(steamDetail.time) }}</span>
            <span class="show-time">总数 : {{ totalTime(steamDetail.time) }}</span>
          </div>
        </div>

        <div class="flex mt-2">
          <div class="flex items-center detail-active mr-3 s-item pointer px-3 rounded-lg" @click="backGameList">
            <Icon icon="xiangzuo" style="font-size: 1.8em;"></Icon>
          </div>
          <div @click="startGame" v-if="runningGame.appid!==steamDetail.appid" class="flex game-start-button items-center mr-3  detail-active s-item  rounded-lg pointer  justify-center" style="background: rgba(82,196,26,1);padding: 13px 40px;">
            <Icon icon="bofang" style="font-size: 1.2em;"></Icon>
            <span class="ml-2">开始游戏</span>
          </div>
          <div @click="closeGame" v-else class="flex items-center mr-3 game-start-button running  detail-active s-item  rounded-lg pointer  justify-center" style="padding: 13px 40px;">
            <Icon icon="guanbi" style="font-size: 1.2em;"></Icon>
            <span class="ml-2">关闭游戏</span>
          </div>
          <div @click="guidelineJump(steamDetail.appid)" class="flex  py-3 s-item px-15 detail-active  rounded-lg pointer items-center justify-center"  style="padding: 13px 40px;">
            <Icon icon="trophy" style="font-size: 1.2em;"></Icon>
            <span class="ml-2">游戏攻略</span>
          </div>

        </div>

      </div>
      <a-divider type="vertical" style="height: 350px;background: rgba(255,255,255,0.05);" />
      <div class="flex flex-col" style="width:20.405%;">
        <div class="mb-2.5 flex s-item rounded-lg flex-col items-center justify-center" style="padding: 18px 6px;">
          <span class="flex items-center justify-center" style="width:100px;line-height: 53px;font-size: 30px;font-weight: 600;">
            {{  CPUGPUData.FPS.value }}
          </span>
          <span class="flex items-center">
            <Icon icon="game" class="mr-1" style="font-size:1.2em;"></Icon>
            FPS
          </span>
        </div>
        <div class="mb-2.5 flex s-item rounded-lg flex-col items-center justify-center " style="padding: 18px 6px;">
          <span class="flex items-center justify-center" style="width:100px;line-height: 53px;font-size: 30px;font-weight: 600;">
            {{  CPUGPUData.useCPU.value }}%
          </span>
          <span class="flex items-center">
            <Icon icon="lvzhou_cpu" class="mr-1" style="font-size:1.2em;"></Icon>
            CPU
          </span>
        </div>
        <div class="flex s-item rounded-lg flex-col items-center justify-center" style="padding: 18px 6px;">
          <span class="flex items-center justify-center" style="width:100px;line-height: 53px;font-size: 30px;font-weight: 600;">
            {{  CPUGPUData.useGPU.value }}
          </span>
          <span class="flex items-center">
            <Icon icon="xianqia" class="mr-1" style="font-size:1.2em;"></Icon>
            GPU
          </span>
        </div>
      </div>
    </div>
    <div class="mt-3 flex flex-col  relative" v-else>
      <div style="height: 118px;" class="mb-3.5">
        <img class="rounded-lg" style="width: 100%;height: 100%; object-fit: cover;" :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamDetail.appid}/header.jpg`" alt="">
      </div>
      <div class="m-in-run mt-1" v-if="isRunGame === true">正在运行</div>
      <div class="flex items-center justify-center">
        <span class="truncate mb-2.5 " style="max-width: 180px;">{{steamDetail.name}}</span>
      </div>
      <span class="flex items-center mb-2.5 justify-center last-time">最近游玩 : {{getDateMyTime(steamDetail.time)}} </span>
      <span class="flex items-center mb-2.5 justify-center last-time">过去两周 : {{twoWeekTime(steamDetail.time)}} 小时</span>
      <span class="flex items-center mb-2.5 justify-center last-time">总数 : {{totalTime(steamDetail.time)}} 小时</span>
      <div class="flex items-center">
        <div @click="backGameList" class="flex items-center detail-active mb-2 mr-3 s-item rounded-lg pointer" style="padding: 13px 12px;">
          <Icon icon="xiangzuo" style="font-size: 1.5em;"></Icon>
        </div>
        <div @click="guidelineJump(steamDetail.appid)" style="padding:12px 35px;" class="flex mb-2  w-full s-item detail-active  rounded-lg pointer items-center justify-center">
          <Icon icon="trophy" style="font-size: 1.2em;"></Icon>
          <span class="ml-2">游戏攻略</span>
        </div>
      </div>
      <div @click="startGame" v-if="runningGame.appid!==steamDetail.appid" style="background: rgba(82,196,26,1);" class="flex game-start-button w-full items-center  detail-active s-item py-3 rounded-lg pointer justify-center">
        <Icon icon="bofang" style="font-size: 1.2em;"></Icon>
        <span class="ml-2">开始游戏</span>
      </div>
      <div @click="closeGame" v-else class="flex w-full game-start-button running items-center  detail-active s-item py-3 rounded-lg pointer justify-center">
        <Icon icon="guanbi" style="font-size: 1.2em;"></Icon>
        <span class="ml-2">关闭游戏</span>
      </div>
    </div>
  </div>
</template>

<script>
import {getDateTime} from '../../../util'
import { mapWritableState,mapActions } from 'pinia';
import {cardStore} from "../../../store/card";
import {steamUserStore} from "../../../store/steamUser";
import { inspectorStore } from '../../../store/inspector'
export default {
  name:'MySteamDetail',
  props:{
    steamDetail:{
      type:Object,
      default:()=>{}
    },
    size:{
      type:Object,
      default:()=>{}
    }
  },
  data(){
    return{
      CPUGPUData:{
        useCPU:{value:0},
        useGPU:{value:0},
        useMemory:{value:0},
        FPS:{value:0},
        down:0,
        up:0
      },
      isRunGame:false,
    }
  },
  computed:{
    ...mapWritableState(inspectorStore,['displayData']),
    ...mapWritableState(steamUserStore,['runningGame'])
  },

  watch:{
    'displayData':{
      handler(){
        let { useGPU, useMemory, useCPU, FPS, down, up} = this.displayData || {}
        this.CPUGPUData = {
          useGPU:useGPU,
          useCPU:useCPU,
          useMemory:useMemory,
          FPS:FPS,
          down:down,
          up:up
        }
      },
      deep:true
    }
  },

  mounted(){
  },

  methods:{
    ...mapActions(steamUserStore,['playGame','stopGame']),
    getDateMyTime(time){
      if(time){
        const timer = getDateTime(new Date(parseInt(time.rtime_last_played) * 1000))
        return time.rtime_last_played !==0 ? timer.month+ '月' + timer.day + '日':'0'
      }else{
        return 0
      }

    },
    twoWeekTime(time){
      return time? ( time.playtime_2weeks / 60 ).toFixed(1): 0
    },
    totalTime(time){
      return time? ( time.playtime_forever / 60 ).toFixed(1): 0
    },
    // 游戏攻略跳转
    guidelineJump(id){
      this.$router.push({name:'gameIntroduction',params:{id}})
    },
    // 关闭游戏
    closeGame(){
      this.stopGame(this.steamDetail)
    },
    startGame(){
      this.playGame(this.steamDetail)
    },
    backGameList(){
      this.$emit('closeDetail')
    }
  }
}
</script>

<style lang="scss" scoped>
.show-time{
  font-size: 13px;
  color: rgba(255,255,255,0.60);
  font-weight: 400;
}
.px-15{
  padding-left: 4rem;
  padding-right: 3.25rem;
}
.detail-active{
  &:hover{
    opacity: 0.8;
  }
  &:active{
    filter: brightness(0.8);
    background: rgba(42, 42, 42, 0.25);
  }
}
.in-run{
  position: absolute;
  top: 7px;
  right: 10px;
  background: rgba(82,196,26,1);
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  font-weight: 500;
}
.m-in-run{
  position: absolute;
  top: 0;
  right: 8px;
  background: rgba(82,196,26,1);
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  font-weight: 500;
}
</style>
