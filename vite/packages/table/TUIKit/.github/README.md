## 关于腾讯云即时通信 IM

腾讯云即时通信（Instant Messaging，IM）基于 QQ 底层 IM 能力开发，仅需植入 SDK 即可轻松集成聊天、会话、群组、资料管理能力，帮助您实现文字、图片、短语音、短视频等富媒体消息收发，全面满足通信需要。

## 关于 chat-uikit-vue

chat-uikit-vue 是基于腾讯云 Web IM SDK 的一款 VUE UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。基于 UI 组件您可以像搭积木一样快速搭建起自己的业务逻辑。
chat-uikit-vue 中的组件在实现 UI 功能的同时，会调用 IM SDK 相应的接口实现 IM 相关逻辑和数据的处理，因而开发者在使用 chat-uikit-vue 时只需关注自身业务或个性化扩展即可。
chat-uikit-vue Web 端 和 H5 端界面效果如下图所示：

<img width="1015" alt="page02" src="https://user-images.githubusercontent.com/57951148/192585298-c79960ed-a6a9-4927-89b9-31c1b3f68740.png">
<img width="2072" alt="page00" src="https://user-images.githubusercontent.com/57951148/192585375-6260280f-4a67-4b64-a908-efcedee1c253.png">

本文介绍如何快速集成腾讯云 Web IM SDK 的 VUE UI 组件库。对于其他平台，请参考文档：

