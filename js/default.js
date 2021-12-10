window.globalArgs = {}

process.argv.forEach(function(arg) {
	if (arg.startsWith('--')) {
		var key = arg.split('=')[0].replace('--', '')
		var value = arg.split('=')[1]
		globalArgs[key] = value
	}
})

window.electron = require('electron')
window.fs = require('fs')
window.EventEmitter = require('events')
window.ipc = electron.ipcRenderer
window.Dexie = require('dexie')


if (navigator.platform === 'MacIntel') {
	document.body.classList.add('mac')
	window.platformType = 'mac'
} else if (navigator.platform === 'Win32') {
	document.body.classList.add('windows')
	window.platformType = 'windows'
} else {
	document.body.classList.add('linux')
	window.platformType = 'linux'
}



if (navigator.maxTouchPoints > 0) {
	document.body.classList.add('touch')
}

/* add classes so that the window state can be used in CSS */
ipc.on('enter-full-screen', function() {
	document.body.classList.add('fullscreen')
})

ipc.on('leave-full-screen', function() {
	document.body.classList.remove('fullscreen')
})

ipc.on('maximize', function() {
	document.body.classList.add('maximized')
})

ipc.on('unmaximize', function() {
	document.body.classList.remove('maximized')
})
let mouseRcoverAreaElement = document.getElementById('mouseRcoverArea')

ipc.on('getTitlebarHeight',function(){
	console.log(mouseRcoverAreaElement.offsetTop)
	ipc.send('returnTitlebarHeight',{
			titlebarHeight:mouseRcoverAreaElement.offsetTop,
	})

})
ipc.send('returnTitlebarHeight',{
	 		titlebarHeight:mouseRcoverAreaElement.offsetTop,
})
setTimeout(()=>{
	ipc.send('returnTitlebarHeight',{
		 		titlebarHeight:mouseRcoverAreaElement.offsetTop,
	})
},500)
// https://remysharp.com/2010/07/21/throttling-function-calls

window.throttle = function(fn, threshhold, scope) {
	threshhold || (threshhold = 250)
	var last,
		deferTimer
	return function() {
		var context = scope || this

		var now = +new Date()
		var args = arguments
		if (last && now < last + threshhold) {
			// hold on to it
			clearTimeout(deferTimer)
			deferTimer = setTimeout(function() {
				last = now
				fn.apply(context, args)
			}, threshhold)
		} else {
			last = now
			fn.apply(context, args)
		}
	}
}

ipc.on('getGlobal',function(event,args){
	ipc.send('receiveGlobal',{
		tasks:tasks.getStringifyableState(),
		tabs:tabs.getStringifyableState(),
    callbackWin:args.callbackWin
		})
})
// https://remysharp.com/2010/07/21/throttling-function-calls

window.debounce = function(fn, delay) {
	var timer = null
	return function() {
		var context = this
		var args = arguments
		clearTimeout(timer)
		timer = setTimeout(function() {
			fn.apply(context, args)
		}, delay)
	}
}

window.empty = function(node) {
	var n
	while (n = node.firstElementChild) {
		node.removeChild(n)
	}
}

/* prevent a click event from firing after dragging the window */

window.addEventListener('load', function() {
	var isMouseDown = false
	var isDragging = false
	var distance = 0

	document.body.addEventListener('mousedown', function() {
		isMouseDown = true
		isDragging = false
		distance = 0
	})

	document.body.addEventListener('mouseup', function() {
		isMouseDown = false
	})

	var dragHandles = document.getElementsByClassName('windowDragHandle')

	for (var i = 0; i < dragHandles.length; i++) {
		dragHandles[i].addEventListener('mousemove', function(e) {
			if (isMouseDown) {
				isDragging = true
				distance += Math.abs(e.movementX) + Math.abs(e.movementY)
			}
		})
	}

	document.body.addEventListener('click', function(e) {
		if (isDragging && distance >= 10.0) {
			e.stopImmediatePropagation()
			isDragging = false
		}
	}, true)
})



require('tabState.js').initialize()
require('windowControls.js').initialize()
require('navbar/menuButton.js').initialize()
require('navbar/addTabButton.js').initialize()
require('navbar/tabActivity.js').initialize()
require('navbar/tabColor.js').initialize()
require('navbar/navigationButtons.js').initialize()
//加入工具栏
require('toolbar/toolbar')


require('downloadManager.js').initialize()
require('webviewMenu.js').initialize()
require('contextMenu.js').initialize()
require('menuRenderer.js').initialize()
require('defaultKeybindings.js').initialize()
require('pdfViewer.js').initialize()
require('autofillSetup.js').initialize()
require('passwordManager/passwordManager.js').initialize()
require('passwordManager/passwordCapture.js').initialize()
require('passwordManager/passwordViewer.js').initialize()
require('util/theme.js').initialize()
require('userscripts.js').initialize()
require('statistics.js').initialize()
require('taskOverlay/taskOverlay.js').initialize()
require('pageTranslations.js').initialize()
require('sessionRestore.js').initialize()

// default searchbar plugins

require('searchbar/placesPlugin.js').initialize()
require('searchbar/instantAnswerPlugin.js').initialize()
require('searchbar/openTabsPlugin.js').initialize()
require('searchbar/bangsPlugin.js').initialize()
require('searchbar/customBangs.js').initialize()
require('searchbar/searchSuggestionsPlugin.js').initialize()
require('searchbar/placeSuggestionsPlugin.js').initialize()
require('searchbar/updateNotifications.js').initialize()
require('searchbar/restoreTaskPlugin.js').initialize()
require('searchbar/bookmarkManager.js').initialize()
require('searchbar/historyViewer.js').initialize()
require('searchbar/developmentModeNotification.js').initialize()
require('searchbar/shortcutButtons.js').initialize()
require('searchbar/calculatorPlugin.js').initialize()
require('sessionRestore.js').restore()

//通用工具类(copy实现、深拷贝命中)
require('util/tools.js').initialize()

const searchbar = require('searchbar/searchbar.js')
ipc.on('importBookMarks',function(){
  searchbar.openURL('!importbookmarks', null)
})
