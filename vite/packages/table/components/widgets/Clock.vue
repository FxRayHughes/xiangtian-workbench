<template>
  <Widget :desk="desk" :options="options" :customIndex="customIndex" :menuList="menus" ref="cardSlot">
    <!-- <div class="flex flex-col items-center"> -->
    <div v-if="countDowntime.hours" style="display: flex;flex-direction: column;justify-content: space-between; "
      class="mt-4">
      <div class="right-title" @click.stop="showDrawer" @contextmenu.stop="showDrawer">
        <Icon icon="gengduo1" class="title-icon" style="cursor:pointer"></Icon>
      </div>
      <div style="text-align: center;color: var(--primary-text);font-size:16px  ;" class="font-14">
        <clockIcon icon="fluent:clock-12-regular" class="mr-2 title-icon"
          style="cursor:pointer ;font-size: 20px;text-align: center; vertical-align: sub;">
        </clockIcon>
        计时器
      </div>
      <div style="color: #FBAE17;font-size: 40px;font-weight:600;text-align: center; font-family: Oswald-SemiBold;"
        class="mt-4 mb-4">
        {{ countDowntime.hours + ':' + countDowntime.minutes + ':' + countDowntime.seconds }}
      </div>
      <div style="display: flex;align-items: center;justify-content: space-between;padding: 0 6em;">
        <clockIcon style="width: 2em; height: 2em;cursor:pointer;color: var(--primary-text);" icon="akar-icons:pause"
          @click="closeCountDown" v-show="!countDownBtn"></clockIcon>
        <clockIcon style="width: 2em; height: 2em;cursor:pointer;color: var(--primary-text);" icon="fluent:play-16-filled"
          @click="startCountDown" v-show="countDownBtn"></clockIcon>
        <clockIcon style="width: 2em; height: 2em;cursor:pointer;color: var(--primary-text);"
          icon="fluent:dismiss-16-filled" @click="deleteCountDown"></clockIcon>
      </div>
    </div>
    <div class="flex flex-col text-center" v-else-if="clockEvent.length <= 0" style="width: 100%">
      <div class="right-title" @click.stop="showDrawer" @contextmenu.stop="showDrawer">
        <Icon icon="gengduo1" class="title-icon" style="cursor:pointer"></Icon>
      </div>
      <div class="flex flex-col items-center justify-center mt-10">
        <xt-button class="rounded-lg  w-[120px] h-[45px] xt-active-bg mb-4 border-0 p-0 font-16" type="primary"
          @click="onSetup">添加闹钟</xt-button>
        <xt-button type="text" class="rounded-lg  w-[120px] h-[45px]  border-0 p-0 warn-bg font-16" @click="onSetCountDown">添加定时器</xt-button>
      </div>

    </div>
    <div @click="onSetup" class="flex flex-col mt-6 text-center cursor-pointer" v-else>
      <div class="right-title" @click.stop="showDrawer" @contextmenu.stop="showDrawer">

      </div>
      <div style="text-align: center;font-family: PingFangSC-Regular !important;font-size: 16px;font-weight: 400; "
        class="font-14">
        <clockIcon icon="fluent:clock-alarm-16-filled" class="mr-2 title-icon"
          style="cursor:pointer ;font-size: 20px;text-align: center; vertical-align: sub;">
        </clockIcon>
        下一个闹钟
      </div>
      <!-- style="font-size: 3em; margin-top: 0.5em" -->
      <div class="mt-4 mb-4 font-40" style="font-family:Oswald-SemiBold !important; font-size: 40px; font-weight: 600;">
        <!-- <icon icon="naozhong"></icon> -->
        {{ clockEvent[0].dateValue.hours }}:{{ clockEvent[0].dateValue.minutes }}
      </div>
      <div class="text-more font-14" style="font-family: PingFangSC-Regular !important; font-size: 16px;">
        {{ clockEvent[0].eventValue }}
      </div>
    </div>
    <!-- </div> -->
    <template #menuExtra>
      <div class="w-24 h-24 mr-4 option" @click="onCountDown(3)">
        <clockIcon class="icon" icon="fluent:clock-12-regular"></clockIcon>
        3分钟
      </div>
      <div class="w-24 h-24 mr-4 option" @click="onCountDown(10)">
        <clockIcon class="icon" icon="fluent:clock-12-regular"></clockIcon>
        10分钟
      </div>
      <div class="w-24 h-24 mr-4 option" @click="onCountDown(30)">
        <clockIcon class="icon" icon="fluent:clock-12-regular"></clockIcon>
        30分钟
      </div>
      <div class="w-24 h-24 mr-4 option" @click="onCountDown(300)">
        <clockIcon class="icon" icon="fluent:clock-12-regular"></clockIcon>
        自定义
      </div>
      <div class="w-24 h-24 mr-4 option" @click="onSetup">
        <Icon class="icon" icon="shezhi1"></Icon>
        设置
      </div>
    </template>
  </Widget>


  <a-drawer v-model:visible="visibleDrawer" class="custom-class xt-text" style="color: red" title="设置" placement="right" :width="600"
    @after-visible-change="afterVisibleChange">
    <div class="flex">
      <SetupClock></SetupClock>
    </div>
  </a-drawer>
  <a-modal v-model:visible="custom" title="" @ok="() => { }" :footer="null"
    style="font-size: 8px;color: var(--primary-text);" :maskClosable="false">
    <div style="display: flex;flex-direction: column;align-items: center;">
      <div style="">自定义倒计时</div>
      <a-space direction="vertical" style="margin: 14px" :popupStyle="{ zIndex: 9999999999999 }">
        <a-time-picker v-model:value="value1" size="large" :popupStyle="{ zIndex: 9999999999999 }" />
      </a-space>
      <a-button type="primary" @click="addCustom" style="margin: 14px">开始倒计时</a-button>
    </div>
  </a-modal>
