<template>
  <back-btn></back-btn>
  <div v-if="loaded" style="">
    <vue-custom-scrollbar :settings="scrollbarSettings"
      style="position:relative;width:calc(100vw - 9em);  border-radius: 8px;height: calc(100vh - 12em)" class="ml-16">
      <div style="width: auto;   ">
        <div style="display: inline-block;vertical-align: top">
          <div
          class="xt-bg xt-text"
            style="margin: 2em;padding:2em;border-radius: 0.5em;width: 40em; ">
            <h3 class="xt-text">音量
              <span style="float:right">提示音 <a-switch  v-model:checked="settings.duck"></a-switch></span>
            </h3>
            <a-row>
              <a-col :span="3">
                <div style="cursor: pointer" class="xt-text" v-if="!muted" @click="setMuted">
                  <Icon icon="yinliang" style="font-size: 3em"></Icon>
                </div>
                <div style="cursor: pointer"  class="xt-text" v-else @click="cancelMuted">
                  <Icon icon="jingyin"   style="font-size: 3em"></Icon>
                </div>
              </a-col>
              <a-col id="scroller" :span="21">
                <a-slider @touchstart.stop="() => { log('1') }" @touchmove.stop="() => { log('2') }"
                  @touchend.stop="() => { log('3') }" @after-change="setVol" v-model:value="vol"></a-slider>
              </a-col>
            </a-row>
            <div>
            </div>
          </div>
          <div
          class="xt-bg xt-text"
            style="margin: 2em;background: #282828;padding:2em;border-radius: 0.5em;width: 40em;">
            <h3  class="xt-text">屏幕亮度</h3>
            <a-row>
              <a-col :span="3">
                <div>
                  <Icon icon="icon_qingtian"  class="xt-text " style="font-size: 3em;filter: grayscale(100%)"></Icon>
                </div>
              </a-col>
              <a-col :span="21">
                <a-slider @after-change="setBright" v-model:value="bright"></a-slider>
                <p style="margin-top:1em;font-size: 1.2em;padding-left: 0.3em">
                  调整屏幕亮度需要用到高权限接口，可能造成安全软件误报。</p>
              </a-col>
            </a-row>


            <div>

            </div>
          </div>
        </div>

        <div style="display: inline-block; ">
          <div
          class="xt-bg xt-text"
            style="margin: 2em;background: #282828;padding:2em;border-radius: 0.5em;width: 40em;vertical-align: top; ">
            <h3 style="color: var(--primary-text)">音频输出设备</h3>
            <div v-for=" audio in audioList">
              <div @click="setAudio(audio,audioList)" class="audio xt-bg-2" :class="{ 'active': audio.isDefaultForMultimedia }">
                <Icon icon="yinlianglabashengyin" style="font-size: 1.2em"></Icon>
                {{ audio.name }} ({{ audio.deviceName }}) <span v-if="audio.deviceId === 'default'">当前</span>
              </div>
            </div>
            <div>
            </div>
          </div>
          <audio id="speakerAudio" src='/sound/gua.mp3'>
            您的浏览器暂不支持音频播放
          </audio>
        </div>
        <div style="display: inline-block;vertical-align: top">
          <div
          class="xt-bg xt-text"
            style="margin: 2em;background: #282828;padding:2em;border-radius: 0.5em;width: 40em;vertical-align: top;background-color:var(--primary-bg) ; color: var(--primary-text);">
            <h3 style="color: var(--primary-text)">音频输入设备</h3>
            <div v-for="audio in micList">
              <div @click="setAudio(audio,micList)" class="audio xt-bg-2" :class="{ 'active': audio.isDefaultForMultimedia}">
                <Icon icon="maikefeng" style="font-size: 1.2em"></Icon>
                {{ audio.name }}（{{audio.deviceName}}） <span v-if="audio.deviceId === 'default'">当前</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div>
      </div>
    </vue-custom-scrollbar>
  </div>
</template>

<script>
import { appStore } from '../store'

