const { exists, mkdirSync, readFile, unlink, writeFile } = require("fs");
const fs = require('fs')
const ipc = require('electron').ipcRenderer
let baseStorePath = ''
let favStorePath = ''
ipc.on('getUserDataPath', (event, args) => {
  baseStorePath = args
  ipc.send('canCloseInterval')
})

const fileHelpers = {
  //异步封装   判断文件是否存在函数
  asyncFileExists(filePath) {
    return new Promise((resolve) => {
      exists(filePath, (fileExists) => {
        resolve({ fileExists, filePath });
      });
    });
  },

  //异步封装 写入'utf8' string文件
  asyncWriteFile(filePath, fileContent) {
    return new Promise((resolve, reject) => {
      writeFile(filePath, fileContent, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  //异步封装 删除文件
  asyncDeleteFile(filePath) {
    return new Promise((resolve, reject) => {
      unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  //同步 创建文件夹
  syncCreateFolder(filePath) {
    mkdirSync(filePath);
  },

  //异步封装 读string返回的文件    非buffer类型
  asyncReadFile(filePath) {
    return new Promise((resolve, reject) => {
      this.asyncFileExists(filePath).then(res => {
        if(res) {
          readFile(filePath, (err, data) => {
            if(err) {
              reject(err)
            } else {
              resolve(data.toString('utf8'))
            }
          })
        } else {
          reject(`File "${filePath} does not exist"`)
        }
      }).catch(error => reject(error))
    })
  },

  //---------------------------------收藏夹书签的耦合api>
  //创建一个url后缀类型的文件
  addUrlFile(title, url, folderPath) {
    const ext = '.url'
    let urlTpl = `
      [DEFAULT]
      [InternetShortcut]
      URL=${url}
    `
    fs.writeFileSync((favStorePath + folderPath + '/' + title + ext).replaceAll('//', '/'), urlTpl, 'utf-8')
  },

  //创建书签文件夹
  addBookmarkFolder(folderPath) {
    if(!fs.existsSync((favStorePath + folderPath).replaceAll('//', '/'))) {
      mkdirSync((favStorePath + folderPath).replaceAll('//', '/'))
    }
  },

  //创建书签根目录和改变favStorePath
  addRootFolder(fileName) {
    if(!fs.existsSync((baseStorePath + '/' + fileName).replaceAll('//', '/'))) {
      mkdirSync((baseStorePath + '/' + fileName).replaceAll('//', '/'))
      favStorePath = `${baseStorePath}/${fileName}`
    } else {
      throw '书签根目录已存在'
    }
  },

  //一次导入后还原favStorePath的初始路径
  restFavStorePath() {
    favStorePath = baseStorePath
  },

  //递归处理书签(edge、chrome)
  recurBookmark(bookmarkObj, prevFolderName = null) {
    let currentFloderName
    if(bookmarkObj.type === 'url') {
      currentFloderName = prevFolderName ?? '/'
      fileHelpers.addUrlFile(bookmarkObj.name, bookmarkObj.url, currentFloderName)
    } else {
      currentFloderName = prevFolderName ? `${prevFolderName}/${bookmarkObj.name}` : `/${bookmarkObj.name}`
      fileHelpers.addBookmarkFolder(currentFloderName)
      bookmarkObj.children.forEach(v => {
        fileHelpers.recurBookmark(v, currentFloderName)
      })
    }
  },

  //递归处理书签前，对整个书签对象的非法违规字符进行处理
  recurBookmarkNameObj(bookmarkObject) {
    bookmarkObject.name = fileHelpers.filterName(bookmarkObject.name)
    if(bookmarkObject.type === 'folder') {
      bookmarkObject.children.forEach(v => {
        fileHelpers.recurBookmarkNameObj(v)
      })
    }
  },

  //处理非法违规字符
  filterName(name) {
    const illegal = [
      '/', '\\', '|', '?', '"', '*', ':', '<', '>', '\n'
    ]
    illegal.forEach(v => {
      if(name.indexOf(v) > -1) {
        name = name.replaceAll(v, ' ')
      }
    })
    return name
  },

  //手动处理html文件的导入拿到data
  manualOperateHtml: async function () {
    let filePath = await ipc.invoke('showOpenDialog', {
      filters: [
        { name: 'HTML files', extensions: ['htm', 'html'] }
      ]
    })

    if (!filePath) {
      return
    }

    return fileHelpers.asyncReadFile(filePath[0])
  }

};

module.exports = fileHelpers
