const EventEmitter = require('events')

const webviews = require('webviews.js')
const focusMode = require('focusMode.js')
const readerView = require('readerView.js')
const tabAudio = require('tabAudio.js')
const dragula = require('dragula')
const settings = require('util/settings/settings.js')
const urlParser = require('util/urlParser.js')
const keybindings = require('keybindings.js')

const tabEditor = require('navbar/tabEditor.js')
const progressBar = require('navbar/progressBar.js')
const permissionRequests = require('navbar/permissionRequests.js')

//添加tab上的右键菜单，支持右键选择关闭行为组
const remoteMenu = require('remoteMenuRenderer.js')
//const path = require('path')

const ipc = electron.ipcRenderer

const navbarApi = require('../../src/api/navbarApi.js')
const baseApi = require('../../src/api/baseApi')
const deskModel = require('../../pages/util/model/deskModel.js')
const { ipcRenderer } = require('electron')

/**
 * 判断是不是小号标签
 * @param tabData
 * @returns {*}
 */
function isCopy(tabData){
  return tabData.partition && tabData.partition.startsWith('persist:webcontent_')
}
var lastTabDeletion = 0 // TODO get rid of this

const tabBar = {
  navBar: document.getElementById('navbar'),
  container: document.getElementById('tabs'),
  containerInner: document.getElementById('tabs-inner'),
  tabElementMap: {}, // tabId: tab element
  events: new EventEmitter(),

  dragulaInstance: null,
  getTab: function (tabId) {
    return tabBar.tabElementMap[tabId]
  },
  getTabInput: function (tabId) {
    return tabBar.getTab(tabId).querySelector('.tab-input')
  },
  setActiveTab: function (tabId) {
    var activeTab = document.querySelector('.tab-item.active')

    if (activeTab) {
      activeTab.classList.remove('active')
      activeTab.removeAttribute('aria-selected')
    }

    var el = tabBar.getTab(tabId)
    el.classList.add('active')
    el.setAttribute('aria-selected', 'true')

    requestAnimationFrame(function () {
      el.scrollIntoView()
    })
  },
  /*标签栏补充的右键菜单触发动作开始*/
  //关闭其他的标签
  closeOtherTabs: function (tabId) {
    if (tabId !== tabs.getSelected())
      require('browserUI.js').switchToTab(tabId)
    let needDestroy = []
    let lockCount = 0
    tasks.getSelected().tabs.forEach(function (tab, index) {
      if (tab.id != tabId) {
        if (!!tabs.get(tab.id).lock) {
          lockCount++
        } else {
          needDestroy.push(tab.id)
        }
      }
    })
    tabBar.closeTabsById(needDestroy, lockCount)
    //$store.getters.fillTasksToItems
  },
  closeTabsById (needDestroyIds, lockCount) {
    needDestroyIds.forEach(function (tid, index) {
      require('browserUI.js').destroyTab(tid)
    })
    if (lockCount > 0) {
      ipc.send('message', {
        type: 'success',
        config: { content: '成功关闭' + needDestroyIds.length + '个标签。但有' + lockCount + '个锁定标签未关闭，请解锁后关闭。' }
      })
    } else {
      ipc.send('message', { type: 'success', config: { content: '成功关闭' + needDestroyIds.length + '个标签。' } })
    }
  },
  //关闭左侧标签
  closeLeftTabs: function (tabId) {
    console.log('close left')
    let tabs = tasks.getSelected().tabs
    if (tabId !== tabs.getSelected())
      require('browserUI.js').switchToTab(tabId)
    let needDestroy = []
    let lockCount = 0
    let currentIndex = tabs.getIndex(tabId)
    for (let i = 0; i < currentIndex; i++) {
      if (tabs.getAtIndex(i).id != tabId) {
        if (!!tabs.getAtIndex(i).lock) {
          lockCount++
        } else {
          needDestroy.push(tabs.getAtIndex(i).id)
        }
      }
    }
    tabBar.closeTabsById(needDestroy, lockCount)
    //$store.getters.fillTasksToItems
  },
  //关闭右侧标签
  closeRightTabs: function (tabId) {
    let tabs = tasks.getSelected().tabs
    if (tabId !== tabs.getSelected())
      require('browserUI.js').switchToTab(tabId)
    let needDestroy = []
    let count = tabs.count()
    let lockCount = 0
    let currentIndex = tabs.getIndex(tabId)
    for (let i = count - 1; i >= currentIndex; i--) {
      if (tabs.getAtIndex(i).id != tabId) {
        if (!!tabs.getAtIndex(i).lock) {
          lockCount++
        } else {
          needDestroy.push(tabs.getAtIndex(i).id)
        }
      }
    }
    tabBar.closeTabsById(needDestroy, lockCount)
    //$store.getters.fillTasksToItems
  },
  //移动到第一个标签
  moveToFirst: function (tabId) {
    let tabs = tasks.getSelected().tabs
    tab = tabs.get(tabId)
    index = tabs.getIndex(tabId)
    tabs.splice(index, 1)
    tabs.splice(0, 0, tab)
    tabBar.updateAll()
    require('browserUI.js').switchToTab(tabId)
  },
  //刷新
  refresh: function (id) {
    webviews.update(id, tasks.getSelected().tabs.get(id).url)
  },
  //移动到其他标签组
  insertTabToTask (tabId) {
    let previousTask = tasks.getSelected()
    let currentTabIndex = previousTask.tabs.getIndex(tabId)
    //拿到oldTab的信息
    let oldTab = previousTask.tabs.tabs[currentTabIndex]
    ipc.send('selectTask', oldTab)   //呼出面板,并把oldtab的应用地址对象传过去
  },

  /**
   * 添加收藏到本地自建列表或本地默认列表(分单个和整组)
   * @param {String} tabId  tab标签id
   * @param {Number} listId 父级id
   * @param {Boolean} single 默认true单个移动
   */
  addToScopeLocal (tabId, listId, single = true) {
    if (single) {
      let tabs = tasks.getSelected().tabs
      let tab = tabs.get(tabId)
      if (tab.url.startsWith('file:///')) {
        ipc.send('message', { type: 'error', config: { content: '系统页面无法添加!' } })
      } else {
        const appNow = {
          icon: tab.favicon == null ? '../../icons/default.svg' : tab.favicon.url,
          name: tab.title,
          url: tab.url,
          summary: '',
          listId: listId ? listId : 0,
          star: '5'
        }
        const appsRestore = require('../../pages/apps/appsRestore.js')
        appsRestore.addApp(appNow)
        ipc.send('message', { type: 'success', config: { content: '添加成功，可在我的导航和新标签页中查看。' } })
      }
    } else {
      const appsRestore = require('../../pages/apps/appsRestore.js')
      let tabs = tasks.getSelected().tabs
      const filterTabs = tabs.tabs.filter(e => !e.url.startsWith('file:///'))
      filterTabs.forEach(item => {
        const appNow = {
          icon: item.favicon == null ? '../../icons/default.svg' : item.favicon.url,
          name: item.title,
          url: item.url,
          summary: '',
          listId: listId ? listId : 0,
          star: '5'
        }
        appsRestore.addApp(appNow)
      })
      ipc.send('message', { type: 'success', config: { content: '整组添加成功，已为您排除系统页面，可在我的导航和新标签页中查看。' } })
    }
  },

  /**
   * 添加到云端用户导航(分单个和整组)
   * @param {String} tabId  tab标签id
   * @param {Number} listId 父级id
   * @param {Boolean} single 默认true单个移动
   */
  async addToUserNav (tabId, listId, single = true) {
    if (single) {
      let tabs = tasks.getSelected().tabs
      let tab = tabs.get(tabId)
      if (tab.url.startsWith('file:///')) {
        ipc.send('message', { type: 'error', config: { content: '系统页面无法添加!' } })
      } else {
        const appNow = {
          icon: tab.favicon == null ? '../../icons/default.svg' : tab.favicon.url,
          name: tab.title,
          url: tab.url,
          summary: '',
          list_id: listId,
          add_time: String(new Date().getTime()),
        }
        const result = await navbarApi.addUserNavApp(appNow)
        if (result.code === 1000) {
          ipc.send('message', { type: 'success', config: { content: '添加成功，可在云端用户导航中查看。' } })
        }
      }
    } else {
      let tabs = tasks.getSelected().tabs
      const filterTabs = tabs.tabs.filter(e => !e.url.startsWith('file:///'))
      filterTabs.forEach(item => {
        const appNow = {
          icon: item.favicon == null ? '../../icons/default.svg' : item.favicon.url,
          name: item.title,
          url: item.url,
          summary: '',
          list_id: listId,
          add_time: String(new Date().getTime()),
        }
        setTimeout(async () => {
          await navbarApi.addUserNavApp(appNow)
        }, 200)
      })
      ipc.send('message', { type: 'success', config: { content: '添加成功，可在云端用户导航中查看。' } })
    }
  },

  async addToGroupNav (tabId, listId, single = true) {
    if (single) {
      let tabs = tasks.getSelected().tabs
      let tab = tabs.get(tabId)
      if (tab.url.startsWith('file:///')) {
        ipc.send('message', { type: 'error', config: { content: '系统页面无法添加!' } })
      } else {
        const appNow = {
          icon: tab.favicon == null ? '../../icons/default.svg' : tab.favicon.url,
          name: tab.title,
          url: tab.url,
          summary: '',
          list_id: listId,
          add_time: String(new Date().getTime()),
        }
        const result = await navbarApi.addGroupNavApp(appNow)
        if (result.code === 1000) {
          ipc.send('message', { type: 'success', config: { content: '添加成功，可在云端团队导航中查看。' } })
        }
      }
    } else {
      let tabs = tasks.getSelected().tabs
      const filterTabs = tabs.tabs.filter(e => !e.url.startsWith('file:///'))
      filterTabs.forEach(item => {
        const appNow = {
          icon: item.favicon == null ? '../../icons/default.svg' : item.favicon.url,
          name: item.title,
          url: item.url,
          summary: '',
          list_id: listId,
          add_time: String(new Date().getTime()),
        }
        setTimeout(async () => {
          await navbarApi.addGroupNavApp(appNow)
        }, 200)
      })
      ipc.send('message', { type: 'success', config: { content: '添加成功，可在云端团队导航中查看。' } })
    }
  },
  /**
   * 重命名
   * @param tabId
   */
  rename(tabId){


    const { newName } = ipc.sendSync('prompt', {
      text: '输入标签名称',
      values: [
        { placeholder: tabs.get(tabId).newName?tabs.get(tabId).newName:tabs.get(tabId).title, id: 'newName', type: 'text' }
        ],
      ok: '修改',
      cancel: '取消',
      width: 500,
      height: 240
    })
    if(newName!=='' && newName){
      let tabData=tabs.get(tabId)
      if(isCopy(tabData)){
        tabs.tabs.forEach(tab=>{
          //遍历全部的标签，并修改同分区的标签为同一个名称
          if(tab.partition===tabData.partition){
            tabs.update(tab.id,{newName})
            console.log(tab.id)
          }
        })
        tabBar.updateAll()
      }else{
        //不是小号标签，只需要改自己就行了
        tabs.update(tabId,{newName})
      }
      //console.log('设置了名称',newName)
    }
  },

  //复制tab链接
  shareTab: function (tabId) {
    let tabs = tasks.getSelected().tabs
    let tab = tabs.get(tabId)
    if (tab.url.startsWith('file:///')) {
      ipc.send('message', { type: 'error', config: { content: '链接复制失败' } })
    } else {
      Tools.copy(tab.url)
    }
  },

  //复制tasks整组链接生成分享页
  shareTask: function () {
    let tabs = tasks.getSelected().tabs
    let filterList = tabs.tabs.filter(e => !e.url.startsWith('file:///'))    //过滤掉file层面的tab
    let args = []
    for (let i = 0; i < filterList.length; i++) {
      const obj = {
        url: filterList[i].url,
        favicon: filterList[i].favicon === null ? '/shareTask/default.svg' : filterList[i].favicon.url,
        title: filterList[i].title
      }
      args.push(obj)
    }
    ipc.send('shareTask', args)
  },

  /*标签栏补充的右键菜单触发动作结束*/
  createTab: function (data) {
    var tabEl = document.createElement('div')
    tabEl.className = 'tab-item'
    tabEl.setAttribute('data-tab', data.id)
    tabEl.setAttribute('role', 'tab')

    tabEl.appendChild(readerView.getButton(data.id))
    tabEl.appendChild(tabAudio.getButton(data.id))
    tabEl.appendChild(progressBar.create())

    tabEl.addEventListener('dblclick', (e) => {
      ipc.send('dbClickClose', { id: data.id })
      e.stopPropagation()
      e.preventDefault()
    })
    // icons

    var iconArea = document.createElement('span')
    iconArea.className = 'tab-icon-area'

    if (data.private) {
      var pbIcon = document.createElement('i')
      pbIcon.className = 'icon-tab-is-private tab-icon tab-info-icon i carbon:view-off'
      iconArea.appendChild(pbIcon)
    }

    // var secIcon = document.createElement('i')
    // secIcon.className = 'icon-tab-not-secure tab-icon tab-info-icon i carbon:unlocked'
    // secIcon.title = l('connectionNotSecure')
    //iconArea.appendChild(secIcon)

    var closeTabButton = document.createElement('button')
    closeTabButton.className = 'tab-icon tab-close-button i carbon:close'
    if (data.lock) {
      closeTabButton.style.display = 'none'
    }

    closeTabButton.addEventListener('click', function (e) {
      tabBar.events.emit('tab-closed', data.id)
      // prevent the searchbar from being opened
      e.stopPropagation()
    })

    iconArea.appendChild(closeTabButton)

    // title

    var title = document.createElement('span')
    title.className = 'title'

    tabEl.appendChild(title)
    tabEl.appendChild(iconArea)
    // click to enter edit mode or switch to a tab
    tabEl.addEventListener('click', function (e) {
      if (tabs.getSelected() !== data.id) {
        // else switch to tab if it isn't focused
        tabBar.events.emit('tab-selected', data.id)
      } else {
        // the tab is focused, edit tab instead
        if (!$toolbar.expanded) {
          //如果非二栏模式才可以触发show
          tabEditor.show(data.id)
        }
      }
    })

    tabEditor.input.removeEventListener('focus', $toolbar.focusInput)
    tabEditor.input.addEventListener('focus', $toolbar.focusInput)

    tabEl.addEventListener('auxclick', function (e) {
      if (e.which === 2) {
        // if mouse middle click -> close tab
        tabBar.events.emit('tab-closed', data.id)
      }
    })

    tabEl.addEventListener('wheel', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        // https://github.com/minbrowser/min/issues/698
        return
      }
      event.preventDefault()
      if (e.deltaY > 65 && e.deltaX < 10 && Date.now() - lastTabDeletion > 900) {
        e.target.scrollLeft += event.deltaY
          ? event.deltaY
          : (event.detail && event.detail !== 0)
            ? event.detail
            : -event.wheelDelta
        // // swipe up to delete tabs
        // lastTabDeletion = Date.now()
        //
        // /* tab deletion is disabled in focus mode */
        // if (focusMode.enabled()) {
        //   focusMode.warn()
        //   return
        // }
        //
        // this.style.transform = 'translateY(-100%)'
        //
        // setTimeout(function () {
        //   tabBar.events.emit('tab-closed', data.id)
        // }, 150) // wait until the animation has completed
      }
    })

    tabEl.addEventListener('contextmenu', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      let desks = []
      try {
        desks = JSON.parse(localStorage.getItem('desks'))
      } catch (e) {
      }
      let addToDeskMenus = []
      if (!!desks) {
        desks.forEach((desk) => {
          addToDeskMenus.push({
            id: desk.id,
            label: desk.name,
            click: () => {
              const tab = tabs.get(data.id)
              const app = {
                type: 'app',
                data: {
                  name: tab.title,
                  icon: tab.favicon == null ? '../../icons/default.svg' : tab.favicon.url,
                  url: tab.url
                }
              }
              const deskModel = require('../../pages/util/model/deskModel.js')
              const element = deskModel.createElementPos(app)
              deskModel.addElementToDesk(element, desk.id)
              ipc.send('message', { 'type': 'success', config: { 'content': '添加到桌面成功' } })
            }
          })
        })
      }
      const tab = tabs.get(data.id)
      let templateAdd = []
      if (!tab.url.startsWith('file://')) {
        templateAdd = [[
          {
            id: 'addToDesk',
            label: '添加到桌面',
            submenu: addToDeskMenus
          },
          {
            id: 'addToApps',
            label: '添加到我的应用…',
            click: function () {
              tabBar.addToApps(data.id)
            },
          }
        ]
        ]
      }
      let template = templateAdd.concat([

        [
          {
            id: 'duplicateTab',
            label: '复制标签',
            click: function () {
              require('browserUI.js').duplicateTab(tabs.get(data.id))
            }
          },
          {
          id: 'duplicateCopyTab',
          label: '使用此网址创建小号标签',
          click: function () {
            require('browserUI.js').duplicateCopyTab(tabs.get(data.id))
          }
        },
          {
            id: 'lockTab',
            label: tabs.get(data.id).lock === true ? '解锁标签' : '锁定标签',
            click: function () {
              tabBar.lockTab(data.id)
            },
          },
          {
          id: 'renameTab',
          label: isCopy(tab)?'重命名小号':'重命名标签',
          click: function () {
            tabBar.rename(data.id)
          },
        },

          {
            label: '移动到最左边',
            toolTip: '作为组代表,当前任务组会更新为此标签的网站图标',
            click: function () {
              tabBar.moveToFirst(data.id)
            },
          },
          {
            label: '移动到其他标签组',
            click: () => {
              tabBar.insertTabToTask(data.id)
            }
          }
        ],
        [
          {
            label: '关闭其他标签',
            click: function () {
              tabBar.closeOtherTabs(data.id)
            },
          },
          {
            label: '关闭左侧标签',
            click: function () {
              tabBar.closeLeftTabs(data.id)
            },
          },
          {
            label: '关闭右侧标签',
            click: function () {
              tabBar.closeRightTabs(data.id)
            },
          },
        ],
        [
          {
            label: '分享标签',
            submenu: [
              {
                label: '复制链接',
                click: function () {
                  tabBar.shareTab(data.id)
                },
              },
            ],
          }
        ],
      ])
      console.log(template)
      remoteMenu.open(template)
      //绑定代码结束
    })

    tabBar.updateTab(data.id, tabEl)

    return tabEl
  },

  updateTab: function (tabId, tabEl = tabBar.getTab(tabId)) {
    var tabData = tabs.get(tabId)

    // update tab title
    var tabTitle

    const isNewTab = tabData.url === '' || tabData.url === urlParser.parse('min://newtab')
    if (isNewTab) {
      tabTitle = l('newTabLabel')
    } else if (tabData.title) {
      tabTitle = tabData.title
    } else if (tabData.loaded) {
      tabTitle = tabData.url
    }

    tabTitle = (tabTitle || l('newTabLabel')).substring(0, 500)

    var titleEl = tabEl.querySelector('.title')

    //给tab加上favicon的显示，以提升每个页面的辨识度
    var iconEl = this.createIconEl(tabData, tabData.loaded)
    //titleEl.textContent = tabTitle  原先的方法只是添加了文字
    titleEl.innerHTML = ''
    titleEl.appendChild(iconEl)


    if(isCopy(tabData)){
      if(tabData.newName){
        tabTitle=tabData.newName+'|'+tabTitle
      }else{
        tabTitle='小号|'+tabTitle
      }
    }else{
      if(tabData.newName) {
        tabTitle = tabData.newName + '|' + tabTitle
      }
    }
    titleEl.append(tabTitle)

    tabEl.title = tabTitle
    if (tabData.private) {
      tabEl.title += ' (' + l('privateTab') + ')'
    }

    // update tab audio icon
    var audioButton = tabEl.querySelector('.tab-audio-button')
    tabAudio.updateButton(tabId, audioButton)

    tabEl.querySelectorAll('.permission-request-icon').forEach((el) => el.remove())

    permissionRequests
      .getButtons(tabId)
      .reverse()
      .forEach(function (button) {
        tabEl.insertBefore(button, tabEl.children[0])
      })

    // var secIcon = tabEl.getElementsByClassName('icon-tab-not-secure')[0]
    // if (tabData.secure === false) {
    //   secIcon.hidden = false
    // } else {
    //   secIcon.hidden = true
    // }
  },
  updateAll: function () {
    let addBtnWrapper = document.getElementById('add-btn-wrapper')
    empty(tabBar.containerInner)

    tabBar.tabElementMap = {}

    tabs.get().forEach(function (tab) {
      var el = tabBar.createTab(tab)
      tabBar.containerInner.appendChild(el)
      tabBar.tabElementMap[tab.id] = el
    })

    if (tabs.getSelected()) {
      tabBar.setActiveTab(tabs.getSelected())
    }
    tabBar.containerInner.appendChild(addBtnWrapper)
  },

  lockTab: function (id) {
    let tab = tabs.get(id)
    let tabEl = tabBar.tabElementMap[id]
    let closeEl = tabEl.querySelector('.tab-close-button')
    if (tab.lock === true) {
      tabs.update(tab.id, { lock: !tab.lock, startPage: null })
      $toolbar.updateStartPage()
      closeEl.style.display = ''
      ipc.send('message', { type: 'success', config: { content: '标签锁定解除' } })
    } else {
      closeEl.style.display = 'none'
      tabs.update(tab.id, { lock: !tab.lock, startPage: tab.url })
      $toolbar.updateStartPage()
      ipc.send('message', { type: 'success', config: { content: '标签锁定成功' } })
    }
  },

  addTab: function (tabId, last = false) {
    var tab = tabs.get(tabId)
    var index = tabs.getIndex(tabId)
    var tabEl = tabBar.createTab(tab)
    if (last) {
      tabBar.containerInner.insertBefore(tabEl, tabBar.containerInner.childNodes[tabBar.containerInner.childNodes.length - 1])
    } else
      tabBar.containerInner.insertBefore(tabEl, tabBar.containerInner.childNodes[index])
    tabBar.tabElementMap[tabId] = tabEl
  },

  removeTab: function (tabId) {
    var tabEl = tabBar.getTab(tabId)
    if (tabEl) {
      // The tab does not have a corresponding .tab-item element.
      // This happens when destroying tabs from other task where this .tab-item is not present
      tabBar.containerInner.removeChild(tabEl)
      delete tabBar.tabElementMap[tabId]
    }
  },
  handleDividerPreference: function (dividerPreference) {
    if (dividerPreference === true) {
      tabBar.navBar.classList.add('show-dividers')
    } else {
      tabBar.navBar.classList.remove('show-dividers')
    }
  },
  initializeTabDragging: function () {
    tabBar.dragulaInstance = dragula([], {
      mirrorContainer: document.getElementById('dragContainer'),
      direction: 'horizontal',
      slideFactorX: 25,
      slideFactorY: 25,
      invalid: function (el, handle) {
        return el.id === 'add-btn-wrapper'
      },
      accepts: function (el, target, source, sibling) {
        return !(sibling === null)
      }
    })

    tabBar.dragulaInstance.on('drop', function (el, target, source, sibling) {
      var tabId = el.getAttribute('data-tab')
      if (sibling) {
        var adjacentTabId = sibling.getAttribute('data-tab')
      }

      var oldTab = tabs.splice(tabs.getIndex(tabId), 1)[0]

      var newIdx
      if (adjacentTabId) {
        newIdx = tabs.getIndex(adjacentTabId)
      } else {
        // tab was inserted at end
        newIdx = tabs.count()
      }

      tabs.splice(newIdx, 0, oldTab)
    })
  },
  enableTabDragging: function () {
    tabBar.dragulaInstance.containers = [document.getElementById('tabs-inner')]
  },
  disableTabDragging: function () {
    tabBar.dragulaInstance.containers = []
  },
  /**
   * 添加一个应用
   * @param id
   */
  addToApps (id) {
    let tab = tabs.get(id)
    let standAloneAppModel = require('../../pages/util/model/standAloneAppModel.js')
    let option = {
      name: tab.title,
      logo: !!!tab.favicon ? '../../icons/default.svg' : tab.favicon.url,
      summary: '自定义应用',
      type: 'web',
      themeColor: !!!tab.backgroundColor ? '#ccc' : tab.backgroundColor.color,
      settings: {
        bounds: {
          width: 1000,
          height: 800
        }
      },
      showInSideBar: false
    }
    standAloneAppModel.install(tab.url, option).then(success => {
      console.log(success)
      ipc.send('message', { type: 'success', config: { content: `添加应用：${tab.title} 成功` } })
      ipc.send('installApp', { id: success })
    }, err => {
      ipc.send('message', { type: 'error', config: { content: '添加应用失败' } })
    })
  },
  //扩充一个获取icon的方法
  createIconEl: function (tabData, loaded) {
    var iconEl = document.createElement('img')
    iconEl.className = 'icon'
    iconEl.addEventListener('error', (e) => {
      e.target.src = __dirname + '/icons/default.svg'
    })
    var src = ''
    if (loaded == false) {
      src = __dirname + '/icons/loading.gif'
    } else {
      if (tabData.favicon == null) {
        src = __dirname + '/icons/default18.png'
      } else {
        src = tabData.favicon.url
      }
    }
    // iconEl.title="点击查看网站名片"
    iconEl.src = src
    // iconEl.style.cursor='pointer'
    // iconEl.style="cursor:pointer"
    //  iconEl.addEventListener('click',(e)=>{
    //    ipc.send('createSiteCard',{url:tabData.url,x:e.clientX,y:e.clientY,title:tabData.title,tabData:tabData})
    //    e.preventDefault()
    //    e.stopPropagation()
    //  })
    return iconEl
  },
}

