<template>
    <div>
        <Widget :customData="customData" :customIndex="customIndex" :menuList="menuList" :options="options" ref="cardSlot" :desk="desk">
            <div class="icon">
                <Icon icon="solar:keyboard-bold" />
            </div>
            <!-- 快捷键列表 更多快捷键 -->
            <div v-show="showFlag == 'showMore'" class="top-list" >
                <div style="height: 306px;">
                    <div class="card-app pointer" v-for="(item,index) in cardList" :key="index">
                        <img :src="item.imgUrl" alt="">
                        <div class="title-text">{{ item.title }}</div>
                        <div class="right-box">
                            <div class="num">{{ item.num }}</div>
                            <div class="title-key">快捷键</div>
                        </div>
                    </div>
                </div>

                <div class="button-bom">
                    <div class="p-firse pointer">
                        <!-- <icon></icon> -->
                        更多快捷键
                    </div>
                    <div class="p-second pointer">
                        <icon></icon>搜索
                    </div>
                </div>
            </div>         
            <!-- 快捷键详情面板 -->
            <div class="top-list"  v-show = "showFlag == 'showDetail'"  >
                <div class="p-firse" :class="topBar">
                    <div class="name-img">
                        <img src="" alt="">
                        <span>Adobe Lightroom</span>
                    </div>
                    <div class="page-change">
                        <!-- 换页 -->
                        <left-outlined @click="onChangePage(go)"/>
                        <right-outlined @click="onChangePage(after)"/>
                    </div>
                </div>
                <div class="key-body">
                    <!-- 循环类型 -->
                    <div class="key-flex" v-for="item in keyList" :key="item.id">
                        <!-- 标题 -->
                        <div class="key-item" v-if="item.groupName != ''">
                            <div class="key-name">{{ item.groupName }}</div>
                        </div>
                        <!-- 快捷键 -->
                        <div class="key-item" v-if="item.keyStr != ''">
                            <div class="key-item">
                                <span v-for="(keySpan,index) in item.keys" :key="index">{{ keySpan }}</span>
                            </div>
                        </div>
                        <div class="key-title">{{ item.title }}</div>
                    </div>
                </div>
            </div>
        </Widget>
    </div>
    <!-- 设置面板 -->
    <a-drawer :width="500" title="设置" v-model:visible="settingVisible" placement="right">
      <vue-custom-scrollbar :settings="settingsScroller" style="height: 100%;">
        <p>需要在小组件内显示的数据</p>
        <RadioTab :navList="dataType" v-model:selectType="defaultType" @click="onChangeList(1)" 
        @change="onChangeList(22)"></RadioTab>
        <div v-if="defaultType.name == 'showDetail'">
            <p style="margin-top: 14px;">选择快捷键方案</p>
            <a-select
                class="select rounded-lg  text-xs flex items-center" size="large" :bordered="false"
                v-model:selValue="selValue"
                show-search
                placeholder="请选择"
                style="width: 100%"
                :filter-option="filterOption"
                @change="handleChange"
                :options="sortType"
            ></a-select> 
        </div>
      </vue-custom-scrollbar>

    </a-drawer>
    
</template>
  
<script>
import Widget from "../../card/Widget.vue";
import { Icon } from '@iconify/vue';
import RadioTab from "../../RadioTab.vue"
import { defineComponent } from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';


