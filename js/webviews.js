var urlParser = require('util/urlParser.js')
var settings = require('util/settings/settings.js')
const passwordModel = require('../pages/util/model/passwordModel')
const systemType = require('./util/systemType.js')
/* implements selecting webviews, switching between them, and creating new ones. */

var placeholderImg = document.getElementById('webview-placeholder')

var hasSeparateTitlebar = settings.get('useSeparateTitlebar')
var windowIsMaximized = false // affects navbar height on Windows
var windowIsFullscreen = false

function captureCurrentTab (options) {
  if (tabs.get(tabs.getSelected()).private) {
    // don't capture placeholders for private tabs
    return
  }

  if (webviews.placeholderRequests.length > 0 && !(options && options.forceCapture === true)) {
    // capturePage doesn't work while the view is hidden
    return
  }

  ipc.send('getCapture', {
    id: webviews.selectedId,
    width: Math.round(window.innerWidth / 10),
    height: Math.round(window.innerHeight / 10)
  })
}





// called whenever a new page starts loading, or an in-page navigation occurs
function onPageURLChange (tab, url) {


  ipc.send('changeUrl',{url:urlParser.getSourceURL(url)})
    //增加了ts开头的页面的安全提示，避免提示不安全
    webviews.updateToolBarStatus(tabs.get(tab))
    if (url.indexOf('https://') === 0 || url.indexOf('about:') === 0 || url.indexOf('chrome:') === 0 || url.indexOf('file://') === 0 || url.indexOf('ts://') === 0) {
      tabs.update(tab, {
        secure: true,
        url: url
      })
      webviews.updateToolbarSecure(true)
    } else {
      tabs.update(tab, {
        secure: false,
        url: url
      })
      webviews.updateToolbarSecure(false)
    }
}

// called whenever a navigation finishes
function onNavigate (tabId, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) {
  if (isMainFrame) {
    onPageURLChange(tabId, url)
  }
}

// called whenever the page finishes loading
function onPageLoad (tabId) {
  // capture a preview image if a new page has been loaded
  if (tabId === tabs.getSelected()) {
    setTimeout(function () {
      // sometimes the page isn't visible until a short time after the did-finish-load event occurs
      captureCurrentTab()
    }, 250)
  }
}

function scrollOnLoad (tabId, scrollPosition) {

  const listener = function (eTabId) {
    if (eTabId === tabId) {
      // the scrollable content may not be available until some time after the load event, so attempt scrolling several times
      // but stop once we've successfully scrolled once so we don't overwrite user scroll attempts that happen later
      for (let i = 0; i < 3; i++) {
        var done = false
        setTimeout(function () {
          if (!done) {
            webviews.callAsync(tabId, 'executeJavaScript', `
            (function() {
              window.scrollTo(0, ${scrollPosition})
              return window.scrollY === ${scrollPosition}
            })()
            `, function (err, completed) {
              if (!err && completed) {
                done = true
              }
            })
          }
        }, 750 * i)
      }
      webviews.unbindEvent('did-finish-load', listener)
    }
  }
  webviews.bindEvent('did-finish-load', listener)
}

function setAudioMutedOnCreate (tabId, muted) {
  const listener = function () {
    webviews.callAsync(tabId, 'setAudioMuted', muted)
    webviews.unbindEvent('did-navigate', listener)
  }
  webviews.bindEvent('did-navigate', listener)
}

