const localCacheManager = require(path.join(__dirname, '/js/main/localCacheManager.js'))
const { shell } = require('electron')
const fsExtra = require('fs-extra')
const ElectronLog = require('electron-log')
const wallpaper = require('wallpaper')
const STORE_PATH_KEY = 'app.fav.storePath'
async function initFav () {
  const FAV_PACKAGE = 'com.thisky.fav'
  // 设置默认的本地收藏夹位置
  const defaultStorePath = await sqlDb.getConfig(STORE_PATH_KEY, path.join(app.getPath('userData'), '收藏夹.lab'))

  ipc.on('downloadAndSetWallpaper', (event, args) => {
    try {
      const savePath = path.join(defaultStorePath, '壁纸')
      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath)
      }
      const filename = localCacheManager.getHash(args.url).substr(0, 5)
      const filePath = path.join(savePath, filename)
      localCacheManager.fetchContentWithType(args.url, filePath).then((header) => {
        let ext = header.substr(header.lastIndexOf('/') + 1)
        if (ext === 'svg+xml') {
          ext = 'svg'
        }
        fs.renameSync(filePath, filePath + '.' + ext)
        const wallpaper = require('wallpaper')
        wallpaper.set(filePath + '.' + ext)
        event.reply('setWallPaper', { status: 1 })
      })
    } catch (e) {
      event.reply('setWallPaper', { status: 0 })
    }
  })
  // ------------------>
  let canCloseInterval = false
  ipc.on('canCloseInterval', (event, args) => {
    canCloseInterval = true
  })
  const interval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('getUserDataPath', defaultStorePath)
      if (canCloseInterval) {
        clearInterval(interval)
      }
    }
  }, 5000)
  // 以上部分解决子进程中无法获得到当前收藏夹的storePath路径的问题
  // -----------------

  if (!fs.existsSync(defaultStorePath)) {
    /**
     * 初始化收藏夹
     * @param defaultStorePath
     */
    function initLib (defaultStorePath) {
      fs.mkdirSync(defaultStorePath)

      function createDir (parentPath, dirname) {
        if (!fs.existsSync(parentPath)) {
          return false
        } else {
          fs.mkdirSync(path.join(parentPath, dirname))
        }
      }

      const commonFolder = [
        '书签', '图片', '视频', '音频', '密码', '笔记'
      ]
      const jobFolder = {
        develop: [],
        pm: [],
        designer: [],
        salse: []
      }
      commonFolder.forEach(folder => {
        createDir(defaultStorePath, folder)
      })
    }

    initLib(defaultStorePath)
  }
  ipc.on('getUserInfo', (event, args) => {
    SidePanel.send('getUserInfo', { webContentsId: event.sender.id })
  })
  // 采集到的内容本地下载下来保存
  ipc.on('getFavContent', async (event, args) => {
    SidePanel.send('message', { type: 'info', config: { content: '开始下载图片到收藏夹，请稍候…', key: 'fav' } })

    function filterFilename (filename, replaceHolder = ' ') {
      const map = [
        '/', '\\', '|', '?', '"', '*', ':', '<', '>', '\n'
      ]
      map.forEach(replace => {
        filename = filename.replaceAll(replace, replaceHolder)
      })
      return filename
    }

    SidePanel.send('executeAppByPackage', { package: FAV_PACKAGE, background: true })
    const content = args.content
    let filename = Date.now().toString()// content.src.substr(content.src.lastIndexOf('/'))
    if (content.type === 'img') {
      content.src.substr(content.src.lastIndexOf('/'))
      if (filename.length > 30) {
        if (filename.indexOf('?')) {
          filename = filename.substr(0, filename.indexOf('?'))
        }
        filename = filename.substr(0, 30) + filename.substr(filename.indexOf('.'))
      }

      const fullPath = path.join(defaultStorePath, filename)
      localCacheManager.fetchContentWithType(content.src, fullPath).then((header) => {
        let ext = header.substr(header.lastIndexOf('/') + 1)
        if (ext === 'svg+xml') {
          ext = 'svg'
        }
        let newFileName = ''
        if (content.alt !== '') {
          newFileName = content.alt.length > 20 ? content.alt.substr(0, 20) + '.' + ext : content.alt + '.' + ext
        } else if (content.title !== '') {
          newFileName = content.title.length > 20 ? content.title.substr(0, 20) + '.' + ext : content.title + '.' + ext
        } else {
          newFileName = Date.now() + '.' + ext
        }
        newFileName = filterFilename(newFileName) // 过滤一下文件名
        let i = 0
        let testFileName = newFileName
        while (fs.existsSync(path.join(defaultStorePath, testFileName))) {
          i++
          testFileName = newFileName.substr(0, newFileName.lastIndexOf('.')) + '-' + i.toString() + newFileName.substr(newFileName.lastIndexOf('.'))
        }
        let lastPath = testFileName
        lastPath = lastPath
        const storePath = path.join(defaultStorePath, lastPath)// 存储的实际文件名
        fs.renameSync(path.join(defaultStorePath, filename), storePath)
        if (fs.existsSync(path.join(defaultStorePath, newFileName))) {
          // 此时已经保存成功，需要发送消息告诉fav，要更新了
          const timeout = 5000
          let timeGone = 0
          const timer = setInterval(() => {
            if (timeGone >= timeout) {
              // 超时终止
              clearInterval(timer)
            }
            if (appManager.getWindowByPackage(FAV_PACKAGE)) {
              appManager.sendIPCToApp(FAV_PACKAGE, 'addImageMeta', {
                storePath: storePath,
                href: content.href
              })
              clearInterval(timer)
            } else {
              timeGone += 200
            }
          }, 200)
          SidePanel.send('message', { type: 'success', config: { content: '收藏到本地成功。', key: 'fav' } })
        } else {
          SidePanel.send('message', { type: 'error', config: { content: '收藏失败，请检查网络。', key: 'fav' } })
        }
      }).catch(e => {
        console.warn(e)
        SidePanel.send('message', { type: 'error', config: { content: '收藏失败，意外错误。', key: 'fav' } })
      })
    }
  })

  ipc.on('openDir', (event, args) => {
    shell.openPath(args.dir)
  })
  ipc.on('showItemInFolder', (event, args) => {
    let filePath = args.fullPath
    if (process.platform === 'win32') {
      filePath = filePath.replaceAll('/', '\\')
    }
    shell.showItemInFolder(filePath)
  })
  ipc.on('openExternal', async (event, args) => {
    try {
      let filePath = args.fullPath
      if (process.platform === 'win32') {
        filePath = filePath.replaceAll('/', '\\')
      }
      await shell.openPath(filePath).catch((e) => console.warn(e))
    } catch (e) {
      console.warn(e)
    }
  })
  ipc.on('setWallPaper', (event, args) => {
    sendIPCToWindow(mainWindow, 'setNewTabWallPaper', { wallPaper: args.wallPaper, tip: false })
  })
  ipc.on('trashItem', (event, args) => {
    let filePath = args.fullPath
    if (process.platform === 'win32') {
      filePath = filePath.replaceAll('/', '\\')
    }
    shell.trashItem(filePath)
  })
  ipc.on('createDir', (event, args) => {
    try {
      if (fs.existsSync(args.path + '/' + args.dirName)) {
        event.reply('createDirResult', { result: 'false', message: '存在同名文件夹。' })
        return
      }
      fs.mkdirSync(args.path + '/' + args.dirName)
      if (fs.existsSync(args.path + '/' + args.dirName)) {
        event.reply('createDirResult', { result: 'true', message: '创建文件夹成功。' })
      }
    } catch (e) {
      event.reply('createDirResult', { result: 'false', message: '请检查输入是否符合规范。' })
    }
  })
  let popWindow = null

  async function showAddPage () {
    let url = 'pages/fav/index.html'// decodeURI('file://'+path.join(__dirname,'/pages/fav/index.html?=#/popSaveToFolder'))//开发环境测试环境，提交到版本库前注释掉
    const options = {
      hash: 'popSaveToFolder',
      enableRemoteModule: true
    }
    if (isDevelopmentMode) {
      url = 'http://localhost:8080/#/popSaveToFolder'
    }

    const bounds = mainWindow.getBounds()
    const currentBounds = { width: 500, height: 500, x: bounds.x + bounds.width - 510, y: bounds.y + 85 }
    if (!popManager.get('favSaveToFolder')) {
      ipc.on('addPageReady', () => popWindow.window.webContents.send('addPage'))// 首次准备好之后再发消息获取图片，防止过早获取，应用未准备好接收
    }
    popWindow = await popManager.openPop('favSaveToFolder', url, {}, { preload: __dirname + '/pages/fav/preload.js' }, options)
    popWindow.setBounds(currentBounds) // 重新调整位置，不然会保持在首次创建的位置不再变化

    require('@electron/remote/main').enable(popWindow.window.webContents)
    popWindow.window.webContents.send('addPage')
  }

  ipc.on('openPopSaveToFolder', () => {
    showAddPage()
  })
  ipc.on('favContextMenu', (event, args) => {
    const menuTemplate = [{
      label: '收藏网页...',
      click: () => {
        showAddPage()
      }
    }, {
      type: 'separator'
    },
    // {
    //   label: '整页截图保存'
    // },
    // {
    //   label: '此页面禁用拖拽保存'
    // },
    // {
    //   label: '此域名下禁用拖拽保存'
    // },
    // {
    //   type: 'separator'
    // },
    {
      label: '打开超级收藏夹',
      click () {
        protocolManager.handleProtocol('tsb://app/redirect/?package=com.thisky.fav&url=/')
      }
    }]
    const menu = require('electron').Menu.buildFromTemplate(menuTemplate)
    menu.popup()
  })

  ipc.on('getAddPageInfo', (event, args) => {
    sendIPCToWindow(mainWindow, 'getAddPageInfo', { favWindowId: event.sender.id })
  })

  ipc.on('hideFavPop', () => {
    if (popWindow) {
      popWindow.window.hide()
    }
  })
  ipc.on('reloadFav', () => {
    appManager.sendIPCToApp('com.thisky.fav', 'reload')
  })

  ipc.on('exportFile', async (event, args) => {
    const defaultPath = args.parentPath || args.path
    let filePath
    filePath = dialog.showSaveDialogSync({
      title: '导出内容',
      defaultPath: defaultPath,
      properties: [
        'openDirectory'
      ]
    })
    if (!filePath) return
    // if(args.parentPath){
    //    filePath= dialog.showOpenDialogSync({
    //     title:'导出内容',
    //     defaultPath:defaultPath,
    //      properties:[
    //        'openDirectory'
    //      ]
    //   })
    // }else{
    //
    // }
    const storePath = await sqlDb.getConfig(STORE_PATH_KEY)
    if (filePath.startsWith(storePath)) {
      event.reply('error', { message: '导出文件不能导出到收藏夹内。' })
      return
    }
    if (filePath) {
      try {
        fsExtra.copySync(args.path, filePath)
        shell.showItemInFolder(filePath)
        event.reply('success', { message: '导出成功。' })
      } catch (e) {
        event.reply('error', { message: '导出失败，失败原因：' + e.message })
        ElectronLog.log(e)
      }
    }
  })
}