settings.listen('showDividerBetweenTabs', function (dividerPreference) {
  tabBar.handleDividerPreference(dividerPreference)
})

/* tab loading and progress bar status*/
webviews.bindEvent('did-start-loading', function (tabId) {
  progressBar.update(tabBar.getTab(tabId).querySelector('.progress-bar'), 'start')
  tabs.update(tabId, {
    loaded: false,
  })
})

webviews.bindEvent('did-stop-loading', function (tabId) {
  progressBar.update(tabBar.getTab(tabId).querySelector('.progress-bar'), 'finish')
  tabs.update(tabId, {
    loaded: true,
  })
  tabBar.updateTab(tabId)
})

tasks.on('tab-updated', function (id, key) {
  var updateKeys = ['title', 'secure', 'url', 'muted', 'hasAudio', 'favicon'] //增加了一下更新的字段，否则favcion变化是不会生效的
  if (updateKeys.includes(key)) {
    tabBar.updateTab(id)
  }
})

permissionRequests.onChange(function (tabId) {
  tabBar.updateTab(tabId)
})

tabBar.initializeTabDragging()

if (0) {//window.platformType === 'mac'
  tabBar.dragulaInstance.containers = []
  keybindings.defineShortcut({ keys: 'mod' }, function () {
    tabBar.enableTabDragging()
    console.log('mod')
    document.body.classList.add('disable-window-drag')
  })

  keybindings.defineShortcut({ keys: 'mod' }, function () {
    tabBar.disableTabDragging()
    document.body.classList.remove('disable-window-drag')
  }, { keyUp: true })
} else {
  tabBar.dragulaInstance.on('drop', function (el, target, source, sibling) {
    var tabId = el.getAttribute('data-tab')
    if (sibling) {
      var adjacentTabId = sibling.getAttribute('data-tab')
    }

    var oldTab = tabs.splice(tabs.getIndex(tabId), 1)[0]

    var newIdx
    if (adjacentTabId) {
      newIdx = tabs.getIndex(adjacentTabId)
    } else {
      // tab was inserted at end
      newIdx = tabs.count()
    }

    tabs.splice(newIdx, 0, oldTab)
  })
  tabBar.enableTabDragging()
}

