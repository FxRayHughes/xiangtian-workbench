
let updaterWindow=null
function loadUpdate(updateInfo){
  updaterWindow= new BrowserWindow({
    parent: mainWindow,
    width: 400,
    height: 530,
    resizable: false,
    visible:false,
    acceptFirstMouse: true,
    webPreferences: {
      //preload: path.join(__dirname, '/pages/update/inde.js'),
      nodeIntegration: true,
      contextIsolation: false,
      additionalArguments: [
        '--user-data-path=' + userDataPath,
        '--app-version=' + app.getVersion(),
        '--app-name=' + app.getName(),
        ...((isDevelopmentMode ? ['--development-mode'] : [])),
      ]
    }
  })
  updaterWindow.setMenu(null)
  updaterWindow.webContents.loadURL('file://' + __dirname + "/pages/update/index.html")
  updaterWindow.on('ready-to-show',()=>{
    updaterWindow.show()
    updaterWindow.webContents.send('getInfo',updateInfo)

  })
  updaterWindow.focus()
}
//app.whenReady().then(()=>loadUpdate())
// 自动检测升级机制
app.whenReady().then(()=>{
  let updateInfo={}
  autoUpdater.checkForUpdates().then((updateInfo)=>{
    //检测到可以升级，则发送升级的信息到updateWindow
    updateInfo={
      version:updateInfo.updateInfo.version,
      releaseDate:updateInfo.updateInfo.releaseDate
    }
  }).catch((err)=>console.log(err))


  autoUpdater.on('update-available',(data)=>{
    updateInfo=data
    console.log(updateInfo)
    sidePanel.get().webContents.send('message', {content:'有新版本可用，系统将在后台自动下载。' })
  })

  // autoUpdater.on('download-progress',(progressObj)=>{
  //   updaterWindow.webContents.send('downloadProgress',progressObj)
  // })

  autoUpdater.on('update-downloaded',(event,releaseEvents,releaseName,releaseDate,updateUrl,quitAndUpdate)=>{
    // ipc.on('updateNow',(e,arg)=>{
    //   autoUpdater.quitAndInstall()
    // })
    console.log('update下载完成')
    loadUpdate(updateInfo)
  })

  ipc.on('startInstall',()=>{
    autoUpdater.quitAndInstall()
  })
  autoUpdater.on("error", (error) => {
    console.log(`升级检测失败: ${error}`)
  });
  // ipc.on('quitAndInstall',(event)=>{
  //   console.log('退出并执行升级')
  //   autoUpdater.quitAndInstall()
  // })
  ipc.on('closeUpdate',()=>{
    updaterWindow.close()
  })

})


