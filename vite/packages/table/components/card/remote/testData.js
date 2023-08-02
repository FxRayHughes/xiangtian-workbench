export const dataList = [
  {
    nanoid: 'edrg',
    "name": "remote",
    "cname": "俄罗斯方块小游戏",
    "detail": "一个可以在桌面直接使用的俄罗斯方块小游戏",
    url: 'https://chvin.github.io/react-tetris/',
    sizes: ['2x2'],
    option: [
      {
        img: 'https://simg.doyo.cn/imgfile/bgame/202212/07094520g5iy.jpg',
        name: 'Remote',
        size: '2x2',
        zoom: '11'
      },
    ],
    "time": 1685460400000,
    "download": 7351,
    "avatar": '/icons/logo128.png',
    "nickname": 'Victor Ruiz',
  },
  {
    nanoid: 'qqsd',
    "name": "remote",
    "cname": "网易云",
    "detail": "https://music.163.com/",
    "url": "https://music.163.com/",
    "sizes": ['4x4'],
    "option": [
      {
        img: 'https://img1.baidu.com/it/u=1705857616,1505257240&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500',
        "name": "Remote",
        "size": '4x4',
        "zoom": "11"
      }
    ],
    "time": 1685462400000,
    "download": 9710,
    "avatar": '/icons/logo128.png',
    "nickname": 'Russell Morgan',
  }, 
  {
    nanoid: '6hgd',
    "name": "remote",
    "cname": "动态壁纸-动漫人物",
    "detail": "地址：https://www.bilibili.com/read/cv9984775/",
    "url": "地址：https://www.bilibili.com/read/cv9984775/",
    "sizes": ['2x4'],
    "option": [
      {
        img: '//i0.hdslb.com/bfs/article/ab4648be10143e5a6c5c37766f3c392d1c44e2c1.jpg@1256w_708h_!web-article-pic.avif',
        name: 'Remote',
        size: '2x4',
        zoom: '11'
      },
    ],
    "time": 1635462100000,
    "download": 111,
    "avatar": '/icons/logo128.png',
    "nickname": 'Edith Harvey',
  }, 
  {
    nanoid: 'mjyi',
    "name": "remote",
    "cname": "Ant Design Vue",
    "detail": "地址：https://www.antdv.com/components/overview-cn",
    "url": "地址：https://www.antdv.com/components/overview-cn",
    "sizes": ['2x4'],
    "option": [
      {
        img: 'https://aliyuncdn.antdv.com/form/static/assets/landing-config.4f9d5425.png',
        name: 'Remote',
        size: '2x4',
        zoom: '11'
      },
    ],
    "time": 1685462430000,
    "download": 645,
    "avatar": '/icons/logo128.png',
    "nickname": 'Edith Harvey',
  }, 
]
export const shareList = []

export const setList = function(val){
  shareList.push(val)
}

export const delList = function(id){
  shareList.map((item,index) => {
    if(item.nanoid === id)shareList.splice(index,1)
  })
}