<template>
    <div class="p-0 -mt-8 card content">
        <a-row>
            <a-col :span="13" style="border-right: 1px solid #454545; height: calc(100vh - 10em )">
                <vue-custom-scrollbar :settings="outerSettings"
                    style="position: relative; height: calc(100vh -5em );color: var(--primary-text);" class="scroll">
                    <div class="pr-6">
                        <div class="mb-4 font-16 xt-text">添加闹钟</div>
                        <div class="mb-4 ">
                            <a-input ref="input" allow-clear @click="$refs.input.select()" v-model:value="eventValue"
                                style="border-radius: 10px;height: 40px; width: 100%;" placeholder="新闹钟" />
                        </div>

                        <div class="mb-4 font-16 xt-text">小时</div>
                        <div>
                            <a-radio-group button-style="solid" v-model:value="timeHour" class="flex rounded-lg xt-bg-2 "
                                option-type="button">
                                <template
                                    v-for="(i, index) in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]">
                                    <a-radio-button :value="i" class="mb-2 text-center xt-text" style="width: 50px;">{{ index }}</a-radio-button>
                                </template>
                            </a-radio-group>

                        </div>
                        <div>
                            <div class="mt-4 mb-4 font-16 xt-text">分钟</div>
                            <!-- <div class="w-full xt-bg-2" style="border-radius: 10px;border: 1px solid var(--secondary-text);"> -->
                            <a-select v-model:value="timeMinute" placeholder="选择分钟"
                                style="width:100%;  height: 40px; border-radius: 10px;">
                                <a-select-option :value="index" v-for="(i, index) in new Array(60)" class="xt-bg xt-text-2"  >
                                    {{ index }}
                                </a-select-option>
                            </a-select>
                            <!-- </div> -->

                        </div>
                        <div class="w-full mt-4 mb-4">
                            <div class="mt-4 mb-4 font-16 xt-text">
                                重复
                            </div>
                            <a-radio-group v-model:value="clockType" button-style="solid" class="flex justify-between w-full xt-bg-2" buttonStyle="solid">
                                <a-radio-button value="不重复" style="color:var(--primary-text);width: 50%;" class="text-center font-16" >不重复</a-radio-button>
                                <a-radio-button value="每天" class="text-center font-16" style="width: 50%;">每天</a-radio-button>
                            </a-radio-group>
                        </div>
                        <div>
                            <!-- <xt-button type="primary" class="w-full xt-active-bg" @click="addSettingClock">确认添加</xt-button>
                             -->
                            <xt-button type="primary" class=" font-16 xt-text" style="width: 100%; height: 40px; background-color: var(--active-bg);"
                                @click="addSettingClock">确认添加</xt-button>
                        </div>
                    </div>

                </vue-custom-scrollbar>
            </a-col>
            <a-col :span="11">
                <vue-custom-scrollbar :settings="outerSettings" style="position: relative; height: calc(100vh - 10em)"
                    class="scroll">
                    <div class="pl-4">
                        <div style="color:var(--primary-text)"> 我的闹钟</div>
                        <a-empty v-if="clockEvent.length === 0" description="暂无闹钟" image="/img/test/load-ail.png"
                            style="margin-top: 40%;"></a-empty>
                        <!-- <a-row> -->
                        <div class="flex items-center" v-for="(item, index) in clockEvent">
                            <div class="rounded-lg event-list "
                                style="background: var(--secondary-bg);color: var(--primary-text);width: calc(100% - 20px);height: 56px; ">
                                <div class="card-list ">
                                    <div class="event-title">
                                        <span class="font-14 xt-text">{{ item.eventValue }}</span>
                                        <span class="font-12 xt-text-2"
                                            style="color:var(--secondary-text)">{{ item.clockType }}</span>
                                    </div>
                                    <span class="font-20">{{ item.dateValue.hours }}:{{ item.dateValue.minutes }}</span>
                                </div>
                            </div>
                            <clockIcon icon="akar-icons:circle-x-fill" @click="onClockMenuClick" class="ml-2 xt-bg xt-text-2"
                                style="font-size: 18px;">
                            </clockIcon>
                        </div>

                        <!-- </a-row> -->
                    </div>

                </vue-custom-scrollbar>
            </a-col>
        </a-row>
    </div>
</template>
  
