cloudTpl = `
<div style="width: 100%">
  <a-layout>
    <a-layout-header style="background: #fff; padding: 0">
      <a-page-header title="云端团队导航" sub-title="这里是云端团队导航，云端导航与帐号绑定，重装系统、更换电脑都可以同步，永不丢失。">
        <template slot="extra">

          <a-radio-group :value="appList.type" @change="onListTypeChange">
            <a-radio-button value="0">
              <a-icon type="appstore"></a-icon>
            </a-radio-button>
            <!--           <a-radio-button value="1">-->
            <!--          <a-icon type="table"></a-icon>-->
            <!--        </a-radio-button>-->
            <a-radio-button value="2">
              <a-icon type="bars"></a-icon>
            </a-radio-button>
          </a-radio-group>

          <a-button shape="circle" icon="share-alt" @click="shareList" title="分享整组" />
          <a-button shape="circle" icon="diff" @click="openList" title="整组打开" />
        </template>
      </a-page-header>
    </a-layout-header>
    <a-layout-content>
      <div style="text-align: left;padding: 10px;margin:20px">
        <div style="float: left">
          <template>
            <a-breadcrumb>
              <a-breadcrumb-item>云端团队导航列表</a-breadcrumb-item>
              <a-breadcrumb-item>{{appList.name}}</a-breadcrumb-item>
            </a-breadcrumb>

          </template>
        </div>
        <!-- <div style="text-align: center;margin:20px">
          <search />
        </div> -->
        <div>
          <a-card>

            <a-button type="primary" shape="round" class="add-button" slot="extra" @click="showModal">添加网站</a-button>

            <div id="main-content" class="elements selecto-area"
              style="max-height: calc( 100vh - 238px);overflow-y: auto">
              <template>
                <a-list v-show="appList.type==='2' && myApps.length>0" item-layout="horizontal" :data-source="myApps"
                  :pagination="pagination">
                  <a-list-item @dragstart="dragStart($event,item)" @mousedown.stop draggable="true" class="app-list"
                    :id="item.id" slot="renderItem" slot-scope="item, index">
                    <a-list-item-meta>
                      <div slot="description">
                        <a class="app-url"  @click="openUrl(item.url)">{{item.url}}</a>
                      </div>
                      <a slot="title" @click="openUrl(item.url)"><strong>{{ item.name }}</strong> <span
                          style="color: #999;font-weight: normal;padding-left: 20px">{{item.summary}}</span></a>
                      <a-avatar @click="openUrl(item.url)" style="margin:10px;cursor:pointer;" slot="avatar" shape="square" :src="item.icon" />
                    </a-list-item-meta>
                  </a-list-item>
                </a-list>
              </template>
              <vue-selecto dragContainer=".elements"
                v-bind:selectableTargets='[".selecto-area .app",".selecto-area .app-list"]' v-bind:hitRate='5'
                v-bind:selectByClick='true' v-bind:selectFromInside='true' v-bind:ratio='0' @select="onSelect"
                @selectEnd="selectEnd"></vue-selecto>
              <div class="" id="selecto1" v-show="appList.type==='0' && myApps.length>0">
                <a-dropdown v-for="(app, index) in myApps" :trigger="['contextmenu']">
                  <a-card-grid @dragstart="dragStart($event,app)" @mousedown.stop draggable="true" :id="app.id"
                    class="app" style="cursor: pointer;" @click="openUrl(app.url)">
                    <a-avatar shape="square" :size="64" :src="app.icon" style="margin-bottom: 10px;"></a-avatar>
                    <a-card-meta :title="app.name">
                    </a-card-meta>
                  </a-card-grid>
                  <a-menu slot="overlay">
                    <a-menu-item @click="addApp(app)" key="1">
                      <a-icon type="delete"></a-icon>
                      删除
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>

              </div>

              <a-empty v-if="myApps.length==0" description="还未添加任何网站，点击添加网站">

                <a-button type="primary" @click="showModal">
                  添加网站
                </a-button>

              </a-empty>
            </div>
          </a-card>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
  <template>
    <div>
      <a-modal v-model="visible" title="添加网站" :footer="null" :width="800">
        <template>
          <a-tabs default-active-key="1" tab-position="top">
            <a-tab-pane key="1">
              \t\t\t\t\t\t\t\t\t<span slot="tab">
                \t\t\t\t\t\t\t\t\t\t<a-icon type="appstore"></a-icon>
                \t\t\t\t\t\t\t\t\t\t全部
                \t\t\t\t\t\t\t\t\t</span>
              <a-alert message="点击图标即可添加，添加完毕后，需手动关闭本界面。" type="info" show-icon style="margin-bottom: 10px;"></a-alert>

              <template>
                <div style="width: 750px">

                  <a-tabs default-active-key="productive" tab-position="left" :style="{ height: '600px' }">
                    <a-tab-pane v-for="(type, indexType) in allApps" :key="type.name" :tab="type.title">

                      <div style="overflow-y: auto;max-height: 600px">
                        <a-card :title="type.title" style="padding: 10px;">
                          <a-card-grid style="width: 140px;cursor: pointer;" v-for="(app, indexApp) in type.apps"
                            class="app" @click="addApp(app)">
                            <a-avatar shape="square" :size="64" :src="app.icon" style="margin-bottom: 10px;"></a-avatar>
                            <a-card-meta :title="app.name">
                              <template slot="description">
                                {{ app.summary }}
                              </template>
                            </a-card-meta>
                          </a-card-grid>
                        </a-card>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                </div>
              </template>
            </a-tab-pane>
            <!-- <a-tab-pane key="2">
                              <span slot="tab">
                                <a-icon type="book"></a-icon>
                                从书签创建
                              </span>
              待开发
            </a-tab-pane>
            <a-tab-pane key="3">
                              <span slot="tab">
                                <a-icon type="folder"></a-icon>
                                从标签创建
                              </span>
              待开发
            </a-tab-pane> -->
            <a-tab-pane key="4">
              <span slot="tab">
                <a-icon type="link"></a-icon>
                从URL创建
              </span>
              <template>
                <a-form :form="form" @submit="handleSubmit">
                  <a-alert message="网站的图标不需要设置，当你打开一次这个网站之后，系统就会自动获取并更新。" type="info" show-icon
                    style="margin-bottom: 10px;"></a-alert>
                  <a-form-item v-bind="formItemLayout" label="应用名">
                    \t\t\t\t\t\t\t\t\t\t\t\t<span slot="label">
                      \t\t\t\t\t\t\t\t\t\t\t\t\t应用名&nbsp;
                      <a-tooltip title="应用名称">
                        \t\t\t\t\t\t\t\t\t\t\t\t\t\t
                        <a-icon type="question-circle-o" />
                        \t\t\t\t\t\t\t\t\t\t\t\t\t</a-tooltip>
                      \t\t\t\t\t\t\t\t\t\t\t\t</span>
                    <a-input placeholder="请输入应用名，少于8个字" v-decorator="[
          'name',
          {
            rules: [{ required: true, message: '请输入应用名！', whitespace: true },{max:24,message:'不得超过24个字！'}],
          },
        ]" />
                  </a-form-item>

                  <a-form-item v-bind="formItemLayout" label="网址">
                    \t\t\t\t\t\t\t\t\t\t\t\t<span slot="label">
                      \t\t\t\t\t\t\t\t\t\t\t\t\t网址&nbsp;
                      <a-tooltip title="输入网址，如果不以http://或https://开头，系统会自动加上http://">
                        \t\t\t\t\t\t\t\t\t\t\t\t\t\t
                        <a-icon type="question-circle-o" />
                        \t\t\t\t\t\t\t\t\t\t\t\t\t</a-tooltip>
                      \t\t\t\t\t\t\t\t\t\t\t\t</span>

                    <a-auto-complete
                      v-decorator="['url', { rules: [{ required: true, message: '请输入网址！' },{max:512,message:'最多不能超过512个字母！'}] }]"
                      placeholder="输入任意网址，如http://apps.vip，以http或https开头" @change="handleWebsiteChange">
                      <template slot="dataSource">
                        <a-select-option v-for="url in autoCompleteResult" :key="url">
                          {{ url }}
                        </a-select-option>
                      </template>
                      <a-input />
                    </a-auto-complete>
                  </a-form-item>

                  <a-form-item v-bind="formItemLayout" label="应用介绍">
                    \t\t\t\t\t\t\t\t\t\t\t\t<span slot="label">
                      \t\t\t\t\t\t\t\t\t\t\t\t\t应用介绍&nbsp;
                      \t\t\t\t\t\t\t\t\t\t\t\t</span>
                    <template>
                      <a-textarea placeholder="应用介绍，非必填，不超过100字" :rows="4"
                        v-decorator="['summary', { rules: [{max:100,message:'最多不能超过100个字！'}] }]">
                      </a-textarea>
                    </template>
                  </a-form-item>
                  <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
                    <a-button style="margin-left: 20px" type="primary" html-type="submit">
                      添加并继续
                    </a-button>
                  </a-form-item>
                </a-form>
              </template>
            </a-tab-pane>
          </a-tabs>
        </template>
      </a-modal>
    </div>
  </template>
</div>
`;
const ipc = require("electron").ipcRenderer;
function parseNumber(str) {
  const num = Number(str);
  return isNaN(num) ? 0 : num;
}

