
window.tsbApi=require('../browserApi/baseApi')
let ipc=require('electron').ipcRenderer
ipc.on('updateMusicStatus',(e,a)=>{
  if(window.updateMusicStatusHandler){
    window.updateMusicStatusHandler(a)
  }
})