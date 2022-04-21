#### 1、打包 UMD SDK 第三方应用版本

`npm run build`

###### 1、进入到 electron-app/tsbSdk 中执行上面的命令

###### 2、SDK 文件支持 ES Module、CommonJS、AMD 的调用

###### 3、目前预留了(支持 sdk 鉴权的设计)，后续需配合后端完善，已经支持续签鉴权 jsapi_ticket

###### 4、设计大致参考[微信 JSSDK](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#1)

###### 5、在类似 Vue 的 SPA 单页面项目中使用需注意：要使用 tsb-SDK 的页面必须先注入 config 配置信息，否则将无法调用。如需全局应用，例如 Vue 项目中在 mixin 或 main 文件中的 created 方法中预先注入 config 鉴权配置信息，在其他页面文件中就无需重复注入。

###### 6、在 html 文件中直接使用需注意：script 标签中引入 sdk，在 window.onload 方法上挂上 tsbk.default.config 配置信息。具体方法的调用在 tsbk.default.ready()调用时传入具体的回调执行方法

###### 7、所有的 sdk 方法都已包装成一个 Promise，支持链式回调执行。

###### 8、完善后建包发布 npm

#### 2、鉴权部分设计

> - 微信 jssdk 是同一个 url 仅需调用一次，对于变化 url 的 SPA 的 web app 可在每次 url 变化时进行调用，我们设计成同一个 origin 仅需调用一次
> - 后期给第三方应用一个接口调取 jsapi_ticket（有效期 7200 秒，开发者必须在自己的服务全局缓存 jsapi_ticket）
> - jsapi_ticket 获取后，去生成 tsb-SDK 权限验证的签名
> - 签名生成规则如下：参与签名的字段包括 noncestr（随机字符串）, 有效的 jsapi_ticket, timestamp（时间戳）, url（第三方开发商网站的 Origin）
> - 对所有待签名参数按照字段名的 ASCII 码从小到大排序（字典序）后，使用 URL 键值对的格式（即 key1=value1&key2=value2…）拼接成字符串 string
> - 对 string 进行 sha1 签名，得到 signature

#### 3、使用说明 📖

##### 步骤一、💥 引入 tsbSdk

`import tsbk from 路径地址` ES module 引入
`<script src="路径文件"></script>` script 标签引入 ❗️ 对象在全局 tsbk.default 中
###### demo
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="./tsbSdk.js"></script>
  </head>
  <body>
    <button id="test22">测试sdk按键</button>
    <script>
      window.onload = () => {
        tsbk.default.config({
          signature: "ts",
        });
      };
    </script>
  </body>
  <script>
    var button22 = document.getElementById("test22");

    button22.onclick = () => {
      tsbk.default.ready(() => {
        tsbk.default
          .getUserProfile()
          .then((res) => {
            console.log(res, "res!!!");
          })
          .catch((err) => {
            console.log(err, "err!!!");
          });
      });
    };
  </script>
</html>
```

##### 步骤二、💥 通过 config 接口注入权限验证配置

第三方应用需要使用 tsb-SDK 的页面必须先注入 config 配置信息，否则将无法调用。对于变化 url 的 SPA 的 web app 可在每次 url 变化时注入 config 配置信息。

```
tsbk.config({
  appId: '', // 必填，第三方应用的唯一标识
  timestamp: , // 必填，生成签名的时间戳
  nonceStr: '', // 必填，生成签名的随机串
  signature: '',// 必填，签名
  jsApiList: [] // 必填，需要使用的JS接口列表
})
```

👀 💗目前只需要如下即可(实际检验功能未完成)

```
tsbk.config({
  signature: "ts"
})
```

##### 步骤三、💥 通过 ready,error 接口处理验证

```
#ready接口处理成功验证
wx.ready(function(){
  // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，任何sdk接口的调用，须把相关接口放在ready函数中调用来确保正确执行。
})
```

```
#error接口处理失败验证
wx.error(function(res){
  // config信息验证失败会执行error函数，错误可以在返回的res参数中查看，对于SPA可以在这里更新签名。
})

```

#### 4、接口调用说明 📖

##### 🤔 通用参数，可选

所有接口通过 tsbk 对象来调用，参数是一个对象，除了每个接口本身需要传的参数之外，还有以下通用参数：

> - success：接口调用成功时执行的回调函数。
> - fail：接口调用失败时执行的回调函数。

##### 一、🧊 隐藏第三方应用(后台常驻) hideApp 方法

示例

```
tsbk.ready(function() {
  tsbk.hideApp()
})
```

##### 二、🧊 新启动一个指定 url 的标签页 tabLinkJump 方法

###### 参数: 1、必填【url: String】

示例

```
tsbk.ready(function() {
  tsbk.tabLinkJump({
    url: 'https://s.apps.vip/user/account-info'
  })
})

```

##### 三、🧊 销毁第三方应用 destoryApp 方法

示例

```
tsbk.ready(function() {
  tsbk.destoryApp()
})
```

##### 四、🧊 系统消息提示

###### 参数: 1、必填【title: String】消息标题

###### 参数: 2、必填【body: String】消息内容

###### 参数: 3、必填【category: String】消息类型 (lumen 存在以下：【聊天、入群邀请、好友申请】，短说存在以下：【互动消息、关注消息、应用消息】)

示例

```
tsbk.ready(function() {
  tsbk.notice({
    title: '标题',
    body: '消息内容',
    category: '好友申请'
  })
})
```

##### 五、🧊 想天内置应用的免登

示例

```
tsbk.ready(function() {
  tsbk.autoLoginSysApp()
})
```

##### 六、🧊 唤醒想天内置应用【仅支持后台休眠的内置应用】

###### 参数: 1、必填【appName: String】,目前想天内置应用名单【团队协作、元社区、收藏夹、导入助手】

###### 参数：2、可选【url: String】，内置应用跳转链接 path 和 parameters 组成部分(不包含第一个'/')，目前仅支持元社区和团队协作的跳转

示例

```
tsbk.ready(function() {
  tsbk.openSysApp({
    appName: '团队协作',
    url: '?fid=xxxxxxx'
  })
})
```

##### 七、🧊 创建短说圈子邀请链接窗体

###### 参数: 1、必填【groupId: Number】,圈子的 id

示例

```
tsbk.ready(function() {
  tsbk.openOsxInviteMember({
    groupId: 424
  })
})
```

##### 八、🧊 获取浏览器用户信息

###### 参数: 无 返回:Promise

示例

```
tsbk.ready(() => {
  tsbk.getUserProfile().then(res => {
    //res 返回的用户信息
    //do something
  }).catch(err => {
    //do something
  })
})
```


### 【此部分内容是平台侧的知识点，应用侧开发无需阅读】

> 1、tsbSdk.listener()监听者有两个参数，
>
> - 第一个参数是必须的，为 saApp 应用的基本信息
> - 第二个参数是非必须的，为 DepList 订阅器收集，是一个数组，支持往订阅器中注入一个个订阅对象，依据具体情况执行订阅
