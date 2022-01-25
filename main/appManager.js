let forceClose = false
const { config } = require(path.join(__dirname, '//server-config.js'))
/**
 * 运行中的应用窗体，结构{window:窗体对象,saApp:独立窗体app对象}
 * @type {*[]}
 */
let processingAppWindows = []//运行中的应用
function apLog(e) {
  if (0) {
    console.log(e)
  }
}

/**
 * 执行一个应用
 */
app.whenReady().then(() => {
  const appManager = {
    settingWindow: null,
    /**
     * 单个更新app信息
     * @param id
     * @param saApp
     */
    updateSaApp(id, saApp) {
      for (let i = 0; i < processingAppWindows.length; i++) {
        if (processingAppWindows[i].saApp.id === id) {
          processingAppWindows[i].saApp = saApp
          return true
        }
      }
      return false
    },
    /**
     * 聚焦窗体
     * @param windowId
     */
    focusWindow(windowId) {
      processingAppWindows.forEach((item) => {
        if (item.saApp.windowId === windowId) {
          if (!item.window.isVisible()) {
            item.window.show()
          }
          item.window.focus()
        }
      })
    },
    /**
     * 隐藏窗体
     * @param windowId
     */
    hideWindow(windowId) {
      processingAppWindows.forEach((item) => {
        if (item.saApp.windowId === windowId) {
          item.window.hide()
        }
      })
    },
    toggleAppWindowVisible(appId) {
      let appWindow = appManager.getWindowByAppId(appId)
      if (appWindow.isVisible()) {
        appWindow.hide()
      } else {
        appWindow.show()
        appWindow.focus()
      }
    },
    /**
     * 隐藏窗体
     * @param appId
     */
    hideAppWindow(appId) {
      appManager.getWindowByAppId(appId).hide()
    },
    /**
     * 隐藏窗体
     * @param appId
     */
    showAppWindow(appId) {
      appManager.getWindowByAppId(appId).show()
      appManager.getWindowByAppId(appId).focus()
    },
    /**
     * 获得app运行状态
     * @param saAppId appId
     * @returns {boolean}
     */
    isAppProcessing(saAppId) {
      let processing = false
      processingAppWindows.forEach((item) => {
        if (item.saApp.id === saAppId) {
          processing = !item.window.isDestroyed()
        }
      })
      return processing
    },
    /**
     * 移除appWindow
     * @param saAppWindowId 窗体id,这里不适用appid，因为未来可能是多开窗体的
     */
    removeAppWindow(saAppWindowId) {
      for (let i = 0; i < processingAppWindows.length; i++) {
        if (processingAppWindows[i].saApp.windowId === saAppWindowId) {
          processingAppWindows.splice(i, 1)
        }

      }
    },
    /**
     * 设置原始app的设置，这里不考虑main中应用状态，还需要自行更新main的设置
     * @param saAppId
     * @param settings
     */
    setOriginAppSettings(saAppId, settings) {
      SidePanel.send('updateSetting', {id: saAppId, settings: settings})
    },
    /**
     * 设置应用的设置，如果应用已存在，则会自动更新main中存储的设置，如果不存在，则直接调取originAppSetting，仅发送ipc去更新设置
     * @param saAppId 应用id
     * @param settings 应用设置，一个对象，类似{isAlwaysHide:true,runAtStart:true} 参考开发文档
     */
    setAppSettings(saAppId, settings = []) {
      let saApp = appManager.getSaAppByAppId(saAppId)
      if (saApp) {
        appManager.setOriginAppSettings(saAppId, settings)
        saApp.settings = Object.assign(saApp.settings, settings)
        appManager.updateSaApp(saAppId, saApp)
      } else {
        appManager.setOriginAppSettings(saAppId, settings)
      }
    },
    /**
     * 获取应用设置
     * @param saAppId 应用id
     * @param settingName 设置名称
     * @returns {*}
     */
    getAppSettings(saAppId, settingName) {
      for (let i = 0; i < processingAppWindows.length; i++) {
        if (processingAppWindows[i].saApp.id === saAppId) {
          return processingAppWindows[i].saApp.settings[settingName]
        }

      }
    },
    /**
     * 通过窗体获得saApp实体
     * @returns {*}
     */
    getSaAppByWindowId(saAppWindowId) {
      for (let i = 0; i < processingAppWindows.length; i++) {
        if (processingAppWindows[i].saApp.windowId === saAppWindowId) {
          return processingAppWindows[i]
        }
      }
    },
    /**
     * 通过WindowId获得对应索引
     * @returns {number}
     */
    getIndexByWindowId(saAppWindowId) {
      for (let i = 0; i < processingAppWindows.length; i++) {
        if (processingAppWindows[i].saApp.windowId === saAppWindowId) {
          return i
        }
      }
    },
    /**
     * 获取saApp信息，通过appid
     * @param appId
     * @returns {*}
     */
    getSaAppByAppId(appId) {
      for (let i = 0; i < processingAppWindows.length; i++) {
        if (processingAppWindows[i].saApp.id === appId) {
          return processingAppWindows[i].saApp
        }
      }
    },
    getWindowByAppId(appId) {
      for (let i = 0; i < processingAppWindows.length; i++) {
        if (processingAppWindows[i].saApp.id === appId) {
          return processingAppWindows[i].window
        }
      }
      return null
    },
    async getAppRunningInfo(id) {
      let saApp = appManager.getSaAppByAppId(id)
      if (!!!saApp) {
        return //如果不存在这个saApp
      }
      let capture = await appManager.capture(saApp.windowId)
      let memoryUsage = appManager.memoryUsageInfo(saApp.windowId)
      let info = {
        'capture': capture,
        'memoryUsage': memoryUsage
      }
      return info
    },
    /**
     * 获取应用内存信息
     * @param saAppWindowId
     */
    memoryUsageInfo(saAppWindowId) {
      let saApp = appManager.getSaAppByWindowId(saAppWindowId)
      let appWindow = saApp.window //窗体
      let memoryInfo = {}
      let allMetrics = app.getAppMetrics() //全局内存统计
      /*
      *[
[1]   {
[1]     cpu: { percentCPUUsage: 0, idleWakeupsPerSecond: 0 },
[1]     pid: 82207,
[1]     type: 'Browser',
[1]     creationTime: 1642407867658.929,
[1]     memory: { workingSetSize: 173120, peakWorkingSetSize: 173120 },
[1]     sandboxed: false
[1]   },
* https://www.electronjs.org/zh/docs/latest/api/structures/process-metric
* */
      let pid = appWindow.webContents.getOSProcessId()
      allMetrics.forEach((met) => {
        if (met.pid === pid) {
          memoryInfo = met
        }
      })
      return memoryInfo
    },
    /**
     * 通过windowId给APP截图
     * @param saAppWindowId
     */
    async capture(saAppWindowId) {
      let saApp = appManager.getSaAppByWindowId(saAppWindowId)
      if (saApp.window.isDestroyed()) {
        return
      }
      let capturedImage = await saApp.window.view.webContents.capturePage()
      if (!fs.existsSync(userDataPath + '/app')) {
        fs.mkdirSync(userDataPath + '/app')
      }
      let imagePath = path.resolve(userDataPath + '/app/screen' + saApp.saApp.id + '.jpg')
      try {
        fs.writeFileSync(imagePath, capturedImage.toJPEG(50))
      } catch (err) {
        return false
      }
      return imagePath
    },
    openSetting(appId) {
      function loadSettingWindow(appId) {
        appManager.settingWindow = new BrowserWindow({
          width: 800,
          height: 800,
          acceptFirstMouse: true,
          alwaysOnTop: true,
          webPreferences: {
            //preload: __dirname+'/pages/saApp/settingPreload.js',
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            sandbox: false,
            safeDialogs: false,
            safeDialogsMessage: false,
            partition: null,
            additionalArguments: [
              '--user-data-path=' + userDataPath,
              '--app-version=' + app.getVersion(),
              '--app-name=' + app.getName(),
              '--app-id=' + appId
            ]
          }
        })
        appManager.settingWindow.setMenu(null)
        appManager.settingWindow.webContents.loadURL('file://' + __dirname + '/pages/saApp/setting.html')
        if (isDevelopmentMode)
          appManager.settingWindow.webContents.openDevTools()
        appManager.settingWindow.on('close', () => {
          appManager.settingWindow = null
        })
      }

      if (appManager.settingWindow === null) {
        loadSettingWindow(appId)
      } else {
        if (!appManager.settingWindow.isDestroyed()) {
          appManager.settingWindow.close()
          loadSettingWindow(appId)
        }
      }

    },
    /**
     * 关闭并删除应用
     * @param appId
     */
    deleteApp(appId) {
      appManager.closeApp(appId)
      setTimeout(() => {
        SidePanel.send('deleteApp', {id: appId})
      }, 1000)
    },
    closeApp(appId) {
      let window = appManager.getWindowByAppId(appId)
      let saApp = appManager.getSaAppByAppId(appId)
      if (window && !window.isDestroyed()) {
        window.destroy()
        appManager.removeAppWindow(saApp.windowId)
        SidePanel.send('closeApp', {id: appId})
      }
    },
    loadView(saApp,appWindow){
      let webPreferences = {
        preload: saApp.isSystemApp ? path.join(__dirname, saApp.preload) : null,
        nodeIntegration: saApp.isSystemApp,
        contextIsolation: !saApp.isSystemApp,
        enableRemoteModule: saApp.isSystemApp,
        sandbox: !saApp.isSystemApp,
        safeDialogs: false,
        backgroundColor:'white',
        safeDialogsMessage: false,
        partition: saApp.isSystemApp ? null : 'persist:webcontent',
        additionalArguments: [
          '--user-data-path=' + userDataPath,
          '--app-version=' + app.getVersion(),
          '--app-name=' + app.getName(),
          ...((isDevelopmentMode ? ['--development-mode'] : [])),
        ]
      }
      console.log(webPreferences)
      let appView = new BrowserView({
        width: saApp.settings.bounds.width,
        height: saApp.settings.bounds.height - 70, webPreferences: webPreferences
      })
      /**
       * 在dev模式下，group引用开发环境
       */
      if(saApp.package==='com.thisky.group' && isDevelopmentMode){
        saApp.url=config.IM.FRONT_URL + config.IM.AUTO_LOGIN
      }
      if (saApp.type === 'local') {
        appView.webContents.loadURL('file://' + path.join(__dirname, saApp.url))
      } else {
        appView.webContents.loadURL(saApp.url)
      }
      appView.webContents.on('did-navigate-in-page', (event, url) => {
        appWindow.webContents.send('updateView', {
          url: url,
          canGoBack: appView.webContents.canGoBack(),
          canGoForward: appView.webContents.canGoForward()
        })
      })
      appView.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        appView.webContents.loadURL(url)
        appWindow.webContents.send('updateView', {
          url: url,
          canGoBack: appView.webContents.canGoBack(),
          canGoForward: appView.webContents.canGoForward()
        })
      })
      return appView

    },
    /**
     * 执行应用
     * @param saApp 一个应用实体
     * @param background 是否后台运行，是则运行后不显示
     */
    executeApp(saApp, background = false) {
      saApp.isSystemApp = saApp.id < 10 //todo 加入更加安全的系统应用判断方式
      if (1) {
        //todo 判断一下是不是独立窗体模式
        let appWindow = new BrowserWindow({
          width: 800,
          height: 600,
          minWidth:360,
          show: !background,
          frame:false,
          acceptFirstMouse: true,
          trafficLightPosition: {
            x: 12,
            y: 14
          },
          titleBarStyle: 'hidden',
          alwaysOnTop: saApp.settings.alwaysTop,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
            partition: null,
            additionalArguments: [
              '--user-data-path=' + userDataPath,
              '--app-version=' + app.getVersion(),
              '--app-name=' + app.getName(),
              ...((isDevelopmentMode ? ['--development-mode'] : [])),
            ]
          }
        })

        saApp.windowId = appWindow.webContents.id

        //appWindow.setMenu(null)

          appWindow.webContents.loadURL('file://' + path.join(__dirname + '/pages/saApp/index.html'))
          appWindow.on('ready-to-show',()=>{
            appWindow.webContents.send('init', {
              url: saApp.url,
              id: saApp.id,
              title: saApp.name,
              windowId: saApp.windowId,
              app:saApp
            })
            if (isDevelopmentMode) {
              appWindow.webContents.openDevTools()
            }
          })

        appWindow.setBounds(saApp.settings.bounds)
        // if (process.platform !== 'darwin') {
        //   appWindow.setMenuBarVisibility(false)
        // }
        let appView=appManager.loadView(saApp,appWindow)
        appWindow.setBrowserView(appView)

        appView.setBounds({
          x: 0,
          y: 40,
          width: appWindow.getBounds().width,
          height: appWindow.getBounds().height - 40
        })
        // appWindow.webContents.on('ipc-message', function (e, channel, data) {
        //   mainWindow.webContents.send('view-ipc', {
        //     name: channel,
        //     data: data,
        //     frameId: e.frameId
        //   })
        // })
        SidePanel.send('executedAppSuccess', {app: saApp})
        appWindow.on('moved', (event, args) => {
          appManager.setAppSettings(saApp.id, {bounds: appWindow.getBounds()})
        })
        appWindow.on('resize', (event, args) => {
          appManager.setAppSettings(saApp.id, {bounds: appWindow.getBounds()})
          appView.setBounds({
            x: 0,
            y: 40,
            width: appWindow.getBounds().width,
            height: appWindow.getBounds().height - 40
          })
        })
        appWindow.on('ready-to-show', (event) => {
          //连续4秒都获取一次截图，保障能够截取到最新的图
          appManager.capture(saApp.windowId)
          setTimeout(() => {
            if (!appWindow.isDestroyed())
              appManager.capture(saApp.windowId)
          }, 2000)
          setTimeout(() => {
            if (!appWindow.isDestroyed())
              appManager.capture(saApp.windowId)
          }, 3000)
          setTimeout(() => {
            if (!appWindow.isDestroyed())
              appManager.capture(saApp.windowId)
          }, 4000)
        })
        appWindow.on('blur', async (event) => {
          SidePanel.send('updateRunningInfo', {id: saApp.id, 'info': await appManager.getAppRunningInfo(saApp.id)})
        })
        /**
         * 只允许通过关闭按钮隐藏，而不是彻底关闭
         */
        appWindow.on('enter-full-screen',()=>{
          appWindow.webContents.send('enter-full-screen')
        })
        appWindow.on('leave-full-screen',()=>{
          appWindow.webContents.send('leave-full-screen')
        })

        appWindow.on('maximize',()=>{
          appWindow.webContents.send('maximize')
        })
        appWindow.on('unmaximize',()=>{
          appWindow.webContents.send('unmaximize')
        })
        appWindow.on('close', (event, args) => {
          if (!forceClose) {
            appManager.hideWindow(saApp.windowId)
            event.preventDefault()
          } else {
            appManager.closeApp(saApp.id)
          }

          // const result = dialog.showMessageBoxSync({
          //   type: 'none',
          //   buttons: ['取消','退出', '隐藏[不再询问]'],
          //   message: '退出后无法接受消息提醒,请注意!',
          //   cancelId: 0,
          //   defaultId: 2,
          //   noLink: true
          // })
          // if(result === 0 ) {
          //   apLog('阻止隐藏')
          //   event.preventDefault()
          //   return
          // } else if(result === 2) {
          //   event.preventDefault()
          //   apLog('设置设置,true')
          //   appManager.setAppSettings(saApp.id,{'alwaysHide':true})//alwaysHide = true
          //
          //   //groupIMWindow.hide()
          // } else {
          //   appManager.closeApp(saApp.id)
          //   //alwaysHide = false
          //   apLog('设置设置false')
          //   appManager.setAppSettings(saApp.id,{'alwaysHide':false})
          // }

        })
        appWindow.view=appView
        processingAppWindows.push({
          window: appWindow,//在本地的对象中插入window对象，方便后续操作
          saApp: saApp
        })
      } else {
        //todo intab模式，在主窗体某个标签内
      }
    }
  }

  setTimeout(() => {
    SidePanel.send('runAutoRunApps')
  }, 2000)


  ipc.on('executeApp', (event, args) => {
    let saApp = args.app
    if (!!!saApp.processing) {
      //首先必须是没运行的
      if (!appManager.isAppProcessing(saApp.id)) {
        appManager.executeApp(saApp, args.background)
      }
    } else {
      //todo 判断是多例还是单例
      if (1) {//是单例
        appManager.focusWindow(saApp.windowId)
      }
    }
  })
  ipc.on(ipcMessageMain.saApps.createAppMenu, (event, args) => {
    let appId = args.id
    let saApp = appManager.getSaAppByAppId(appId)
    let appWindow = appManager.getWindowByAppId(appId)
    let template = [
      {
        label: '选项',
        submenu: [{
          type: 'checkbox',
          checked: args.app.settings['alwaysTop'],
          label: '窗口置顶',
          click() {
            if (args.app.settings['alwaysTop']) {
              appManager.setAppSettings(appId, {
                'alwaysTop': false
              })
              if (appWindow && !appWindow.isDestroyed()) {
                appWindow.setAlwaysOnTop(false)
              }
            } else {
              appManager.setAppSettings(appId, {
                'alwaysTop': true
              })
              if (appWindow && !appWindow.isDestroyed()) {
                appWindow.setAlwaysOnTop(true)
              }
            }
          }
        },
          {
            type: 'checkbox',
            checked: args.app.settings['showInSideBar'],
            label: '在左侧栏保留',
            click() {
              if (args.app.settings['showInSideBar']) {
                appManager.setAppSettings(appId, {
                  'showInSideBar': false
                })
                //todo 更新左侧栏
              } else {
                appManager.setAppSettings(appId, {
                  'showInSideBar': true
                })
                //todo 在左侧栏显示
              }
            }
          },
          {
            checked: args.app.settings['autoRun'],
            type: 'checkbox',
            label: '打开浏览器时运行',
            click() {
              if (args.app.settings['autoRun']) {
                appManager.setAppSettings(appId, {
                  'autoRun': false
                })
              } else {
                appManager.setAppSettings(appId, {
                  'autoRun': true
                })
              }
            }
          },
          // {
          //   type: 'separator'
          // },
          // {
          //   label:'发送到当前桌面'
          // }
        ]

      },
      {
        label: '设置',
        click() {
          appManager.openSetting(appId)
        }
      }
    ]

    if (appWindow) {
      if (!appWindow.isDestroyed()) {
        template.unshift(
          {
            type: 'checkbox',
            checked: appWindow.isVisible(),
            label: saApp.name,
            click() {
              appManager.toggleAppWindowVisible(appId)
            }
          }, {
            type: 'separator'
          }
        )

      }
      if (appWindow.isVisible()) {
        template.push({
          label: '隐藏',
          click() {
            appManager.hideAppWindow(appId)
          }
        })
      } else {
        template.push({
          label: '显示',
          click() {
            appManager.showAppWindow(appId)
          }
        })
      }
      if (!appWindow.isDestroyed()) {
        template.push({
          label: '退出',
          click() {
            appManager.closeApp(appId)
          }
        })
      }
    } else {
      template.push({
        label: '打开',
        click() {
          appManager.executeApp(args.app)
        }
      })
    }
    let menu = require('electron').Menu.buildFromTemplate(template)

    menu.popup()
  })
  ipc.on(ipcMessageMain.saApps.openSetting, (event, args) => {
    appManager.openSetting(args.id)
  })
  ipc.on('closeApp', (event, args) => {
    appManager.closeApp(args.id)
  })
  ipc.on('getAppRunningInfo', async (event, args) => {
    SidePanel.send('updateRunningInfo', {id: args.id, 'info': await appManager.getAppRunningInfo(args.id)})
  })
  /**
   * 获取并更新一个app的截图
   */
  ipc.on('getAppCapture', (event, args) => {
    let saApp = appManager.getSaAppByAppId(args.id)
    if (!!!saApp) {
      return //如果不存在这个saApp
    }
    let image = appManager.capture(saApp.windowId)
    if (!!image)
      SidePanel.send('updateAppCapture', {id: saApp.saApp.id, captureSrc: image})
  })
  /**
   * 获取到全部正在运行的app清单
   */
  ipc.on('getRunningApps', (event, args) => {
    let runningApps = []
    let windows = []
    processingAppWindows.forEach(window => {
      runningApps.push(window.saApp.id)
      windows.push(window.saApp.windowId)
    })
    SidePanel.send('updateRunningApps', {runningApps: runningApps, windows: windows})
  })
  ipc.on(ipcMessageMain.saApps.deleteApp, (event, args) => {
    let appId = args.id
    appManager.settingWindow.close()
    appManager.deleteApp(appId)
  })


  ipc.on(ipcMessageMain.saApps.installApp, (event, args) => {
    SidePanel.send('installApp', {id: args.id})
  })
  /**
   * 应用关闭前，将所有开启的窗体销毁掉
   */
  app.on('before-quit', () => {
    forceClose = true
    processingAppWindows.forEach((item) => {
      if (!item.window.isDestroyed()) {
        item.window.destroy()
      }
    })
  })


  ipc.handle('minimizeAppWindow',(event,args)=>{
    console.log(args.id)
    appManager.getWindowByAppId(args.id).minimize()
  })
  ipc.handle('closeAppWindow',(event,args)=>{
    appManager.getWindowByAppId(args.id).close()
  })
  ipc.handle('unmaximizeAppWindow',(event,args)=>{
    appManager.getWindowByAppId(args.id).unmaximize()
  })
  ipc.handle('maximizeAppWindow',(event,args)=>{
    appManager.getWindowByAppId(args.id).maximize()
  })
  ipc.handle('setFullScreenAppWindow',(event,args)=>{
    appManager.getWindowByAppId(args.id).setFullScreen(args.flag)

  })

  ipc.on('saAppGoBack', (event, args) => {
    appManager.getWindowByAppId(args.id).view.webContents.goBack()
  })

  ipc.on('saAppGoForward', (event, args) => {
    appManager.getWindowByAppId(args.id).view.webContents.goForward()
  })

  ipc.on('saAppRefresh', (event, args) => {
    appManager.getWindowByAppId(args.id).view.webContents.reload()
  })
})