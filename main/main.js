const electron = require('electron')
const fs = require('fs')
const path = require('path')
const electronLog=require('electron-log')
const SpaceManager=require(__dirname+'/src/main/spaceManager.js')
electron.protocol.registerSchemesAsPrivileged([
  { scheme: 'tsbapp', privileges: { bypassCSP: true ,standard:true} } //将tsbapp注册为标准协议，以支持localStorage
])
let forceClose = false //是否强制退出应用
var clipboardContent=''
var spaceManager
const {
  app, // Module to control application life.
  protocol, // Module to control protocol handling
  BrowserWindow, // Module to create native browser window.
  webContents,
  session,
  ipcMain: ipc,
  Menu, MenuItem,
  crashReporter,
  dialog,
  nativeTheme,
  globalShortcut
} = electron

crashReporter.start({
	submitURL: 'https://minbrowser.org/',
	uploadToServer: false,
	compress: true
})

if (process.argv.some(arg => arg === '-v' || arg === '--version')) {
	console.log('Min: ' + app.getVersion())
	console.log('Chromium: ' + process.versions.chrome)
	process.exit()
}

let isInstallerRunning = false
const isDevelopmentMode = process.argv.some(arg => arg === '--development-mode')
 if (process.platform === 'win32')
{
  //修复通知出现应用名electron.app
    app.setAppUserModelId(app.name);
}
function clamp(n, min, max) {
	return Math.max(Math.min(n, max), min)
}
//如果是命令行下，会执行注册表的功能。
if (process.platform === 'win32') {
	// (async function() {
  //   await registryInstaller.install().then(()=>{
  //     console.log('reg success')
  //   },(err)=>{
  //     console.log(err)
  //   })
    // registryInstaller.uninstall()
		// var squirrelCommand = process.argv[1]
		// if (squirrelCommand === '--squirrel-install' || squirrelCommand === '--squirrel-updated') {
		// 	isInstallerRunning = true
		// 	await registryInstaller.install()
		// }
		// if (squirrelCommand === '--squirrel-uninstall') {
		// 	isInstallerRunning = true
		// 	await registryInstaller.uninstall()
		// }
		// if (require('electron-squirrel-startup')) {
		// 	app.quit()
		// }
	// })()
}

if (isDevelopmentMode) {
	app.setPath('userData', app.getPath('userData') + '-development')
}
electronLog.transports.file.file=app.getPath('userData')+'/myLog.log'

electronLog.transports.file.level = "debug"
electronLog.transports.console.level='debug'
// workaround for flicker when focusing app (https://github.com/electron/electron/issues/17942)
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true')
var userDataPath = app.getPath('userData')

const browserPage = 'file://' + __dirname + '/index.html'

var mainWindow = null
var mainWindowIsMinimized = false // workaround for https://github.com/minbrowser/min/issues/1074
var mainMenu = null
var secondaryMenu = null
var isFocusMode = false
var appIsReady = false
var isToolbar = true

const isFirstInstance = app.requestSingleInstanceLock()

if (!isFirstInstance) {
	app.quit()
	return
}

var saveWindowBounds = function() {
	if (mainWindow) {
		var bounds = Object.assign(mainWindow.getBounds(), {
			maximized: mainWindow.isMaximized()
		})
		fs.writeFileSync(path.join(userDataPath, 'windowBounds.json'), JSON.stringify(bounds))
	}
}

function sendIPCToWindow(window, action, data) {
	// if there are no windows, create a new one
	if (!mainWindow) {
		createWindow(function() {
			mainWindow.webContents.send(action, data || {})
		})
	} else {
		mainWindow.webContents.send(action, data || {})
	}
}

function openTabInWindow(url) {
	sendIPCToWindow(mainWindow, 'addTab', {
		url: url
	})
}

