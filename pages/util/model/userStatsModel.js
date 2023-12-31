const db = require('../../../js/util/database.js').db

const userStatsModel = {
  async initialize() {
    const result = await db.userStats.count()
    if(result === 0) {
      await userStatsModel.init()
    }
  },

  /**
   * 返回id主键为1的值
   * @param {Number} id
   * @returns
   */
  async get(id) {
    await userStatsModel.setLocalApp()
    return await db.userStats.get(id)
  },


  async setLocalApp() {
    const appListRes = await db.appList.count()
    const myAppsRes = await db.myApps.count()
    await userStatsModel.setValue('appList', appListRes)
    await userStatsModel.setValue('myApps', myAppsRes)
  },

  /**
   * userStatsModel对象属性值方法
   * @param {String} fieldName 设置的对象属性名
   * @param {Number} val 设置的对象属性值
   */
  async setValue(fieldName, val) {
    // await db.userStats.where(fieldName).first().modify({
    //   value: val
    // })
    const obj = {}
    obj[`${fieldName}`] = val
    await db.userStats.update(1, obj)
  },

  /**
   * userStatsModel对象属性值+1
   * @param {String} fieldName 设置的对象属性名
   */
  async incrementValue(fieldName) {
    const result = await db.userStats.get(1)
    result[`${fieldName}`] += 1
    await db.userStats.put(result, 1)
  },

  /**
   * userStatsModel对象属性值-1
   * @param {String} fieldName 设置的对象属性名
   */
  async decreseValue(fieldName) {
    const result = await db.userStats.get(1)
    result[`${fieldName}`] -= 1
    await db.userStats.put(result, 1)
  },

  /**
   * 获取此次统计的使用时间
   * @returns 返回时间数，毫秒级
   */
  async getUseTime() {
    const result = await db.userStats.get(1)
    return Date.now() - result.startTime
  },

  async init() {
    const obj = {
      scripts: 0, //mark插入对scripts的数据统计
      apps: 0,  //mark插入对apps的数据统计
      appsExecutedCounts: 0,  //mark插入对appsExecutedCounts的数据统计
      blockAds: 0,    //mark插入对blockAds的数据统计
      tasks: 0,       //mark插入对tasks的数据统计，统计放在了sidebar里
      tabs: 0,        //mark插入对tabs的数据统计，统计放在了sidebar里
      webviewsInk: 0,  //mark插入对webviewInk的数据统计
      password: 0,     //mark插入对password的数据统计
      defaultBrowser: 0,  //mark插入对defaultBrowser的数据统计
      searchCounts: 0,    //mark插入对searchCounts的数据统计
      translateCounts: 0,  //mark插入对translateCounts翻译接口调用次数的数据统计
      appList: 0, //dexie本地导航列表数
      myApps: 0, //dexie本地导航应用app数
      startTime: Date.now()  //此次统计开始的时间
    }
    await db.userStats.put(obj)
  },

  /**
   * 重置userStatsModel对象属性
   */
  async reset() {
    const obj = {
      scripts: 0,
      apps: 0,
      appsExecutedCounts: 0,
      blockAds: 0,
      tasks: 0,
      tabs: 0,
      webviewsInk: 0,
      password: 0,
      defaultBrowser: 0,
      searchCounts: 0,
      translateCounts: 0,
      appList: 0,
      myApps: 0,
      startTime: Date.now()
    }
    await db.userStats.update(1, obj)
  }
}


module.exports = userStatsModel
