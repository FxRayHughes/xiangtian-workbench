import {defineStore} from "pinia";
import {myStore} from '../util.js'
export const appsStore = defineStore('apps', {
  state: () => ({
    myApps:[],
    qingApps:[]
  }),
  actions:{
    loadData(){
      appsStore().$patch(myStore.loadAppData('apps',{
        myApps:[],
        qingApps:[]
      }))
    },

    /**
     * 添加应用
     * @param apps
     */
    addApps(apps) {
      this.myApps = this.myApps.concat(apps)
      //console.log(appsStore())
      //myStore.saveAppData('apps')
    },

    /**
     * 删除应用
     * @param findApp
     */
    deleteApp(findApp){
      try{
        this.myApps.splice( this.myApps.findIndex(app=>{
          return app===findApp
        }),1)
        console.log(appsStore())
       // this.saveAppData('apps')
      }catch (e) {

      }
    }
  },
  persist: {
    enabled: true,
    strategies: [{
      // 自定义存储的 key，默认是 store.$id
      // 可以指定任何 extends Storage 的实例，默认是 sessionStorage
      storage: localStorage,
      // state 中的字段名，按组打包储存
    }]
  }
})