<script>
import { mapWritableState, mapActions } from "pinia";
import { cardStore } from '../../store/card'
import { timeStamp, transDate } from "../../util";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import BackBtn from '../../components/comp/BackBtn.vue'
import { getDateTime } from '../../../../src/util/dateTime'
import { Icon as clockIcon } from '@iconify/vue'
export default {
    name: "SetupClock",
    components: { BackBtn, clockIcon },

    data() {
        return {
            outerSettings: {
                useBothWheelAxes: true,
                swipeEasing: true,
                suppressScrollY: false,
                suppressScrollX: true,
                wheelPropagation: true,
            },
            title: "",
            countdownDayType: "大",
            clockType: "不重复",

            eventValue: "未命名",
            dateValue: null,
            clockDate: null,
            flag: true,
            customIndex: 0,

            timeHour: 0,//时钟设置的小时
            timeMinute: 0,//时钟设置的分钟

            dateTime: {},//当前时间
            timer: null //当前时间更新计时器
        };
    },

    mounted() {
        if (this.$route.params["name"]) {
            // console.log(this.$route.params);
            this.title = this.$route.params["cname"];
            this.cardType = this.$route.params["name"];
            this.customIndex = this.$route.params["customIndex"];
        }
        this.updateTime()
        this.timer = setInterval(() => {
            this.updateTime()
        }, 1000)
    },
    unmounted() {
        clearInterval(this.timer)
    },
    computed: {
        ...mapWritableState(cardStore, ["countdownDay", "appDate", "clockEvent"]),
    },
    methods: {
        dayjs,
        transDate,
        ...mapActions(cardStore, [
            "addCountdownDay",
            "addClock",
            "addCard",
            "removeCountdownDay",
            "removeClock",
        ]),
        updateTime() {
            this.dateTime = getDateTime()
        },
        addCard() {
            if (this.eventValue === "" || this.dateValue === null) {
                if (this.flag !== true) return;
                this.flag = false;
                setTimeout(() => {
                    message.info("不可为空！");
                    this.flag = true;
                }, 500);
                return;
            }
            this.addCountdownDay({
                eventValue: this.eventValue,
                dateValue: timeStamp(this.dateValue.valueOf()),
                customIndex: this.customIndex
            });
            // this.$router.push({
            //   name: "home",
            // });
            message.success("添加成功！");
        },
        addSettingClock() {
            if (this.eventValue === "") {
                if (this.flag !== true) return;
                this.flag = false;
                message.info("闹钟名称不可为空！");
                setTimeout(() => {
                    this.flag = true;
                }, 500);
                return;
            }

            let date = new Date(Date.now())
            let timeSpan = {
                day: date.getDate(),
                hours: this.timeHour < 10 ? '0' + this.timeHour : this.timeHour,
                minutes: this.timeMinute < 10 ? '0' + this.timeMinute : this.timeMinute,
                month: date.getMonth() + 1,
                seconds: '00',
                year: date.getFullYear()
            }
            let dateSpan = timeStamp(timeSpan)


            this.addClock({
                clockType: this.clockType,
                eventValue: this.eventValue,
                dateValue: timeSpan,
                clockTimeStamp: timeSpan
            });
            // this.$router.push({
            //   name: "home",
            // });
            message.success("添加成功！");
        },
        onContextMenuClick(e, index) {
            this.removeCountdownDay(index);
        },
        onClockMenuClick(e, index) {
            this.removeClock(index, 1);
        },
    },
};
</script>
  
<style lang="scss" scoped>
.event-list {
    padding: 0.2em 0.5em;

    width: 100%;
    margin-top: 0.5em;

    .card-list {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .event-title {
            display: flex;
            flex-direction: column;
            width: 70%;

            .event {
                padding: 0;
                margin: 0;
                font-size: 0.6em;
                color: #6a6a6a;
            }
        }
    }
}

.font-14 {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    font-weight: 400;
}

.font-12 {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    font-weight: 400;
}

.title {
    display: flex;
    align-items: center;
    color: #dddddd;
    font-size: 1.3em;
}

.content {
    color: #dddddd;
    font-size: 1.3em;
    width: calc(100vw - 1em);
    padding: 0;
    // margin-top: 2em;
}

.ant-row {
    margin: 1em;
}

.scroll {
    @media screen and (max-width: 1100px) {
        width: 100%;
    }
}

.button {
    display: flex;
    flex-direction: column;
    height: 5em;
    width: 8em;
    justify-content: space-between;

    button {
        width: 6em;
    }

    @media screen and (max-width: 1200px) {
        flex-direction: row;
        height: 2em;
        width: 14em;
        align-items: center;
    }
}

.list {
    display: flex;
    flex-direction: column;
    margin-top: -0.5em;
}

:deep(.ant-select) {
    border: none !important;
}
:deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    // border-radius: 10px !important;
    height: 100%;
    border-radius: 10px;

}
:deep(.ant-select-option){
    color: var(--primary-text);
}
:deep(.ant-select-arrow){
    color: var(--primary-text);
}
:deep(.ant-input) {
    color: var(--primary-text);
    &::placeholder {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        font-weight: 400;
        color:var(--primary-text);
    }
}

:deep(.ant-select-single .ant-select-selector .ant-select-selection-item) {
    line-height: 35px;
}

:deep(.ant-picker-header) {
    -webkit-app-region: no-drag;
}

:deep(.ant-drawer-body) {
    padding-top: 0px;
}



.font-16 {
    font-family: PingFangSC-Regular;
    font-size: 16px;
    font-weight: 400;
}

.font-20 {
    font-family: Oswald-Medium;
    font-size: 20px;
    font-weight: 500;
}</style>
  