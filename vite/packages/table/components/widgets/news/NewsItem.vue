<template>
  <div class="card-item" :style="{ marginBottom:copyNum==12?'20px':'12px'}">

    <div class="left" :style="{ width: showImg == false ? '260px' : '' }" >
      <div class="title" @click="goNews" style="color: var(--primary-text);" >
        {{ newsMsgList.newsMsgList.title }}
      </div>
      <div class="bottom" >
        <div class="date"  >
          <span style="color: var(--secondary-text);">{{ timer[0] }} {{ timer[1] }}</span>
        </div>
        <div class="name">
          <span style="color: var(--secondary-text);" >{{ newsMsgList.newsMsgList.author_name }}</span>
        </div>
      </div>

    </div>
    <div class="right" :style="{ backgroundImage: img ? `url(${img})` : '' }" v-if="showImg" @click="goNews">
      <!-- <img :src="img" alt="" class="image"> -->
    </div>

  </div>
</template>

<script setup lang='ts'>
import { ref, reactive, computed } from 'vue'
// vite\packages\table\js\common\browser.ts
import browser from '../../../js/common/browser'
let showImg = ref(true)
const newsMsgList = defineProps({
  newsMsgList: {
    type: Object,
  },
  copyNum:{
    type:Number
  }

})
const goNews = () => {

  browser.openInUserSelect(newsMsgList.newsMsgList.url)
}
const timer = computed(() => {
  let [updateDate, updateTime] = newsMsgList.newsMsgList.date.split(' ')
  let [item, ...arr] = updateDate.split('-')
  let [hour, min, _] = updateTime.split(':')
  const Utime = [hour, min].join(':')
  const uDate = arr.join("-")
  return [uDate, Utime]
})

const img = computed(() => {
  if (newsMsgList.newsMsgList.thumbnail_pic_s) {
    return newsMsgList.newsMsgList.thumbnail_pic_s
  } else {
    return showImg.value = false
  }
})

</script>
<style lang='scss' scoped>
.card-item {
  width: 222px;
  height: 68px;
  // margin-bottom: 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  // cursor: pointer;

  .left {
    width: 145px;
    position: relative;
    .title {
      width: 100%;
      height: auto;
      // padding-top: 12px;
      margin-top: 2.4%;
      white-space: pre-wrap;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      overflow: hidden;
      // overflow-wrap: break-word;
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 400;
      text-align: left;
      cursor: pointer;

    }

    .bottom {
      width: 100%;
      height: 18px;
      display: flex;
      // justify-content: space-between;
      position: absolute;
      // margin-top: 9.2%;
      bottom: -6px;

      .date {
        span {
          font-family: PingFangSC-Regular;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.40);
          font-weight: 400;
        }
        &:after {
          content: '·';
          text-align: center;
          margin: 0 4px;
        }
      }

      .name {
        margin-left: 3px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        span {
          font-family: PingFangSC-Regular;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.40);
          font-weight: 400;

        }
      }

    }
  }

  .right {
    background: rgba(0, 0, 0, 0.30);
    border-radius: 10px;
    width: 67px;
    height: 67px;
    margin: 8px 0px;
    margin-right: 0.8%;
    background-size: cover;
    cursor: pointer;
  }
}
</style>
