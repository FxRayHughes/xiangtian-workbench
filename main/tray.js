const { Tray } = require('electron')

let tray = null
app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname,'/img/touxiang.png'))

  tray.setToolTip("我是托盘菜单")
  tray.on('click', function(event,position) {
    pool.usePop({
      url: render.getUrl('tray.html'),
      width: 400,
      height: 600,
      x: position.x - 350,
      y: position.y - 600,
    }).then( r =>{

    })
  })

  tray.on('right-click', function(event,position) {
    const contextMenu = Menu.buildFromTemplate([
      { label: '设置'},
      { label: '退出'},
    ])
    tray.setContextMenu(contextMenu)
  })
})