function handleCommandLineArguments(argv) {
	// the "ready" event must occur before this function can be used
	if (argv) {
		argv.forEach(function(arg, idx) {
			if (arg && arg.toLowerCase() !== __dirname.toLowerCase()) {
				// URL
				if (arg.indexOf('://') !== -1) {
					sendIPCToWindow(mainWindow, 'addTab', {
						url: arg
					})
				} else if (idx > 0 && argv[idx - 1] === '-s') {
					// search
					sendIPCToWindow(mainWindow, 'addTab', {
						url: arg
					})
				} else if (/\.(m?ht(ml)?|pdf)$/.test(arg) && fs.existsSync(arg)) {
					// local files (.html, .mht, mhtml, .pdf)
					sendIPCToWindow(mainWindow, 'addTab', {
						url: 'file://' + path.resolve(arg)
					})
				}
			}
		})
	}
}

function createWindow(cb) {
	fs.readFile(path.join(userDataPath, 'windowBounds.json'), 'utf-8', function(e, data) {
		var bounds
    let displayBounds
    if (data) {
			try {
				bounds = JSON.parse(data)
			} catch (e) {
				console.warn('error parsing window bounds file: ', e)
			}
		}
		if (e || !data || !bounds) { // there was an error, probably because the file doesn't exist
			var size = electron.screen.getPrimaryDisplay().workAreaSize
      const initWidth=1366
      const initHeight=950
      let width=size.width>initWidth?initWidth:size.width
      let height=(size.width>initWidth && initHeight<size.height)?initHeight:size.height

			bounds = {
        x:size.width/2-width/2,
        y:size.height/2-height/2,
				width: width,
				height: height,
				maximized: false
			}
      displayBounds={
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
      }
		}else{
      displayBounds=bounds
    }



		// make the bounds fit inside a currently-active screen
		// (since the screen Min was previously open on could have been removed)
		// see: https://github.com/minbrowser/min/issues/904
		var containingRect = electron.screen.getDisplayMatching(displayBounds).workArea

		bounds = {
      x:containingRect.width/2-bounds.width/2,
      y:containingRect/2-bounds.height/2,
			width: bounds.width,
			height: bounds.height,
			maximized: bounds.maximized
		}

		createWindowWithBounds(bounds)

		if (cb) {
			cb()
		}
	})
}