// import BottomEdit from "..";
export default {
    components:{
        Widget,
        Icon,
        RadioTab,
        LeftOutlined,
        RightOutlined,
        defineComponent
    },

    props: {
        customIndex: {
            type: Number,
            default: 0,
        },
        customData: {
            type: Object,
            default: () => { },
        },
        menuList: {
            type: Array,
        },
        desk: {
            type: Object,
        },
        editing: {
            type: Boolean,
        },
    },
    data() {
        return {
            selValue:"",
            settingVisible: false,
            selectValue: '请选择',
            // 选择快捷键方案
            sortType: [
                { name: 'Adobe PS', value: 'Adobe PS' },
                { name: 'Adobe AI', value: 'Adobe AI' },
                { name: 'Adobe PR', value: 'Adobe PR' },
                { name: 'Adobe AX', value: 'Adobe AX' },
            ],
            // 需要在小组件显示的数据
            dataType: [
                { title: '最近使用列表', name: 'showMore' },
                { title: '指定快捷键详情', name: 'showDetail' }
            ],
            defaultType: { title: '最近使用列表', name: 'showMore' },
            options: {
                className: "card double",
                title: "快捷键",
            },
            // 控制面板显示
            // showMore 查看更多
            // showDetail 查看详情
            showFlag: "showMore",
            // 
            // dataList:[],
            menuList: [
                {
                    icon: 'shezhi1',
                    title: '设置',
                    fn: () => { 
                        this.settingVisible = true; 
                        this.$refs.cardSlot.visible = false 
                    }
                },
            ],
            // 快捷键测试数据
            cardList:[
                {
                    title:"Adobe Lighting",
                    imgUrl:"s",
                    num:"92"
                },
                {
                    title:"Adobe Lighting",
                    imgUrl:"s",
                    num:"92"
                },
                {
                    title:"Adobe Lighting",
                    imgUrl:"s",
                    num:"92"
                },
                {
                    title:"Adobe Lighting",
                    imgUrl:"s",
                    num:"92"
                },
                {
                    title:"Adobe Lighting",
                    imgUrl:"s",
                    num:"92"
                },
                {
                    title:"Adobe Lighting",
                    imgUrl:"s",
                    num:"92"
                },
            ],

            // 快捷键测试数据 提交删
            keyList: [
              {
                id: 1,//唯一标识
                groupName: '常用',
                isEdit: false
              },
              {
                id: 2,
                keys: ['Space', 'H', '3'],
                keyStr: 'Space + H + 3',
                // 用于区分编辑的键一键二
                keyArr: [
                  {
                    field: 'modifierKeyTwo',
                    index: 1,
                    key: 'Space'
                  },
                  {
                    field: 'keyList[0]',
                    index: 7,
                    key: 'H'
                  },
                  {
                    field: 'keyList[1]',
                    index: 2,
                    key: '3'
                  }
                ],
                title: '首选项',
                isEdit: false
              },
              {
                id: 3,
                keys: ['Win', 'A'],
                keyStr: 'Win + A',
                keyArr: [
                  {
                    field: 'modifierKeyOne',
                    index: 4,
                    key: 'Win'
                  },
                  {
                    field: 'keyList[0]',
                    index: 0,
                    key: 'A'
                  }
                ],
                title: '清除浏览器数据',
                isEdit: false
              },
              {
                id: 4,
                keys: ['Tab', 'X'],
                keyStr: 'Tab + X',
                keyArr: [
                  {
                    field: 'modifierKeyOne',
                    index: 3,
                    key: 'Tab'
                  },
                  {
                    field: 'keyList[0]',
                    index: 23,
                    key: 'X'
                  }
                ],
                title: '隐藏 Microsoft Edge',
                isEdit: false
              },
              {
                id: 5,
                keys: ['Alt', 'Y', 'L'],
                keyStr: 'Alt + Y + L',
                keyArr: [
                  {
                    field: 'modifierKeyOne',
                    index: 6,
                    key: 'Alt'
                  },
                  {
                    field: 'keyList[0]',
                    index: 24,
                    key: 'Y'
                  },
                  {
                    field: 'keyList[0]',
                    index: 11,
                    key: 'L'
                  }
                ],
                title: '通过系统对话框打印',
                isEdit: false
              },
              {
                id: 6,
                groupName: '文件',
                isEdit: false
              },
              {
                id: 7,
                keys: ['Ctrl', 'Q'],
                keyStr: 'Ctrl + Q',
                keyArr: [
                  {
                    field: 'modifierKeyTwo',
                    index: 0,
                    key: 'Ctrl'
                  },
                  {
                    field: 'keyList[0]',
                    index: 16,
                    key: 'Q'
                  }
                ],
                title: '打印',
                isEdit: false
              },
              {
                id: 8,
                keys: ['Ctrl', 'I', 'K'],
                keyStr: 'Ctrl + I + K',
                keyArr: [
                  {
                    field: 'modifierKeyOne',
                    index: 0,
                    key: 'Ctrl'
                  },
                  {
                    field: 'keyList[0]',
                    index: 8,
                    key: 'I'
                  },
                  {
                    field: 'keyList[0]',
                    index: 10,
                    key: 'K'
                  }
                ],
                title: '隐藏其他',
                isEdit: false
              },
              {
                id: 9,
                keys: ['Tab', 'X', 'W'],
                keyStr: 'Tab + X + W',
                keyArr: [
                  {
                    field: 'modifierKeyTwo',
                    index: 3,
                    key: 'Tab'
                  },
                  {
                    field: 'keyList[0]',
                    index: 23,
                    key: 'X'
                  },
                  {
                    field: 'keyList[0]',
                    index: 22,
                    key: 'W'
                  }
                ],
                title: '电子邮件链接',
                isEdit: false
              },
              {
                id: 10,
                keys: ['Tab', 'Ctrl', 'E'],
                keyStr: 'Tab + Ctrl + E',
                keyArr: [
                  {
                    field: 'modifierKeyTwo',
                    index: 3,
                    key: 'Tab'
                  },
                  {
                    field: 'modifierKeyOne',
                    index: 0,
                    key: 'Ctrl'
                  },
                  {
                    field: 'keyList[0]',
                    index: 4,
                    key: 'E'
                  }
                ],
                title: '新建 InPrivate 窗口',
                isEdit: false
              },
              {
                id: 11,
                keys: ['Fn', 'Ctrl', 'L'],
                keyStr: 'Fn + Ctrl + L',
                keyArr: [
                  {
                    field: 'modifierKeyTwo',
                    index: 5,
                    key: 'Fn'
                  },
                  {
                    field: 'modifierKeyOne',
                    index: 0,
                    key: 'Ctrl'
                  },
                  {
                    field: 'keyList[0]',
                    index: 11,
                    key: 'L'
                  }
                ],
                title: '关闭标签页',
                isEdit: false
              },
              {
                id: 12,
                keys: ['Ctrl', 'V'],
                keyStr: 'Ctrl + V',
                keyArr: [
                  {
                    field: 'modifierKeyTwo',
                    index: 0,
                    key: 'Ctrl'
                  },
                  {
                    field: 'keyList[0]',
                    index: 21,
                    key: 'V'
                  }
                ],
                title: '页面另存为',
                isEdit: false
              },
              {
                id: 13,
                groupName: '其他',
                isEdit: false
              },
              {
                id: 14,
                keys: ['Alt', 'D', 'X'],
                keyStr: 'Alt + D + X',
                keyArr: [
                  {
                    field: 'modifierKeyOne',
                    index: 6,
                    key: 'Alt'
                  },
                  {
                    field: 'keyList[0]',
                    index: 3,
                    key: 'D'
                  },
                  {
                    field: 'keyList[0]',
                    index: 23,
                    key: 'X'
                  }
                ],
                title: '退出 Microsoft Edge',
                isEdit: false
              },
              {
                id: 15,
                keys: ['Ctrl', '.'],
                keyStr: 'Ctrl + .',
                keyArr: [
                  {
                    field: 'modifierKeyTwo',
                    index: 0,
                    key: 'Ctrl'
                  },
                  {
                    field: 'keyList[1]',
                    index: 16,
                    key: '.'
                  }
                ],
                title: '退出并保留窗口',
                isEdit: false
              },
            ],
        };
    },
    async mounted() {

    },
    methods:{

        // 换页
        onChangePage(type){
            // type
        },

        handleChange(value){
            console.log(`selected ${value}`);
        },
        filterOption(input, option){
            return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },



    }
};
</script>
  
