<template>
  <div
    @click.stop
    class="bottom-panel mb-3 flex flex-row items-center justify-center w-full"
    style="text-align: center"
    @contextmenu.stop="showMenu"
  >
    <!-- 快速搜索 底部 用户栏 -->
    <div
      v-if=" (!simple || settings.enableChat)"
      class="common-panel user s-bg flex flex-row"
      style="
        vertical-align: top;
        margin-top: 0;
        background: var(--primary-bg);
        color: var(--primary-text);
      "
    >
      <MyAvatar v-if="!simple" :chat="true" :level="true"></MyAvatar>
      <div v-show="settings.enableChat" class="pointer">
        <ChatButton></ChatButton>
      </div>
    </div>


    <!-- 快速搜索 底部栏区域 -->
    <div
      v-show="navigationToggle[2]"
      class="flex flex-row items-center pl-4 s-bg"
      style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        justify-items: center;
        align-content: center;
        align-items: center;
        border-radius: 8px;
        height: 73px;
        overflow: hidden;
        margin-right: 10px;
        background: var(--primary-bg);
        color: var(--primary-text);
      "
    >
      <div
        style="
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 56px;
          align-items: start;
          flex-wrap: nowrap;
          justify-content: center;
        "
      >
        <div @contextmenu.stop="showMenu" style="height: 56px; width: 100%; overflow: hidden">
          <div
            class="scroll-content mr-6"
            style="overflow-y: hidden; overflow-x: auto; flex: 1; display: flex"
            ref="content"
          >
            <xt-task :modelValue="m01041" @cb="showMenu">
              <div
                style="white-space: nowrap; display: flex; align-items: center"
                id="bottomContent"
              >
                <div v-if="footNavigationList.length <= 0" style=""></div>
                  <a-tooltip
                  v-for="item in footNavigationList"
                  :key="item.name"
                        :title="item.name"
                >
         <div
           @contextmenu.stop="enableDrag"
           class="pointer mr-3 mr-6"
           style="white-space: nowrap; display: inline-block"
           @click.stop="clickNavigation(item)"
         >
           <div
             style="width: 56px; height: 56px"
             v-if="item.type === 'systemApp'"
             class="s-item flex justify-center items-center rounded-lg xt-bg-2"
           >
             <Icon
               :icon="item.icon"
               class="test"
               style="
                 width: 32px;
                 height: 32px;
                 fill: var(--primary-text);
               "
             ></Icon>
           </div>
           <div
             v-else
             style="width: 45px; height: 45px"
             class="flex justify-center items-center"
           >
             <a-avatar
               :size="40"
               shape="square"
               :src="item.icon"
             ></a-avatar>
           </div>
                </div>
               </a-tooltip>
              </div>
            </xt-task>
          </div>
        </div>

        <a-tooltip :title="showScreen ? '运行中的分屏' : '运行中的应用'">
          <div
            @click="appChange"
            v-if="isMain"
            style="
              flex-shrink: 0;
              border-left: 1px solid var(--divider);
              width: 72px;
              height: 58px;
            "
            class="flex justify-center items-center h-2/3 pointer"
          >
            <template v-if="!showScreen">
              <Icon
                icon="fuzhi"
                style="
                  width: 40px;
                  height: 40px;
                  margin-left: 5px;
                  margin-bottom: 3px;
                "
              ></Icon>
              <span
                style="
                  position: absolute;
                  width: 48px;
                  height: 48px;
                  text-align: center;
                  line-height: 48px;
                  font-weight: bold;
                  font-size: 18px;
                "
              >{{ runningApps.length + runningTableApps.length }}</span
              >
            </template>
            <template v-else>
              <Icon
                icon="touping"
                style="width: 40px; height: 40px; margin-left: 2px"
              ></Icon>
              <span
                style="
                  position: absolute;
                  width: 48px;
                  height: 48px;
                  text-align: center;
                  line-height: 48px;
                  font-weight: bold;
                  font-size: 18px;
                  margin-bottom: 6px;
                "
              >{{ runningScreen }}</span
              >
            </template>
          </div>
        </a-tooltip>
      </div>
    </div>

    <template v-if="!simple && isMain">
      <Team></Team>
    </template>

    <TaskBox></TaskBox>
  </div>

  <div
    id="trans"
    v-show="visibleTrans"
    style="
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background: #2c2c2c;
    "
  >
    <a-button
      @click="visibleTrans = false"
      style="position: fixed; left: 10px; top: 10px"
    >取消
    </a-button
    >
    <iframe id="transFrame" style="width: 100vw; height: 100vh; border: none">
    </iframe>
  </div>
  <a-drawer
    :contentWrapperStyle="{ backgroundColor: '#212121', height: '216px' }"
    class="drawer"
    :closable="true"
    placement="bottom"
    :visible="menuVisible"
    @close="onClose"
  >
    <a-row>
      <a-col>
        <div @click="editNavigation" class="btn relative">
          <xt-task :modelValue="m01042" @cb="editNavigation">
            <Icon style="font-size: 3em" icon="tianjia1"></Icon>
            <div><span>编辑导航</span></div>
          </xt-task>
        </div>

        <div
          @click="clickNavigation(item)"
          class="btn"
          v-for="item in builtInFeatures"
          :key="item.name"
        >
          <Icon style="font-size: 3em" :icon="item.icon"></Icon>
          <div>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-drawer>
  <!-- <a-drawer :contentWrapperStyle="{ backgroundColor: '#1F1F1F', height: '11em' }" :width="120" :height="120"
    class="drawer" :closable="false" placement="bottom" :visible="menuVisible" @close="onClose">
    <a-row style="margin-top: 1em" :gutter="[20, 20]">
      <a-col>
        <div @click="editNavigation" class="btn relative">
          <Icon style="font-size: 3em" icon="tianjia1"></Icon>
          <div><span>编辑</span></div>
         <GradeSmallTip powerType="bottomNavigation" @closeDrawer="closeDrawer"></GradeSmallTip>
        </div>
      </a-col>
    </a-row>
  </a-drawer> -->

  <transition name="fade">
    <div class="home-blur fixed inset-0" style="z-index: 999" v-if="quick">
      <EditNavigation @setQuick="setQuick"></EditNavigation>
    </div>
  </transition>

  <div
    class="home-blur fixed inset-0"
    style="z-index: 999; background: var(--mask-background-color)"
    v-if="changeFlag"
    @click="closeChangeApp"
  >
    <ChangeApp
      :tab="tab"
      @closeChangeApp="closeChangeApp"
      :full="full"
      @setFull="setFull"
    ></ChangeApp>
  </div>
  <TeamTip :key="teamKey" v-model:visible="showTeamTip"></TeamTip>
