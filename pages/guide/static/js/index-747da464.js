var e=Object.defineProperty,t=Object.defineProperties,r=Object.getOwnPropertyDescriptors,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable,a=(t,r,o)=>r in t?e(t,r,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[r]=o;import{_ as l,r as i,t as n,c,e as u,a as d,z as v,C as f,p as b,b as m,M as y,d as j,o as O,j as h}from"./index-78e08b12.js";/* empty css              */import{g}from"./index.es-62ae3e1d.js";const w={components:{vue3VideoPlay:g},props:["video_url","poster"],setup(e){let l=i({options:{width:"816px",height:"459px",color:"#409eff",src:(e={video_url:"https://up.apps.vip/desk.mp4"}).video_url,muted:!1,webFullScreen:!1,autoPlay:!1,loop:!1,mirror:!1,ligthOff:!0,volume:.3,control:!0,controlBtns:["volume","fullScreen"]},poster:e.poster});return c=((e,t)=>{for(var r in t||(t={}))s.call(t,r)&&a(e,r,t[r]);if(o)for(var r of o(t))p.call(t,r)&&a(e,r,t[r]);return e})({},n(l)),t(c,r({help:()=>{window.$ipc.send("guideApply")}}));var c}},x={class:"title"},P=(e=>(b("data-v-488c65a0"),e=e(),m(),e))((()=>u("span",{class:"text1"},"如何创建和使用桌面？",-1))),_=h("查看使用引导");var k=l(w,[["render",function(e,t,r,o,s,p){const a=y,l=j("vue3VideoPlay");return O(),c("div",null,[u("div",x,[P,d(a,{onClick:t[0]||(t[0]=e=>o.help()),type:"link",class:"text2"},{default:v((()=>[_])),_:1})]),d(l,f(e.options,{poster:"https://up.apps.vip/cover/app.jpg"}),null,16)])}],["__scopeId","data-v-488c65a0"]]);export{k as default};
