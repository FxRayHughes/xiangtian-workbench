<template>
  <xt-left-menu :list="isFloat" :index="index" last="3" end="2">

    <div class="w-full">
      <router-view ></router-view>
    </div>

    <template #communityFloat>
      <div class="flex flex-col" style="height:500px;width:300px;" v-if="communityNo !== 1">
        <CategoryFloat :communityID="{no:communityNo}" :float="true"></CategoryFloat> 
      </div>
      
    </template>

  </xt-left-menu>

  <teleport to='body'>
    <Modal v-if="open" v-model:visible="open" :blurFlag="true">
      <AddFriend v-if="addIndex === 'launch'" @close="open = false"></AddFriend>
      <CreateGroup v-if="addIndex === 'addGroup'" @close="open = false" :isH5="env.isH5"/>
      <Transfer v-if="addIndex === 'addFriend'" @close="open = false" :isH5="env.isH5"></Transfer>
      <CreateCommunity v-if="addIndex === 'createCom'" @close="open = false"></CreateCommunity>
      <JoinCommunity v-if="addIndex === 'joinCom'" @close="open = false"></JoinCommunity>
    </Modal>
  </teleport>

</template>

<script>
import { defineComponent, reactive, toRefs, onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TUIEnv } from '../../TUIKit/TUIPlugin'
import Drag from '../../TUIKit/TUIComponents/components/drag'
import TUIContact from '../../TUIKit/TUIComponents/container/TUIContact/index.vue'
import SecondPanel from '../../components/SecondPanel.vue'
import { message } from 'ant-design-vue'
// import Commun from './Commun.vue'
import ChatFind from './page/chatFind.vue'
import ChatMain from './page/chatMain.vue'
import CommunityIndex from './page/communityIndex.vue'
import Modal from '../../components/Modal.vue'
import AddFriend from '../../TUIKit/TUIComponents/components/transfer/addFriend.vue'
import CreateGroup from '../../TUIKit/TUIComponents/container/TUISearch/components/createGroup/index.vue'
import Transfer from '../../TUIKit/TUIComponents/components/transfer/index.vue'
import CreateCommunity from './components/createCommunity.vue'
import _ from 'lodash-es'
import config from './config'
import { appStore } from '../../store'
import { storeToRefs } from 'pinia'
import { chatList } from '../../js/data/chatList'
import ChatDropDown from './components/float/chatDropDown.vue'
import ChatFold from './components/float/chatFold.vue'
import JoinCommunity from './components/joinCommunity.vue'
import { AppstoreOutlined, MessageOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { communityStore } from './store/communityStore'
import { localCache } from '../../js/axios/serverCache'
import MyCommunity from './page/communityDetail.vue'
import { Icon as chatIcon } from '@iconify/vue'
import { chatStore } from '../../store/chat'
import CategoryFloat from './components/float/categoryFloat.vue'

export default {
  name: 'App',
  components: {
    AppstoreOutlined, MessageOutlined, LinkOutlined,
    SecondPanel,
    TUIContact, chatIcon,
    Drag,
    ChatFind,
    CommunityIndex,
    ChatMain, Modal,
    AddFriend, CreateGroup,
    Transfer,
    ChatDropDown, ChatFold,
    CreateCommunity, JoinCommunity, MyCommunity,CategoryFloat,
  },

  setup () {
    const myCom = communityStore()
    const router = useRouter()
    const route = useRoute()
    const TUIServer = window.$TUIKit
    const Server = window.$chat
    const chat  = chatStore()

    const data = reactive({
      index: 'chat',
      // type:'chat',
      addIndex: '',
      communityNo:'',
      open: false,
      env: TUIServer.TUIEnv,
      needSearch: !TUIServer.isOfficial,
      TUIServer: Server,
      createConversationType: '',
      community: chatList[0],
      settingsScroller: {
        useBothWheelAxes: true,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true
      },
      info: {},
    })

    const selectTab = async (item) => {
      data.index = item.type
      
      if(item.route.params.no !== 1){
        await myCom.getCategoryData(item.route.params.no)
      }else{
        await myCom.getCategoryData('')
      }

      router.push(item.route)
      
      
    }

    const selectDorpTab = (item) => {
      data.addIndex = item.index
      data.open = true

    }

    const openAddCom = () => {
      data.addIndex = 'createCom'
      data.open = true
    }

    // const selectCommunityTab = (item) => {
    //   console.log('排查问题::>>',item)
    //   router.push(item.route)
    //   // localCache.set('communityId', item.type)
    //   // data.index = item.type
    //   // data.info = item.info
    // }

    const appS = appStore()

    const { userInfo } = appS
    const { communityList } = myCom

    const menuCommunityList = []
    // 遍历将社群进行UI层数据替换
    for (let i = 0; i < communityList.length; i++) {
      if (communityList[i].communityInfo) {
        const item = {
          name: communityList[i].communityInfo.name,
          img: communityList[i].communityInfo.icon,
          type: `community${communityList[i].cno}`,
          float: "",
          tab:'community_'+ communityList[i].communityInfo.no,
          noBg: true,
          callBack:(item)=>{
            selectTab(item)
            data.communityNo = communityList[i].communityInfo.no
          } ,
          route:{ name:'myCommunity',params:{no: communityList[i].communityInfo.no}},
        }
        menuCommunityList.push(item)
      } else {
        console.error('该社群不存在')
      }
    }

    const addCom = (item) => {
      data.addIndex = item.index
      data.open = true
      myCom.getRecommendCommunityList()
    }

    const currentCom = computed(() => {
      return data.index === localCache.get('communityId')
    })

   

    const chatLeftList = ref([
      {
        icon: 'message',
        tab: 'session',
        route: {
          name: 'chatMain',
          params:{no:'',info:JSON.stringify('')}
        },
        callBack: selectTab,
      },
      {
        icon: 'team',
        tab: 'contact',
        callBack: selectTab,
        route: {
          name: 'contact',
          params:{no:'',info:JSON.stringify('')}
        }
      },
      ...(config.adminUids.includes(userInfo.uid) ? [
        {
          icon: 'diannao',
          type: 'admin',
          tab:'admin',
          title: '管理面板(仅管理员可见)',
          callBack: selectTab,
          route: {
            name: 'chatAdmin',
            params:{no:'',info:JSON.stringify('')}
          }
        }
      ] : []),

      {
        icon: 'zhinanzhen',
        type: 'find',
        tab:'find',
        callBack: selectTab,
        route: {
          name: 'chatFind',
          params:{no:'',info:JSON.stringify('')}
        }
      },
      // 写社群相关静态内容时临时打开的路由
      {
        icon: '',
        img: '/icons/logo128.png',
        type: 'community',
        float: "",
        // chat.settings.enableHide ? "communityFloat" : 
        noBg: true,
        callBack: (item)=>{
          selectTab(item)
          data.communityNo=1
        },
        tab:'community',
        route: {
          name: 'defaultCommunity',params:{no:1}
        }
      },

      ...menuCommunityList,

      {
        //  icon:'ic:baseline-add',
        icon: 'tianjia2',
        callBack: openAddCom,
      },
      {
        full: true,
      },
      {
        icon: 'tianjia2',
        children: [
          {
            icon: 'message',
            name: '发起群聊',
            index: 'launch',
            callBack: selectDorpTab
          },
          {
            icon: 'team',
            name: '加入群聊',
            index: 'addGroup',
            callBack: selectDorpTab
          },
          {
            icon: 'tianjiachengyuan',
            name: '添加好友',
            index: 'addFriend',
            callBack: selectDorpTab
          },
          {
            icon: 'smile',
            name: '创建社群',
            index: 'createCom',
            callBack: selectDorpTab
          },
          {
            icon: 'team',
            name: '加入社群',
            index: 'joinCom',
            callBack: addCom,
          }
        ]
      },
    ])

    // 判断是否展开悬浮模式
    const isFloat = computed(()=>{
      // console.log('排查条件',chat.settings.enableHide)
      // return
      if(chat.settings.enableHide){
        const mapList = chatLeftList.value.map((item)=>{
          return {...item,float:item.float === '' ? "communityFloat" : ''}
        })
        // console.log('测试::>>',mapList)
        return mapList
      }else{
        return chatLeftList.value
      }
    });

    // onMounted(() => {
    //   router.push({ name: 'chatMain' })
    // })

    return {
      chatLeftList,  route, router, newArr: menuCommunityList, currentCom,isFloat,
      ...toRefs(data),
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.xt-br) {
  margin-right: 0px !important;
}

.font-16-500 {
  font-family: PingFangSC-Medium;
  font-size: 16px;
  font-weight: 500;
}

.font-14 {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  font-weight: 400;
}


:deep(#tippy-4) {
  z-index: 1000 !important;
  top: 23px !important;
  left: 12px !important;
}

</style>