const webviews = {
  viewList: [], // [tabId]
  viewFullscreenMap: {}, // tabId, isFullscreen
  selectedId: null,
  placeholderRequests: [],
  asyncCallbacks: {},
  internalPages: {
    error: urlParser.getFileURL(__dirname + '/pages/error/index.html')
  },
  events: [],
  IPCEvents: [],
  bindEvent: function (event, fn) {
    webviews.events.push({
      event: event,
      fn: fn
    })
  },
  unbindEvent: function (event, fn) {
    for (var i = 0; i < webviews.events.length; i++) {
      if (webviews.events[i].event === event && webviews.events[i].fn === fn) {
        webviews.events.splice(i, 1)
        i--
      }
    }
  },
  emitEvent: function (event, viewId, args) {
    if (!webviews.viewList.includes(viewId)) {
      // the view could have been destroyed between when the event was occured and when it was recieved in the UI process, see https://github.com/minbrowser/min/issues/604#issuecomment-419653437
      return
    }
    webviews.events.forEach(function (ev) {
      if (ev.event === event) {
        ev.fn.apply(this, [viewId].concat(args))
      }
    })
  },
  bindIPC: function (name, fn) {
    webviews.IPCEvents.push({
      name: name,
      fn: fn
    })
  },
  viewMargins: [document.getElementById('toolbar').hidden?0:document.getElementById('third-toolbar').hidden?40:80, 0, 0, 45], // top, right, bottom, left
  autoAdjustMargin: function() {
    let top=0
    let left=0

    if(window.$toolbar.layoutMod==='min'){
      top=0
      left=0
    }else{
     top= document.getElementById("toolbar").hidden
        ? 0
        : document.getElementById("third-toolbar").hidden
          ? 40
          : 80
      left=  window.sideBar.mod === "close"
        ? 45
        : window.sideBar.mod === "open"
          ? 145
          : 45
    }


    const currentMargins = [
      top,
      0,
      0,
      left,
    ];
    for (var i = 0; i < currentMargins.length; i++) {
      webviews.viewMargins[i] = currentMargins[i];
    }
    webviews.resize();
  },
  adjustMargin: function (margins) {
    for (var i = 0; i < margins.length; i++) {
      webviews.viewMargins[i] += margins[i]
    }
    webviews.resize()
  },
  getViewBounds: function () {
    if (webviews.viewFullscreenMap[webviews.selectedId]) {
      return {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
      }
    } else {
      if (!hasSeparateTitlebar && (window.platformType === 'linux' || window.platformType === 'windows') && !windowIsMaximized && !windowIsFullscreen) {
        var navbarHeight = 36
      } else {
        var navbarHeight = 36
      }

      const viewMargins = webviews.viewMargins
      return {
        x: 0 + Math.round(viewMargins[3]),
        y: 0 + Math.round(viewMargins[0]) + navbarHeight,
        width: window.innerWidth - Math.round(viewMargins[1] + viewMargins[3]),
        height: window.innerHeight - Math.round(viewMargins[0] + viewMargins[2]) - navbarHeight
      }
    }
  },
  add: function (tabId, existingViewId) {
    var tabData = tabs.get(tabId)

    // needs to be called before the view is created to that its listeners can be registered
    if (tabData.scrollPosition) {
      scrollOnLoad(tabId, tabData.scrollPosition)
    }

    if (tabData.muted) {
      setAudioMutedOnCreate(tabId, tabData.muted)
    }

    // if the tab is private, we want to partition it. See http://electron.atom.io/docs/v0.34.0/api/web-view-tag/#partition
    // since tab IDs are unique, we can use them as partition names
    var partition=tasks.getSelected().partition
    if(tabData.partition){
      partition=tabData.partition
    }
    if (tabData.private === true) {
      partition= tabId.toString() // options.tabId is a number, which remote.session.fromPartition won't accept. It must be converted to a string first
    }


	/*对特殊的内部webview做处理，增加一些额外的权限*/
	let webPreferences={}
	let sourceUrl=urlParser.getSourceURL(tabData.url)
	if(sourceUrl=='ts://apps')
	{
		//仅仅对apps页面单独开启权限
		webPreferences={
			preload: __dirname + '/pages/apps/preload.js',
			nodeIntegration: true,
			contextIsolation:false,
			enableRemoteModule: true,
			scrollBounce: false,
			sandbox: false,
			safeDialogs:false,
			safeDialogsMessage:false,
			additionalArguments: [
				'--user-data-path=' + window.globalArgs['user-data-path'],
				'--app-version=' + window.globalArgs['app-version'],
				'--app-name=' +  window.globalArgs['app-name'],
				//'--is-Dev='+window.globalArgs['development--mode']
			],
			allowPopups:true
		}
  }else if(sourceUrl=='ts://newtab'  ){
    //仅仅对apps页面单独开启权限
    webPreferences={
      preload: __dirname + '/pages/newtab/preload.js',
      nodeIntegration: true, //node集成开高了
      contextIsolation:false,
      enableRemoteModule: true,
      scrollBounce: false,
      sandbox: false,
      safeDialogs:false,
      safeDialogsMessage:false,
      additionalArguments: [
        '--user-data-path=' + window.globalArgs['user-data-path'],
        '--app-version=' + window.globalArgs['app-version'],
        '--app-name=' +  window.globalArgs['app-name'],
        //'--is-Dev='+window.globalArgs['development--mode']
      ],
      allowPopups:true
    }
  } else if(sourceUrl == 'ts://guide') {
    webPreferences={
      preload: __dirname + '/pages/guide/preload.js',
      nodeIntegration: true, //node集成开高了
      contextIsolation:false,
      enableRemoteModule: true,
      scrollBounce: false,
      sandbox: false,
      safeDialogs:false,
      safeDialogsMessage:false,
      additionalArguments: [
        '--user-data-path=' + window.globalArgs['user-data-path'],
        '--app-version=' + window.globalArgs['app-version'],
        '--app-name=' +  window.globalArgs['app-name'],
        //'--is-Dev='+window.globalArgs['development--mode']
      ],
      allowPopups:true
    }
  }
  //   else if(sourceUrl.startsWith('http://localhost:5008/' )) {
  //   webPreferences={
  //     preload: __dirname + '/pages/appStore/preload.js',
  //     nodeIntegration: true, //node集成开高了
  //     contextIsolation:false,
  //     enableRemoteModule: true,
  //     scrollBounce: false,
  //     sandbox: false,
  //     safeDialogs:false,
  //     safeDialogsMessage:false,
  //     additionalArguments: [
  //       '--user-data-path=' + window.globalArgs['user-data-path'],
  //       '--app-version=' + window.globalArgs['app-version'],
  //       '--app-name=' +  window.globalArgs['app-name'],
  //       //'--is-Dev='+window.globalArgs['development--mode']
  //     ],
  //     allowPopups:true
  //   }
  // }
    else if(sourceUrl.startsWith('http://localhost:8080') ) {
    webPreferences={
      preload: __dirname + '/pages/guide/preload.js',
      nodeIntegration: true, //node集成开高了
      contextIsolation:false,
      enableRemoteModule: true,
      scrollBounce: false,
      sandbox: false,
      safeDialogs:false,
      safeDialogsMessage:false,
      additionalArguments: [
        '--user-data-path=' + window.globalArgs['user-data-path'],
        '--app-version=' + window.globalArgs['app-version'],
        '--app-name=' +  window.globalArgs['app-name'],
        //'--is-Dev='+window.globalArgs['development--mode']
      ],
      allowPopups:true
    }
  }else if(urlParser.isInternalURL(sourceUrl)){
    webPreferences= {
      nodeIntegration: true, //node集成开高了
      contextIsolation:false,
      enableRemoteModule: true,
      scrollBounce: false,
      sandbox: false,
      webSecurity:false,
    }
  }

    if(sourceUrl==='ts://apps' || sourceUrl ==='ts://newtab'){
      webPreferences.partition=null
    }else{
      webPreferences.partition = partition || 'persist:webcontent' //网页的分区
    }

	/*特殊处理部分结束*/

    ipc.send('createView', {
      existingViewId,
      id: tabId,
      webPreferencesString: JSON.stringify(webPreferences),
      boundsString: JSON.stringify(webviews.getViewBounds()),
      events: webviews.events.map(e => e.event).filter((i, idx, arr) => arr.indexOf(i) === idx)
    })


    if (!existingViewId) {
      if (tabData.url) {
        ipc.send('loadURLInView', { id: tabData.id, url: urlParser.parse(tabData.url) })
      } else if (tabData.private) {
        // workaround for https://github.com/minbrowser/min/issues/872
        ipc.send('loadURLInView', { id: tabData.id, url: urlParser.parse('ts://newtab') })
      }
    }

    webviews.viewList.push(tabId)
  },
  setSelected: function (id, options) { // options.focus - whether to focus the view. Defaults to true.
    webviews.emitEvent('view-hidden', webviews.selectedId)

    webviews.selectedId = id

    // create the view if it doesn't already exist
    if (!webviews.viewList.includes(id)) {
      webviews.add(id)
    }

    if (webviews.placeholderRequests.length > 0) {
      // update the placeholder instead of showing the actual view
      webviews.requestPlaceholder()
      return
    }

    ipc.send('setView', {
      id: id,
      bounds: webviews.getViewBounds(),
      focus: !options || options.focus !== false
    })
    //当切换选中的view的时候要同步一下信息
    ipc.send('barrage.changeUrl',{url:urlParser.getSourceURL(tabs.get(id).url)})
    webviews.updateToolBarStatus(tabs.get(id))
    webviews.emitEvent('view-shown', id)
  },
  /**
   * 更新一下工具栏的状态
   * @param tabData tab的信息
   */
  updateToolBarStatus(tabData){
    if(tabData.id===tabs.getSelected()){
      require('js/navbar/tabEditor').updateUrl(urlParser.getSourceURL(tabData.url))
      webviews.updateToolbarSecure(tabData.secure)
      require('./navbar/tabEditor').updateTool(tabData.id)
      webviews.updateAppStatus(tabData)
      $toolbar.updateStartPage()
      if(urlParser.getSourceURL(tabData.url).startsWith('ts://')){
        $toolbar.setPwdCanUse(false)
        $toolbar.setMobileCanUse(false)
        $toolbar.setCanRead(false)
      }else{
        $toolbar.setPwdCanUse(true)
        $toolbar.setMobileCanUse(true)
        $toolbar.setCanRead(true)
      }
    }else{
      //console.log('update了一个非选中的tab信息')
    }
  },
  updateAppStatus(tabData){
    // 添加密码数量显示
    if($toolbar){
      $toolbar.loadPwdCount(tabData.url)
      $toolbar.updateScriptsCountTip(tabData.id)
    }

  },
  updateToolbarSecure(secure){
    if(secure){
      document.getElementById('site-card').setAttribute('src','./icons/svg/safe.svg')
    }else{
      document.getElementById('site-card').setAttribute('src','./icons/svg/unsafe.svg')
    }
  },
  update: function (id, url) {
    ipc.send('loadURLInView', { id: id, url: urlParser.parse(url) })
  },
  destroy: function (id) {
    webviews.emitEvent('view-hidden', id)

    if (webviews.viewList.includes(id)) {
      webviews.viewList.splice(webviews.viewList.indexOf(id), 1)
      ipc.send('destroyView', id)
    }
    delete webviews.viewFullscreenMap[id]
    if (webviews.selectedId === id) {
      webviews.selectedId = null
    }
  },
  requestPlaceholder: function (reason) {
    if (reason && !webviews.placeholderRequests.includes(reason)) {
      webviews.placeholderRequests.push(reason)
    }
    if (webviews.placeholderRequests.length >= 1) {
      // create a new placeholder

      var associatedTab = tasks.getTaskContainingTab(webviews.selectedId).tabs.get(webviews.selectedId)
      var img = associatedTab.previewImage
      if (img) {
        placeholderImg.src = img
        placeholderImg.hidden = false
      } else if (associatedTab && associatedTab.url) {
        captureCurrentTab({ forceCapture: true })
      } else {
        placeholderImg.hidden = true
      }
    }
    setTimeout(function () {
      // wait to make sure the image is visible before the view is hidden
      // make sure the placeholder was not removed between when the timeout was created and when it occurs
      if (webviews.placeholderRequests.length > 0) {
        ipc.send('hideCurrentView')
        webviews.emitEvent('view-hidden', webviews.selectedId)
      }
    }, 0)
  },
  hidePlaceholder: function (reason) {
    if (webviews.placeholderRequests.includes(reason)) {
      webviews.placeholderRequests.splice(webviews.placeholderRequests.indexOf(reason), 1)
    }

    if (webviews.placeholderRequests.length === 0) {
      // multiple things can request a placeholder at the same time, but we should only show the view again if nothing requires a placeholder anymore
      if (webviews.viewList.includes(webviews.selectedId)) {
        //如果是吸附模式，还需要还原主tab
        if( typeof window.attachedTab !=='undefined'){
          ipc.send('addView', {
            id: window.mainTab.id,
            bounds: webviews.getViewBounds(),
            focus:false
          })
        }
        ipc.send('setView', {
          id: webviews.selectedId,
          bounds: webviews.getViewBounds(),
          focus: true
        })
        webviews.emitEvent('view-shown', webviews.selectedId)
      }
      // wait for the view to be visible before removing the placeholder
      setTimeout(function () {
        if (webviews.placeholderRequests.length === 0) { // make sure the placeholder hasn't been re-enabled
          placeholderImg.hidden = true
        }
      }, 400)
    }
  },
  releaseFocus: function () {
    ipc.send('focusMainWebContents')
  },
  focus: function () {
    if (webviews.selectedId) {
      ipc.send('focusView', webviews.selectedId)
    }
  },
  resize: function () {
    ipc.send('setBounds', { id: webviews.selectedId, bounds: webviews.getViewBounds() })
  },
  goBackIgnoringRedirects: function (id) {
    /* If the current page is an error page, we actually want to go back 2 pages, since the last page would otherwise send us back to the error page
    TODO we want to do the same thing for reader mode as well, but only if the last page was redirected to reader mode (since it could also be an unrelated page)
    */

    var url = tabs.get(id).url

    if (url.startsWith(urlParser.parse('min://error'))) {
      webviews.callAsync(id, 'canGoToOffset', -2, function (err, result) {
        if (!err && result === true) {
          webviews.callAsync(id, 'goToOffset', -2)
        } else {
          webviews.callAsync(id, 'goBack')
        }
      })
    } else {
      webviews.callAsync(id, 'goBack')
    }
  },
  /*
  Can be called as
  callAsync(id, method, args, callback) -> invokes method with args, runs callback with (err, result)
  callAsync(id, method, callback) -> invokes method with no args, runs callback with (err, result)
  callAsync(id, property, value, callback) -> sets property to value
  callAsync(id, property, callback) -> reads property, runs callback with (err, result)
   */
  callAsync: function (id, method, argsOrCallback, callback) {
    var args = argsOrCallback
    var cb = callback
    if (argsOrCallback instanceof Function && !cb) {
      args = []
      cb = argsOrCallback
    }
    if (!(args instanceof Array)) {
      args = [args]
    }
    if (cb) {
      var callId = Math.random()
      webviews.asyncCallbacks[callId] = cb
    }
    ipc.send('callViewMethod', { id: id, callId: callId, method: method, args: args })
  }
}

