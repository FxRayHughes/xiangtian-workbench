let sidePanel = null //SidePanel类的存储变量
/**
 * 是否是win11
 */
function debounce(fn, delay) {
  let time = null;//time用来控制事件的触发
  return function () {
    if (time !== null) {
      clearTimeout(time);
    }
    time = setTimeout(() => {
      fn.call(this);
      //利用call(),让this的指针从指向window 转成指向input
    }, delay)
  }
}

function isWin11 () {
  const sysVersion = process.getSystemVersion()
  return sysVersion.startsWith('10.') && process.platform === 'win32'
}

function log (info) {
  //console.log(info)
}

/**
 * 是否是Mac
 */
function isMac () {
  return process.platform === 'darwin'
}

/**
 * 是否是windows
 */
function isWin () {
  return process.platform === 'win32'
}

global.SidePanel=class SidePanel {
  _sidePanel = null //sidePanelWindow的实例
  titlebarHeight = 20
  panelWidth = 800
  mainViewBounds = null
  isStandalone = false //是否是独立
  constructor () {
    //this.mainViewBounds = mainWindow.getBounds()
  }

  /**
   * 返回sidePanel实例
   */
  static getSidePanel () {
    if (SidePanel.alive()) {
      return sidePanel.get()
    } else {
      return null
    }
  }

  //判断是否存在sidebar
  static alive () {
    if (sidePanel == null || typeof (sidePanel) == 'undefined') {
      return false
    } else if (typeof (sidePanel._sidePanel) == 'undefined') {
      return false
    } else if (sidePanel.isDestroyed()) {
      return false
    }
    return true
  }

  static send (channel, args) {
    if (SidePanel.alive()) {
      sidePanel.get().webContents.send(channel, args)
    }
  }

  //mainWindow往webview子进程发送消息的方法
  static mainWindowSend (eventName, args) {
    if (SidePanel.alive()) {
      mainWindow.webContents.send(eventName, args)
    }
  }

  isVisible () {
    return this._sidePanel.isVisible()
  }

  isDestroyed () {
    if (this._sidePanel == null || typeof (this._sidePanel) == 'undefined')
      return true
    return this._sidePanel.isDestroyed()
  }

  /**
   * 初始化sidePanel并载入、设置好位置
   */
  init () {
    this._sidePanel = new BrowserWindow({
      transparent: true,
      frame: false,
      parent: mainWindow,
      hasShadow: false,
      width: 0,
      height: 0,
      resizable: false,
      acceptFirstMouse: true,
      roundedCorners: false,
      visualEffectState: 'active',
      webPreferences: {
        preload: path.join(__dirname, '/pages/sidebar/sidebarPreload.js'),
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
    // if (process.platform == 'win32') {
    // 	this.titlebarHeight = 48
    // }
    this._sidePanel.webContents.loadURL('file://' + __dirname + '/pages/sidebar/sidebar.html')

    this.syncBounds()
    this._sidePanel.on('ready-to-show', () => {
      checkUpdate()
      let layout= settings.get('layout') || 'max'
      SidePanel.send('adjustSidePanel',layout)
    })

    this._sidePanel.on('close', function () {
      log('sidebar-close:左侧栏隐藏')
    })

    this._sidePanel.on('show', function () {
      log('sidebar-show:左侧栏显示')
    })
    this._sidePanel.on('hide', function () {
      log('sidebar-hide:左侧栏隐藏')
    })
    sidePanel = this

    this._sidePanel.on('blur', () => {
      this._sidePanel.webContents.send('blur')
    })
  }

  /**
   * 获得实例
   */
  get () {
    return this._sidePanel
  }

  syncBounds(){
    sendIPCToMainWindow('getSidePanelPos')
  }
  /**
   * 获取一下mainWindow的位置信息并同步一下sidePanel，不包含焦点处理
   */
  syncSize (resetY = 0) {
    this.syncBounds()
    // if (!SidePanel.alive()) return
    // if (mainWindow == null || sidePanel == null) {
    //   return
    // }
    // if (!mainWindow.isVisible()) {
    //   //如果mainWindow本身不可见，则不做吸附操作
    //   return
    // }
    // this.bounds = mainWindow.getBounds()
    // //windows全屏模式单独处理
    // if (mainWindow.isMaximized() && isWin()) {
    //   //win上x和y在全屏下不为0，甚至为-8，目前未考虑win7
    //   if (this.bounds.x < 0) this.bounds.x = this.bounds.x+8
    //   if (this.bounds.y < 0) {
    //     this.bounds.y = this.bounds.y+8
    //   }
    //   if (settings.get('useSeparateTitlebar')) {
    //     this.bounds.y += 23
    //     this.bounds.height -= 40
    //   } else {
    //     if (isWin11()) {
    //       this.bounds.height -= 15 //单独对win11的标题栏高度进行兼容
    //     } else {
    //       this.bounds.height -= 20
    //     }
    //   }
    // }
    //
    // let setX = this.bounds.x
    // let setY = !resetY ? this.bounds.y + this.titlebarHeight : this.bounds.y + resetY
    // let setHeight = this.bounds.height - this.titlebarHeight
    // if (isWin11()) {
    //   //win11的高度不一致
    //   setX += 1
    //   setHeight -= 1
    // }
    // if (isWin()) {
    //   setHeight += 2
    //   setX -= 1
    //   if (process.getSystemVersion().startsWith('6.1')) {//win7少也要少一个像素
    //     setHeight -= 1
    //   }
    //   if(process.getSystemVersion().startsWith('10.')){
    //     setHeight+=1
    //     setX-=1
    //   }
    // }
    // if (isWin11()) {
    //   //win11要少一个像素
    //   setHeight -= 2
    //   setX += 1
    // }
    // this._sidePanel.setBounds({
    //   x: setX,
    //   y: setY,
    //   width: this.bounds.width,
    //   height: setHeight
    // }, false)
  }

  setTop () {
    // if (SidePanel.alive())
    // 	this._sidePanel.setAlwaysOnTop(true, 'status')
  }

  unsetTop () {
    // if (SidePanel.alive())
    // 	this._sidePanel.setAlwaysOnTop(false)
  }

  /**
   * 挂载全部的mainWindow事件以修正sidebar的位置
   */



  show () {
    if (SidePanel.alive()) {
      if (!this._sidePanel.isVisible() && this._sidePanel != null) {
        log('调用sidebar.show()侧边栏')
        this._sidePanel.show()
      }
    }

  }

  hide () {
    if (SidePanel.alive()) {
      log('调用sidebar.hide()侧边栏')
      this._sidePanel.hide()
    }
  }

  focus () {
    if (SidePanel.alive()) {
      log('调用sidebar.focus()侧边栏')
      this._sidePanel.focus()
    }
  }

  setIgnoreMouseEvents (args) {
    if (SidePanel.alive()) {
      this._sidePanel.setIgnoreMouseEvents(args)
    }
  }

  close () {
    log('调用sidebar.close()主动close')
    this._sidePanel.destroy()
    this._sidePanel = null
  }

  addItem (item) {

    let defaultItem = {
      title: '', //名称，用于显示提示
      name: '',
      index: 0, //索引组
      id: 0, //任务id
      icon: '', //图标
      draggable: true, //是否允许拖拽
      ext: '', //额外的信息，如果是任务则放任务id
      fixed: false,
      type: 'task', //task fav
      tabs: [], //初始化的时候必要用于展示的有就行了，其他的会自动同步过去
      count: 0
    }

    let addItem = Object.assign({}, defaultItem, item)

    if (this._sidePanel != null) {
      this._sidePanel.webContents.send('addItem', {
        item: addItem
      })
      log(addItem)
    }

  }

  // syncTitleBar () {
  //   sendIPCToWindow(mainWindow, 'getTitlebarHeight')
  // }

  /**
   * 设置左侧栏位置
   * @param pos
   */
  setPos(pos){
    if(mainWindow){
      let parentBounds=mainWindow.getBounds()
      if(mainWindow.isMaximized() && isWin()){
        let fixBounds=require('electron').screen.getDisplayMatching(parentBounds).bounds //取出主屏幕所在屏幕的坐标
        //重新设置为主窗口所在屏幕的起始点
        parentBounds.x=fixBounds.x
        parentBounds.y=fixBounds.y
      }
      let bounds={
        x:0,
        y:0,
        height:0,
        width:0
      }
      bounds.x=parentBounds.x
      bounds.y=pos.clientY+parentBounds.y
      bounds.width=pos.width===0?0:parentBounds.width
      bounds.height=pos.height
      if(sidePanelState!=='min'){
        //如果此处不做判断，则导致极简模式下卡死
        debounce(()=>{
          sidePanel._sidePanel.setBounds(bounds)
        },15)() //60帧=1000/60
      }
    }else{
      console.log('因为mainwindow未载入而放弃一次设置位置')
    }
  }
  //设置在侧边栏鼠标无效
  setMouseIgnore () {
    this._sidePanel.setIgnoreMouseEvents(true, {
      forward: false  //设置为false，如果为true，在windows上鼠标会闪的不行
    })
    if (BrowserWindow.getFocusedWindow() != null && sidePanel.get().isFocused()) //如果有任意一个window还有焦点，则聚焦到mainwindow
      //有窗体还有焦点 且 只有左侧栏
    {
      if (process.platform === 'darwin') {
        mainWindow.setFocusable(true)
      }
      mainWindow.focus()
    }
    log('设置左侧栏不再感应鼠标，主窗体获得焦点')
  }

  //设置在侧边栏鼠标有效
  setMouseEnable () {
    this._sidePanel.setIgnoreMouseEvents(false)
    if (BrowserWindow.getFocusedWindow() != null && mainWindow.isFocused()) //如果有任意一个window还有焦点，且主窗体有焦点，则取得焦点，则聚焦到sidepanel
      this._sidePanel.focus()
    log('设置左侧栏感应 鼠标，左侧栏同时获得焦点')
  }
}

// function onlyFocusedSideBarAndMainWindow(windows=[]){
//   if(sidePanel.get().isFocused() || mainWindow.isFocused())
//   {
//     return true
//   }
//   //如果目前
// }
function addMainWindowEventListener () {

  mainWindow.on('move', () => {
    syncSize()
  })

  mainWindow.on('hide', () => {
    // if (SidePanel.alive()) {
    // 	//sidePanel.hide()
    // 	closeSidePanel()
    // }
  })

  mainWindow.on('show', () => {
    if (SidePanel.alive()) {
      log('mainwindow-show:侧边栏' + sidePanel._sidePanel)
      //sidePanel.show()
      //sidePanel.syncSize()
    }

  })

  //当主窗体失去焦点的时候，取消侧边栏的置顶。
  // mainWindow.on('blur', () => {
  // 	if (SidePanel.alive()) {
  // 		if (!sidePanel._sidePanel.isFocused() && !mainWindow.isMinimized()) {
  // 			//sidePanel失去焦点，且mainWindow不是最小化
  // 			if (sidePanel._sidePanel.isAlwaysOnTop()) {
  // 				sidePanel._sidePanel.setAlwaysOnTop(false)
  // 				sidePanel._sidePanel.moveAbove(mainWindow
  // 					.getMediaSourceId()) //移动到父级最前面，不挡住其他的界面，不使用这个办法会突出来
  // 				mainWindow.blur()
  // 			}
  // 			//mainWindow.blur()
  // 			//sidePanel.showInactive()
  // 		}
  // 	}
  //
  // })

  //设置侧边栏全局置顶，不设置的话，移动鼠标上去的话，是无法直接获得焦点，触发其弹窗浮层的效果
  // mainWindow.on('focus', () => {
  // 	if (SidePanel.alive()) {
  // 		if (mainWindow.isVisible()) {
  // 			sidePanel.setTop()
  // 			sidePanel._sidePanel.showInactive()
  // 		}
  // 	}

  // })

  //最小化、恢复事件
  mainWindow.on('minimize', () => {
    SidePanel.send('closeUserSidePanel')
    if (!isWin()) {
      closeSidePanel()
    }
  })
  mainWindow.on('restore', () => {
    if (isWin()) {

    } else {
      loadSidePanel()
    }
    //
    sidePanel.setMouseIgnore()
    mainWindow.focus()
    // setTimeout(() => {
    //
    // }, 500)
  })

  //最大化，取消最大化事件，一般用于win
  mainWindow.on('maximize', () => {
    log('mainwindow-maximize:')
    loadSidePanel()
    syncSize()
    //sidePanel.show() //最大化情况下，最小化，再恢复窗体，必须要重新show一下，不然无法点击左侧栏
  })
  mainWindow.on('unmaximize', () => {
    log('mainwindow-unmaximize:')
    syncSize()
    //sendIPCToWindow(mainWindow, 'getTitlebarHeight')
  })

  //进入退出全屏事件
  mainWindow.on('enter-full-screen', () => {
    log('mainwindow-enter-full-screen:进入全屏')
    //sidePanel.syncSize()
    //windows上全屏少了一块区域
    //sidePanel.syncTitleBar()
    // this.sidePanel.setAlwaysOnTop(true, 'floating')
  })
  mainWindow.on('leave-full-screen', () => {
    log('mainwindow-leave-full-screen:进入全屏')
    syncSize() //sendIPCToWindow(mainWindow, 'getTitlebarHeight')
  })

  //进入退出html全屏，一般用于视频播放的时候
  mainWindow.on('enter-html-full-screen', () => {
    closeSidePanel()
  })
  mainWindow.on('leave-html-full-screen', () => {
    loadSidePanel()

  })

  mainWindow.on('resize', function (event, newBounds, details) {
    log('mainwindow-resize:调整尺寸')
    syncSize()
  })
  mainWindow.on('close', function () {
    log('mainwindow-close:关闭')
    closeSidePanel()
  })

}

function loadSidePanel () {
  if (!SidePanel.alive()) {
    sidePanel = new SidePanel()
    sidePanel.init()
    sidePanel.setMouseIgnore() //重新让主界面获得焦点
    mainWindow.focus()
  } else {
    sidePanel.show()
  }
}

function closeSidePanel () {
  log('执行closeSidePanel()')
  if (SidePanel.alive()) {
    if (isMac()) {
      sidePanel.close()
      sidePanel = null
      //sidePanel.hide()
    } else {
      sidePanel.hide()
    }

  }
}


function syncSize () {
  if (sidePanel != null) {
    sidePanel.syncSize()
  }
}

// //用于viewManager回调，以使sidebar配合显示
// function onSetView() {
// 	if (SidePanel.alive())
// 		sidePanel.show()

// }
// //用于viewManager回调，以使sidebar配合隐藏
// function onHideCurrentView() {
// 	if (SidePanel.alive())
// 		sidePanel.hide()
// }

// ipc.on('set-ignore-mouse-events', (event, ...args) => {
// 	if (SidePanel.alive()) {
// 		if (mainWindow.isFocused() || sidePanel._sidePanel.isFocused()) {
// 			if (args[0]) {
// 				mainWindow.focus()
// 			} else {
// 				sidePanel.focus()
// 			}
// 			if (sidePanel._sidePanel.isVisible()) {
// 				log(args)
// 				 if (args[0]) {
// 				 	sidePanel.setMouseIgnore()
// 				 } else {
// 				 	sidePanel.setMouseEnable()
// 				 }

// 				//sidePanel.setIgnoreMouseEvents(...args)
// 			}

// 		}
// 	}
// })
ipc.on(ipcMessageMain.sidePanel.setMouseEnable, function () {
  if (SidePanel.alive())
    sidePanel.setMouseEnable()
})
ipc.on(ipcMessageMain.sidePanel.setMouseIgnore, function () {
  if (SidePanel.alive())
    sidePanel.setMouseIgnore()
})

//主窗口收到要获取全局变量的消息，主要是返回tasks和tabs两个数组，用于同步左侧栏
ipc.on(ipcMessageMain.sidePanel.getGlobal, (event, args) => {
  //sidebar发来的消息
  if (mainWindow)
    sendIPCToWindow(mainWindow, 'getGlobal', args)
})

//ipc从mainWindow得到全局变量后，返回给sidebar
ipc.on(ipcMessageMain.sidePanel.receiveGlobal, function (event, args) {
  if(mainWindow && mainWindow.webContents){
    args.mainWindowId = mainWindow.webContents.id
    if (!!!args.callbackWin) {
      if (sidePanel != null && mainWindow != null) {
        SidePanel.send('receiveGlobal', args)
      }
    } else {
      if (args.callbackWin === 'switchWin')
        //如果是明确了要返回给switchWin的，则发送到switchWindow
        if (switchWindow != null && mainWindow != null) {
          switchWindow.webContents.send('receiveGlobal', args)
        }
    }
  }
})
function openSetting(e){
  let url= render.getUrl('settings.html')
  sendIPCToWindow(mainWindow, 'addTab', {
    url: url +(e?'?' + e:'')
  })
}
//显示书签的时候，将sidepanel隐藏起来
ipc.on(ipcMessageMain.main.openBookmarks, function () {
  sendIPCToWindow(mainWindow, 'showBookmarks') //直传给mainWindow，让它唤出书签页面
})
ipc.on('openSetting', function (event,args) {
  openSetting(args)
})

ipc.on('openHome', function () {
  sendIPCToWindow(mainWindow, 'openApps')
})

ipc.on('openHelp', function () {
  sendIPCToWindow(mainWindow, 'addTab', {
    url: 'https://www.yuque.com/tswork/ngd5zk'
  })
})

ipc.on('openMobile', function () {
  sendIPCToWindow(mainWindow, 'openMobile')
})

ipc.on('openHistory', function () {
  sendIPCToWindow(mainWindow, 'showHistory')
})

ipc.on('hideSidePanel', function () {
  closeSidePanel()
})

// ipc.on('returnTitlebarHeight', function (event, data) {
//   if (data.titlebarHeight && sidePanel != null) {
//     sidePanel.titlebarHeight = data.titlebarHeight
//     sidePanel.syncSize()
//   }
// })

ipc.on('returnSidePanelPos', (event,data)=>{
  let pos=data.pos
  sidePanel.setPos(pos)
})

ipc.on('channelFixed', () => {
  SidePanel.mainWindowSend('adjustByFixed')
})

ipc.on('channelFreeFixed', () => {
  SidePanel.mainWindowSend('freeAdjustByFixed')
})

ipc.on('channelTemporaryAdjust', (event, args) => {
  SidePanel.mainWindowSend('temporaryAdjust', args)
})

var count = 0
ipc.on('showSidePanel', function () {
  loadSidePanel()
})
let sidePanelState='min'
ipc.on('openSidebar',()=>{
  sidePanelState='max'
  SidePanel.send('adjustSidePanel',sidePanelState)
  syncSize()
})
ipc.on('closeSidebar',()=>{
  sidePanelState='min'
  SidePanel.send('adjustSidePanel',sidePanelState)
  syncSize()
})
var selectTaskWindow = null
ipc.on('selectTask', function (event, arg) {
  //console.log(arg, '__apppp__')
  selectTaskWindow = new BrowserWindow({
    frame: true,
    backgroundColor: 'black',
    parent: mainWindow,
    modal: true,
    hasShadow: true,
    width: 1000,
    autoHideMenuBar: true,
    height: 700,
    thickFrame: false,
    resizable: false,
    acceptFirstMouse: true,
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, '/pages/selectTask/preload.js'),
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
  selectTaskWindow.webContents.loadURL('file://' + __dirname + '/pages/selectTask/index.html')
  if (toString.call(arg) === '[object Array]') {
    selectTaskWindow.webContents.send('appsCartList', arg)
  } else if (toString.call(arg) === '[object Object]') {
    selectTaskWindow.webContents.send('fromTabBarOp', arg)
  }
})
ipc.on('getTasks', () => {
  mainWindow.webContents.send('getTasks', { id: selectTaskWindow.webContents.id })
})
ipc.on('closeTaskSelect', function () {
  selectTaskWindow.close()
})

ipc.on('addTab', function (event, data) {
  sendIPCToWindow(mainWindow, 'addTab', {
    'url': data.url
  })
})

ipc.on('themeChange', (e, a) => {
  global.darkMode=a.status
  SidePanel.send('themeChange', a)
})

//可以尝试移动到browserUI中有tab和task的环境，而且能直接捕获从preload传出来的ipc
//选择到对应的task，再在对应的位置执行addTab
ipc.on('insertTab', (event, arg) => {
  sendIPCToWindow(mainWindow, 'toTaskAddTab', arg)
})

ipc.on('userLogin', function (event, data) {
  SidePanel.send('userLogin', data)
})

ipc.on('importBookMarks', function () {
  sendIPCToWindow(mainWindow, 'importBookMarks')
})

/**
 * 发送消息到sidebar，进行全局提示
 */
ipc.on('message', function (event, args) {
  SidePanel.send('message', args)
})

function sendMessage (args) {
  messager.send(args)
}

const messager = {
  send (args) {
    SidePanel.send('message', args)
  },
  success (config) {
    SidePanel.send('message', {
      type: 'success',
      config: config
    })
  },
  error (config) {
    SidePanel.send('message', {
      type: 'error',
      config: config
    })
  }
}

ipc.on('closeTask', function (event, args) {
  sendIPCToWindow(mainWindow, 'closeTask', args)
})

ipc.on('reloadTask', () => {
  sendIPCToWindow(mainWindow, 'reloadTask')
})

ipc.on('addTask', function (event, data) {
  let taskId = Math.round(Math.random() * 100000000000000000)
  let item = {
    title: data.name, //名称，用于显示提示
    name: data.name,
    index: 0, //索引组
    id: taskId, //任务id
    icon: data.icon, //图标
    draggable: true, //是否允许拖拽
    ext: taskId, //额外的信息，如果是任务则放任务id
    fixed: false,
    type: 'task',//task fav
    tabs: [],//初始化的时候必要用于展示的有就行了，其他的会自动同步过去
    count: 1
  }
  if (sidePanel != null)
    sidePanel.addItem(item)
  sendIPCToWindow(mainWindow, 'addTaskFromApps', { id: taskId, name: data.name, url: data.url })
})

ipc.on('addNewTask', function () {
  sendIPCToWindow(mainWindow, 'addTask')
})

let switchWindow = null

function createSwitchTask () {
  if (switchWindow === null) {
    switchWindow = new BrowserWindow({
      frame: true,
      backgroundColor: 'white',
      parent: mainWindow,
      modal: false,
      hasShadow: true,
      width: 480,
      autoHideMenuBar: true,
      height: 415,
      resizable: false,
      acceptFirstMouse: true,
      maximizable: false,
      visualEffectState: 'active',
      alwaysOnTop: true,
      webPreferences: {
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
    switchWindow.webContents.loadURL('file://' + __dirname + '/pages/switch/index.html')
    //switchWindow.webContents.openDevTools()
    switchWindow.on('close', () => switchWindow = null)
    switchWindow.on('show', () => {
      switchWindow.focus()
    })
  } else {
    switchWindow.close()
    switchWindow = null
  }

}

ipc.on('openSwitch', () => {
  createSwitchTask()
})

ipc.on('addSingleTaskGuide', () => {
  sendIPCToWindow(mainWindow, 'addSingleTask')
})

ipc.on('closeSwitch', () => {
  if (switchWindow !== null) {
    switchWindow.close()
  }
})
ipc.on('openTaskMenu', (event, args) => {
  let task = args.task
  let pos = require('electron').screen.getCursorScreenPoint()
  const tpl = [
    {
      label: task.title,
      enabled: false
    },
    {
      label: '重命名标签组',
      click () {
        let defaultIcon = {
          type: 'img',
          icon: {
            url: task.icon
          }
        }
        if (task.userIcon) {
          defaultIcon = {
            type: 'fontIcon',
            icon: task.userIcon
          }
        }
        renderPage.openIconSelector({
          x: pos.x,
          y: pos.y,
        }, {
          text: true,
          shape: 'none',
          originalIcon: task.icon,
          defaultIcon: defaultIcon,
          defaultText: task.title,
        }, event.sender.id)
      }
    },
    {
      type: 'separator'
    },
    {
      label: '暂存标签组…',
      click () {
        sendIPCToWindow(mainWindow, 'stashTask', { id: task.id })
      }
    },
    {
      label: '删除标签组',
      click () {
        sendIPCToWindow(mainWindow, 'closeTask', { tabId: task.id })
      }
    }
  ]
  let menu = require('electron').Menu.buildFromTemplate(tpl)

  menu.popup()
})
ipc.on('openSidebarMenu', (e, args) => {
  let checkAuto, checkClose, checkOpen, checkHide = false
  switch (args.mod) {
    case 'auto':
      checkAuto = true
      break
    case 'close':
      checkClose = true
      break
    case 'hide':
      checkHide = true
      break
    default :
      checkOpen = true
  }

  function setSideMod (mod) {
    SidePanel.send('sideSet' + mod)
    sendIPCToWindow(mainWindow, 'sideSetMod', { mod: mod.toLowerCase() })

  }

  const tpl = [
    {
      label: '新建标签组',
      click () {
        sendIPCToWindow(mainWindow, 'addTask')
      }
    },
    {
      label: '新建小号标签组',
      click () {
        sendIPCToWindow(mainWindow, 'addSingleTask')
      }
    },
    {
      label: '整理标签组…',
      click () {
        sendIPCToWindow(mainWindow, 'showTasks')
        mainWindow.focus()
      }
    },
    {
      label: '导入标签组…',
      click () {
        renderPage.openPopTaskStash()
      }
    },

    {
      type: 'separator'
    },
    {
      label: '侧边栏模式',
      submenu: [
        {
          type: 'checkbox',
          label: '自动伸缩',
          checked: checkAuto,
          click () {
            setSideMod('Auto')
          }
        },
        {
          type: 'checkbox',
          label: '收起',
          checked: checkClose,
          click () {
            setSideMod('Close')
          }
        }, {
          type: 'checkbox',
          label: '展开',
          checked: checkOpen,
          click () {
            setSideMod('Open')
          }
        }
        // , {
        //   type:'separator'
        // },
        // {
        //   label:!checkHide?'隐藏侧边栏':'显示侧边栏',
        //   click(){
        //     setSideMod('Hide')
        //   }
        // }
      ]
    }
  ]
  let menu = require('electron').Menu.buildFromTemplate(tpl)

  menu.popup()
})

ipc.on('importTasks', (e, args) => {
  sendIPCToWindow(mainWindow, 'importTasks', args)
})
ipc.on('removeStash',(e,args)=>{
  sendIPCToWindow(mainWindow, 'removeStash', args)
})
ipc.on('sidePanelFocus', () => {
  sidePanel.setMouseEnable()
})

ipc.on('switchToTab', (event, args) => {
  sendIPCToWindow(mainWindow, 'switchToTab', args)
})
ipc.on('switchToTask', (event, args) => {
  sendIPCToWindow(mainWindow, 'switchToTask', args)
})
ipc.on('openTasks', (event, args) => {
  sendIPCToWindow(mainWindow, 'showTasks', args)
})
// app.whenReady().then(()=>{
//   createSwitchTask()
// })
//设置侧边栏模式
ipc.on('sideSetOpen', (event, args) => {
  SidePanel.send('sideSetOpen')
})
ipc.on('sideSetClose', (event, args) => {
  SidePanel.send('sideSetClose')
})
ipc.on('sideSetAuto', (event, args) => {
  SidePanel.send('sideSetAuto')
})

ipc.on('importDesk', (event, args) => {
  const files = dialog.showOpenDialogSync(mainWindow, {
    title: '导入桌面',
    defaultPath: '.tsbk',
    filters: [{ name: '桌面备份', extensions: ['tsbk'] }]
  })
  if (!!!files) {
    return
  } else {
    event.reply('importDesk', { files: files })
  }
})
ipc.on('exportDesk', (event, args) => {
  let desk = args.desk
  desk.layout = args.deskLayout
  const path = dialog.showSaveDialogSync(mainWindow, {
    title: '导出桌面',
    defaultPath: '桌面备份-' + desk.name + '.tsbk',
    filters: [{ name: '桌面备份', extensions: ['tsbk'] }]
  })
  if (!!!path) {
    return
  } else {
    fs.writeFile(path, JSON.stringify(desk), function (err) {
      if (err) {
        sendMessage({ type: 'error', config: { content: '备份失败。请重试。' } })
      } else {
        sendMessage({ type: 'success', config: { content: '保存桌面备份成功。' } })
      }
    })
  }
})
ipc.on('captureDeskScreen', (event, args) => {
  let capturedImage = undefined
  event.sender.capturePage(args.bounds).then((data) => {
    capturedImage = data
    if (!fs.existsSync(userDataPath + '/desk')) {
      fs.mkdirSync(userDataPath + '/desk')
    }
    fs.writeFile(path.resolve(userDataPath + '/desk/screen' + args.desk.id + '.jpg'), capturedImage.toJPEG(50), (err) => {
      if (!err) {
        event.reply('updateScreen', { id: args.desk.id })
      }
    })
  })
})


ipc.on('showAllSaApps', async (event, args) => {
  let allApps =await renderPage.openAllApps()
  let allAppsWindow=allApps.win
  allAppsWindow.webContents.send('refresh')

  let mainBounds = mainWindow.getBounds()
  allAppsWindow.setBounds({
    x: mainBounds.x + 170,
    y: mainBounds.y + 70
  })
  allAppsWindow.show()
  allAppsWindow.focus()
})

const configModel = require(__dirname + '/src/model/configModel')

let userWindow = null
let lastWindowArgs = {}
let changingSpace = false

async function showUserWindow (args) {
  const _ = require('lodash')
  if (userWindow) {
    if (masked) {
      return
    }
    userWindow.show()
    userWindow.focus()
  } else {
    let defaultArgs = {
      tip: '',
      modal: false
    }
    if (typeof args === 'undefined') {
      args = {}
    }
    let additionalArgs = Object.assign(defaultArgs, args)
    lastWindowArgs = additionalArgs
    let formatArgs = []

    _.mapKeys(additionalArgs, (value, key) => {
      formatArgs.push('--' + key + '=' + value)
    })
    let userWindowInstance = await windowManager.create({
      name: 'user',
      windowOption: {
        //backgroundColor: '#00000000',
        frame: true,
        show: false,
        minWidth: 900,
        minHeight: 550,
        width: 900,
        height: 550,
        title: '选择空间',
        maximizable: false,
        alwaysOnTop: true,//一直保持最高，防止被遮挡
      },
      webPreferences: {
        preload: path.join(__dirname, 'src/preload/user.js'),
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false,
        webSecurity: false,
        additionalArguments: [
          '--user-data-path=' + userDataPath,
          '--app-version=' + app.getVersion(),
          '--app-name=' + app.getName(),
          ...((isDevelopmentMode ? ['--development-mode'] : [])),
          ...formatArgs
        ]
      },
      url: render.getUrl('user.html')
    })
    console.log(userWindowInstance, '222')
    userWindow = userWindowInstance.window

    function computeBounds (parentBounds, selfBounds) {
      let bounds = {}
      bounds.x = parseInt((parentBounds.x + parentBounds.x + parentBounds.width) / 2 - selfBounds.width / 2, 0)
      bounds.y = parseInt((parentBounds.y + parentBounds.y + parentBounds.height) / 2 - selfBounds.height / 2)
      bounds.width = parseInt(selfBounds.width)
      bounds.height = parseInt(selfBounds.height)
      return bounds
    }

    userWindow.setMenu(null)
    //userWindow.webContents.openDevTools()
    userWindow.on('ready-to-show', () => {
      userWindow.show()
      if (mainWindow && !mainWindow.isDestroyed())
        userWindow.setBounds(computeBounds(mainWindow.getBounds(), userWindow.getBounds()))
      else {
      }
      if (additionalArgs.modal) {
        callModal(userWindow)
      }

    })
    userWindow.on('close', () => {
      userWindow = null
    })
  }
}



let masked = false
let inseartedCSS = []

/**
 * 调用模态方法，给所有窗体添加模态
 * @param window
 */
function callModal (win) {
  if (masked) {
    return
  }
  win.setSkipTaskbar(true)
  let css = `._mask{
     position:fixed;
     top:0;
     left: 0;
     right: 0;
     bottom: 0;
     background-color: #00000090;
     z-index: 9999999;
     display:block;
     }`
  let code = `
  let div=document.createElement('div');
  div.id='_modalWindowMask';
  div.classList.add('_mask');
  //div.hidden=true;
  document.body.appendChild(div);
  `
  webContents.getAllWebContents().forEach(async wb => {
    if (wb.id === win.webContents.id || wb.getURL().startsWith('tsbapp://') || wb.getURL()==='') return
    inseartedCSS.push({ id: wb.id, cssHandler: await wb.insertCSS(css) })
    await wb.executeJavaScript(code)
  })
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setMinimizable(false)
    mainWindow.setClosable(false)
    mainWindow.setMaximizable(false)
  }
  masked = true
  //
  // BrowserWindow.getAllWindows().forEach(async w=>{
  //   if(w.id===win.id) return ;
  //   await w.webContents.insertCSS(css)
  //   await w.webContents.executeJavaScript(code)
  // })

}

function callUnModal (win) {
  if (masked) {
    webContents.getAllWebContents().forEach(async wb => {
      try {
        if (wb.id === win.webContents.id || wb.getURL().startsWith('tsbapp://')|| wb.getURL()==='') return
        let handler = inseartedCSS.find((item) => {
          return item.id === wb.id
        })
        wb.removeInsertedCSS(handler)
        await wb.executeJavaScript('document.body.removeChild(document.getElementById(\'_modalWindowMask\'))')
      } catch (e) {
      }
    })
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setMinimizable(true)
      mainWindow.setClosable(true)
      mainWindow.setMaximizable(true)
    }
    inseartedCSS = []
    masked = false

  }
}

/*user面板代码*/
app.whenReady().then(() => {
  ipc.on('startApp',()=>{
    if(!mainWindow){
      createWindow(()=>{
        if (userWindow) {
          if (userWindow.isDestroyed() === false)
            userWindow.close()
        }
      })
    }
  })

  ipc.on('showUserWindow', (event, args) => {
    showUserWindow(args)
  })

  /**
   * 只关闭主窗体，不做任何其他的操作
   */
  ipc.on('justCloseMainWindow',()=>{
    if (mainWindow && !mainWindow.isDestroyed()) {
      destroyAllViews()
      saveWindowBounds()
      mainWindow.close()
      if(SidePanel.alive()){
        sidePanel.close()
      }
      mainWindow=null
      showUserWindow()
    }
  })

  let loginWindow = null
  ipc.on('closeUserWindow', () => {
    callUnModal(userWindow)
    if (userWindow) {
      if (userWindow.isDestroyed() === false)
        userWindow.close()
    }
  })
  ipc.handle('createWindow',()=>{
    createWindow()
  })

  ipc.on('closeSync',(e)=>{
    function callback(){
      e.returnValue='done'
    }
    if (!mainWindow) {
      e.returnValue='not_alive'
      return
    }
    mainWindow.once('closed',()=>{
      callback()
    })
    safeCloseMainWindow()
  })

  ipc.on('changeSpace',  (event, args) => {
    async function  reloadMainWindow(){
      await require('./src/model/spaceModel').setCurrentSpace(args)
      createWindow(()=>{
        event.returnValue='done'
      })

    }
    changingSpace = true
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setClosable(true)
      mainWindow.once('closed', async () => {
        reloadMainWindow()
      })
      safeCloseMainWindow()
      // mainWindow.close()
    }else{
      reloadMainWindow()
    }
  })

  ipc.on('disconnect', () => {
    SidePanel.send('disconnect')
  })

  ipc.on('reconnect', () => {
    SidePanel.send('reconnect')
  })

  ipc.on('saving', () => {
    SidePanel.send('saving')
  })

  ipc.on('login', (event, args) => {
    if (loginWindow) {
      loginWindow.show()
      loginWindow.focus()
    } else {
      loginWindow = new BrowserWindow({
        backgroundColor: '#00000000',
        show: false,
        alwaysOnTop: true,
        width: 550,
        height: 730,
        webPreferences: {
          preload: path.join(__dirname, 'pages/user/loginPreload.js'),
          nodeIntegration: true,
          contextIsolation: false,
          additionalArguments: [
            '--user-data-path=' + userDataPath,
            '--app-version=' + app.getVersion(),
            '--app-name=' + app.getName(),
            ...((isDevelopmentMode ? ['--development-mode'] : [])),
            '--callWindow=' + event.sender.id,
          ],
          partition: 'login'
        }
      })
      loginWindow.setMenu(null)
      loginWindow.on('close', () => {
        loginWindow = null
      })
      let api = require(path.join(__dirname, 'server-config.js')).api
      loginWindow.loadURL(api.getUrl(api.API_URL.user.login))
      loginWindow.on('ready-to-show', () => {
        if (userWindow && !userWindow.isDestroyed()) {
          userWindow.setAlwaysOnTop(false)
        }
        loginWindow.show()
        loginWindow.focus()
      })
      loginWindow.on('close', () => {
        if (userWindow && !userWindow.isDestroyed()) {
          userWindow.setAlwaysOnTop(true)
        }
      })
    }
  })
})

ipc.on('onDropUrl', (e, args) => {
  if (args.url) {
    let set = settings.get('dropOpenLink')
    if (!!!set) {
      dialog.showMessageBox(mainWindow, {
        message: '检测到您首次拖放网页链接，请选择您的默认拖放链接行为，您也可以后续在设置中修改行为。',
        buttons: ['新标签打开链接', '不做任何行为']
      }).then((res) => {
        if (res.response === 0) {
          sendIPCToWindow(mainWindow, 'addTab', { url: args.url })
          settings.set('dropOpenLink', 'true')
        } else {
          settings.set('dropOpenLink', 'false')
        }
      })
    } else if (set === 'true') {
      sendIPCToWindow(mainWindow, 'addTab', { url: args.url })
    }
  }
})

ipc.on('dbClickClose', (e, args) => {
  if (args.id) {
    let set = settings.get('dbClickClose')
    if (!!!set) {
      dialog.showMessageBox(mainWindow, {
        message: '检测到您首次双击标签，请根据习惯选择您的默认行为，您也可以后续在设置中修改此行为。',
        buttons: ['关闭标签', '不做任何行为']
      }).then((res) => {
        if (res.response === 0) {
          sendIPCToWindow(mainWindow, 'closeTab', { id: args.id })
          settings.set('dbClickClose', 'true')
        } else {
          settings.set('dbClickClose', 'false')
        }
      })
    } else if (set === 'true') {
      sendIPCToWindow(mainWindow, 'closeTab', { id: args.id })
    }
  }
})

ipc.on('settingChangedCallback',(event,args)=>{
  if(args.callback.indexOf('sidebar')>=0){
    SidePanel.send('settingChanged',args)
  }
  if(args.callback.indexOf('main')>=0){
    sendIPCToMainWindow('settingChanged',args)
  }
})

/*user面板代码end*/


app.whenReady().then(()=>{
  let askingSpeedup=false
  ipc.on('toolbar.speedup',()=>{
    if(askingSpeedup) return
    askingSpeedup=true
     let ask= require('electron').dialog.showMessageBoxSync({
        message:'在加速之前，请务必确认网页表单均已保存。\n此操作将放弃全部网页内容！！！\n注意：任何加速都不会关闭当前标签。',
        buttons:['杀死所有标签(同时关闭全部应用）','杀死非锁定标签（不关闭应用）','取消'],
        title:'一键加速',
       textWidth:300,
       cancelId:2
      })
    switch (ask) {
      case 0:
        sendIPCToMainWindow('speedup',{type:'all'})
        let closedApp=appManager.closeAll()
        if(closedApp>0)
          sendMessage({type:'success',config:{content:'已为您关闭'+closedApp+'个应用。'}})
        break
      case 1:
        sendIPCToMainWindow('speedup',{type:'unlock'})
    }
    askingSpeedup=false
  })
  var osu=require('node-os-utils')
  setInterval(async ()=>{
    if(mainWindow && !mainWindow.isDestroyed()){
      try{
        let mem=await osu.mem.info()
        let info={
          mem: mem,
        }
        sendIPCToWindow(mainWindow,'doRefreshLoad',info)
      }catch (e) {
       console.error(e)
      }
    }
  },3000)
})
