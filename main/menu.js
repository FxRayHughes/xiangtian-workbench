const {
  default: installExtension,
  VUEJS3_DEVTOOLS,
  VUEJS_DEVTOOLS,
  REACT_DEVELOPER_TOOLS
} = require('electron-devtools-installer')

const devPlugin = {}
devPlugin[VUEJS3_DEVTOOLS.id] = { installed: false }
devPlugin[VUEJS_DEVTOOLS.id] = { installed: false }
devPlugin[REACT_DEVELOPER_TOOLS.id] = { installed: false }

function buildAppMenu (options = {}) {
  function getFormattedKeyMapEntry (keybinding) {
    const value = settings.get('keyMap')?.[keybinding]

    if (value) {
      if (Array.isArray(value)) {
        // value is array if multiple entries are set
        return value[0].replace('mod', 'CmdOrCtrl')
      } else {
        return value.replace('mod', 'CmdOrCtrl')
      }
    }

    return null
  }

  var tabTaskActions = [
    {
      label: l('appMenuNewTab'),
      accelerator: getFormattedKeyMapEntry('addTab') || 'CmdOrCtrl+t',
      click: function (item, window, event) {
        // keyboard shortcuts for these items are handled in the renderer
        if (!event.triggeredByAccelerator) {
          sendIPCToWindow(window, 'addTab')
        }
      }
    },
    {
      label: l('appMenuDuplicateTab'),
      accelerator: getFormattedKeyMapEntry('duplicateTab') || 'shift+CmdOrCtrl+d',
      click: function (item, window, event) {
        if (!event.triggeredByAccelerator) {
          sendIPCToWindow(window, 'duplicateTab')
        }
      }
    },
    {
      label: l('appMenuNewPrivateTab'),
      accelerator: getFormattedKeyMapEntry('addPrivateTab') || 'shift+CmdOrCtrl+p',
      click: function (item, window, event) {
        if (!event.triggeredByAccelerator) {
          sendIPCToWindow(window, 'addPrivateTab')
        }
      }
    },
    {
      label: l('appMenuNewTask'),
      accelerator: getFormattedKeyMapEntry('addTask') || 'CmdOrCtrl+n',
      click: function (item, window, event) {
        if (!event.triggeredByAccelerator) {
          sendIPCToWindow(window, 'addTask')
        }
      }
    }
  ]

  var personalDataItems = [
    {
      label: l('appMenuBookmarks'),
      accelerator: getFormattedKeyMapEntry('showBookmarks') || 'CmdOrCtrl+b',
      click: function (item, window, event) {
        if (!event.triggeredByAccelerator) {
          sendIPCToWindow(window, 'showBookmarks')
        }
      }
    },
    {
      label: l('appMenuHistory'),
      accelerator: getFormattedKeyMapEntry('showHistory') || 'Shift+CmdOrCtrl+h',
      click: function (item, window, event) {
        if (!event.triggeredByAccelerator) {
          sendIPCToWindow(window, 'showHistory')
        }
      }
    }
  ]

  var quitAction = {
    label: l('appMenuQuit').replace('%n', app.name),
    accelerator: getFormattedKeyMapEntry('quitMin') || 'CmdOrCtrl+Q',
    click: function (item, window, event) {
      if (!event.triggeredByAccelerator) {
        app.quit()
      }
    }
  }

  var preferencesAction = {
    label: l('appMenuPreferences'),
    accelerator: 'CmdOrCtrl+,',
    click: function (item, window) {
      openSetting()
    }
  }

  ipc.on('changeToolbar', () => {
    isToolbar = false
  })
  var template = [
    ...(options.secondary ? tabTaskActions : []),
    ...(options.secondary ? [{ type: 'separator' }] : []),
    ...(options.secondary ? personalDataItems : []),
    ...(options.secondary ? [{ type: 'separator' }] : []),
    ...(options.secondary ? [preferencesAction] : []),
    ...(options.secondary ? [{ type: 'separator' }] : []),
    ...(process.platform === 'darwin'
      ? [
        {
          label: app.name,
          submenu: [
            {
              label: l('appMenuAbout').replace('%n', app.name),
              role: 'about'
            },
            {
              type: 'separator'
            },
            preferencesAction,
            {
              label: 'Services',
              role: 'services',
              submenu: []
            },
            {
              type: 'separator'
            },
            {
              label: l('appMenuHide').replace('%n', app.name),
              accelerator: 'CmdOrCtrl+H',
              role: 'hide'
            },
            {
              label: l('appMenuHideOthers'),
              accelerator: 'CmdOrCtrl+Alt+H',
              role: 'hideothers'
            },
            {
              label: l('appMenuShowAll'),
              role: 'unhide'
            },
            {
              type: 'separator'
            },
            quitAction
          ]
        }
      ] : []),

    {
      label: l('appMenuFile'),
      submenu: [
        ...(!options.secondary ? tabTaskActions : []),
        ...(!options.secondary ? [{ type: 'separator' }] : []),
        {
          label: '截图',
          submenu: [
            {
              label: '可见区域',
              click: () => {
                sendIPCToWindow(mainWindow, 'saveViewCapture')
              }
            },
            {
              label: '整页',
              click: () => {
                sendIPCToWindow(mainWindow, 'saveViewFullCapture')
              }
            }
          ]
        },
        {
          label: l('appMenuSavePageAs'),
          submenu: [
            {
              label: '文件',
              accelerator: 'CmdOrCtrl+s',
              click: function (item, window) {
                sendIPCToWindow(window, 'saveCurrentPage')
              }
            },
            {
              label: 'PDF',
              click: function (item, window) {
                sendIPCToWindow(window, 'saveCurrentPageToPdf')
              }
            }
          ]

        },
        {
          type: 'separator'
        },
        {
          label: l('appMenuPrint'),
          accelerator: 'CmdOrCtrl+p',
          click: function (item, window) {
            sendIPCToWindow(window, 'print')
          }
        },
        {
          label: '打开用户数据目录',
          click: function () {
            electron.shell.openPath(app.getPath('userData'))
          }
        },
        ...(!options.secondary && process.platform === 'linux' ? [{ type: 'separator' }] : []),
        ...(!options.secondary && process.platform === 'linux' ? [quitAction] : [])
      ]
    },
    {
      label: l('appMenuEdit'),
      submenu: [
        {
          label: l('appMenuUndo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: l('appMenuRedo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: l('appMenuCut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: l('appMenuCopy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: l('appMenuPaste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: l('appMenuSelectAll'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
        {
          type: 'separator'
        },
        {
          label: l('appMenuFind'),
          accelerator: 'CmdOrCtrl+F',
          click: function (item, window) {
            sendIPCToWindow(window, 'findInPage')
          }
        },
        ...(!options.secondary && process.platform !== 'darwin' ? [{ type: 'separator' }] : []),
        ...(!options.secondary && process.platform !== 'darwin' ? [preferencesAction] : [])
      ]
    },
    {
      label: '导航',
      submenu: [
        {
          label: '选择器',
          accelerator: 'Ctrl+tab',
          click: function (item, window) {
            createSwitchTask()
          }
        }
      ]
    },
    {
      label: l('appMenuView'),
      submenu: [
        ...(!options.secondary ? personalDataItems : []),
        ...(!options.secondary ? [{ type: 'separator' }] : []),
        {
          label: l('appMenuZoomIn'),
          accelerator: 'CmdOrCtrl+Plus',
          click: function (item, window) {
            sendIPCToWindow(window, 'zoomIn')
          }
        },
        {
          label: l('appMenuZoomOut'),
          accelerator: 'CmdOrCtrl+-',
          click: function (item, window) {
            sendIPCToWindow(window, 'zoomOut')
          }
        },
        {
          label: l('appMenuActualSize'),
          accelerator: 'CmdOrCtrl+0',
          click: function (item, window) {
            sendIPCToWindow(window, 'zoomReset')
          }
        },
        {
          type: 'separator'
        },
        {
          label: l('appMenuFocusMode'),
          accelerator: undefined,
          type: 'checkbox',
          checked: false,
          click: function (item, window) {
            if (isFocusMode) {
              isFocusMode = false
              sendIPCToWindow(window, 'exitFocusMode')
            } else {
              isFocusMode = true
              sendIPCToWindow(window, 'enterFocusMode')
            }
          }
        },
        {
          label: '显示/隐藏工具栏',
          accelerator: undefined,
          click: function (item, window) {
            if (isToolbar) {
              isToolbar = false
              sendIPCToWindow(window, 'hideToolbar')
            } else {
              isToolbar = true
              sendIPCToWindow(window, 'openToolbar')
            }
          }
        },
        {
          label: l('appMenuFullScreen'),
          accelerator: (function () {
            if (process.platform == 'darwin') {
              return 'Ctrl+Command+F'
            } else {
              return 'F11'
            }
          })(),
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: l('appMenuDeveloper'),
      submenu: [
        {
          label: l('appMenuInspectPage'),
          accelerator: (function () {
            if (process.platform == 'darwin') {
              return 'F12'
            } else {
              return 'F12'
            }
          })(),
          click: function (item, window) {
            sendIPCToWindow(window, 'inspectPage')
          }
        },
        {
          type: 'separator'
        },
        {
          label: l('appMenuReloadBrowser'),
          accelerator: undefined,
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              reloadBrowser(focusedWindow)
            }
          }
        },
        {
          label: l('appMenuInspectBrowser'),
          accelerator: (function () {
            if (process.platform === 'darwin') {
              return 'Shift+Cmd+Alt+I'
            } else {
              return 'Ctrl+Shift+Alt+I'
            }
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) focusedWindow.toggleDevTools()
          }
        },
        {
          type: 'separator'
        },
        {
          label: '一键启用开发扩展',
          submenu: [
            {
              label: '⭐⭐⭐️安装插件需要挂梯子⭐⭐⭐️'
            },
            {
              label: 'Vue2扩展',
              type: 'checkbox',
              checked: devPlugin[VUEJS_DEVTOOLS.id].installed,
              click: function () {
                installDevPlugin(VUEJS_DEVTOOLS)
              }
            }, {
              label: 'Vue3扩展',
              type: 'checkbox',
              checked: devPlugin[VUEJS3_DEVTOOLS.id].installed,
              click: () => {
                installDevPlugin(VUEJS3_DEVTOOLS)
              }
            },
            {
              label: 'React扩展',
              type: 'checkbox',
              checked: devPlugin[REACT_DEVELOPER_TOOLS.id].installed,
              click: () => {
                installDevPlugin(REACT_DEVELOPER_TOOLS)
              }
            }]
        },
        {
          type: 'separator'
        },
        {
          label: '管理开发中的项目',
          icon: ___dirname + '/vite/dist/icons/dev.png',
          click: () => {
            appManager.openAppVite('/allDevApps')
          }
        }
      ]
    },
    ...(process.platform === 'darwin' ? [
      {
        label: l('appMenuWindow'),
        role: 'window',
        submenu: [
          {
            label: l('appMenuMinimize'),
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
          },
          {
            label: l('appMenuClose'),
            accelerator: 'CmdOrCtrl+W',
            click: function (item, window) {
              if (mainWindow && !mainWindow.isFocused()) {
                // a devtools window is focused, close it
                var contents = webContents.getAllWebContents()
                for (var i = 0; i < contents.length; i++) {
                  if (contents[i].isDevToolsFocused()) {
                    contents[i].closeDevTools()
                    return
                  }
                }
              }
              // otherwise, this event will be handled in the main window
            }
          },
          {
            label: l('appMenuAlwaysOnTop'),
            type: 'checkbox',
            checked: settings.get('windowAlwaysOnTop') || false,
            click: function (item, window) {
              if (mainWindow) {
                mainWindow.setAlwaysOnTop(item.checked)
              }
              settings.set('windowAlwaysOnTop', item.checked)
            }
          },
          {
            type: 'separator'
          },
          {
            label: l('appMenuBringToFront'),
            role: 'front'
          }
        ]
      }
    ] : []),
    {
      label: l('appMenuHelp'),
      role: 'help',
      submenu: [
        {
          label: l('appMenuKeyboardShortcuts'),
          click: function () {
            openTabInWindow('https://www.yuque.com/tswork/ngd5zk/sgla5i')
          }
        },
        {
          label: l('appMenuReportBug'),
          click: function () {
            openTabInWindow('https://s.apps.vip/forum?id=3')
          }
        },
        {
          label: l('appMenuTakeTour'),
          click: function () {
            openTabInWindow('https://www.yuque.com/tswork/ngd5zk/sv8ozw')
          }
        },
        {
          label: l('appOfficialWebsite'),
          click: function () {
            openTabInWindow('https://apps.vip')
          }
        },
        {
          label: '检测升级',
          click: function () {
            const Updater=require('./src/main/update')
            let updater=new Updater()
            updater.checkUpdate(true)
          }
        },
        ...(process.platform !== 'darwin' ? [{ type: 'separator' }] : []),
        ...(process.platform !== 'darwin' ? [{
          label: l('appMenuAbout').replace('%n', app.name),
          click: function (item, window) {
            var info = [
              '想天浏览器版本： v' + app.getVersion(),
              'Chromium内核版本： v' + process.versions.chrome
            ]
            electron.dialog.showMessageBox({
              type: 'info',
              title: l('appMenuAbout').replace('%n', app.name),
              message: info.join('\n'),
              buttons: [l('closeDialog')]
            })
          }
        }] : [])
      ]
    },
    ...(options.secondary && process.platform !== 'darwin' ? [{ type: 'separator' }] : []),
    ...(options.secondary && process.platform !== 'darwin' ? [quitAction] : [])
  ]
  return Menu.buildFromTemplate(template)
}

function createDockMenu () {
  // create the menu. based on example from https://github.com/electron/electron/blob/master/docs/tutorial/desktop-environment-integration.md#custom-dock-menu-macos
  if (process.platform === 'darwin') {
    var Menu = electron.Menu

    var template = [
      {
        label: l('appMenuNewTab'),
        click: function (item, window) {
          sendIPCToWindow(window, 'addTab')
        }
      },
      {
        label: l('appMenuNewPrivateTab'),
        click: function (item, window) {
          sendIPCToWindow(window, 'addPrivateTab')
        }
      },
      {
        label: l('appMenuNewTask'),
        click: function (item, window) {
          sendIPCToWindow(window, 'addTask')
        }
      }
    ]

    var dockMenu = Menu.buildFromTemplate(template)
    app.dock.setMenu(dockMenu)
  }
}

function installDevPlugin (plugin) {
  sendMessage({
    type: 'loading',
    config: { content: '正在后台安装插件，请勿关闭浏览器。如果长时间无法成功，请挂梯子后重试。', key: 'install', duration: 5 }
  })
  installExtension(plugin).then((ext) => {
    sendMessage({
      type: 'success',
      config: { content: '安装插件成功，插件生效需如此操作：①关闭原调试工具，②按F5刷新调试页面，③按F12再次打开调试工具。', key: 'install', duration: 10 }
    })
    devPlugin[plugin.id].installed = true
    Menu.setApplicationMenu(buildAppMenu())
    const _ = require('lodash')
    const extension = _.find(session.defaultSession.getAllExtensions(), { name: ext })
    sessions.forEach(ses => {
      if (!ses.getExtension(extension.id)) {
        ses.loadExtension(extension.path).catch(e => {
          console.warn(e)
        })
      }
    })
  })
    .catch((err) => {
      sendMessage({
        type: 'error',
        config: { content: '安装插件失败，失败原因：' + err + '，请检查网络后再试，必要情况下请挂梯子。', key: 'install' }
      })
    }).finally(() => {
      if (devPlugin[plugin.id].installed === false) {
        sendMessage({
          type: 'info',
          config: { content: '后台安装任务结束。', key: 'install' }
        })
      }
    })
}
function reloadBrowser (focusedWindow) {
  destroyAllViews()
  focusedWindow.reload()
}
require('electron').app.whenReady().then(() => {
  ipc.handle('reloadBrowser', (event, args) => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) { reloadBrowser(focusedWindow) }
  })
})
