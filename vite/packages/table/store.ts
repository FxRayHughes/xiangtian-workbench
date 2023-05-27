import {defineStore} from "pinia";
import dbStorage from "./store/dbStorage";
import  {sUrl} from './consts'
const userCardUrl=sUrl('/app/com/userCard')
import axios from 'axios'
import {getConfig} from "./js/axios/serverApi";
// @ts-ignore
export const appStore = defineStore('appStore', {
  state: () => ({

    //用户信息卡片
    userCardVisible:false,
    userCardUid:0,
    userCardUserInfo:{
      certification:[]
    },


    userInfo: false,
    lvInfo: {},
    myData: {
      myCircle: [],
      joinedCircle: []
    },


    saving:true,//性能模式

    simple:false,//极简模式
    agreeTest:false,

    init: false, //是否已经初始化

    fullScreen: false, //是否是全屏模式

    settings: {
      transparent:false,//透明背景
      down:{
        enable:false,
        count:100,
        type:'rain'
      },
      houserun:false,//rgb跑马灯
      zoomFactor:100,//缩放比
      openUrlBrowser: 'builtin',//默认打开浏览器
      enableChat: true,//主界面显示聊天
      preventLock: false,//阻止锁屏

      enableBarrage: true, //启用弹幕
      barrage: {
        height: 100, //单个轨道的高度
        limit: 10, //单个屏幕允许的数量
        repeat: 3, //重复次数
        direction: "left",
        browserLink: true, //和浏览器联动
      }, //弹幕设置
      ui: {}, //ui设置
      showButtonTitle: false,
      darkMod: true, //深色模式
      attachScreen: null, //id,bounds
    },

    routeUpdateTime: Date.now(),//用于更新滚动条
    status: {
      music: {//存当前播放的音乐
        notInit: true,
        cover: '',
        title: ''
      }
    },
    backgroundSettings:{
      backGroundImgBlur:0,
      backGroundImgLight:0.3,
    },
    backgroundImage:{
      path:''
    }


  }),
  getters: {},

  actions: {
    async showUserCard(uid,userInfo=null) {
      this.userCardUid = Number(uid)
      if(userInfo){
        //如果存在用户数据，则使用此数据显示卡片
        this.userCardUserInfo=userInfo
        this.userCardVisible = true
      }
      let response  = await this.getUserCard(uid)
      if(response.code===200){
        const data=response.data
        this.userCardUserInfo={
          uid:uid,
          nickname:data.user.nickname,
          avatar:data.user.avatar_128,
          signature:data.user.signature,
          certification:data.user.all_certification_entity_pc||[]
        }
        this.userCardVisible = true
      }
    },

    /**
     * 获取用户小卡片
     * @param uid
     */
    async getUserCard(uid){
      let response = await axios.post(userCardUrl,{uid:uid},await getConfig())
      if(response.data.code===1000){
        return response.data.data
      }
    },

    setBackgroundImage(value){
      this.backgroundImage = value
    },
    setAgreeTest(value){
      this.agreeTest = value
    },
    reset() {
      this.fullScreen = false
    },


    /**
     * 结束新手引导
     */
    finishWizard() {
      this.init = true;
    },

    setMusic(status) {
      this.status.music = status;
      this.status.music.cover = status.cover.replace("34y34", "120y120"); //修正封面
    },

    getUserInfo(){
      ipc.send('getDetailUserInfo')
    },

    /**
     * 设置当前用户
     * @param userInfo
     */
    setUser(userInfo) {
      userInfo.onlineGradeExtra.cumulativeMinutes =Number(userInfo.onlineGradeExtra.minutes) - Number(userInfo.onlineGradeExtra.cumulativeHours) * 60
      userInfo.onlineGradeExtra.cumulativeMinute = userInfo.onlineGradeExtra.minutes
      userInfo.onlineGradeIcons = {}
      userInfo.onlineGradeIcons.crown = []
      userInfo.onlineGradeIcons.sun = []
      userInfo.onlineGradeIcons.moon = []
      userInfo.onlineGradeIcons.star = []

      userInfo.uid=Number(userInfo.uid)
      function handleGrade(name) {
        for (let i = 0; i < userInfo.onlineGrade[name]; i++) {
          userInfo.onlineGradeIcons[name].push({
            icon: 'file://' + window.globalArgs['app-dir_name'] + `/../../icons/grade/${name}.svg`
          })
        }
      }

      Object.keys(userInfo.onlineGrade).forEach(v => handleGrade(v))
      this.userInfo = userInfo
    }
  },
  persist: {
    enabled: true,
    strategies: [{
      // 自定义存储的 key，默认是 store.$id
      // 可以指定任何 extends Storage 的实例，默认是 sessionStorage
      paths:['status','settings','init','agreeTest','backgroundSettings','backgroundImage','saving','simple'],
      storage: dbStorage,
      // state 中的字段名，按组打包储存
    }]
  }
}, {})