</template>

<script>
import PanelButton from './PanelButton.vue'
import { appStore } from '../store'
import { cardStore } from '../store/card'
import { navStore } from '../store/nav'
import { mapWritableState, mapActions } from 'pinia'
import Template from '../../user/pages/Template.vue'
import { ThunderboltFilled } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import SidePanel from './SidePanel.vue'
import SecondPanel from './SecondPanel.vue'
import GradeSmallTip from './GradeSmallTip.vue'
import { isMain } from '../js/common/screenUtils'

import EditNavigation from './bottomPanel/EditNavigation.vue'
import ChangeApp from './bottomPanel/ChangeApp.vue'
import ScrolX from './ScrolX.vue'

import TeamTip from './TeamTip.vue'
import { teamStore } from '../store/team'
import { messageStore } from '../store/message'
import { appsStore } from '../store/apps'
import { screenStore } from '../store/screen'
import { toggleFullScreen } from '../js/common/common'
import MyAvatar from './small/MyAvatar.vue'
import Team from './bottomPanel/Team.vue'
import Sortable from 'sortablejs'
import { message } from 'ant-design-vue'
import TaskBox from '../apps/task/page/TaskBox.vue'
import { taskStore } from '../apps/task/store'
import Emoji from './comp/Emoji.vue'
import ChatButton from './bottomPanel/ChatButton.vue'

