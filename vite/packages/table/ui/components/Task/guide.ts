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
      title: "图标分组",
      text: "右键单击图标小组件，在出现的底部菜单中选择「移动」",
      position: "bottom",
    },
    {
      time: 300,
      title: "移动图标",
      text: "点击「移动」，然后在另一个小组件上单击右键选择合并（你可以同时移动多个图标组件）",
    },
    {
      title: "图标分组",
      text: "右键单击图标小组件，在出现的底部菜单中选择「合并」",
    },
    {
      time: 300,
      title: "合并图标",
      text: "点击「合并」将之前所选择的图标组件合并到当前图标组件的位置。",
    },
    {
      success: true,
    },
  ],
  M0301: [
    {
      type: "router",
      value: "setting",
    },
    {
      title: "主题色",
      text: "点击这里进入「主题色」编辑，选择喜欢的主题配色。",
    },
    {
      time: 300,
      title: "主题色",
      text: "在这里你可以修改主题颜色和文字颜色，来搭配的你桌面和壁纸。",
      next: "好的",
    },
    {
      success: true,
    },
  ],
  M0302: [
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
      title: "添加桌面",
      text: "点击这里打开「添加桌面」侧滑弹窗，在弹窗中查看热门推荐桌面。",
    },
    {
      time: 300,

      title: "添加桌面",
      text: "在这里，你可以选择「从市场添加」，挑选来自社区其他用户分享的桌面，或「自定义创建」，从默认模版中创建。本次任务请选择一个社区用户分享的桌面方案，点击进入「更多桌面分享」",
      next: "好的",
    },
    {
      title: "添加桌面",
      text: "点击进入「桌面创意市场」，挑选一个喜欢的桌面方案。",
      position: "left",
    },
    {
      title: "添加桌面",
      text: "点击一个社区用户分享的桌面，预览桌面效果。",
    },
    {
      title: "添加桌面",
      text: "在这里你可以预览桌面的实际展示效果（部分数据可能需要手动修改）。点击「立即添加」立刻添加到你的桌面。",
    },
    {
      success: true,
    },
  ],
  M0303: [
    {
      type: "router message",
      value: "为了引导流程正确进行，将为你添加1个临时的「外部小组件」。",
    },
    {
      time: 300,
      title: "外部小组件",
      text: "「外部小组件」是一个可以自由修改内容的特殊小组件，你可以选择喜欢的网页地址作为小组件的数据。右键单击或点击右上角更多按钮，在底部操作菜单中选择「发现」。",
    },
    {
      time: 300,
      title: "发现",
      text: "点击进入「发现」，浏览社区其他用户分享的小组件方案。",
    },
    {
      title: "发现",
      text: "在这里你可以看到其他社区小伙伴分享的「外部小组件」，选择一个添加到你的桌面。",
      next: "好的",
    },
    {
      success: true,
    },
  ],
  M0401: [
    {
      type: "router",
      value: "setting",
    },
    {
      title: "通用设置",
      text: "点击这里进入「通用设置」，可以对工作台进行界面缩放，按键基础配置等操作。",
    },
    {
      title: "通用设置",
      text: "你可以在这里修改快捷键。快使用快捷键启动一次工作台吧。",
    },
    {
      success: true,
    },
  ],
};
