
const BrowserView = electron.BrowserView

global.viewMap = {} // id: view
var viewStateMap = {} // id: view state
var selectedView = null

var temporaryPopupViews = {} // id: view

global.viewBounds = {}
var sidebarBounds = {}

var defaultBrowserViewBg = '#ffffff'
var mainTabView

var viewStash = [] // 暂存，用于隐藏views时暂存下来，下次setview的时候自动读入并清空，防止因为开关而导致view被销毁的问题。

const defaultViewWebPreferences = {
  nodeIntegration: false,
  nodeIntegrationInSubFrames: true,
  scrollBounce: true,
  safeDialogs: true,
  safeDialogsMessage: '阻止此页面弹窗',
  preload: __dirname + '/dist/preload.js',
  contextIsolation: true,
  sandbox: true,
  enableRemoteModule: false,
  allowPopups: false,
  // partition: partition || 'persist:webcontent',
  enableWebSQL: false,
  autoplayPolicy: ((settings.get('enableAutoplay') || settings.get('enableAutoplay') === undefined) ? 'no-user-gesture-required' : 'user-gesture-required'),
  // match Chrome's default for anti-fingerprinting purposes (Electron defaults to 0)
  minimumFontSize: 6
}

function getBackgroundColor(){
  if(global.darkMode===undefined){
    global.darkMode=require('./js/util/theme').getShouldDarkMod()?'enable':'disable'
  }
  if(global.darkMode==='enable' && settings.get('useTabDarkBackground')){
    return 'rgb(32,32,32)'
  }else{
    return  '#fff'
  }
}
async function createView(existingViewId, id, webPreferencesString, boundsString, events) {
  viewStateMap[id] = {loadedInitialURL: false}

  let view
  const webPreferences = JSON.parse(webPreferencesString)



  if (existingViewId) {
    view = temporaryPopupViews[existingViewId]
    delete temporaryPopupViews[existingViewId]

    // the initial URL has already been loaded, so set the background color
    view.setBackgroundColor(getBackgroundColor())
    viewStateMap[id].loadedInitialURL = true
  } else {
    view = new BrowserView({ webPreferences: Object.assign({}, defaultViewWebPreferences, webPreferences) })
    view.setBackgroundColor(getBackgroundColor())
    // if(webPreferences.partition!=='persist:webcontent'){
    //   console.log('webPreferences',webPreferences)
    //   await browser.ensureExtension(webPreferences.partition)
    // }

    // mark插入对webviewInk的数据统计 但在主进程中，需要发送一个ipc到sidebar常驻子进程中去db操作
    SidePanel.send('countWebviewInk')

    // statsh
    statsh.do({
      action: 'increase',
      key: 'webviewsInk',
      value: 1
    })

    // mark插入对scripts的数据统计
    SidePanel.send('countScript')

    // mark插入对defaultBrowser的数据统计
    SidePanel.send('defaultBrowser', app.isDefaultProtocolClient('http'))
  }
  events.forEach(function (event) {
    view.webContents.on(event, function (e) {
      var args = Array.prototype.slice.call(arguments).slice(1)

      if(mainWindow && !mainWindow.isDestroyed()) {
        //防止报错
        mainWindow.webContents.send('view-event', {
          viewId: id,
          event: event,
          args: args
        })
      }
    })
  })

  view.webContents.on('select-bluetooth-device', function (event, deviceList, callback) {
    event.preventDefault()
    callback('')
  })

  view.webContents.on('did-fail-load',(event,errorCode,errorDescription,validatedURL,isMainFrame,frameProcessId,frameRoutingId)=>{
    console.log(
      event,errorCode,errorDescription,validatedURL,isMainFrame,frameProcessId,frameRoutingId
    )
  })

  view.webContents.on('certificate-error', (event, url, error, certificate, callback, isMainFrame) => {
    const reg = /^http(s)?:\/\/(.*)\.(\w*)/
    const regedUrl = reg.exec(url)[0]
    // 在这里触发了证书错误引起的回调，把当前url放入白名单，然后放行
    const whiteCertInvalid = settings.get('whiteCertInvalid')
    if (whiteCertInvalid.find(v => v === regedUrl)) {
      // 如果白名单中存在，放行
      event.preventDefault()
      callback(true)
    } else {
      callback(false)
    }
  })

  view.webContents.setWindowOpenHandler(function (details) {
    /*
      Opening a popup with window.open() generally requires features to be set
      So if there are no features, the event is most likely from clicking on a link, which should open a new tab.
      Clicking a link can still have a "new-window" or "foreground-tab" disposition depending on which keys are pressed
      when it is clicked.
      (https://github.com/minbrowser/min/issues/1835)
    */
    if (!details.features) {
      // mainWindow.webContents.send('view-event', {
      //   viewId: id,
      //   event: 'new-tab',
      //   args: [details.url, !(details.disposition === 'background-tab')]
      // })
      return {
        // 如果这里return  deny，则禁止任何形式的弹窗
        action: 'allow'
      }
    }

    return {
      action: 'allow'
    }
  })

  view.webContents.removeAllListeners('-add-new-contents')

  // view.webContents.on('devtools-opened',()=>{
  //   console.log('devtools-opends')
  //
  //   view.webContents.devToolsWebContents.setWindowOpenHandler((details)=>{
  //     console.log('open')
  //     sendIPCToWindow(mainWindow,'addTab',{url:details.url})
  //   })
  //   // view.webContents.devToolsWebContents.on('new-window',(event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {
  //   //   console.log('devtools-new-window')
  //   //   event.preventDefault()
  //   //   sendIPCToWindow(mainWindow,'addTab',{url:url})
  //   // })
  // })

  view.webContents.on('-add-new-contents', function (e, webContents, disposition, _userGesture, _left, _top, _width, _height, url, frameName, referrer, rawFeatures, postData) {
    if (!filterPopups(url)) {
      return
    }

    var view = new BrowserView({ webPreferences: defaultViewWebPreferences, webContents: webContents })

    var popupId = Math.random().toString()
    temporaryPopupViews[popupId] = view

    mainWindow.webContents.send('view-event', {
      viewId: id,
      event: 'did-create-popup',
      args: [popupId, url]
    })
  })

  view.webContents.on('ipc-message', function (e, channel, data) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('view-ipc', {
        id: id,
        name: channel,
        data: data,
        frameId: e.frameId,
        frameURL: e.senderFrame.url
      })
    }
  })

  view.webContents.on('focus', () => {
    sendIPCToMainWindow('focusTab', { tabId: id })
  })

  // Open a login prompt when site asks for http authentication
  view.webContents.on('login', (event, authenticationResponseDetails, authInfo, callback) => {
    if (authInfo.scheme !== 'basic') { // Only for basic auth
      return
    }
    event.preventDefault()
    var title = l('loginPromptTitle').replace('%h', authInfo.host).replace('%r', authInfo.realm)
    createPrompt({
      text: title,
      values: [{ placeholder: l('username'), id: 'username', type: 'text' },
        { placeholder: l('password'), id: 'password', type: 'password' }],
      ok: l('dialogConfirmButton'),
      cancel: l('dialogSkipButton'),
      width: 400,
      height: 200
    }, function (result) {
      // resend request with auth credentials
      callback(result.username, result.password)
    })
  })

  // show an "open in app" prompt for external protocols

  function handleExternalProtocol (e, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) {
    var knownProtocols = ['http', 'https', 'file', 'min', 'about', 'data', 'javascript', 'chrome', 'tsb'] // TODO anything else? tsb是新增的协议
    if (!knownProtocols.includes(url.split(':')[0])) {
      var externalApp = app.getApplicationNameForProtocol(url)
      if (externalApp) {
        // TODO find a better way to do this
        // (the reason to use executeJS instead of the Electron dialog API is so we get the "prevent this page from creating additional dialogs" checkbox)
        var sanitizedName = externalApp.replace(/[^a-zA-Z0-9.]/g, '')
        if (view.webContents.getURL()) {
          view.webContents.executeJavaScript('confirm("' + l('openExternalApp').replace('%s', sanitizedName) + '")').then(function (result) {
            if (result === true) {
              electron.shell.openExternal(url)
            }
          })
        } else {
          // the code above tries to show the dialog in a browserview, but if the view has no URL, this won't work.
          // so show the dialog globally as a fallback
          var result = electron.dialog.showMessageBoxSync({
            type: 'question',
            buttons: ['OK', 'Cancel'],
            message: l('openExternalApp').replace('%s', sanitizedName).replace(/\\/g, '')
          })

          if (result === 0) {
            electron.shell.openExternal(url)
          }
        }
      }
    }
  }

  view.webContents.on('did-start-navigation', handleExternalProtocol)
  /*
  It's possible for an HTTP request to redirect to an external app link
  (primary use case for this is OAuth from desktop app > browser > back to app)
  and did-start-navigation isn't (always?) emitted for redirects, so we need this handler as well
  */
  view.webContents.on('will-redirect', handleExternalProtocol)

  view.setBounds(JSON.parse(boundsString))
  viewBounds = JSON.parse(boundsString)
  view.id = id // 增加一个id属性，方便后续区分
  viewMap[id] = view

  // 增加对证书的验证事件处理
  // view.webContents.session.setCertificateVerifyProc((request, callback) => {
  //   const { hostname } = request
  //   //沿用默认验证方法
  //   callback(-3)
  // })
  // end

  // 同步extension的tab
  browser.extensions.addTab(view.webContents, mainWindow)

  if (waitingSyncId !== 0) {
    tabs[waitingSyncId] = view.webContents
    waitingSyncId = 0
  }
  return view
}