const VueSelecto = require("vue-selecto");
module.exports = Vue.component("cloud-page", {
  name: "cloud-page",
  template: cloudTpl,
  components: {
    VueSelecto,
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      vm.myApps = [];
      vm.groupId = parseNumber(to.query.groupId)
      vm.listId = parseNumber(to.query.listId); // 通过 `vm` 访问组件实例
      window.$listId = vm.listId;
      window.$type = String(to.query.type);
      vm.appList.type = String(to.query.type);
      vm.appList.name = String(to.query.name)
      vm.appList.summary = String(to.query.summary)
      await vm.load(vm);
    });
  },
  async beforeRouteUpdate(to, from, next) {
    this.listId = parseNumber(to.query.listId);
    this.groupId = parseNumber(to.query.groupId)
    window.$listId = this.listId;
    window.$type = String(to.query.type);
    this.appList.type = String(to.query.type);
    this.appList.name = String(to.query.name)
    this.appList.summary = String(to.query.summary)
    await this.load(this);
  },
  data() {
    return {
      //selecto
      selectedElements: [],
      selected: [],
      //selecto end
      pagination: {
        onChange: (page) => {},
        pageSize: 10,
        hideOnSinglePage: true,
      },
      listId: Number,
      groupId: Number,
      visible: false,
      type: 0,
      myApps: [],
      appList: {
        name: "",
        type: "",
        summary: ""
      },
      //表单布局用字段
      formItemLayout: {
        labelCol: {
          xs: {
            span: 8,
          },
          sm: {
            span: 6,
          },
        },
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 16,
          },
        },
      },
      //表单验证用字段
      confirmDirty: false,
      //表单自动填充用字段
      autoCompleteResult: [],

      //表单专用填充项目
      name: "",
      url: "",
      summary: "",
    };
  },
  computed: {
    allApps: {
      get: function () {
        if (
          typeof window.$appsApiData == "undefined" ||
          window.$appsApiData == null
        ) {
          return window.nativeData.allApps;
        }
        return window.$appsApiData.allApps;
      },
    },
    appUpdateTime: {
      get: function () {
        if (
          typeof window.$appsApiData == "undefined" ||
          window.$appsApiData == null
        ) {
          return window.nativeData.updateTime;
        } else {
          return window.$appsApiData.updateTime;
        }
      },
    },
  },
  mounted() {
    //因为路由切换控制 mounted无法满足需求
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, {
      name: "register",
    });
  },
  methods: {
    //判断是否是我的应用
    //添加应用到任务栏
    addTask(app) {
      postMessage({
        message: "addTask",
        name: app.name,
        url: app.url,
        icon: app.icon,
      });
      this.$message.success("成功在左侧栏添加了应用：" + app.name + "。");
    },
    isInMyApps() {
      // if (this.currentApp == null) {
      //   return -1
      // }
      let findIndex = -1;
      let findIds = [];
      this.myApps.forEach((item, index) => {
        if (item.name == this.currentApp.name) {
          findIndex = index;
          findIds.push(item.id);
        }
      });
      return {
        findIndex: findIndex,
        findIds: findIds,
      };
    },
    //添加app
    async addCurrentApp() {
      const resFind = this.isInMyApps(this.currentApp);
      if (resFind.findIndex !== -1) {
        const data = {
          ids: resFind.findIds,
          list_id: this.listId
        }
        const result = await this.$store.dispatch("delGroupNavApps", data);
        if (result.code === 1000) {
          this.$message.warning("移除了应用：" + this.currentApp.name + "");
          await this.$store.dispatch("getGroupNavApps", this.listId);
          this.myApps = this.$store.getters.getGroupNavApps;
        } else {
          this.$message.error("移除应用失败!");
        }
      } else {
        const data = {
          name: this.currentApp.name,
          summary: this.currentApp.summary,
          url: this.currentApp.url,
          icon: this.currentApp.icon,
          add_time: String(new Date().getTime()),
          list_id: this.listId,
        };
        //group
        const result = await this.$store.dispatch("addGroupNavApps", data);
        if (result.code === 1000) {
          this.$message.success("添加了应用：" + this.currentApp.name);
          await this.$store.dispatch("getGroupNavApps", this.listId);
          this.myApps = this.$store.getters.getGroupNavApps;
        } else {
          this.$message.error("添加应用失败!");
        }
      }
    },
    //点击app或手动创建的时候
    async addApp(app) {
      this.currentApp = app;
      await this.addCurrentApp();
    },
    handleSubmit(e) {
      e.preventDefault();
      let that = this;
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (!err) {
          const app = {
            name: values.name,
            url: values.url,
            summary: values.summary ? values.summary : "",
            icon: "../../icons/default.svg",
          };
          await that.addApp(app);
          that.$nextTick(() => {
            that.form.resetFields();
          });
        }
      });
    },
    handleWebsiteChange(value) {
      let autoCompleteResult;
      if (!value) {
        autoCompleteResult = [];
      } else {
        autoCompleteResult = [".com", ".org", ".net"].map(
          (domain) => `${value}${domain}`
        );
      }
      this.autoCompleteResult = autoCompleteResult;
    },
    showModal() {
      this.visible = true;
    },
    async load(vm) {
      await vm.$store.dispatch("getGroupNavApps", vm.listId);
      vm.myApps = vm.$store.getters.getGroupNavApps;
    },
    async onListTypeChange(e) {
      this.appList.type = e.target.value;
      const data = {
        id: this.listId,
        group_id: this.groupId
      }
      await this.$store.dispatch('updateAppGroupNav', Object.assign(data, this.appList))
      await this.$store.dispatch('getAppGroupNavs', { id: this.groupId})
    },
    openUrl(url) {
      ipc.send('addTab',{url:url});
    },
    //selecto
    onSelect(e) {
      e.added.forEach((el) => {
        el.classList.add("selected");
      });
      e.removed.forEach((el) => {
        el.classList.remove("selected");
        this.selected = [];
      });
    },
    // 框选结束存储数据
    selectEnd(e) {
      //console.log(e, '>>>>>>>>>>>>?')
      this.selectedElements = [];
      window.$selectedApps = [];
      e.selected.map((item) => {
        this.selectedElements.push(item);
        this.selected.push(item.id);
      });
      window.$selectedApps = this.selected;
    },

    //selecto end

    //drag
    dragStart(e, app) {
      //console.log(e, 'e')
      console.log(app, "app");
      if (!!!window.$selectedApps) {
        window.$selectedApps = [String(app.id)];
      } else if (window.$selectedApps.length === 0) {
        window.$selectedApps.push(String(app.id));
      }
      //fn中的this不会出现指向问题，在cloud-comp中调用fn时
      //因为这是箭头函数，指向的this还是这个cloud-page组建
      window.$removeApps = () => {
        this.selected = [];
        this.selectedElements.forEach((el) => {
          el.classList.remove("selected");
        });
        this.load(this);
      };
    },
    //drag end

    /***
     * 分享整组
     */
    shareList() {
      let apps = this.myApps;
      let filterList = apps.filter((e) => !e.url.startsWith("file:///")); //过滤掉file层面的tab
      let args = [];
      for (let i = 0; i < filterList.length; i++) {
        const obj = {
          url: filterList[i].url,
          favicon: filterList[i].icon,
          title: filterList[i].name,
        };
        args.push(obj);
      }
      ipc.send("shareTask", args);
    },
    /***
     * 分享整个列表
     */
    openList() {
      this.myApps.forEach((app) => {
        ipc.send('addTab',{url:app.url});
      });
    },
  },
});
