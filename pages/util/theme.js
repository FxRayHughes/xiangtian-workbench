db = require('../../js/util/database').db
/**
 * 壁纸的原始地址
 * @type {string}
 */
const wallUrl='http://d.xiangtian.ren/api/wall/' //壁纸存储的cdn地址

const wallPaper = {
  get: async () => {
    return db.system.get({ name: 'newtabBg' })
  },
  set: async (image) => {
      let newtabBg = await db.system.get({ name: 'newtabBg' })
      const imageUrl=wallUrl+image
      if (!!!newtabBg) {
        db.system.put({ name: 'newtabBg', value: imageUrl })
      } else {
        return db.system.update(newtabBg.id, { name: 'newtabBg', value: imageUrl })
      }
  },
  /**
   * 设置某个元素的背景
   * @param element dom元素
   * @param bg 背景图
   * @returns {boolean}
   */
  setElementBg: (element, bg) => {
    if (!!!bg) {
      //背景不存在
      return false
    }
    element.style = `
                background: url("${bg}") no-repeat;
                background-size:cover;
                background-attachment:fixed;
                `
  },
  /**
   * 获取壁纸的url，自动拼装进起始地址
   * @param name
   * @returns {string}
   */
  getWallPaperUrl:(name)=>{
    return wallUrl+name
  }
}

const themeSetting = {
  /**
   * 获取新标签页卡片透明度
   * @returns {*}
   */
  getNewtabCardOpacity: () => {
    return db.system.get({ name: 'newtabCardOpacity' })
  },
  set: async () => {

  },
  /**
   * 设置新标签页dock的尺寸
   * @returns {*}
   */
  getNewtabDockSize:()=>{
    return db.system.get({name:'newtabDockSize'})
  },
  /**
   * 设置新标签页的dock尺寸，自动存入数据库
   * @param size
   * @returns {Promise<*>}
   */
  setNewtabDockSize:async (size)=>{
    let data = await db.system.get({ name: 'newtabDockSize' })
    if (!!!data) {
      db.system.put({ name: 'newtabDockSize', value: size })
    } else {
      return db.system.update(data.id, { value: size })
    }
  }

}

module.exports = { wallPaper, themeSetting , wallUrl}