export default {
  name: 'BottomPanel',
  emits: ['getDelIcon'],
  components: {
    ChatButton,
    Emoji,
    MyAvatar,
    TeamTip,
    SecondPanel,
    SidePanel,
    Template,
    PanelButton,
    ThunderboltFilled,
    EditNavigation,
    ChangeApp,
    ScrolX,
    GradeSmallTip,
    Team,
    TaskBox,
  },
  data () {
    return {
      sortable: null,

      tab: 'screen',

      lastTime: 0,
      visibleTrans: false,
      full: false,
      //显示小组提示
      showTeamTip: false,
      teamKey: Date.now(),
      updateMessageTimer: null,

      timer: null,

      tipped: false,
      menuVisible: false,
      quick: false,
      scrollbarSettings: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: true,
        suppressScrollX: false,
        wheelPropagation: true,
      },
      changeFlag: false,
      timerRunning: false,
      showScreen: false,
      leftNav: false,
      rightNav: false,
      delNav: false,
      //screenWidth: document.body.clientWidth
    }
  },
  props: {
    delZone: {
      type: Boolean,
      default: () => false,
    },
  },
  unmounted () {
    let that = this
    window.removeEventListener('resize', that.checkScroll)
    clearInterval(this.updateMessageTimer)
    if (this.timerRunning) {
      clearInterval(this.timerRunning)
    }
  },
  mounted () {
    this.timerRunning = setInterval(() => {
      this.showScreen = !this.showScreen
    }, 5000)
    // let inserted=localStorage.getItem('insertBird')
    // if(!inserted){
    //   this.navigationList.unshift( {
    //     icon: 'http://a.apps.vip/icons/flappy.jpg',
    //     type:'coolApp',
    //     name: 'Mlappy Bird',
    //     summary: '和小伙伴们一起飞。',
    //     needInstall: false,
    //     data: {
    //       theme: '#030c13',
    //       name: 'mlappyBird',
    //       url: 'http://bird.apps.vip/?',
    //       background: false,
    //       type:'game',
    //       scale:160
    //     }
    //   })
    //   localStorage.setItem('insertBird','1')
    // }
    this.getMessageIndex().then()
    //每3分钟刷新一次消息
    this.updateMessageTimer = setInterval(() => {
      this.getMessageIndex().then()
    }, 180000)
    let that = this
    this.checkScroll()
    // const that = this
    // window.onresize = function() {
    //   return function(){
    //     window.screenWidth = document.body.clientWidth;
    //     that.screenWidth = window.screenWidth
    //   }()
    // }
    window.addEventListener('resize', that.checkScroll)
    let content = this.$refs.content
    content.addEventListener('wheel', (event) => {
      event.preventDefault()
      // console.log('wheel',event)
      content.scrollLeft += event.deltaY
    })
  },
  computed: {
    ...mapWritableState(appStore, ['userInfo', 'settings', 'lvInfo', 'simple']),
    ...mapWritableState(appsStore, ['runningApps', 'runningTableApps']),
    ...mapWritableState(teamStore, ['team', 'teamVisible']),
    ...mapWritableState(screenStore, ['screens']),
    ...mapWritableState(cardStore, ['routeParams']),
    ...mapWritableState(taskStore, ['taskID', 'step']),
    ...mapWritableState(navStore, [
      'footNavigationList',
      'builtInFeatures',
      'navigationToggle',
      'sideNavigationList',
      'rightNavigationList',
      'mainNavigationList',
    ]),
    m01041 () {
      return this.taskID == 'M0104' && this.step == 1
    },
    m01042 () {
      return this.taskID == 'M0104' && this.step == 2
    },
    // ...mapWritableState(cardStore, ['navigationList', 'routeParams']),

    isMain () {
      return isMain()
    },
    runningScreen () {
      let count = 0
      this.screens.forEach((s) => {
        if (s.running) {
          count++
        }
      })
      return count
    },
  },
  watch: {
    footNavigationList: {
      handler () {
        this.checkScroll()
        // this.$nextTick(()=>{
        //   console.log(this.$refs.content.offsetHeight-this.$refs.content.clientHeight>0)
        //   if(this.$refs.content.offsetHeight-this.$refs.content.clientHeight>0){
        //     this.$refs.content.style.marginTop='17px'
        //   }else{
        //     this.$refs.content.style.marginTop='0px'
        //   }
        // })
      },
      immediate: true,
      deep: true,
    },
    delZone (val) {
      this.delNav = val
    },
    navigationToggle: {
      immediate: true,
      deep: true,
      handler (val) {
        this.leftNav = val[0]
        this.rightNav = val[1]
      },
    },
  },
  methods: {
    ...mapActions(teamStore, ['updateMy']),
    ...mapActions(messageStore, ['getMessageIndex']),
    ...mapActions(navStore, [
      'setFootNavigationList',
      'sortFootNavigationList',
      'removeFootNavigationList',
    ]),
    async toggleTeam () {
      await this.updateMy(0)
      if (this.team.status === false) {
        this.teamKey = Date.now()
        this.showTeamTip = true
      } else {
        this.teamVisible = !this.teamVisible
      }
    },
    closeDrawer () {
      this.menuVisible = false
    },
    checkScroll () {
      // this.$nextTick(() => {
      //   if (this.$refs.content.offsetHeight - this.$refs.content.clientHeight > 0) {
      //     this.$refs.content.style.marginTop = '17px'
      //   } else {
      //     this.$refs.content.style.marginTop = '0px'
      //   }
      // })
    },
    goMy () {
      this.$router.push({ name: 'socialMy' })
    },
    ...mapActions(appStore, ['setUser']),
    setFull (value) {
      this.full = value
    },
    appChange () {
      if (this.showScreen) {
        this.tab = 'screen'
        this.routeParams.url &&
        ipc.send('hideTableApp', {
          app: JSON.parse(JSON.stringify(this.routeParams)),
        })
      } else {
        this.tab = 'apps'
        this.routeParams.url &&
        ipc.send('hideTableApp', {
          app: JSON.parse(JSON.stringify(this.routeParams)),
        })
      }
      this.changeFlag = true
    },
    closeChangeApp () {
      this.routeParams.url &&
      setTimeout(() => {
        this.$router.push({ name: 'app', params: this.routeParams })
      }, 400)
      this.changeFlag = false
    },
    showMenu () {
      this.routeParams.url &&
      ipc.send('hideTableApp', {
        app: JSON.parse(JSON.stringify(this.routeParams)),
      })
      this.menuVisible = true
    },
    hideMenu () {
      this.menuVisible = false
    },
    onClose () {
      this.routeParams.url &&
      this.$router.push({ name: 'app', params: this.routeParams })
      this.menuVisible = false
    },
    editNavigation () {
      this.quick = true
      this.menuVisible = false
    },
    setQuick () {
      this.quick = false
    },

    openSetting () {
      this.$router.push({ name: 'setting' })
      this.hideMenu()
    },
    openStatus () {
      this.hideMenu()
      if (this.$route.path === '/status') {
        this.$router.go(-1)
      } else {
        this.$router.push({ path: '/status' })
      }
    },

    power () {
      this.$router.push({ path: '/power' })
    },
    lock () {
      this.$router.push({ path: '/lock' })
    },
    transFile () {
      //this.visibleTrans=true
      //document.getElementById('transFrame').src='https://szfilehelper.weixin.qq.com/'
      // console.log('发送消息')
      ipc.send('executeAppByPackage', { package: 'com.thisky.fileHelper' })
      this.$router.push({
        name: 'app',
        params: {
          theme: '#2c2c2c',
          name: 'fileHelper',
          url: 'https://szfilehelper.weixin.qq.com/',
          preload: 'fileHelper',
          background: false,
        },
      })
    },
    async setFullScreen () {
      // await tsbApi.window.isFullScreen()
      if (this.full) {
        this.full = false
        tsbApi.window.setFullScreen(false)
      } else {
        this.full = true
        tsbApi.window.setFullScreen(true)
      }
    },

    clickNavigation (item) {
      this.hideMenu()
      switch (item.type) {
        case 'systemApp':
          if (item.event === 'fullscreen') {
            toggleFullScreen()
            this.full = !this.full
          } else if (item.event === '/status') {
            if (this.$route.path === '/status') {
              this.$router.go(-1)
            } else {
              this.$router.push({ path: '/status' })
            }
          } else if (item.data) {
            this.$router.push({
              name: 'app',
              params: item.data,
            })
          } else {
            this.$router.push({ name: item.event })
          }
          break
        case 'coolApp':
          this.$router.push({
            name: 'app',
            params: item.data,
          })
          break
        case 'localApp':
          require('electron').shell.openPath(item.path)
          break
        case 'lightApp':
          ipc.send('executeAppByPackage', { package: item.package })
          break
        default:
          require('electron').shell.openPath(item.path)
      }
    },
    disableDrag () {
      if (this.sortable) {
        document.removeEventListener('click', this.disableDrag)
        this.sortable.destroy()
        this.sortable = null
        message.info('已中止导航栏调整')
      }
    },
    enableDrag () {
      if (this.sortable) {
        return
      }
      document.addEventListener('click', this.disableDrag)
      let that = this
      let drop = document.getElementById('bottomContent')
      this.sortable = Sortable.create(drop, {
        sort: true,
        animation: 150,
        onStart: function (event) {
          let delIcon = document.getElementById('delIcon2')
          that.$emit('getDelIcon', true)
          this.delNav = true
          if (this.delNav) {
            delIcon.ondragover = function (ev) {
              ev.preventDefault()
            }
          }
          delIcon.ondrop = function (ev) {
            let oneNav = that.footNavigationList[event.oldIndex]
            //将要删除的是否是主要功能
            if (!that.mainNavigationList.find((f) => f.name === oneNav.name)) {
              that.removeFootNavigationList(event.oldIndex)
              return
            }
            let sumList = []
            // 判断其他导航栏是否是打开状态，是则获取功能列表
            if (that.leftNav && that.rightNav) {
              sumList = that.sideNavigationList.concat(
                that.rightNavigationList
              )
            } else if (that.leftNav && !that.rightNav) {
              sumList = that.sideNavigationList
            } else if (!that.leftNav && that.rightNav) {
              sumList = that.rightNavigationList
            } else {
              message.info(`导航栏中至少保留一个「${oneNav.name}」`)
              // console.log('不可删除')
              return
            }
            that.delNavigation(
              sumList,
              oneNav,
              event.oldIndex,
              that.removeFootNavigationList
            )
          }
        },
        onUpdate: function (event) {
          let newIndex = event.newIndex,
            oldIndex = event.oldIndex
          let newItem = drop.children[newIndex]
          let oldItem = drop.children[oldIndex]

          // 先删除移动的节点
          drop.removeChild(newItem)
          // 再插入移动的节点到原有节点，还原了移动的操作
          if (newIndex > oldIndex) {
            drop.insertBefore(newItem, oldItem)
          } else {
            drop.insertBefore(newItem, oldItem.nextSibling)
          }
          that.sortFootNavigationList(event)
        },
        onEnd: function (event) {
          that.$emit('getDelIcon', false)
        },
      })
      message.success('开始调整底部栏，点击导航外部即可终止调整。')
    },
    delNavigation (sumList, oneNav, index, delMethod) {
      if (!this.mainNavigationList.find((item) => item.name === oneNav.name)) {
        //如果不是必须的
        delMethod(index)
      } else {
        if (sumList.find((item) => item.name === oneNav.name)) {
          //正常移除
          delMethod(index)
        } else {
          //不可移除
          message.info(`导航栏中至少保留一个「${oneNav.name}」`)
        }
      }
    },
  },
}
</script>
<style></style>
<style lang="scss" scoped>
.bottom-panel {
  :deep(.icon) {
    fill: var(--primary-text);
  }
}

