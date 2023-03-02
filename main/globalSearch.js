let globalSearch = null

const globalSearchMod = {
  init: function () {
    if (globalSearch !== null) {
      if (globalSearch.isFocused()) {
        globalSearch.hide()
      } else {
        globalSearch.show()
        globalSearch.focus()
      }
      return
    }
    if (isWin) {
      globalSearch = new BrowserWindow({
        alwaysOnTop: true,
        minimizable: false,
        parent: null,
        width: 600,
        height: 280,
        minHeight: 150,
        maxHeight: 520,
        maximizable: false,
        resizable: true,
        frame: false,
        backgroundColor: '#fff',
        webPreferences: {
          devTools: true,
          preload: path.join(__dirname, '/src/preload/searchPreload.js'),
          nodeIntegration: true,
          contextIsolation: false,
          additionalArguments: [
            '--user-data-path=' + userDataPath,
            '--app-version=' + app.getVersion(),
            '--app-name=' + app.getName(),
            ...((isDevelopmentMode ? ['--development-mode'] : []))
          ]
        }
      })
    } else {
      globalSearch = new BrowserWindow({
        alwaysOnTop: true,
        minimizable: false,
        parent: null,
        width: 600,
        height: 280,
        minHeight: 150,
        maxHeight: 520,
        maximizable: false,
        resizable: false,
        frame: false,
        backgroundColor: '#00000000',
        transparent: true,
        webPreferences: {
          devTools: true,
          nodeIntegration: true,
          contextIsolation: false,
          additionalArguments: [
            '--user-data-path=' + userDataPath,
            '--app-version=' + app.getVersion(),
            '--app-name=' + app.getName(),
            ...((isDevelopmentMode ? ['--development-mode'] : []))
          ]
        }
      })
    }

    globalSearch.webContents.loadURL(render.getUrl('search.html'))

    globalSearch.on('close', () => globalSearch = null)

    globalSearch.webContents.on('did-finish-load', () => {
      globalSearch.webContents.send('viewLoaded')
    })

    globalSearch.on('blur', () => {
      globalSearch.hide()
    })

    globalSearch.on('will-resize', (event, args) => {
      event.preventDefault()
    })
  }
}
const TableManager = require('./src/main/tableManager.js')
const TableAppManager = require('./src/main/tableAppManager.js')
global.tableManager = new TableManager()
app.whenReady().then(async () => {
  global.tableAppManager = new TableAppManager()
  let tableShortcut = settings.get('tableShortcut')
  let registerResult = false
  if (tableShortcut === undefined) {
    tableShortcut = 'alt+space'
  }

  async function callTable () {
    await tableManager.init()
    global.tableAppManager.setTableWin(tableManager.window)
  }

  registerResult = globalShortcut.register(tableShortcut, async () => {
    await callTable()
  })
  if (registerResult === false) {
    let notification = new Notification({
      title: '工作台通知',
      body: '呼出工作台快捷键[' + tableShortcut + ']被占用，请修改快捷键后使用。为您直接打开工作台。',
      timeoutType: 'never'
    })
    notification.show()
    await callTable()
  }

  let tableMod = settings.get('tableMod')
  if (tableMod === undefined || tableMod === 'table') {
    callTable().then()//呼出工作台
  }

  // Register a 'CommandOrControl+X' shortcut listener.
  const keyMap = settings.get('keyMap')
  let quick = 'Alt+F'
  if (keyMap) {
    if (keyMap.globalSearch) {
      quick = keyMap.globalSearch
    }
  }
  globalShortcut.register(quick, () => {
    globalSearchMod.init()

    // statsh 快捷键打开全局搜索
    if (globalSearch && globalSearch.isFocused()) {
      statsh.do({
        action: 'increase',
        key: 'globalSearchBaseShortOpen',
        value: 1
      })
    }
  })

  ipc.on(ipcMessageMain.sidePanel.openGlobalSearch, () => {
    globalSearchMod.init()

    // statsh 点击打开全局搜索
    if (globalSearch && globalSearch.isFocused()) {
      statsh.do({
        action: 'increase',
        key: 'globalSearchBaseClickOpen',
        value: 1
      })
    }
  })

  ipc.on('transmitTaskList', (event, args) => {
    if (globalSearch) {
      globalSearch.webContents.send('processTransmitTaskList', args)
    }
  })

  ipc.on('changeBrowserWindowHeight', (event, args) => {
    globalSearch.setSize(600, args)
  })

  ipc.on('closeGlobalSearch', () => {
    globalSearch.hide()
  })

  ipc.on('executeTableApp', async (event, args) => {
    console.log('接收到启动应用的请求')
    let appInstance = await tableAppManager.executeApp({ app: args.app, position: args.position })
  })

  ipc.on('closeTableApp', (event, args) => {
    tableAppManager.closeApp(tableAppManager.getName(args.app.name))
  })
  ipc.on('hideTableApp', (event, args) => {
    tableAppManager.hideApp(tableAppManager.getName(args.app.name))
  })

  const ffi = require('ffi-napi');

  /**
   * 先定义一个函数, 用来在窗口中显示字符
   * @param {String} text
   * @return {*} none
   */
  function showText (text) {
    return new Buffer(text, 'ucs2').toString('binary');
  };
// 通过ffi加载user32.dll
  const myUser32 = new ffi.Library('user32', {
    'GetSystemMetrics': // 声明这个dll中的一个函数
      [
        'int32', ['int32'], // 用json的格式罗列其返回类型和参数类型
      ],
  });
// 调用user32.dll中的MessageBoxW()函数, 弹出一个对话框
  const out = myUser32.GetSystemMetrics(94)
  console.log(out);

  ipc.handle('shell', (event, args) => {
    if (args.cmd) {
      require('child_process').exec(__dirname + '/ext/cmd/x64/nircmdc.exe ' + args.cmd, (err, stdout, stderr) => {
        console.log({
          err, stdout, stderr
        })
        event.returnValue = {
          err, stdout, stderr
        }
      })
    }
  })

})
