import{_ as a,i as t,J as e,B as s,y as i,o as l,w as n,v as d,e as o,a as c,p as r,b as m,h as p,K as u}from"./index-c5ee8581.js";import{_ as f}from"./ContentLayout-7247e4d9.js";/* empty css              */const g=t({data:()=>({modalVisiable:!0}),methods:{getMedal(){this.modalVisiable=!1,window.$ipc.send("getMedal")},judgeMedalState:()=>e().getMedalState},setup(){}}),x=a=>(r("data-v-6d559446"),a=a(),m(),a),v=x((()=>o("div",{class:"al-main flex flex-direction justify-around align-center"},[o("div",{class:"main-title"},[o("span",{class:"main-title-first"},"完成引导"),o("span",{class:"main-title-second"},"登录后享有更多权益，还能获得勋章：")]),o("div",{class:"al-main-content"},[o("div",{class:"al-main-content-code"}),o("span",{class:"text"},"打开微信扫一扫，加群了解更多内容")]),o("div",{class:"al-main-bottom"},[o("button",{class:"button1"},"开始探索"),o("button",{class:"button2"},"更多功能介绍")])],-1))),b={class:"modal flex justify-center align-center"},y={class:"modal-content flex flex-direction justify-around align-center"},h=x((()=>o("span",null,"您已完成新用户引导! 获得勋章:",-1))),j=x((()=>o("div",{class:"flex flex-direction align-center"},[o("img",{src:"./static/png/silver-b-e205a991.png",alt:"",style:{width:"80px",height:"90px"}}),o("span",{style:{"margin-top":"20px"}},"初出茅庐")],-1))),M=p("收下了");var _=a(g,[["render",function(a,t,e,r,m,p){const g=u,x=f;return l(),s(x,{height:"514"},{default:i((()=>[v,n(o("div",b,[o("div",y,[h,j,c(g,{type:"primary",style:{width:"180px"},onClick:a.getMedal},{default:i((()=>[M])),_:1},8,["onClick"])])],512),[[d,a.modalVisiable&&!a.judgeMedalState()]])])),_:1})}],["__scopeId","data-v-6d559446"]]);export{_ as default};