window.addEventListener('resize', throttle(function () {
  if (webviews.placeholderRequests.length > 0) {
    // can't set view bounds if the view is hidden
    return
  }
  webviews.resize()
}, 75))

// leave HTML fullscreen when leaving window fullscreen
ipc.on('leave-full-screen', function () {
  // electron normally does this automatically (https://github.com/electron/electron/pull/13090/files), but it doesn't work for BrowserViews
  for (var view in webviews.viewFullscreenMap) {
    if (webviews.viewFullscreenMap[view]) {
      webviews.callAsync(view, 'executeJavaScript', 'document.exitFullscreen()')
    }
  }
})



webviews.bindEvent('enter-html-full-screen', function (tabId) {
  webviews.viewFullscreenMap[tabId] = true
  webviews.resize()
})

webviews.bindEvent('leave-html-full-screen', function (tabId) {
  webviews.viewFullscreenMap[tabId] = false
  webviews.resize()
})

ipc.on('maximize', function () {
  windowIsMaximized = true
  webviews.resize()
})

ipc.on('unmaximize', function () {
  windowIsMaximized = false
  webviews.resize()
})

ipc.on('enter-full-screen', function () {
  windowIsFullscreen = true
  webviews.resize()
})

ipc.on('leave-full-screen', function () {
  windowIsFullscreen = false
  webviews.resize()
})