function destroyView (id) {
  if (!viewMap[id]) {
    return
  }
  let removed = false
  if (windowManager.attachedView && windowManager.attachedView === viewMap[id]) {
    // 如果是关闭当前吸附的窗体
    windowManager.detachTab()
    removed = true
  }
  const bvs = mainWindow.getBrowserViews()
  if (removed) {
    // 通过上方移除了，不需要再做移除操作
  }
  bvs.forEach(bv => {
    if (bv.webContents && viewMap[id].webContents) {
      if (bv.webContents.id === viewMap[id].webContents.id) {
        mainWindow.removeBrowserView(bv)
      }
    }
  })
  viewMap[id].webContents.destroy()
  delete viewMap[id]
  delete viewStateMap[id]
  selectedView = null
  // if (viewMap[id] === mainWindow.getBrowserView()) {
  //   mainWindow.setBrowserView(null)
  //   selectedView = null
  // }
  // else if(viewMap[id]===sidebarView)//如果是侧边栏的view，则直接将其置顶起来
  // {
  //  console.log('阻止一次被消耗')
  //  mainWindow.setTopBrowserView(sidebarView)
  //  return
  // }
}

global.destroyAllViews=function destroyAllViews () {
  for (const id in viewMap) {
    destroyView(id)
  }
}