[**chat-uikit-react**](https://github.com/TencentCloud/chat-uikit-react)

[**chat-uikit-uniapp**](https://github.com/TencentCloud/chat-uikit-uniapp)

[**chat-uikit-wechat**](https://github.com/TencentCloud/chat-uikit-wechat)

[**chat-uikit-ios**](https://github.com/TencentCloud/chat-uikit-ios)

[**chat-uikit-android**](https://github.com/TencentCloud/chat-uikit-android)

[**chat-uikit-flutter**](https://github.com/TencentCloud/chat-uikit-flutter)

## 发送您的第一条消息

### 开发环境要求

- Vue 3
- TypeScript
- sass（sass-loader 版本 <= 10.1.1）
- node（12.13.0 <= node 版本 <= 17.0.0, 推荐使用 Node.js 官方 LTS 版本 16.17.0）
- npm（版本请与 node 版本匹配）

### TUIKit 源码集成 - github方式集成

#### 步骤 1：创建项目

TUIKit 支持使用 webpack 或 vite 创建项目工程，配置 Vue3 + TypeScript + sass。

以下是使用 vue-cli 搭建项目工程示例，vite 及 create-vue 搭建示例请参考官网教程 [集成 TUIKit 基础功能](https://cloud.tencent.com/document/product/269/68493)。

使用 vue-cli 方式创建项目， 配置 Vue3 + TypeScript + sass。
如果您尚未安装 vue-cli ，可以在 terminal 或 cmd 中采用如下方式进行安装：

```shell
npm install -g @vue/cli@4.5.0 sass sass-loader@10.1.1
```

通过 vue-cli 创建项目，并选择下图中所选配置项。

```shell
vue create chat-example
```

![vue-cli-config](https://user-images.githubusercontent.com/57951148/201915919-c5359f15-d3d2-4c33-8764-f694943c956b.png)

创建完成后，切换到项目所在目录

```shell
cd chat-example
```

#### 步骤 2：下载 TUIKit 组件

通过 `git clone` 方式下载 TUIKit 组件及其相关依赖， 为了方便您的后续使用，建议您通过以下命令将整个 `chat-uikit-vue` 复制到您项目的 src目录下，并重命名为TUIKit：

```shell
# 项目根目录命令行执行
git clone https://github.com/TencentCloud/chat-uikit-vue.git

# 移动并重命名到src目录下
# macOS
mv chat-uikit-vue/TUIKit src/TUIKit
# windows
move chat-uikit-vue\TUIKit src\TUIKit

# 安装TUIKit依赖
npm i @tencentcloud/chat-uikit-vue --legacy-peer-deps
```

成功后目录结构如图所示：  
<img width="300" src="https://user-images.githubusercontent.com/57951148/192585499-1a4edd85-43cc-4527-9f39-494b7d7e625a.png"/>

#### 步骤 3：引入 TUIKit 组件

在 main.ts 中，引入 TUIKit，并注册到 Vue 项目实例中：

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { TUIComponents, TUICore, genTestUserSig } from './TUIKit';
// import TUICallKit
import { TUICallKit } from '@tencentcloud/call-uikit-vue';

const SDKAppID = 0; // Your SDKAppID
const secretKey = ''; //Your secretKey
const userID = ''; // User ID

// init TUIKit
const TUIKit = TUICore.init({
  SDKAppID,
});
// TUIKit add TUIComponents
TUIKit.use(TUIComponents);
// TUIKit add TUICallKit
TUIKit.use(TUICallKit);

// login TUIKit


createApp(App).use(TUIKit).mount('#app');
```

#### 步骤 4： 获取 SDKAppID 、密钥与 userID

设置 main.ts 文件示例代码中的相关参数 SDKAppID、secretKey 以及 userID ，其中 SDKAppID 和密钥等信息，可通过 [即时通信 IM 控制台](https://console.cloud.tencent.com/im) 获取，单击目标应用卡片，进入应用的基础配置页面。例如：  
![image](https://user-images.githubusercontent.com/57951148/192587785-6577cc5e-acf9-423c-86d0-52c67234ab1f.png)

userID 信息，可通过 [即时通信 IM 控制台](https://console.cloud.tencent.com/im) 进行创建和获取，单击目标应用卡片，进入应用的账号管理页面，即可创建账号并获取 userID。例如：  
![create user](https://user-images.githubusercontent.com/57951148/192585588-c5300d12-6bb5-45a4-831b-f7d733573840.png)

#### 步骤 5：调用 TUIKit 组件

在需要展示的页面，调用 TUIKit 的组件即可使用。
例如：在 App.vue 页面中，使用 TUIConversation、TUIChat、TUISearch 快速搭建聊天界面。

```javascript
<template>
  <div class="home-TUIKit-main">
    <div :class="env?.isH5 ? 'conversation-h5' : 'conversation'" v-show="!env?.isH5 || currentModel === 'conversation'">
      <TUISearch class="search" />
      <TUIConversation @current="handleCurrentConversation" />
    </div>
    <div class="chat" v-show="!env?.isH5 || currentModel === 'message'">
      <TUIChat>
        <h1>欢迎使用腾讯云即时通信IM</h1>
      </TUIChat>
    </div>
    <Drag :show="showCall" class="callkit-drag-container" domClassName="callkit-drag-container">
      <!-- TUICallKit 组件：通话 UI 组件主体 -->
      <TUICallKit
        :allowedMinimized="true"
        :allowedFullScreen="false"
        :beforeCalling="beforeCalling"
        :afterCalling="afterCalling"
        :onMinimized="onMinimized"
        :onMessageSentByMe="onMessageSentByMe"
      />
    </Drag>
    <Drag :show="showCallMini" class="callkit-drag-container-mini" domClassName="callkit-drag-container-mini">
      <!-- TUICallKitMini 组件：通话 UI 悬浮窗组件，提供最小化功能 -->
      <TUICallKitMini style="position: static" />
    </Drag>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { TUIEnv } from './TUIKit/TUIPlugin';
import Drag from './TUIKit/TUIComponents/components/drag';
import { handleErrorPrompts } from './TUIKit/TUIComponents/container/utils';

export default defineComponent({
  name: 'App',
  components: {
    Drag,
  },
  setup() {
    const data = reactive({
      env: TUIEnv(),
      currentModel: 'conversation',
      showCall: false,
      showCallMini: false,
    });
    const TUIServer = (window as any)?.TUIKitTUICore?.TUIServer;
    const handleCurrentConversation = (value: string) => {
      data.currentModel = value ? 'message' : 'conversation';
    };
    // beforeCalling：在拨打电话前与收到通话邀请前执行
    const beforeCalling = (type: string, error: any) => {
      if (error) {
        handleErrorPrompts(error, type);
        return;
      }
      data.showCall = true;
    };
    // afterCalling：结束通话后执行
    const afterCalling = () => {
      data.showCall = false;
      data.showCallMini = false;
    };
    // onMinimized：组件切换最小化状态时执行
    const onMinimized = (oldMinimizedStatus: boolean, newMinimizedStatus: boolean) => {
      data.showCall = !newMinimizedStatus;
      data.showCallMini = newMinimizedStatus;
    };
    // onMessageSentByMe：在整个通话过程内发送消息时执行
    const onMessageSentByMe = async (message: any) => {
      TUIServer?.TUIChat?.handleMessageSentByMeToView(message);
      return;
    };
    return {
      ...toRefs(data),
      handleCurrentConversation,
      beforeCalling,
      afterCalling,
      onMinimized,
      onMessageSentByMe,
    };
  },
});
</script>
<style scoped>
.home-TUIKit-main {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.search {
  padding: 12px;
}
.conversation {
  min-width: 285px;
  flex: 0 0 24%;
  border-right: 1px solid #f4f5f9;
}
.conversation-h5 {
  flex: 1;
  border-right: 1px solid #f4f5f9;
}
.chat {
  flex: 1;
  height: 100%;
  position: relative;
}
.callkit-drag-container {
  left: calc(50% - 25rem);
  top: calc(50% - 18rem);
  width: 50rem;
  height: 36rem;
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
}
.callkit-drag-container-mini {
  width: 168px;
  height: 56px;
  right: 10px;
  top: 70px;
}
</style>

```

#### 步骤 6：启动项目
在您项目的根目录执行：
```javascript
npm run serve
```

#### 步骤 7：发送您的第一条消息

![send your first message](https://user-images.githubusercontent.com/57951148/192585549-2cc65785-0d6d-4d48-a0ce-0abe0b927bf4.png)

#### 步骤 8: 拨打您的第一通电话
自 @tencentcloud/chat-uikit-vue v1.4.0 版本起自动接入音视频通话功能，无需手动集成。
如果您是 v1.4.0 以下版本，可以通过接入 call-uikit-vue 体验通话功能。详情请参考 [音视频通话 ( Web & H5 )](https://cloud.tencent.com/document/product/269/79861) 
 <img width="1015" alt="page05" src="https://user-images.githubusercontent.com/57951148/196082955-e046f0b1-bba2-491d-91b3-f30f2c6f4aae.png">

### 常见问题
#### 1. TUIKit 与 Demo 有何区别？

<table style="text-align:center; vertical-align:middle; width:1000px">
  <tr>
    <th style="text-align:center;" width="500px">TUIKit 运行效果</th>
    <th style="text-align:center;" width="500px">Demo 运行效果</th>
  </tr>
  <tr>
    <td><img style="width:500px" src="https://user-images.githubusercontent.com/57951148/225872424-c530e7ef-593d-472a-a77d-420d18bafefa.png"/></td>
    <td><img style="width:500px" src="https://user-images.githubusercontent.com/57951148/225871366-f24b0abe-2829-4886-83fe-eb129338380a.png"/></td>
   </tr>
</table>

TUIKit 是基于腾讯云 Web IM SDK 的一款 VUE UI 组件库，它提供了一些通用的 UI 组件，包含会话、聊天、音视频通话、关系链、资料、群组等功能。通过以上“TUIKit 源码集成”教程，您可以快速接入并体验 TUIKit 中的基础功能，并可以直接将 TUIKit 集成到您的现有项目中进行使用。

Demo 是基于 TUIKit 搭建的一套完整的 即时通信含 UI 解决方案，他是一个基于 VUE3 + TS + TUIKit 的完整项目，其 views/Home.vue 文件中展示了丰富的 TUIKit 组合使用方案供您参考使用。
 


#### 2. 什么是 UserSig？

UserSig 是用户登录即时通信 IM 的密码，其本质是对 UserID 等信息加密后得到的密文。

#### 3. 如何生成 UserSig？

UserSig 签发方式是将 UserSig 的计算代码集成到您的服务端，并提供面向项目的接口，在需要 UserSig 时由您的项目向业务服务器发起请求获取动态 UserSig。更多详情请参见 [服务端生成 UserSig](https://cloud.tencent.com/document/product/269/32688#GeneratingdynamicUserSig)。

> !
>
> 本文示例代码采用的获取 UserSig 的方案是在客户端代码中配置 SECRETKEY，该方法中 SECRETKEY 很容易被反编译逆向破解，一旦您的密钥泄露，攻击者就可以盗用您的腾讯云流量，因此**该方法仅适合本地跑通功能调试**。 正确的 UserSig 签发方式请参见上文。

#### 4. Component name "XXXX" should always be multi-word

- IM TUIKit web 所使用的 ESLint 版本为 v6.7.2 ，对于模块名的驼峰式格式并不进行严格校验
- 如果您出现此问题，您可以在 .eslintrc.js 文件中进行如下配置：

```javascript
module.exports = {
  ...
  rules: {
    ...
    'vue/multi-word-component-names': 'warn',
  },
};
```
### 相关文档
- [快速跑通 Demo](https://github.com/TencentCloud/chat-uikit-vue/tree/main/Demo)
- [@tencentcloud/chat-uikit-vue npm仓库](https://www.npmjs.com/package/@tencentcloud/chat-uikit-vue)
- [SDK API手册](https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html)
- [SDK 更新日志](https://cloud.tencent.com/document/product/269/38492)
- [音视频通话](https://cloud.tencent.com/document/product/269/79861) 