//触发下载后地址会被重新定向，判断为下载网页，将地址改回原地址，可能会有bug。
let reUrl
let reId
ipc.on('isDownload',()=>{
  tabs.update(reId, {
    url: reUrl
  })
})

webviews.bindEvent('did-start-navigation', willNavigate)
webviews.bindEvent('will-redirect', onNavigate)
function willNavigate(tabId, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId){
tabs.tabs.forEach((e)=>{
  if(e.selected === true){
    reUrl = e.url
    reId = e.id
  }
})

  const currentTab=tabs.get(tabId)
  if(currentTab.url===urlParser.parse('ts://newtab') && url!==urlParser.parse('ts://newtab')){
    var newTab = tabs.add({
      url: url,
      private: currentTab.private,
      partition:currentTab.partition,
      newName:currentTab.newName,
      backgroundColor:currentTab.backgroundColor||'#fff'
    })
    require('./browserUI.js').addTab(newTab, {
      enterEditMode: false
    })
    //判断要跳转的页面是newtab： 当前的是tabs，且要跳转的页面不是newtab
    //如果是当前newtab页输入了网址，则关闭当前标签并新开一个标签，给页面降降权，同时可以防止出现js污染
    require('./browserUI.js').closeTab(tabId)
    //todo 过早关闭tab导致后面有报错，但是不影响使用，后面再修正
  }else{
      onNavigate(tabId, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId)
  }
}