function createWindowWithBounds(bounds) {
  let icon=__dirname + '/icons/logo1024.png'

  if(process.platform==='win32'){
    icon=__dirname + '/icons/logowin.ico'
  }
	mainWindow = new BrowserWindow({
		width: bounds.width,
		height: bounds.height,
		x: bounds.x,
		y: bounds.y,
		minWidth: (process.platform === 'win32' ? 600 :
			320), // controls take up more horizontal space on Windows
		minHeight: 350,
		titleBarStyle: settings.get('useSeparateTitlebar') ? 'default' : 'hidden',
		trafficLightPosition: {
			x: 12,
			y: 10
		},
    show:false,
		icon: icon,
		frame: settings.get('useSeparateTitlebar'),
		alwaysOnTop: settings.get('windowAlwaysOnTop'),
		backgroundColor: '#fff',//backgroundColor: '#fff', // the value of this is ignored, but setting it seems to work around https://github.com/electron/electron/issues/10559
		webPreferences: {
      preload: __dirname + '/js/defaultPreload.js',
			nodeIntegration: true,
			contextIsolation: false,
			nodeIntegrationInWorker: true, // used by ProcessSpawner
			additionalArguments: [
				'--user-data-path=' + userDataPath,
				'--app-version=' + app.getVersion(),
				'--app-name=' + app.getName(),
				...((isDevelopmentMode ? ['--development-mode'] : [])),
			]
		}
	})
  forceClose=false

	// windows and linux always use a menu button in the upper-left corner instead
	// if frame: false is set, this won't have any effect, but it does apply on Linux if "use separate titlebar" is enabled
	if (process.platform !== 'darwin') {
		mainWindow.setMenuBarVisibility(false)
	}
  if(require('electron').session.defaultSession.protocol.isProtocolRegistered('crx')===false){
    browser = new Browser(electron.session.fromPartition('persist:webcontent'))
    let timer=setInterval(()=>{
      // console.log('检查会话是否注册了协议',require('electron').session.defaultSession.protocol.isProtocolRegistered('crx'))
      if(require('electron').session.defaultSession.protocol.isProtocolRegistered('crx'))
      {
        mainWindow.loadURL(browserPage)
        clearInterval(timer)
      }
    },100)
  }else{
    browser = new Browser(electron.session.fromPartition('persist:webcontent'))
    mainWindow.loadURL(browserPage)
  }

	// and load the index.html of the app.


	if (bounds.maximized) {
		mainWindow.maximize()

		mainWindow.webContents.on('did-finish-load', function() {
			sendIPCToWindow(mainWindow, 'maximize')
		})
	}

	mainWindow.on('close', function(e) {
    if(!canCloseMainWindow){
      safeCloseMainWindow()//发送给主窗体，告知其需要安全关闭，其准备好关闭后会重新触发
      mainWindow.hide()
      e.preventDefault()
      return
    }
		destroyAllViews()
		// save the window size for the next launch of the app
		saveWindowBounds()
	})
  mainWindow.on('ready-to-show',()=>{
    mainWindow.show()
    loadSidePanel()
    getAllAppsWindow()
    changingSpace=false
  })
  function checkClipboard(){
    let latestClipboardContent=clipboard.readText()
    if(latestClipboardContent!==clipboardContent && (latestClipboardContent.startsWith('http://') || latestClipboardContent.startsWith('https://')))
    {
      clipboardContent=latestClipboardContent
      sendIPCToWindow(mainWindow,'showClipboard',{url:latestClipboardContent})
    }
  }
  let ClipTimer=setInterval(()=>{
    if(mainWindow){
      if(!mainWindow.isDestroyed()){
        if(mainWindow.isFocused() && mainWindow.isVisible()){
          checkClipboard()
        }
      }
    }
  },1000)
  mainWindow.on('focus',()=>{
    checkClipboard()
  })


	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
		mainWindowIsMinimized = false
    if(process.platform==='win32' && !changingSpace){
     //windows上，且不是在切换空间，则关闭整个应用
      // todo 如果做了托盘菜单，这里不需要直接退出app
     app.quit()

    }
	})

	mainWindow.on('focus', function() {
		if (!mainWindowIsMinimized) {
			sendIPCToWindow(mainWindow, 'windowFocus')
		}
	})

	mainWindow.on('minimize', function() {
		sendIPCToWindow(mainWindow, 'minimize')
		mainWindowIsMinimized = true
	})

	mainWindow.on('restore', function() {
		mainWindowIsMinimized = false
	})

	mainWindow.on('maximize', function() {
		sendIPCToWindow(mainWindow, 'maximize')
	})

	mainWindow.on('unmaximize', function() {
		sendIPCToWindow(mainWindow, 'unmaximize')
	})

	mainWindow.on('enter-full-screen', function() {
		sendIPCToWindow(mainWindow, 'enter-full-screen')
	})

	mainWindow.on('leave-full-screen', function() {
		sendIPCToWindow(mainWindow, 'leave-full-screen')
		// https://github.com/minbrowser/min/issues/1093
		mainWindow.setMenuBarVisibility(false)
	})

	mainWindow.on('enter-html-full-screen', function() {
		sendIPCToWindow(mainWindow, 'enter-html-full-screen')
	})

	mainWindow.on('leave-html-full-screen', function() {
		sendIPCToWindow(mainWindow, 'leave-html-full-screen')
		// https://github.com/minbrowser/min/issues/952
		mainWindow.setMenuBarVisibility(false)
	})

	mainWindow.on('showBookmarks',function(){
		sendIPCToWindow(mainWindow,'showBookmarks')
	})

	//loadSidebar()
	sendIPCToWindow(mainWindow,'getTitlebarHeight')
	addMainWindowEventListener()


	/*
	Handles events from mouse buttons
	Unsupported on macOS, and on Linux, there is a default handler already,
	so registering a handler causes events to happen twice.
	See: https://github.com/electron/electron/issues/18322
	*/
	if (process.platform === 'win32') {
		mainWindow.on('app-command', function(e, command) {
			if (command === 'browser-backward') {
				sendIPCToWindow(mainWindow, 'goBack')
			} else if (command === 'browser-forward') {
				sendIPCToWindow(mainWindow, 'goForward')
			}
		})
	}

	// prevent remote pages from being loaded using drag-and-drop, since they would have node access
	mainWindow.webContents.on('will-navigate', function(e, url) {
		if (url !== browserPage) {
			e.preventDefault()
		}
	})

	mainWindow.setTouchBar(buildTouchBar())
  global.utilWindow = mainWindow
	return mainWindow

}