tabBar.container.addEventListener('dragover', (e) => e.preventDefault())

tabBar.container.addEventListener('drop', (e) => {
  e.preventDefault()
  var data = e.dataTransfer
  require('browserUI.js').addTab(
    tabs.add({
      url: data.files[0] ? 'file://' + data.files[0].path : data.getData('text'),
      private: tabs.get(tabs.getSelected()).private,
    }),
    {
      enterEditMode: false,
      openInBackground: !settings.get('openTabsInForeground'),
    }
  )
})
ipc.on('refresh', () => {
  webviews.update(tabs.getSelected(), tasks.getSelected().tabs.get(tabs.getSelected()).url)
})
const db = require('../util/database').db
ipc.on('stashTask', (e, args) => {
  const task = tasks.get(args.id)
  db.taskStash.add({
    taskData: JSON.stringify(tasks.getStringify(task.id)),
    createTime: Date.now()
  }).then(res => {
    ipc.send('message', { type: 'success', config: { content: '暂存标签组成功，您可随时导入此暂存标签组到任何空间。' } })
    require('../browserUI.js').closeTask(args.id)
  }).catch((e) => {
    console.warn(res)
  })
})

ipc.on('importTasks',async (e, args) => {
  let stashTasks = await db.taskStash.where('id').anyOf(args.ids).toArray()
  let count=0
  let remove=args.config.removeAfterImported
  stashTasks.forEach(st=>{
    try{
      let task=JSON.parse(st.taskData)
      task.id=Date.now()-Math.round(Math.random()*1000000)
      tasks.add(task)
      count++
      if(remove){
        db.taskStash.delete(st.id)
      }
    }catch (e) {
      console.warn('导入失败',e)
    }
  })
  if(count>0){
    ipc.send('message',{type:'success',config:{content:'成功导入'+count+'个标签组。'}})
  }else{
    ipc.send('message',{type:'error',config:{content:'导入标签组失败。'}})
  }
})