<style lang="scss" scoped>

    .icon{
        width: 24px;
        height: 24px;
        // border: 1px solid #fff;
        position: absolute;
        top: 15px;
        left: 15px;
    }
    .icon svg{
        width: 24px;
        height: 24px;
    }
    
    .card-app{
        float: left;
        // border: 1px solid #fff;
        width: 265px;
        height: 88px;
        margin-top: 14px;
        background: rgba(0,0,0,0.30);
        border-radius: 12px;
    }
    .card-app:nth-of-type(2n){
        margin-left: 14px;
    }
    .card-app img{
        width: 56px;
        height: 56px;
        float: left;
        margin: 16px;
    }
    
    .title-text{
        font-family: 'PingFang SC';
        float: left;
        width: 88px;
        height: 50px;
        font-size: 18px;
        opacity: 0.85;
        margin-top: 19px;
        font-weight: 500;
        word-wrap: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space:pre-wrap;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }

    .right-box{
        float: left;
        width: 42px;
        height: 60px;
        margin-left: 32px;
        margin-top: 5px;
    }

    .right-box .num{
        font-family: 'Oswald';
        font-size: 28px;
        opacity: 0.85;
        text-align: center;
    }

    .right-box .title-key{
        font-family: 'PingFang SC';
        width: 42px;
        height: 20px;
        font-size: 14px;
        opacity: 0.6;
    }

    .button-bom{
        font-family: PingFangSC-Regular;
        font-size: 16px;
        color: rgba(255,255,255,0.85);
        text-align: center;
        font-weight: 400;
        line-height: 44px;
    }
    .button-bom .p-firse{
        width: 266px;
        height: 44px;
        float: left;
        background: rgba(0,0,0,0.30);
        border-radius: 12px;
        margin-top: 16px;
    }
    
    .name-img{
        float: left;
        line-height: 44px;
    }
    
    .name-img img{
        line-height: 44px;
        margin-right: 10px;
        width: 32px;
        height: 32px;
    }
    
    .name-img span{
        margin-right: 10px;
        font-family: PingFangSC-Regular;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.85);
    }


    .button-bom .p-second{
        width: 266px;
        height: 44px;
        float: left;
        background: rgba(0,0,0,0.30);
        border-radius: 12px;
        margin-left: 12px;
        margin-top: 16px;
    }


    .page-change{
       width: 100%; 
    //    border: 1px solid #fff;
       text-align: right;
       margin-top: 10px;
    }

    .page-change span{
        display: inline-block;
        width: 44px;
        height: 44px;
        font-size: 20px;
        line-height: 47px;
        text-align: center;
        background-color: rgba(0,0,0,0.3);
        color: rgba(255,255,255,0.85);
        border-radius: 8px;
        margin-left: 10px;
    }
    i:hover{
        color: rgba(255,255,255,1);

    }

    .key-body{
        margin-top: 10px;
        width: 544px;
        overflow: hidden;
        // border: 1px solid #fff;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        flex-direction: column;
        height: 330px;
        color: rgba(255,255,255,0.85);
        overflow: hidden;

    }

    .key-body>div{
        width: 260px;
        height: 32px;
        margin: 0 16px 18px 0px;
    }

    .key-flex{
        display: flex;
        line-height: 32px;
    }
    .key-name{
        font-size: 16px;
        font-family: PingFangSC-Regular;
        color: rgba(255,255,255,0.85);
        font-weight: 400;
        line-height: 32px;
        padding: 5px;
    }

    .key-item span:nth-of-type(1){
        margin-left: -10px;
        // display: flex;
    }

    .key-title{
        text-align: right;
        flex: 1;
        font-family: PingFangSC-Regular;
        font-size: 16px;
        color: rgba(255,255,255,0.85);
        text-align: right;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
    }


    .key-flex span{
        width: 32px;
        height: 32px;
        background: rgba(0,0,0,0.30);
        border-radius: 8px;
        padding: 5px 8px;
        font-size: 16px;
        margin-right: 8px;
    }
</style>
  