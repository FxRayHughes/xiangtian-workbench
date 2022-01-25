const tsbSdk = {
  //初始化监听
  listener: function() {
    window.addEventListener('message', function(e) {
      let messageEvent = e.data.eventName
      switch(messageEvent) {
        case 'checkAuth':
          tsbSdk.handleCheckAuth(e.data)
          break
        case 'hideApp':
          tsbSdk.handleHideApp()
          break
        case 'tabLinkJump':
          tsbSdk.newTabNavigate(e.data)
          break
        case 'destoryApp':
          tsbSdk.handleDestoryApp()
      }
    })
  },

  handleCheckAuth: function(data) {
    //const { appId, timestamp, nonceStr, signature, jsApiList } = data.secretInfo
    //解密signature，sha1方法
    //校验解密出来的timestamp、nonceStr是否一致
    //然后再进一步远程ts服务器校验(jsapi_ticket, origin)是否过期，不过期返回一个true，过期返回false
    //const axios = require('axios')
    // axios.post().then(res => {
    //   if(res.code === 200) {
    //     window.postMessage({
    //       eventName: 'authResult',
    //       signature: signature,
    //       sdkSwitch: true
    //     })
    //   } else {
    //     window.postMessage({
    //       eventName: 'authResult',
    //       signature: signature,
    //       sdkSwitch: false
    //     })
    //   }
    // }).catch(err => {
    //   window.postMessage({
    //     eventName: 'authResult',
    //     signature: signature,
    //     sdkSwitch: false
    //   })
    // })

    window.postMessage({
      eventName: 'authResult',
      signature: 'ts',
      sdkSwitch: true
    })
  },

  handleHideApp: function() {
    ipc.send('sdkHideApp')
  },

  newTabNavigate: function(options) {
    if(options.url.length > 0) {
      ipc.send('sdkTabNavigate', options)
    } else {
      return
    }
  },

  handleDestoryApp: function() {
    ipc.send('sdkDestoryApp')
  }

}


module.exports = tsbSdk