</template>

<script>
import { mapWritableState, mapActions } from 'pinia'
import { countDownStore } from '../../store/countDown'
import { cardStore } from '../../store/card'
import dayjs from 'dayjs'
import Widget from '../card/Widget.vue'
import { Icon as clockIcon } from '@iconify/vue'
import SetupClock from './setupClock.vue'
export default {
  name: 'Clock',
  components: { Widget, clockIcon, SetupClock },
  props: {
    customIndex: {
      type: Number,
      default: 0
    },
    desk: {
      type: Object
    },

  },
  data() {
    return {
      simpleImage: '/public/img/test/load-ail.png',
      visible: false,
      value1: dayjs('00:00:00', 'HH:mm'),
      custom: false,
      options: {
        className: 'card small',
        title: '闹钟',
        noTitle: true
      },
      menus: [],
      visibleDrawer: false,
      clockValue: '',
      setClockName: '未命名',
    }
  },
  computed: {
    ...mapWritableState(cardStore, ['appDate', 'clockEvent']),
    ...mapWritableState(countDownStore, ['countDowndate', 'countDowntime', 'countDownBtn']),
  },

  methods: {
    ...mapActions(cardStore, ['removeCard']),
    ...mapActions(countDownStore, ['setCountDown', 'stopCountDown', 'openCountDown', 'dCountDown']),
    onContextMenuClick(e) {

    },
    onSetCountDown() {
      this.$refs.cardSlot.menuVisible=true
    },
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false
    },
    onSetup() {
      this.visibleDrawer = true
      // this.$router.push({
      //   name: 'addCardSetting',
      //   params: {
      //     name: 'clock',
      //     cname: '闹钟',
      //   },
      // })
    },
    removeClock() {
      this.removeCard(this.customIndex)
      this.dCountDown()
      this.visible = false
    },
    onCountDown(value) {
      switch (value) {
        case 3:
          this.setCountDown({ hours: 0, minutes: 3, seconds: 0 })
          break
        case 10:
          this.setCountDown({ hours: 0, minutes: 10, seconds: 0 })
          break
        case 30:
          this.setCountDown({ hours: 0, minutes: 30, seconds: 0 })
          break
        case 300:
          this.custom = true
          break
      }
      this.$refs.cardSlot.hideMenu()
      this.countDownBtn = false
    }, closeCountDown() {

      this.stopCountDown()

    },
    startCountDown() {

      this.openCountDown()

    },
    deleteCountDown() {
      this.dCountDown()
    },
    closeCustom() {
      this.custom = false
    },
    addCustom() {
      this.setCountDown({
        hours: parseFloat(this.value1.$H),
        minutes: parseFloat(this.value1.$m),
        seconds: parseFloat(this.value1.$s)
      })
      this.custom = false
    }
  },

}
</script>

<style scoped lang="scss">
.ant-dropdown-open {
  border-radius: 100%;
}

[ant-click-animating-without-extra-node='true']::after,
.ant-click-animating-node {
  background: #676767;
  box-shadow: #676767;
  animation: none
}

.drawer {
  margin: 10em;
}

font-40 {
  font-family: Oswald-SemiBold;
  font-size: 40px;
  font-weight: 600;
}

font-14 {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  font-weight: 400;
}

font-16 {
  font-family: PingFangSC-Medium;
  font-size: 16px;
  font-weight: 500;
}

:deep(.ant-empty-image) {
  height: 60px;
}
:deep(.anticon.ant-input-clear-icon){
    color:var(--secondary-text);
}
</style>