// 处理设置当前BrowserView事件，以将sidebarView拿出来

function setView (id) {
  if (viewStateMap[id]) {
    if (viewStateMap[id].loadedInitialURL) {
      setCurrentBrowserView(viewMap[id])
      // mainWindow.removeBrowserView(needRemove)
    } else {
      mainWindow.setBrowserView(null)
    }
    browser.extensions.selectTab(viewMap[id].webContents)
    sendIPCToWindow(mainWindow, 'setActionListTab', { id: viewMap[id].webContents.id })
    selectedView = id
  }
}

function setBounds (id, bounds) {
  if (viewMap[id]) {
    const bvs = mainWindow.getBrowserViews()
    bvs.forEach(bv => {
      if (windowManager.attachedView && bv === windowManager.attachedView) {
        // 排除右侧分屏的bv
        return
      }
      bv.setBounds(bounds)
    })
  }
  viewBounds = bounds
  // sidebarBounds={x:0,y:bounds.y,width:45,height:bounds.height}
  // sidebarView.setBounds(sidebarBounds)
}

function focusView (id) {
  // empty views can't be focused because they won't propogate keyboard events correctly, see https://github.com/minbrowser/min/issues/616
  // also, make sure the view exists, since it might not if the app is shutting down
  if (viewMap[id] && (viewMap[id].webContents.getURL() !== '' || viewMap[id].webContents.isLoading())) {
    viewMap[id].webContents.focus()
  } else if (mainWindow) {
    mainWindow.webContents.focus()
  }
}

function hideCurrentView () {
  mainWindow.setBrowserView(null)
  selectedView = null
  mainWindow.webContents.focus()
}

function getView (id) {
  return viewMap[id]
}

function getViewIDFromWebContents (contents) {
  for (var id in viewMap) {
    if (viewMap[id].webContents === contents) {
      return id
    }
  }
}

ipc.on('createView', function (e, args) {
  createView(args.existingViewId, args.id, args.webPreferencesString, args.boundsString, args.events)
  // focusView(args.id)
})

ipc.on('destroyView', function (e, id) {
  destroyView(id)
})