webviews.bindEvent('did-navigate', function (tabId, url, httpResponseCode, httpStatusText) {
  onPageURLChange(tabId, url)
})

webviews.bindEvent('did-navigate-in-page',(tabId)=>{
  const tabData=tabs.get(tabId)
  webviews.updateToolBarStatus(tabData)
})


webviews.bindEvent('did-finish-load', onPageLoad)

webviews.bindEvent('page-title-updated', function (tabId, title, explicitSet) {
  tabs.update(tabId, {
    title: title
  })
})

webviews.bindEvent('did-fail-load', function (tabId, errorCode, errorDesc, validatedURL, isMainFrame) {
  console.log(errorCode,errorDesc,'错误信息')
  if (errorCode && errorCode !== -3 && isMainFrame && validatedURL) {
    webviews.update(tabId, webviews.internalPages.error + '?ec=' + encodeURIComponent(errorCode) + '&url=' + encodeURIComponent(validatedURL))
  }
})

webviews.bindEvent('crashed', function (tabId, isKilled) {
  var url = tabs.get(tabId).url
  console.log('crashed崩溃了')
  tabs.update(tabId, {
    url: webviews.internalPages.error + '?ec=crash&url=' + encodeURIComponent(url)
  })

  // the existing process has crashed, so we can't reuse it
  webviews.destroy(tabId)
  webviews.add(tabId)

  if (tabId === tabs.getSelected()) {
    webviews.setSelected(tabId)
  }
})