const loudness = window.loudness
const brightness = window.brightness
import { getResPathJoin } from '../js/common/exec'
// const {listOutputs,setAsDefault} =require('@josephuspaye/win-audio-outputs')
import { listInputs, listOutputs, setAsDefault } from '../js/ext/audio/audio'
import {mapWritableState} from 'pinia'
import BackBtn from '../components/comp/BackBtn.vue'
export default {
  name: 'Status',
  components: { BackBtn },
  data() {
    return {
      muted: false,
      vol: 50,
      bright: 50,
      timer: null,
      loaded: false,
      audioList: [],
      micList: [],
      scrollbarSettings: {
        useBothWheelAxes: false,
        minScrollbarLength: 30,
        swipeEasing: true,
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: true
      },
    }
  },
  computed:{
    ...mapWritableState(appStore,['settings']),
  },
  async mounted() {
    this.micList=await listInputs()

    // $('#scroller').on('touchstart',()=>{
    //
    // })

    //   console.log(this.$refs)
    // setTimeout(()=>{
    //   $('scroller').on('mousedown',(e)=>{
    //     cosnole.log('触摸开始')
    //     e.stopPropagation()
    //     e.preventDefault()
    //     return false
    //   })
    //   $('scroller').on('touchstart',(e)=>{
    //     cosnole.log('触摸开始')
    //     e.stopPropagation()
    //     e.preventDefault()
    //     return false
    //   })
    //   $('scroller').on('touchend',(e)=>{
    //     cosnole.log('触摸解锁')
    //     console.log('toucheend')
    //     e.stopPropagation()
    //     return false
    //   })
    //   $('scroller').on('touchmove',(e)=>{
    //     cosnole.log('触摸移动')
    //     e.stopPropagation()
    //     return false
    //   })
    // },200)
    let isDevelopmentMode = 'development-mode' in window.globalArgs
    let path = getResPathJoin('adjust_get_current_system_volume_vista_plus.exe')
    loudness.setCmdPath(path)
    setTimeout(() => {
      //const [audioList, setAudioList] = useState([]);
      //获取音频列表
      this.getSpeakerList()
    }, 0)
    this.loaded = true
    await this.getVals()

    this.timer = setInterval(() => {
      this.getVals()
    }, 2000)

  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  methods: {
    log(info) {
    },
    async getSpeakerList() {
      listOutputs().then((devices) => {
        let list = []
        devices.forEach((device) => {
          device.value = device.id
          list.push(device)
        })
        this.audioList = list
      })
        .catch(function (err) {
          console.error(err.name + ': ' + err.message)
        })
    },
    async getVals() {
      this.muted = await loudness.getMuted()
      this.vol = await loudness.getVolume()
      this.bright = (await brightness.get()) * 100
    },
    async setVol() {
      await loudness.setVolume(Number(this.vol))
      this.gua()
    },
    async setBright() {
      await brightness.set((Number(this.bright) / 100))
      console.log((Number(this.bright) / 100).toFixed(1))
    },
    async setAudio(audio,list) {
      await setAsDefault(audio)
      list.forEach(li=>{li.isDefaultForMultimedia=false})
      audio.isDefaultForMultimedia = true
      // navigator.mediaDevices.selectAudioOutput()
    },
    async gua() {
      if(!this.settings.duck){
        return
      }
      let audioSpeaker = document.getElementById('speakerAudio')
      audioSpeaker.play()
    },
    async setMuted() {
      await loudness.setMuted(true)
      this.muted = true
    },
    async cancelMuted() {
      await loudness.setMuted(false)
      this.muted = false
      this.gua()
    },
    async shell(cmd, cb) {
      let rs = await ipc.invoke('shell', { cmd })
      if (rs) {
        cb(rs)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.audio {
  border-radius: 0.2em;
  padding: 0.5em;
  font-size: 1.2em;
  cursor: pointer;
  width: 100%;
  word-break: break-all;
  white-space: pre-wrap;

  &.active {
    background: #565656;
    border-radius: 3px;
    font-weight: bold;
  }

  &:hover {
    background: rgba(86, 84, 84, 0.62);
  }
}
</style>