ipc.on('destroyAllViews', function () {
  destroyAllViews()
})
ipc.on('addView', (e, args) => {
  // console.log('saveData',saveData)g('添加view',args.id,viewMap[args.id])
  // mainWindow.addBrowserView(viewMap[args.id])
  // console.log('添加时设置的bounds',args.bounds)
  // let bounds=windowManager.onSetBounds(args.bounds)
  // console.log('修复了attach之后的bounds',args.bounds)
  // viewMap[args.id].setBounds(bounds)
  // //setBounds(args.id,bounds)
  // if(windowManager) {windowManager.syncAttachedBounds()}
  // console.log(mainWindow.getBrowserViews())
  // let bounds=windowManager.onSetBounds(args.bounds)
})
ipc.on('setView', function (e, args) {
  if (viewStash) {
    viewStash.forEach((bv) => {
      mainWindow.addBrowserView(bv)
    })
    viewStash = []
  }
  setView(args.id)
  // let bvs=mainWindow.getBrowserViews()
  // console.log('setvbiew',bvs)
  // if( typeof mainTabView !=='undefined' && bvs.indexOf(mainTabView)===-1){
  //   console.log('自动补充主view')
  //   mainWindow.addBrowserView(mainTabView)
  //   mainTabView.setBounds(viewBounds)
  // }
  // let bvs2=mainWindow.getBrowserViews()
  // console.log('setvbiew2',bvs2)
  let bounds = args.bounds
  try {
    bounds = windowManager.onSetBounds(args.bounds)
  } catch (e) {
    console.warn(e)
  }
  setBounds(args.id, bounds)
  // let bvs3=mainWindow.getBrowserViews()
  // console.log('setvbiew3',bvs3)
  if (windowManager) { windowManager.syncAttachedBounds() }
  if (args.focus) {
    if (SidePanel.alive() && sidePanel.get().isFocused()) {
      // 如果侧边栏是焦点状态，则不去聚焦
    } else {
      focusView(args.id) // todo观察，注释这行在切换view的时候给他聚焦的代码，用以解决mac平台上切换tab导致侧边栏丢失焦点出错的问题
    }
  }
  // 设置当前view
  // onSetView()
})

ipc.on('setBounds', function (e, args) {
  const bounds = windowManager.onSetBounds(args.bounds)
  setBounds(args.id, bounds)
  if (windowManager) { windowManager.syncAttachedBounds() }
})

ipc.on('focusView', function (e, id) {
  focusView(id)
})

ipc.on('printToPDF', (e, args) => {
  viewMap[args.id].webContents.printToPDF({}).then(data => {
    fs.writeFile(args.savePath, data, (error) => {
      if (error) throw error
      sendMessage({ type: 'success', config: { content: '保存为PDF成功。' } })
      require('electron').shell.showItemInFolder(args.savePath)
    })
  }).catch(error => {
    // console.log(`Failed to write PDF to ${pdfPath}: `, error)
    sendMessage({ type: 'error', config: { content: '保存为PDF失败。' } })
  })
})

ipc.on('hideCurrentView', function (e) {
  viewStash = mainWindow.getBrowserViews()// 暂存一下，用于后续恢复
  hideCurrentView()
  // 调用隐藏当前视图的回调到sidebar
  // onHideCurrentView()
})
function setCurrentBrowserView (needSetBrowserView) {
  if (windowManager) {
    if (windowManager.attachedView !== needSetBrowserView) {
      mainTabView = needSetBrowserView
    }
  }
  if (process.platform === 'win32') {
    // windows上存在背景色bug，只能牺牲体验追求正确性
    mainWindow.setBrowserView(needSetBrowserView)
    return
  }
  const bvs = mainWindow.getBrowserViews()
  let hasFinded = false
  let findedView = null
  bvs.forEach(bv => {
    if (needSetBrowserView.webContents && bv.webContents) {
      if (bv.webContents.id === needSetBrowserView.webContents.id) {
        // 如果是要设置的view则跳过
        findedView = bv
        hasFinded = true
      }
    }
  })
  if (!hasFinded) {
    // 如果不存在要寻找的view，则将view添加上去
    mainWindow.addBrowserView(needSetBrowserView)
  } else {
    // mainWindow.addBrowserView(viewMap[id])
    mainWindow.setTopBrowserView(findedView)
  }
}

