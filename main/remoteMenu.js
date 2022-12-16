// const handleTempl = (section, event, args, menuIns) => {
//   if(section instanceof Array) {
//     menuIns.append(new MenuItem({ type: 'separator' }))
//     return section.map(v => handleTempl(v))
//   } else {
//     let id = section.click
//     section.click = () => {
//       event.sender.send('context-menu-item-selected', { menuId: args.id, itemId: id })
//     }
//     menuIns.append(new MenuItem(section))
//     return section
//   }
// }

ipc.on('open-context-menu', function (e, data) {
  var menu = new Menu()

  data.template.forEach(function (section) {
    section.forEach(function (item) {
      var id = item.click
      item.click = function () {
        e.sender.send('context-menu-item-selected', { menuId: data.id, itemId: id })
      }
      if (item.submenu) {
        for (var i = 0; i < item.submenu.length; i++) {
          (function (id) {
            item.submenu[i].click = function () {
              e.sender.send('context-menu-item-selected', { menuId: data.id, itemId: id })
            }
          })(item.submenu[i].click)
          if (item.submenu[i].submenu) {
            for (var j = 0; j < item.submenu[i].submenu.length; j++) {
              (function (id) {
                item.submenu[i].submenu[j].click = function () {
                  e.sender.send('context-menu-item-selected', { menuId: data.id, itemId: id })
                }
              })(item.submenu[i].submenu[j].click)
            }
          }
        }
      }
      menu.append(new MenuItem(item))
    })
    menu.append(new MenuItem({ type: 'separator' }))
  })

  // 拼接扩展菜单进去
  if (extensionsMenu.length > 0) {
    menu.append(new MenuItem({
      type: 'separator'
    }))
    extensionsMenu.forEach(menuItem => {
      menu.append(new MenuItem(menuItem))
    })
  }

  // data.template.forEach(function (section) {
  //   section.forEach(function (item) {
  //     var id = item.click
  //     item.click = function () {
  //       e.sender.send('context-menu-item-selected', { menuId: data.id, itemId: id })
  //     }
  //     if (item.submenu) {
  //       for (var i = 0; i < item.submenu.length; i++) {
  //         (function (id) {
  //           item.submenu[i].click = function () {
  //             e.sender.send('context-menu-item-selected', { menuId: data.id, itemId: id })
  //           }
  //         })(item.submenu[i].click)
  //       }
  //     }
  //     menu.append(new MenuItem(item))
  //   })
  //   menu.append(new MenuItem({ type: 'separator' }))
  // })

  menu.on('menu-will-close', function () {
    e.sender.send('context-menu-will-close', { menuId: data.id })
  })
  const cursorPosition = require('electron').screen.getCursorScreenPoint()
  const windowBounds = mainWindow.getBounds()
  // menu.popup({ x: data.x, y: data.y })
  menu.popup({ x: cursorPosition.x - windowBounds.x, y: cursorPosition.y - windowBounds.y }) // 修复popup弹出位置，以屏幕鼠标位置为准
})
