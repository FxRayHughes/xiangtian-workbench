<template>
  <Widget 
  :options="options" 
  :sizeList="sizeList"
  :customData="customData"
  :desk="desk" 
  ref="rankingSmallSlot" 
  :menuList="toggleRankingList">
  <div class="bg-mask rounded-lg px-3 py-1 pointer" @click="showDrawer"
    style="position: absolute;left: 45px;top:10px;background: var(--primary-bg);color:var(--primary-text)">{{ rankingType[rankIndex].title }}
  </div>
    <!-- 总在线时长榜 -->
    <div class="content-box" v-if="rankIndex === 0">
      <!-- 列表 -->
      <RankList :rankList="onLineList" lastName="totalDuration" unit="h"></RankList>
    </div>
    <!-- 净在线时长榜 -->
    <div class="content-box" v-if="rankIndex === 1">
      <RankList :rankList="onLineList" lastName="netDuration" unit="h"></RankList>
    </div>
    <!-- 小队榜 -->
    <div class="content-box" v-if="rankIndex === 2">
      <RankList :rankList="teamList" lastName="onlineDuration" unit="h"></RankList>
    </div>
    <!-- 邀请榜 -->
    <div class="content-box" v-if="rankIndex === 3">
      <RankList :rankList="inviteList" lastName="invite" unit="人"></RankList>
    </div>
    <!-- 今日签到 -->
    <div class="content-box" v-if="rankIndex === 4">
      <RankList :rankList="signInList" lastName="signInTime"></RankList>
    </div>
    <!-- 累积签到 -->
    <div class="content-box" v-if="rankIndex === 5">
      <RankList></RankList>
    </div>
    <!-- 连续签到 -->
    <div class="content-box" v-if="rankIndex === 6">
      <RankList></RankList>
    </div>
  </Widget>
  <a-drawer v-model:visible="middleShow" title="设置" placement="right" width="500">
    <div class="flex flex-col" style="color:var(--primary-text)">
      <span   v-for="(item,index) in rankingType" :key="index"  
      @click="getRankingType(item,index)" 
      :class="rankIndex === index ? 'active-index':''" 
      class="mb-4  text-center pointer change h-12 xt-bg-2 rounded-lg show-game-time py-3">
         {{ item.title }}
      </span>
    </div>
  </a-drawer>
</template>

<script>
import Widget from '../card/Widget.vue'
import { mapActions, mapWritableState } from 'pinia'
import { appStore } from '../../store'
import { onLineList,teamList,inviteList,signInList } from "../../js/rank"
import RankList from '../rank/RankList.vue'
export default {
  name: 'SmallRank',
  components: {
    Widget,
    RankList
  },
  props: {
    customIndex: {
      type: Number,
      default: 0
    },
    customData: {
      type: Object,
      default: () => {}
    },
    desk:{
      type:Object
    }
  },
  data () {
    return {
      options: {className: 'card small',title: '',icon: 'linechart',type: 'smallRank'},
      sizeList:[{title:'1x1',height:1,width:1,name:'1x1'},{title:'1x2',height:2,width:1,name:'1x2'},],
      //在线时长榜
      onLineList,
      // 小队榜
      teamList,
      // 邀请榜
      inviteList,
      // 签到榜
      signInList,
      middleShow: false,
      toggleRankingList:[ { icon: 'shezhi1', title: '设置', fn: () => {this.middleShow = true;this.$refs.rankingSmallSlot.visible = false } } ],
      rankingType: [
        {title:'总在线时长榜',name:'total'},
        {title:'净在线时长榜',name:'net'},
        {title:'小队榜',name:'team'},
        {title:'邀请榜',name:'invite'},
        {title:'今日签到榜',name:'today'},
        {title:'累计签到榜',name:'accrue'},
        {title:'连续签到榜',name:'series'},
      ],
      rankIndex: 0
    }
  },
  mounted() {
    if (this.customData?.id) {
      this.rankIndex = this.customData.id
    }
  },
  methods: {
    ...mapActions(appStore,['showUserCard']),
    showCard(uid){
      this.showUserCard(uid)
    },
    getRankingType(item,index){
      this.customData.id = index
      this.rankIndex = this.customData.id
      this.middleShow = false
    },
    showDrawer(){
      this.middleShow = true
      this.$refs.rankingSmallSlot.visible = false
    }
  }
}
</script>

<style scoped lang="scss">

.ranking {
  width: 24px;
  height: 24px;
  text-align: center;
  background: var(--mask-bg);
  border-radius: 4px;
  font-size: 16px;
  color: var(--primary-text);
  font-weight: 600;
}

.content-box {
  height: calc(100% - 35px);
  margin-top: 10px;
  overflow: hidden;
}

.set-type:nth-of-type(1) > span {
  background: #FE2C46;
}

.set-type:nth-of-type(2) > span {
  background: #FF6600;
}

.set-type:nth-of-type(3) > span {
  background: #FAAA10;
}

.active-index{
  background: var(--active-bg) !important;
}
</style>
