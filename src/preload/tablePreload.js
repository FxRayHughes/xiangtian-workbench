const messageModel = require('../model/messageModel')
const api = require('../browserApi/baseApi')
window.tsbApi = require('../browserApi/baseApi')
window.tableApi = require('../tableApi/baseApi')
const groupApi = require('../api/groupApi')
let ipc = require('electron').ipcRenderer
ipc.on('updateMusicStatus', (e, a) => {
  if (window.updateMusicStatusHandler) {
    window.updateMusicStatusHandler(a)
  }
})
window.loudness = require('loudness')
window.iconv = require('iconv-lite')
window.brightness = require('brightness')
window.readAida64 = require('aida64-to-json')
window.fs = require('fs-extra')
const StorageModel=require('../model/storageModel')
window.$models = {
  appModel: require('../model/appModel'),
  messageModel,
  axios: require('axios'),
  nanoid:require('nanoid'),
  fs:require('fs-extra'),
  storageModel:new StorageModel(),
  steamUser:require('steam-user'),
  steamSession:require('steam-session'),
  path:require('path'),
  https:require('https'),
  steamFs:require('fs'),
  rpc:require('../rpc/rpc'),
  electron:require('electron'),
  osUtils:require('node-os-utils'),
  win32:require('hmc-win32')
  // hid:require('node-hid')
}
window.$models.appModel.initDb()
// const win32=require('hmc-win32')
// setInterval(()=>{
//   console.log(win32.getPointWindowName())
// },1000)

window.$models.storageModel.initDb()
window.$apis = {
  groupApi
}
tsbApi.barrage.setOnUrlChanged((a) => {
  if (tsbApi.barrage.urlChangedCallback) {
    tsbApi.barrage.urlChangedCallback(a.url)
    tsbApi.barrage.reload()
  }
})
window.getSerialNum=async () => {
  try{
    // console.log('尝试获取机器码')
    // let s = (await si.diskLayout())[0]
    // console.log(s,'ddd')
    // let serial = {
    //   baseboardSerial: s,
    // }
    // console.log(s)
    let serial=localStorage.getItem('serial')
    if(serial===null){
      //去生成
      serial=tsbApi.runtime.clientId
      let crypto=require('crypto')
      serial=crypto.createHash('sha256').update(JSON.stringify(serial)).digest('hex')
      localStorage.setItem('serial',serial)
    }
    return serial
  }catch (e) {
   console.error(e)
  }

}

