

const { config } = require('../../server-config')
const tsbSdk = require('../../js/util/tsbSdk')

const ipc = require('electron').ipcRenderer

window.$ipc = ipc
window.$browser = 'tsbrowser'
window.isApp=true
window.tsbSdk=tsbSdk
let href = window.location.href
ipc.on('gotUserInfo',(event,args)=>{
  tsbSdk.send('gotUserInfo',args)//收到侧边栏发来的用户信息，并传消息给应用主界面
})
window.appReady=function(){
  ipc.send('getUserInfo')
  ipc.send('favInit')
}
let timer=null
ipc.on('addPage',()=>{
  if(window.getAddPageInfo){
    window.getAddPageInfo()
    return
  }
  if(!timer){
    timer=setInterval(()=>{
      if(window.getAddPageInfo){
        window.getAddPageInfo()
        clearInterval(timer)
      }else{
        console.log('waiting ready')
      }
    },200)
  }

})//挂载添加页面到收藏夹的回调，去调取回传数据的方法，这个方法来自于添加页面的mounted挂载
