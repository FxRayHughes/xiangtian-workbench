import {defineStore} from "pinia";
import * as util from "util";

const tools = window.$models.util.tools
// import _ from 'lodash-es';
// const {appModel, devAppModel} = window.$models
const initSetting = { //存储用户的设置
  name: '',
  theme_color: '',
  theme_colors: {},
  url: '',
  summary: '',
  optimize: {},
  auth: {
    base: {},
    api: {},
    ability: {}
  },
}

const FILTERS = {
  ALL: {
    id: 'all',
    type: 'all',
    text: '所有密码',
    icon: 'AppstoreFilled'
  },
  TAB: {
    id: 'tab',
    type: 'tab',
    text: '当前网站',
    icon: 'AppstoreFilled'
  },
  TAG: {
    id: 'tag',
    type: 'tag',
    text: '标签',
    icon: 'AppstoreFilled'
  },
  COLOR: {
    id: 'color',
    type: 'color',
    text: '颜色',
    icon: 'AppstoreFilled'
  }
}

export const appStore = defineStore('kee', {
  state: () => ({

    filterInfo: { //当前的筛选器
      id: 0,
      type: 'all',
      text: "所有密码",
      icon: 'AppstoreFilled'
    },

    siteCard: {
      isRoot:false,//子站属性
    },


    currentTab: null,
    app: {
      name: '',
      url: '',
      theme_color: '',
      user_theme_color: ''
    },
    user: {
      user_info: {}
    },
    //将点击之后的值进行缓存
    passwordItem: {
      id: 0,
      index: 0,
      title: "禅道账号",
      description: "Francisio_Phillps",
      password: '123456',
      url: "../../../public/img/key_black.svg",
      site_1: 'zt.xaingtian.ren',
      site_2: 'zt.xaingtian.ren'
    },

    currentDb: {
      filePath: '',
      name: '',
      kdbx: {}
    },

    tags: [],//全部标签

    dbList: [],//打开过的密码库

    passwords: [],//全部的密码
    _passwords:[]
  }),
  getters: {
    displayPasswords() {
      this._passwords = this.passwords.map((pwd) => {
        return {
          ...pwd,
          showCopy: false,
          passwordType: 'password',
          icon: '/kee/key_black.svg'
        }
      })
      if (this.filterInfo.type === 'all') {
        return this._passwords
      } else if (this.filterInfo.type === 'tab') {
        let domain = tools.getDomainFromUrl(this.filterInfo.url)
        let rootDomain = tools.getRootDomain(this.filterInfo.url)
        this._passwords=this._passwords.filter(pwd => {
          if (!pwd.domain) {
            return false
          }
          let url = new URL('http://'+pwd.domain)
          if(this.siteCard.isRoot){
            return url.hostname.endsWith('.'+rootDomain) || url.hostname===rootDomain
          }else{
            return url.hostname===domain
          }
        })
      }

      return this._passwords
    }
  },

  actions: {
    /**
     * 设置筛选器
     * @param filterName 筛选器名称
     * @param args 额外的参数，例如site，则需要提交当前的domain
     */
    setFilter(filterName, args) {
      let newFilter = FILTERS[filterName]
      this.filterInfo = Object.assign(this.filterInfo, newFilter)
      this.filterInfo = Object.assign(this.filterInfo, args)
    },
    setDb(dbInfo) {
      this.currentDb = dbInfo
      this.tags = dbInfo.tags
      const manager = kdbxModel.getManager(dbInfo.filePath)
      passwordModel.setPasswordManager(manager)
      this.getAllPasswords()
      if (this.filterInfo.type === 'all') {
        this.filterInfo.text = dbInfo.name
      }
    },
    getAllPasswords() {
      this.passwords = []
      this.passwords = passwordModel.getAllPasswords()
      window.pina = this
    },
    importPasswords(passwords, groupName, existAction) {
      return passwordModel.importPasswords(passwords, groupName, existAction)
    },
    loadCurrentDb() {
      passwordModel.loadCurrent((err, dbInfo) => {
        if (err) {
          console.warn('打开密码库失败')
          return
        }
        if (dbInfo) {
          this.setDb({
            filePath: dbInfo.filePath,
            kdbx: dbInfo.db,
            tags: dbInfo.tags,
            name: dbInfo.name
          })
        }
      })

    },
    loadDbList() {
      let history = localStorage.getItem('bankList')
      if (history) {
        this.dbList = JSON.parse(history)
      }
    },
    saveDbList() {
      localStorage.setItem('bankList', JSON.stringify(this.dbList))
    },
    getTabData() {
      if (window.tabData) {
        this.currentTab = window.tabData
      }
      let timer = setTimeout(() => {
        if (window.tabData) {
          this.currentTab = window.tabData
          clearInterval(timer)
        }
      }, 500)
    }
  }
})

