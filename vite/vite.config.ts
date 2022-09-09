import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path=require('path')
// https://vitejs.dev/config/
const pkg:string=__dirname
export default defineConfig({
  plugins: [vue()],
  build:{
    rollupOptions:{
      input :{
        'icon':path.resolve(pkg,'icon.html'),
        'index':path.resolve(pkg,'index.html'),
        'extension':path.resolve(pkg,'extension.html'),
        'task':path.resolve(pkg,'task.html'),
        'settings':path.resolve(pkg,'settings.html'),
        'barrage':path.resolve(pkg,'barrage.html'),
        'user':path.resolve(pkg,'user.html'),
        'tray':path.resolve(pkg,'tray.html')
      }
    }
  }
})