ipc.on('removeStash',(e,args)=>{
  db.taskStash.delete(args.id)
})

ipc.on('toggleLockTab', (event, args) => {
  const tab = tasks.get(args.taskId).tabs.get(args.id)
  if (args.taskId === tasks.getSelected().id) {
    tabBar.lockTab(args.id)
  } else {
    tasks.get(args.taskId).tabs.update(tab.id, { lock: !tab.lock })
  }
})

ipc.on('lockTask', (event, args) => {
  let tabs = tasks.get(args.id)
  tabs.tabs.forEach((item, index) => {
    tabs.tabs.update(item.id, { lock: true, startPage: item.url })
  })
})

ipc.on('clearTaskUnlock', (event, args) => {
  let task = tasks.get(args.id)
  let deleteIds = []
  task.tabs.forEach((tab, index) => {
    console.log(tab.lock)
    if (!!!tab.lock) {
      deleteIds.push(tab.id)
    }
  })
  deleteIds.forEach((id) => {
    if (args.id === tasks.getSelected().id) {
      //如果是当前的标签组，则通过ui去关闭标签
      require('../browserUI.js').closeTab(id)
    } else {
      //如果不是当前选中的标签组，则直接移除
      task.tabs.destroy(id)
    }
  })
  if (task.tabs.count() === 0 && args.id !== tasks.getSelected().id) {
    //清空了，再加一个新标签进去，防止tabs出问题
    task.tabs.add()
  }

})

ipc.on('tabNavigateTo', function (e, data) {
  const { url } = data
  const newTab = tabs.add({ url })
  require('browserUI.js').addTab(newTab, { enterEditMode: false })
})

/**
 * 获取添加到收藏夹的信息，同时会发送一个获取高清截图的请求到主进程。
 * 故信息和截图两边是分开发送的
 */
ipc.on('getAddPageInfo', (event, args) => {
  ipc.send('getHDCapture', { id: tabs.getSelected(), favWindowId: args.favWindowId }) //发送给主进程，要求捕获一个高清截图
  let tabInfo = tabs.get(tabs.getSelected())
  tabInfo.url = urlParser.getSourceURL(tabInfo.url)
  ipc.sendTo(args.favWindowId, 'gotAddPageInfo', tabInfo) //直接回传消息给收藏夹的渲染进程
})

ipc.on('getCurrentTab',(e,a)=>{

  let data=tabs.get(tabs.getSelected())
  data.sourceUrl=urlParser.getSourceURL(data.url)
  console.log('getCurrentTabdddddddddddddd',data)
  ipc.send('gotCurrentTab',{data})
})

module.exports = tabBar
