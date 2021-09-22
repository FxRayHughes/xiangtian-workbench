
require('../../dist/localization.build.js')
var electron = require('electron')
var ipc = electron.ipcRenderer
let mainWindowId=0
window.l = l
const {
	contextBridge
} = require('electron')
//将语言包的接口暴露给里面的页面
contextBridge.exposeInMainWorld('l', l)
contextBridge.exposeInMainWorld('ipc',ipc)

window.addEventListener('message', function(e) {
	if (!e.origin.startsWith('file://')) {
		return
	}
	let messageType = getMessageType(e.data)
	switch (messageType) {
		case 'getGlobal':
			ipc.send('getGlobal')
			break
		case 'openBookMarks':
			ipc.sendTo(mainWindowId, 'showBookmarks') //直传给mainWindow，让它唤出书签页面
			break
		// case 'bringToFront':
		// 	ipc.send('bringSidebarToFront')
		// 	break
		// //case 'bringToBack':
		// 	ipc.send('bringSidebarToBack')
		// 	break
		// case 'bringToBackDelay':
		// 	ipc.send('bringSidebarToBackDelay') //延迟关闭
		// 	break
		case 'switchToTask':
			ipc.sendTo(mainWindowId, 'switchToTask', {
				id: e.data.id,
				index: e.data.index
			})
			
			break
	}


})

function getMessageType(data) {
	if (data && data.message)
		return data.message
	else
		return ''
}

setInterval(function() {
	ipc.send('getGlobal')
}, 500)

ipc.on('receiveGlobal', function(e, data) {
	window.postMessage({
		message: 'receiveGlobal',
		data: data
	})
	mainWindowId=data.mainWindowId
	
})