ipc.on('loadURLInView', function (e, args) {
  // wait until the first URL is loaded to set the background color so that new tabs can use a custom background
  if (!viewStateMap[args.id].loadedInitialURL) {
    viewMap[args.id].setBackgroundColor(getBackgroundColor())
    // If the view has no URL, it won't be attached yet
    if (args.id === selectedView) {
      mainWindow.setBrowserView(viewMap[args.id])
    }
  }
  if (SidePanel.alive()) {
    if (sidePanel.get().isFocused()) {
      if (process.platform === 'darwin') {
        // todo 这行之后就会抢夺焦点到view上 只有mac上有需要这样抢夺焦点
        mainWindow.setFocusable(false)
        viewMap[args.id].webContents.loadURL(args.url).then(() => {
          mainWindow.setFocusable(true)
        })
      } else {
        viewMap[args.id].webContents.loadURL(args.url)
      }
    } else {
      viewMap[args.id].webContents.loadURL(args.url)
    }
  } else {
    viewMap[args.id].webContents.loadURL(args.url)
  }

  viewStateMap[args.id].loadedInitialURL = true
})

ipc.on('callViewMethod', function (e, data) {
  var error, result
  try {
    var webContents = viewMap[data.id].webContents
    var methodOrProp = webContents[data.method]
    if (methodOrProp instanceof Function) {
      // call function
      result = methodOrProp.apply(webContents, data.args)
    } else {
      // set property
      if (data.args && data.args.length > 0) {
        webContents[data.method] = data.args[0]
      }
      // read property
      result = methodOrProp
    }
  } catch (e) {
    error = e
  }
  if (result instanceof Promise) {
    result.then(function (result) {
      if (data.callId) {
        sendIPCToMainWindow('async-call-result', { callId: data.callId, error: null, result },false)
      }
    })
    result.catch(function (error) {
      if (data.callId) {
        sendIPCToMainWindow('async-call-result', { callId: data.callId, error, result: null },false)
      }
    })
  } else if (data.callId) {
    sendIPCToMainWindow('async-call-result', { callId: data.callId, error, result },false)
  }
})

ipc.on('getCapture', function (e, data) {
  var view = viewMap[data.id]
  if (!view) {
    // view could have been destroyed
    return
  }

  view.webContents.capturePage().then(function (img) {
    var size = img.getSize()
    if (size.width === 0 && size.height === 0) {
      return
    }
    img = img.resize({ width: data.width, height: data.height })
    mainWindow.webContents.send('captureData', { id: data.id, url: img.toDataURL() })
  })
})

/**
 * 获得高清的截图，并回传给收藏夹添加页面的fav让它去挂载截图
 */
ipc.on('getHDCapture', (event, args) => {
  var view = viewMap[args.id]
  if (!view) {
    return
  }

  view.webContents.capturePage().then(function (img) {
    var size = img.getSize()
    if (size.width === 0 && size.height === 0) {
      return
    }
    const dir = app.getPath('userData') + '/captureTmp/'
    const filename = dir + Date.now() + '.jpg'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.writeFileSync(filename, img.toJPEG(100))
    if (args.favWindowId) {
      // 如果收藏夹id存在，则直发过去
      webContents.fromId(args.favWindowId).send('gotHdCaptureData', { id: args.id, url: filename })
    }
    mainWindow.webContents.send('hDCaptureData', { id: args.id, url: filename })
  })
})

ipc.on('saveViewCapture', function (e, data) {
  var view = viewMap[data.id]
  if (!view) {
    // view could have been destroyed
  }

  view.webContents.capturePage().then(function (image) {
    view.webContents.downloadURL(image.toDataURL())
  })
})

ipc.on('saveViewFullCapture', function (e, data) {
  var view = viewMap[data.id]
  if (!view) {
    // view could have been destroyed
  }

  view.captureFullPage(function (imageStream) {
    // return an image Stream
    const dir = app.getPath('userData') + '/pageCapture'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    const time = String(Date.now())
    const path = dir + '/capture' + time.substr(time.length - 4, time.length) + '.png'
    imageStream.pipe(fs.createWriteStream(path))
    // let image=require('electron').nativeImage.createFromPath(app.getPath('userData')+'/page.png')
    imageStream.on('end', () => {
      view.webContents.downloadURL('file://' + path)
    })
  })
})

global.getView = getView
var emulationViews = []
var oldAgent = ''
// 当前view打开emulation
ipc.on('enableEmulation', function (e, data) {
  if (viewMap[data.id].webContents.getURL().startsWith('file://') || viewMap[data.id].webContents.getURL().startsWith('ts://')) { return }
  mobileMod.add({
    url: viewMap[data.id].webContents.getURL(),
    partition: data.partition,
    newName: data.newName
  })
})