settings.listen(function () {
  tasks.forEach(function (task) {
    task.tabs.forEach(function (tab) {
      if (urlParser.isInternalURL(tab.url)) {
        try {
          const systemType=require('./util/systemType.js')
          const systemInfo={
            platformAlias:systemType.platformAlias(),
            versionAlias:systemType.versionAlias(),
            platform:systemType.platform(),
            systemVersion:systemType.systemVersion()
          }
          settings.list.systemInfo=systemInfo
          webviews.callAsync(tab.id, 'send', ['receiveSettingsData', settings.list])
        } catch (e) {
          // webview might not actually exist
        }
      }
    })
  })
})

webviews.bindIPC('scroll-position-change', function (tabId, args) {
  tabs.update(tabId, {
    scrollPosition: args[0]
  })
})

ipc.on('view-event', function (e, args) {
  let originalId;
  webviews.emitEvent(args.event, args.viewId, args.args)
  originalId = args.viewId

  setTimeout(()=>{
    tabs.tabs.forEach((e)=>{
      if(e.id === originalId){
        ipc.send('originalPage',e.url)
      }
    })
  },50)
})

ipc.on('closeEmptyPage',(event,args)=>{
  let closeGuideTab
  tabs.tabs.forEach((e)=>{
      for(let i=0;i<args.length;i++){
        if(args[i]===e.url){
          closeGuideTab = e.id
        }
      }
  })
  require('browserUI.js').closeTab(closeGuideTab)
})


ipc.on('closeTab',(event,args)=>{
    require('browserUI.js').closeTab(args.id)
})


ipc.on('async-call-result', function (e, args) {
  webviews.asyncCallbacks[args.callId](args.error, args.result)
  delete webviews.asyncCallbacks[args.callId]
})

ipc.on('view-ipc', function (e, args) {
  if (!webviews.viewList.includes(args.id)) {
    // the view could have been destroyed between when the event was occured and when it was recieved in the UI process, see https://github.com/minbrowser/min/issues/604#issuecomment-419653437
    return
  }
  webviews.IPCEvents.forEach(function (item) {
    if (item.name === args.name) {
      item.fn(args.id, [args.data], args.frameId, args.frameURL)
    }
  })
})

//在当前页面打开emulation
ipc.on('openMobile',function(e,args){
  let tabData=tabs.get(webviews.selectedId)
	ipc.send('enableEmulation',{id:webviews.selectedId,partition:tabData.partition,newName:tabData.newName})
})


setInterval(function () {
  captureCurrentTab()
}, 15000)

ipc.on('captureData', function (e, data) {
  tabs.update(data.id, { previewImage: data.url })
  if (data.id === webviews.selectedId && webviews.placeholderRequests.length > 0) {
    placeholderImg.src = data.url
    placeholderImg.hidden = false
  }
})

/* focus the view when the window is focused */

ipc.on('windowFocus', function () {
  if (webviews.placeholderRequests.length === 0 && document.activeElement.tagName !== 'INPUT') {
    webviews.focus()
  }
})


module.exports = webviews

