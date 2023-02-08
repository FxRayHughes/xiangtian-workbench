if(typeof ipc ==='undefined'){
  window.ipc=require('electron').ipcRenderer
}

if (typeof fs === "undefined") {
  var fs = require("fs");
}
var statsh = {
  filePath:
    window.globalArgs["user-data-path"] +
    (process.platform === "win32" ? "\\" : "/") +
    "statsh.json",
  list: {},
  get: function (key) {
    return statsh.list[key];
  },
  getAll: function() {
    return statsh.list
  },
  /**
   * 埋点函数
   * @param {Object} buryObj action行为属性、key键名、value键值。当action为increase时，vaule必须为number类型
   * @returns
   */
  do: function (buryObj) {
    if (
      !buryObj.hasOwnProperty("action") ||
      !buryObj.hasOwnProperty("key") ||
      !buryObj.hasOwnProperty("value")
    )
      return;
    if (
      buryObj.hasOwnProperty("action") &&
      buryObj.action === "increase" &&
      typeof buryObj.value !== 'number'
    )
      return;
    if (buryObj.hasOwnProperty("action") && buryObj.action === "increase") {
      let prevValue = statsh.get(buryObj.key) ?? 0
      statsh.list[buryObj.key] = prevValue + buryObj.value;
    }
    if (buryObj.hasOwnProperty("action") && buryObj.action === "set") {
      statsh.list[buryObj.key] = buryObj.value;
    }

    ipc.send("statshChanged", buryObj);
  },
  reset: function () {
    statsh.list = {}
    ipc.send('statshReset')
  },
  initialize: function () {
    var fileData;
    try {
      fileData = fs.readFileSync(statsh.filePath, "utf-8");
    } catch (e) {
      if (e.code !== "ENOENT") {
        console.warn(e);
      }
    }
    if (fileData) {
      statsh.list = JSON.parse(fileData);
    }

    //这里是在子进程中接收来自主进程的同步
    ipc.on("statshChanged", function (e, buryObj) {
      if (buryObj.hasOwnProperty("action") && buryObj.action === "increase") {
        statsh.list[buryObj.key] = statsh.get(buryObj.key) + buryObj.value;
      }
      if (buryObj.hasOwnProperty("action") && buryObj.action === "set") {
        statsh.list[buryObj.key] = buryObj.value;
      }
    });
  },
};

statsh.initialize();
module.exports = statsh;
