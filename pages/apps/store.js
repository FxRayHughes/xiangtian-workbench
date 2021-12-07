const userAppsApi = require('../util/api/userAppsApi')
const groupApi = require('../util/api/groupApi')
const store = new Vuex.Store({
  state: {
    //云端用户相关
    appUserNavs: [],
    userNavApps:[],
    //云端团队相关
    myGroups:[]

  },
  getters: {
    getAppUserNavs: state => {
      return state.appUserNavs
    },
    getUserNavApps: state => {
      return state.userNavApps
    },
    getMyGroups: state => {
      return state.myGroups
    }
  },
  mutations: {
    //设置我的云端导航
    SET_APPUSERNAVS: (state, appUserNavs) => {
      state.appUserNavs = appUserNavs
    },
    SET_USERNAVAPPS: (state, userNavApps) => {
      state.userNavApps = userNavApps
    },
    SET_MYGROUPS: (state, myGroups) => {
      state.myGroups = myGroups
    }
  },
  actions: {
    //云端用户相关
    async getAppUserNavs({commit}) {
      const result = await userAppsApi.getAppUserNavs()
      if(result.code === 1000) {
        commit('SET_APPUSERNAVS', result.data)
      }
    },
    async addAppUserNav({commit}, data) {
      return await userAppsApi.addAppUserNav(data)
    },
    async deleteAppUserNav({commit}, data) {
      return await userAppsApi.deleteAppUserNav(data)
    },
    async updateAppUserNav({commit}, data) {
      return await userAppsApi.updateAppUserNav(data)
    },

    async getUserNavApps({commit}, data) {
      const result = await userAppsApi.getUserNavApps(data)
      if(result.code === 1000) {
        commit('SET_USERNAVAPPS', result.data)
      }
    },
    async addUserNavApps({commit}, data) {
      return await userAppsApi.addUserNavApps(data)
    },
    async delUserNavApps({commit}, data) {
      return await userAppsApi.delUserNavApps(data)
    },
    async updateUserNavApps({commit}, data) {
      return await userAppsApi.updateUserNavApps(data)
    },

    //云端团队相关
    async getMyGroups({commit}, data) {
      const result = await groupApi.getGroups()
      if(result.code === 1000) {
        console.log(result, 'list')
        commit('SET_MYGROUPS', result.data)
      }
    }
  }
})

module.exports = store
