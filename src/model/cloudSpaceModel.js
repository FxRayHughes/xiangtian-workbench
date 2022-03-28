const standReturn = require('../util/standReturn')
const spaceApi = require('../../pages/util/api/spaceApi')
const cloudSpaceModel={
  async addSpace(space,user){
   let result= await spaceApi.addSpace(space.name,user)
   return standReturn.autoReturn(result)
  },
  /**
   * 修改当前的空间
   * @param space
   * @param user
   * @returns {Promise<{data: *, status: number}|{data: *, status: number, info: *}>}
   */
  async changeCurrent (space, user) {
    let result = await spaceApi.change(space.nanoid,user.clientId, user)
    ipc.send('changeSpace',{spaceId:space.nanoid,spaceType:'cloud',userInfo:JSON.parse(JSON.stringify(user))})
    return standReturn.autoReturn(result)
  },
  async getSpace(spaceId,userInfo){
    return await cloudSpaceModel.restore (spaceId, userInfo)
  },
  async getUserSpaces(user){
   let result= await spaceApi.getMySpaceList(user)
   return standReturn.autoReturn(result)
  },
  async save (spaceId, saveData, userInfo) {
    let result = await spaceApi.save(spaceId, saveData,userInfo)
    return standReturn.autoReturn(result)
  },
  async restore (spaceId, userInfo) {
    let result = await spaceApi.restore(spaceId,userInfo)
    return standReturn.autoReturn(result)
  }
}

module.exports=cloudSpaceModel
