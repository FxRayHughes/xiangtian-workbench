<script lang="ts">
import extension  from '../../../src/util/extension.js'
export default {
  data() {
    return {
      manifest:{
        icon:'',
        permissions:[]
      },
      userDataPath:'',
      manifestPath:'',
      crxInfo:[],
      id:'',
      name:'',
      permissionText:[],
      iconPath:''
    }
  },
  mounted(){
   let args=  window.globalArgs
    this.userDataPath=args['user-data-path']
   eval('require')('electron').ipcRenderer.invoke('getPopArgs').then(data=>{
     const path=eval('require')('path')
     this.manifest=data.manifest
     this.manifestPath=data.manifestPath
     this.extensionPath=path.dirname(this.manifestPath)
     this.crxInfo=data.crxInfo
     this.id=data.id
     let icons=Object.values(this.manifest.icons)
     this.icon=icons[icons.length-1]
     this.iconPath='file://'+path.join(this.extensionPath,this.icon)
     this.permissionText=this.convertPermissionsToText(this.manifest.permissions)
     this.getName()
    })

  },
  methods: {
    convertPermissionsToText:extension.convertPermissionsToText,
    close(){
      eval('require')('electron').ipcRenderer.send('closeSelf')
    },

    getName(){
      const fs=eval('require')('fs')
      const path=eval('require')('path')
      let name=this.manifest['name']
      let cnName='zh_CN'
      let localePath=path.resolve(this.extensionPath,'_locales')
      if(name.startsWith('__MSG_')){
        name=name.substring(6,name.length-2)
        let messageName=''
        if(fs.existsSync(path.join(localePath,cnName)))
        {
          messageName=path.join(localePath,cnName,'messages.json')
          //存在中文语言包
        }else{
          messageName=path.join(localePath,this.manifest['default_locale'],'messages.json')
        }
        let locale= JSON.parse(fs.readFileSync(messageName,'utf8'))
        this.name=locale[name]['message']
      }else{
        this.name=name
      }
    },
    setup(){
      let args={
        manifestPath:this.manifestPath,
        crxInfo:{
          id:this.crxInfo.id,
          publicKey:this.crxInfo.publicKey
        }
      }
      eval('require')('electron').ipcRenderer.send('doInstallCrx',args)
      eval('require')('electron').ipcRenderer.send('closeSelf',args)
    }
  }
}
</script>

<template>
  <div class="card-container" style="padding:20px;overflow: hidden">
   <a-row>
     <a-col style="width: 50px">
       <a-avatar shape="square" :src="iconPath"></a-avatar>
     </a-col>
     <a-col style="width: 350px">
       <p>
         <strong> 安装扩展 {{name}} 到 想天浏览器？ </strong>
       </p>
      <p>
        该扩展需要：
        <ul style="max-height: 170px;overflow-y: auto" class="permissions">
       <li v-for="p in permissionText">
         {{p}}
       </li>
     </ul>

      </p>
       <p>
       </p>
     </a-col>
   </a-row>
    <div style="text-align: right;position: fixed;bottom: 15px;right: 15px">
      <a-button @click="close">取消</a-button> &nbsp;&nbsp;&nbsp;
      <a-button @click="setup" type="primary">安装</a-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
    html,body{
      overflow: hidden;
    }
    .permissions{
      padding-left: 0;
      li{
        margin-left: 25px;
        line-height: 20px;
      }
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #ffffff;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgb(176, 176, 176);
        border-radius: 20px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #747474;
      }

      &::-webkit-scrollbar-corner {
        background: #f6f6f6;
      }
    }

</style>
