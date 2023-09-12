export const guide = {
  firstTask: [
    // 第一个负责定位和启动任务
    {
      type: "router",
      value: "home",
    },
    {
      time: 500,
      title: "使用帮助——任务中心",
      text: "不了解功能如何使用？不知道从何入手？你可以在这里找到核心功能的基础使用方式，完成引导任务还能获得丰厚奖励。",
      next: "完成",
      position: "top",
    },
    {
      success: true,
    },
  ],
  M0101: [
    // 第一个负责定位和启动任务
    {
      type: "router",
      value: "home",
    },
    {
      title: "桌面操作菜单",
      text: "点击这里（或桌面空白处「单击右键键」），打开桌面的底部操作栏，可以选择桌面相关的功能操作。",
    },
    {
      time: 300,
      title: "添加小组件",
      text: "点击这里进入「创意市场」，目前有数十个类型的小组件任你选择。",
      position: "top",
    },
    {
      title: "添加小组件",
      text: "点击「添加按钮」将小组件添加到你的桌面。",
      next: "完成",

      position: "top",
    },
    // 最后一个是完成任务的标记
    {
      success: true,
    },
  ],
  M0102: [
    // 第一个负责定位和启动任务
    {
      type: "router",
      value: "home",
    },
    {
      title: "桌面操作菜单",
      text: "点击这里（或桌面空白处「单击右键键」），打开桌面的底部操作栏，可以选择桌面相关的功能操作。",
    },
    {
      time: 600,
      title: "添加桌面",
      text: "点击这里打开「添加桌面」侧滑弹窗，在弹窗中设置添加桌面。",
      position: "top",
    },
    {
      time: 500,
      title: "添加桌面",
      text: "在这里，你可以选择「从市场添加」，挑选来自社区其他用户分享的桌面，或「自定义创建」，从默认模版中创建。本次任务请修改「桌面名称」，选择「初始布局」，然后点击「立即添加」即可完成桌面添加。",
      next: "好的",
      position: "right",
    },
    {
      title: "添加桌面",
      text: "有四种默认桌面模版供你选择，选择一个「初始布局」，并点「立即添加」即可完成。",
      next: "完成",
      position: "right",
    },
    // 最后一个是完成任务的标记
    {
      success: true,
    },
  ],
  M0103: [
    // 第一个负责定位和启动任务
    {
      type: "router",
      value: "home",
    },
    {
      id: 1,
      title: "背景设置",
      text: "点击这里（或桌面空白处「单击右键键」），打开桌面的底部操作栏，可以选择桌面相关的功能操作。",
    },
    {
      id: 2,

      time: 500,
      title: "背景设置",
      text: "点击这里打开「设置」侧滑弹窗，在弹窗中选择背景设置。",
      position: "top",
    },
    {
      id: 3,

      time: 200,
      title: "背景设置",
      text: `在这里你可以修改所有桌面的属性，调整卡片的缩放比例、间距，设置背景和特殊效果。也可以针对单个桌面做个性化设置。
      本次任务让我们选择「背景设置」，为桌面设置一个合适的壁纸。`,
      next: "好的",
      position: "left",
    },
    {
      id: 4,
      title: "背景设置",
      text: "点击「背景设置」，进入「壁纸」应用，选择喜欢的壁纸。",
      position: "bottom",
    },
    {
      id: 5,
      title: "背景设置",
      text: "在这里你可以选择「自定义上传」，或者选择来自「必应壁纸」、「拾光壁纸」和「动态壁纸」，将喜欢的壁纸设置为系统桌面壁纸或者工作台背景。本次任务让我们来给工作台添加一个背景壁纸。",
      position: "left",
      next: "好的",
    },
    {
      id: 6,
      title: "背景设置",
      text: "「右键单击」喜欢的壁纸，在弹出的底部操作栏中选择「设置为工作台背景」",
    },
    {
      id: 7,
      time: 300,
      title: "背景设置",
      text: "点击「设为工作台背景」即可完成背景设置。",
      next: "完成",
    },
    // 最后一个是完成任务的标记
    {
      success: true,
    },
  ],
  M0104: [
    // 第一个负责定位和启动任务
    {
      type: "router",
      value: "home",
    },
    {
      title: "编辑导航",
      text: "在「底部导航」或「侧边导航行」上「右键单击」」",
    },
    {
      time: 300,
      title: "编辑导航",
      text: "选择「编辑导航」，进入导航栏编辑模式。",
      position: "top",
    },
    {
      title: "编辑导航",
      text: "在这里你可以自由修改导航栏的用图标，选择开启侧边导航或关闭底部导航等操作。本次任务让我们来给「底部导航」添加一个图标。",
      next: "好的",
      position: "top",
    },
    {
      title: "编辑导航",
      text: "在这里，你可以选择系统应用和功能、酷应用，windows应用，自定义应用和轻应用。本次任务，让我们来添加一个「系统应用」图标。",
      position: "top",
    },
    {
      title: "编辑导航",
      text: "在这里，你可以选择系统应用和功能、酷应用，windows应用，自定义应用和轻应用。本次任务，让我们来添加一个「系统应用」图标。",
    },
    {
      title: "编辑导航",
      text: "点击一个应用图标即可完成添加。",
      next: "完成",
    },
    // 最后一个是完成任务的标记
    {
      success: true,
    },
  ],
  M0201: [
    {
      type: "router",
      value: "home",
    },
    {
      title: "桌面操作菜单",
      text: "点击这里（或桌面空白处「单击右键键」），打开桌面的底部操作栏，可以选择桌面相关的功能操作。",
    },
    {
      time: 300,
      title: "添加图标",
      text: "选择「添加图标」，进入批量导入图标弹窗。",
    },
    {
      title: "添加图标",
      text: "在这里你可以选择我们内置的网址导航图标，也可以选择来自你的系统桌面的应用图标。本次任务让我们将你的桌面图标添加到煮面。",
      next: "好的",
    },
    {
      title: "添加图标",
      text: "本次任务默认帮你添加了两个图标",
      next: "好的",
    },
    {
      title: "添加图标",
      text: "点击确定完成添加",
      next: "完成",
    },
    {
      success: true,
    },
  ],
  M0202: [
    // 第一个负责定位和启动任务
    {
      type: "message",
      value: "为了引导流程正确进行，将为你添加2个临时的单图标小组件。",
    },
    {
      time: 1000,
      title: "栓q2",
      text: "在「底部导航」或「侧边导航行」上「右键单击」」",
      position: "bottom",
    },
    {
      time: 300,
      title: "栓q",
      text: "在「底部导航」或「侧边导航行」上「右键单击」」",
    },
    {
      title: "栓q",
      text: "在「底部导航」或「侧边导航行」上「右键单击」」",
    },
    {
      time: 300,
      title: "栓q",
      text: "在「底部导航」或「侧边导航行」上「右键单击」」",
    },
    // 最后一个是完成任务的标记
    {
      success: true,
    },
  ],
};