.common-panel {
  margin-bottom: 0;
}

.btn {
  text-align: center;
  margin-right: 24px;
  border-radius: 12px;
  width: 100px;
  height: 100px;
  padding-top: 16px;
  line-height: 30px;
}

.status-text {
  font-size: 1.5em;
  line-height: 3em;
  height: 3em;
  width: 6em;
  text-align: center;
}

.bottom-panel .common-panel {
  padding: 0.2em 1em 0.2em 1em !important;
}

//
//@media screen and (max-height: 510px) {
//  .bottom-panel {
//    zoom:0.9;
//
//  }
//  .chat{
//    display: none;
//  }
//  .user-info{
//    width: 100%;
//  }
//  .user{
//    width: 12.5em;
//  }
//}
//@media screen and (min-height: 511px) and (max-height: 550px) {
//  .bottom-panel{
//    zoom:0.9;
//
//  }
//  .chat{
//    display: none;
//  }
//  .user-info{
//    width: 100%;
//  }
//  .user{
//    width: 12.5em;
//  }
//}
//@media screen and (min-height: 551px) and (max-height: 610px) {
//  .bottom-panel {
//    zoom: 0.9;
//  }
//  .chat{
//    display: none;
//  }
//  .user-info{
//    width: 100%;
//  }
//  .user{
//    width: 12.5em;
//  }
//}

.scroll-content {
  :last-child {
    margin-right: 0;
  }
}
</style>