// Quit when all windows are closed.
app.on('window-all-closed', function() {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin' && !changingSpace) {
		app.quit()
	}
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', async function () {
  settings.set('restartNow', false)
  appIsReady = true

  /* the installer launches the app to install registry items and shortcuts,
  but if that's happening, we shouldn't display anything */
  if (isInstallerRunning) {
    return
  }

  //预先创建好快速启动窗口
  //createLanuchBar()
//app.lanuchBar.show()

  // if (isDevelopmentMode) {
  // 	session.defaultSession.loadExtension(
  // 		path.join(__dirname, 'devtools-5.3.4/packages/shell-chrome'),
  // 		// allowFileAccess is required to load the devtools extension on file:// URLs.
  // 		{
  // 			allowFileAccess: true
  // 		}
  // 	)
  // }
  //注册快捷键，用于展示启动界面
  // globalShortcut.register('alt+space', () => {
  // 	//注册全局快捷键
  // 	//todo 判断一下注册失败
  // 	console.log('Electron loves global shortcuts!')

  // 	if (app.lanuchBar) {
  // 		if(app.lanuchBar.isVisible()){
  // 			app.lanuchBar.hide()  //如果已经存在，则隐藏
  // 		}else{
  // 			app.lanuchBar.show()
  // 		}

  // 	} else {
  // 		createLanuchBar()
  // 	}

  // })

  //todo before create
  spaceManager = new SpaceManager()
  await spaceManager.ensureDb()
  mainMenu = buildAppMenu()
  Menu.setApplicationMenu(mainMenu)
  createDockMenu()
  appStart()

})
function handleUrlOpen(url){
  if (appIsReady) {
    sendIPCToWindow(mainWindow, 'addTab', {
      url: url
    })
    if(mainWindow){
      if(mainWindow.isMinimized()){
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  } else {
    global.URLToOpen = url // this will be handled later in the createWindow callback
  }
}
app.on('open-url', function(e, url) {
  handleUrlOpen(url)
})
app.on('open-file', function(e, url) {
  handleUrlOpen('file://'+url)
})
app.on('second-instance', function(e, argv, workingDir) {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore()
		}
		mainWindow.focus()
		// add a tab with the new URL
		handleCommandLineArguments(argv)
	}
})

/**
 * Emitted when the application is activated, which usually happens when clicks on the applications's dock icon
 * https://github.com/electron/electron/blob/master/docs/api/app.md#event-activate-os-x
 *
 * Opens a new tab when all tabs are closed, and min is still open by clicking on the application dock icon
 */
app.on('activate', function( /* e, hasVisibleWindows */ ) {
	if (!mainWindow &&
		appIsReady
		) { // sometimes, the event will be triggered before the app is ready, and creating new windows will fail
		//createWindow()
    appStart()
	}
})

/**
 * 启动应用，此方法会自动判断是否启动的时候显示选择空间的面板
 * @returns {Promise<void>}
 */
async function appStart () {
  const { SqlDb } = require('./src/util/sqldb.js')
  let sqlDb = new SqlDb()
  let showOnStart = await sqlDb.getConfig('system.user.showOnStart')
  if (!showOnStart) {
    createWindow(function () {
      mainWindow.webContents.on('did-finish-load', function () {
        // if a URL was passed as a command line argument (probably because Min is set as the default browser on Linux), open it.
        handleCommandLineArguments(process.argv)
        // there is a URL from an "open-url" event (on Mac)
        if (global.URLToOpen) {
          // if there is a previously set URL to open (probably from opening a link on macOS), open it
          sendIPCToWindow(mainWindow, 'addTab', {
            url: global.URLToOpen
          })
          global.URLToOpen = null
        }
      })
    })
  } else {
    showUserWindow()
  }
}


