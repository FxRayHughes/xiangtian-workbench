//这个预载入文件用于与服务器进行交互，仅适用于项目路径
let href = window.location.href

window.addEventListener('message',(e)=>{
  console.log(e)
  if(e.data==='autoLogin'){
    ipc.send('autoLogin')
  }

})
const server = {
  //osx端说pc登录是否已掉的前置判断
  beforeInit() {
    //先检测node是否登录
    ipc.send('checkLogin')
    ipc.on('callback-checkLogin', (event, args) => {
      if(args) {
        console.log(args)
        if(window.localStorage.getItem('token')) {
          return
        } else {
          console.log(api.getUrl(api.API_URL.user.loginOrigin))
          if(href===api.getUrl(api.API_URL.user.loginOrigin)){
            let timer=setInterval(()=>{
              let els=document.getElementsByClassName('form')
              console.log(els)
              if(els.length>0){
                clearInterval(timer)
                ipc.on('callback-autoLogin', (event, args) => {
                  if(args.code === 1000) {
                    window.location.href = args.data
                  }
                })
                let element=`
            <div class="form-row" onclick="window.postMessage('autoLogin')" style="margin-top:10px;margin-bottom: 15px"><button class="button medium" style="width:100%;background-color:"><img style="width:32px;margin-right:10px" src="https://jxxt-1257689580.cos.ap-chengdu.myqcloud.com/8befa3834d2eb29e75685563ef513215.png?imageMogr2/crop/260x260/gravity/center/">使用浏览器账号登录</button></div>`
                let tag=document.createElement('div')
                tag.innerHTML=element
                els[0].insertBefore(tag,els[0].children[4])
                //els[0].appendChild(element)
              }

            },600)
          }
        }
      } else {
        return
      }
    })
  },
	init(path) {
		switch (path) {
      case api.getProdNodeUrl(api.NODE_API_URL.USER.CODE):
        this.login()
        break
      case api.getDevNodeUrl(api.NODE_API_URL.USER.CODE):
        this.login()
        break
      default:
        console.log('在server网站下，但未命中任何预加载处理路径:'+path)
		}
	},
	login() {
    if(window.location.href.includes('code=')) {
      const code = server.matchIntercept(window.location.href, 'code', '\\&')
      ipc.send('loginBrowser', code)
      ipc.on('callback-loginBrowser', (event, arg) => {
        if(arg.code === 1000 ) {
          ipc.send('userLogin', arg.data)
          setTimeout(() => {
            window.location.href = api.getUrl(api.API_URL.group.index)
          }, 500)
        } else {
          console.log(arg.message)
          window.location.href = api.getUrl(api.API_URL.user.login)
        }
      })
    }
	},
  /**
   * 正则匹配标记之间的内容，进一次，特殊字符请添加\\
   * @param {String} url
   * @param {String} start
   * @param {String} end
   */
  matchIntercept(url, start, end) {
    //不加g就不会在第一个匹配时就停止，\S：匹配任何非空白字符，*：多次
    const reg = new RegExp(start + "\\=(\\S*)" + end)
    return url.match(reg)[1]
  }
}

if(href.startsWith(config.SERVER_BASE_URL) && !href.startsWith(config.SERVER_BASE_URL + api.API_URL.user.AUTO_LOGIN))
{
  server.beforeInit()
   server.init(href)
} else if (href.startsWith(config.DEV_NODE_SERVER_BASE_URL)) {
  const newUrl = window.location.origin + window.location.pathname
  server.init(newUrl)
} else if (href.startsWith(config.PROD_NODE_SERVER_BASE_URL)) {
  const newUrl = window.location.origin + window.location.pathname
  server.init(newUrl)
}