ipc.on('focusMainWebContents', function() {
	mainWindow.webContents.focus()
})

ipc.on('showSecondaryMenu', function(event, data) {
	if (!secondaryMenu) {
		secondaryMenu = buildAppMenu({
			secondary: true
		})
	}
	secondaryMenu.popup({
		x: data.x,
		y: data.y
	})
})


//设置默认浏览器部分结束
ipc.on('quit', function() {
	app.quit()
})
var sessions=[]
app.on('ready', function() {
  nativeTheme.on('updated', function () {
    settings.set('systemShouldUseDarkColors', electron.nativeTheme.shouldUseDarkColors)
  })

  if (electron.nativeTheme.shouldUseDarkColors !== settings.get('systemShouldUseDarkColors')) {
    settings.set('systemShouldUseDarkColors', electron.nativeTheme.shouldUseDarkColors)
  }

app.on('session-created',async (ses)=>{
  sessions.push(ses)
  ses.protocol.registerBufferProtocol('tsbapp', (request, response) => {
    render.regDefaultProtocol(request, response)
  })
  if(ses!==session.defaultSession && session!==session.fromPartition('persist:webcontent')){
    if(typeof browser!=='undefined')
      await browser.ensureExtension(ses) //如果不是默认会话和网页会话，就载入插件
  }
})
})

// ipc.on('showBookmarks',function(){
// 	mainWindow.removeBrowserView(sidebarView)
// 	sendIPCToWindow(mainWindow,'showBookmarks')

// })
/**
 * 安全关闭主窗体，主窗体会先同步完成空间保存，之后再发送ipc告诉主进程进行安全关闭
 */
function safeCloseMainWindow(){
  sendIPCToWindow(mainWindow,'safeClose')
}
let canCloseMainWindow=false
ipc.on('closeMainWindow',()=>{
  if(mainWindow && !mainWindow.isDestroyed()){
    canCloseMainWindow=true
    mainWindow.close()
  }
})

let canQuit=false
ipc.on('quitApp',()=>{
  canQuit=true
  app.quit()
})
ipc.on('errorClose',(e,args)=>{
  //此处为遇到意外的情况下，重新显示mainWindow，并提示用户保存失败。可再次点击关闭。
  electronLog.error('意外关闭',args.error)
  if(!mainWindow.isDestroyed()){
    mainWindow.show()
    sendMessage({type:'error',config:{content:'关闭保存意外失败，您可以再次点击关闭，在不保存的情况下继续使用，此消息将在10秒后自动消失。',duration:'10'}})
  }
})

var barrageManager=null //全局可用
const { BarrageManager }=require(path.join(__dirname,'/src/main/barrageManager.js'))
app.whenReady().then(()=>{
  setTimeout(()=>{
    barrageManager=new BarrageManager({
      parent:mainWindow
    })
    //barrageManager.init()
  },3000)


  ipc.on('toggleBarrage',()=>{
    if(BarrageManager.isAlive()){
      if(barrageManager.isLocked){
        barrageManager.unlock()
        return
      }
      barrageManager.destroy()
    }else{
      barrageManager.init()
    }
  })
  ipc.on('barrage.changeUrl',(e,a)=>{
    if(barrageManager)
     barrageManager.changeUrl(a.url)
  })

  ipc.on('tabs.current',(e,a)=>{
    //这是一个非常经典的ipc.sendSync的回调实现。
    function getCurrentTab(callBack){
      ipc.once('gotCurrentTab',(e,args)=>{
        callBack(args.data)
      })
      sendIPCToWindow(mainWindow,'getCurrentTab')
    }
    getCurrentTab((data)=>{
      e.returnValue=data
    })
  })

  ipc.on('barrage.lock',(e,a)=>{
    barrageManager.lock()
  })
})
