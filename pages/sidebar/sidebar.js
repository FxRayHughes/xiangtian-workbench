//定义一个TaskList来接收tasks类型的数据
const groupApi = require('../util/api/groupApi')
const userStatsModel = require('../util/model/userStatsModel')
const userApi = require('../util/api/userApi')
const messageModel = require('../util/model/messageModel')
const {tools} = require('../util/util')

class TasksList {
	constructor() {
		this.tasks = []
		this.selected = null

	}

	init(tasks) {
		this.tasks = tasks.tasks
		this.selected = tasks.selectedTask
	}
	getAll() {
		return this.tasks
	}
	forEach(fun) {
		return this.tasks.forEach(fun)
	}

	getSelected() {
		return this.get(this.selected)
	}

	get(id) {
		return this.find(task => task.id === id) || null
	}

	find(filter) {
		for (var i = 0, len = this.tasks.length; i < len; i++) {
			if (filter(this.tasks[i], i, this.tasks)) {
				return this.tasks[i]
			}
		}
	}

	getAll() {
		return this.tasks
	}
	getLength() {
		return this.tasks.length
	}

	byIndex(index) {
		return this.tasks[index]
	}


	getIndex(id) {
		return this.tasks.findIndex(task => task.id === id)
	}

	slice(...args) {
		return this.tasks.slice.apply(this.tasks, args)
	}

	splice(...args) {
		return this.tasks.splice.apply(this.tasks, args)
	}
}


let count = 0
window.addEventListener('message', async function(e) {
	if (e.data.message && e.data.message === 'receiveGlobal') {
		let tasksList = new TasksList()
		if ($store.state.pinItems == null) {
			console.log('还未初始化')
			return
		}
		tasksList.init(e.data.data.tasks)
		await $store.commit('fillTasksToItems', tasksList)
		//console.log('同步'+count+++"次")
	}

})
//初始化一个tasks变量

window.onload = function() {

	Vue.prototype.$window = window
	Vue.use(Vuex)
	const store = new Vuex.Store({
		state: {
			pinItems: null, //置顶区域的items，横线上方部分
			items: null, //普通区域的items
			selected: '', //当前选中的
			tasks: new TasksList(),
			user:{//当前用户
				uid:0,
				nickname:"立即登录",
				avatar:"../../icons/browser.ico",
        fans:0,
        follow:0,
        grade:{
          grade:0
        }
			},
      myGroups: [],
      joinedGroups: [],
      managerGroups: [],
      allMessages: []
		},
		getters: {
      getAllMessages: state => {
        state.allMessages.forEach(v => {
          v.time = tools.formatTime(v.timestamp)
        });
        return state.allMessages
      },
      getMyGroups: state => {
        return state.myGroups
      },
      getAllCircle: state => {
        let allCircle = []
        state.managerGroups.forEach(e => {
          allCircle.push(e)
        })
        state.joinedGroups.forEach(e => {
          if(!state.managerGroups.some(v => v.id === e.id)) {
            allCircle.push(e)
          }
        })
        return allCircle
      },
			getAll: state => {
				if (state.pinItems == null) { //还未初始化
					$store.commit('initItems')
				}
				return {
					'pinItems': state.pinItems,
					'items': state.items
				}
			},
			getStringifyableState(sate) {
				return {
					sidebar: store.getters.getAll
				}

			},
			//获取当前选中的id
			getSelected: state => {
				return state.selected
			},
			//获取全部的item，包括置顶和非置顶的部分
			getItems: state => {
				return state.items
			},
			getPinItems: state => {
				return state.pinItems
			},
			//获取单个item的标题，自动处理无分组名的情况，支持语言包
			getItemTitle: (state) => (task) => {
				//如果标签没名字，就给它取个默认名字
				if (typeof(task) == 'undefined') { //如果已经被删除了，容错处理
					return ''
				}
				if (task.name == null || task.name==='') {
					return l('defaultTaskName').replace('%n', state.tasks.getIndex(task.id) + 1)
				} else {
					return task.name
				}
			},
			//获取任务的icon
			updateItemIcon: (state) => (task, item) => {
				if (task.tabs.length == 0) {
					return "../../icons/empty.png"
				}
				let favicon = task.tabs[0].favicon;

				gotIcon = store.getters.getIcon(favicon)
				if (gotIcon !== false) //获取到了图标
				{
					return gotIcon
				}
				if (typeof(item) == 'undefined') {
					return "../../icons/empty.png"
				}
				return item.icon //如果取不到图标，维持原样，防止icon丢失
			},
			//获取图标的方法
			getIcon: (state) => (favicon) => {
				if (typeof favicon == 'undefined') {
					return false
				} else if (typeof favicon == 'undefined') {
					return false
				} else if (favicon == null) {
					return false
				} else {
					return favicon.url
				}
			},
			//从一个任务转化出一个item，用于items列表
			getItemFromTask: (state) => (task, item) => {
				let parsedTitle = store.getters.getItemTitle(task)
				let parsedIcon = store.getters.updateItemIcon(task, item)
				task.tabs.forEach(function(tab) {
					let icon = store.getters.getIcon(tab.favicon)
					tab.icon = icon === false ? "../../icons/tab.png" : icon
					if (!tab.title) {
						tab.title = l('newTabLabel')
					}
				})
				let addItem = {
					title: parsedTitle, //名称，用于显示提示
					name: parsedTitle,
					index: task.index, //索引组
					id: task.id, //任务id
					icon: parsedIcon, //图标
					draggable: true, //是否允许拖拽
					ext: task.id, //额外的信息
					fixed: false,
					type: 'task',
					tabs: task.tabs,
					count: 0
				}
				addItem.count = task.tabs.length
				return addItem
			}

		},
		mutations: {
      //设置全部的消息列表
      SET_ALLMESSAGES: (state, messages) => {
        state.allMessages = messages
      },
      //添加消息
      ADD_MESSAGE: (state, message) => {
        state.allMessages.unshift(message)
      },
      //根据id删除单个消息
      DEL_MESSAGE_BYID: (state, id) => {
        const index = state.allMessages.findIndex(v => v.id === id)
        state.allMessages.splice(index, 1)
      },
      //根据type删除消息
      DEL_MESSAGES_BYTYPE: (state, type) => {
        const result = state.allMessages.filter(v => v.messageType !== type)
        state.allMessages = result
      },
      //删除所有消息
      DEL_ALLMESSAGES: (state) => {
        state.allMessages = []
      },
      //设置我的团队列表
      SET_MYGROUPS: (state, myGroups) => {
        state.myGroups = myGroups
      },
      //同步我加入的圈子
      SET_JOINED_CIRCLE: (state, groups) => {
        state.joinedGroups = groups
      },
      //同步我管理的圈子
      SET_MANAGER_CIRCLE: (state, groups) => {
        state.managerGroups = groups
      },
      set_user_info:(state,data)=>{
        let userInfo=data.data
        if(!!!userInfo || !!!userInfo.grade){
          userInfo={
            fans:0,
            postCount:0,
            grade:{
              grade:0
            },
            follow:0,
            signature:''
          }
        }
        state.user.nickname=userInfo.nickname
        state.user.avatar=userInfo.avatar
        state.user.fans=userInfo.fans
        state.user.postCount=userInfo.post_count
        state.user.grade=userInfo.grade
        state.user.follow=userInfo.follow
        state.user.signature=userInfo.signature
      },
			//设置置顶区域的item
			savePinItems(state, pinItems) {
				//将根据pin和items生成Tasks
				state.pinItems = pinItems
			},
			//设置item
			saveItems(state, items) {
				state.items = items
			},
			setSelected(state, selected) {
				state.selected = selected
			},

			//从任务组读入置顶区域，目前还不支持存档，每次进去会重新填充一次
			initItems: state => {
				state.pinItems = []
				state.items = []
			},
			//将任务填充到item列表当中，系统会自动刷新一次列表。
			//算法主要是遍历两个组，然后将task按顺序填充进去，如果有多的，就在队列尾部插入（应对插入新组的情况），如果有少的，则从队尾删除相应数量（应对删除任务的情况）
			async fillTasksToItems(state, tasksList) {
				//将tasks转化为items
				let replaceIndex = 0
				//遍历置顶的区域，把任务都替换进来
				const totalCount = tasksList.getLength() //任务的总数

				state.pinItems.forEach(function(pinItem, indexPin) {
					if (pinItem.type == "task") {
						if (replaceIndex >= totalCount) {
							state.pinItems.splice(indexPin, 1) //如果已经都填充进去了，则删除掉剩余的任务即可。
						} else {
							state.pinItems[indexPin] = store.getters.getItemFromTask(tasksList
								.byIndex(
									replaceIndex), pinItem)
							replaceIndex++
						}
					}

				});


				//遍历非置顶区域，把任务都替换进来
				state.items.forEach(function(item, index) {

					if (item.type == "task") {
						//如果现存的任务都替换进去了，接下来就不是再替换了，而是删除掉剩余的task，以保持两边同步
						if (replaceIndex >= tasksList.getLength()) {
							state.items.splice(index, 1)
						} else {
							state.items[index] = store.getters.getItemFromTask(tasksList.byIndex(
								replaceIndex), item)
							replaceIndex++
						}

					}

				});
				//如果到最后，还有没替换的，就在队尾插入剩余的任务
				let last = tasksList.getLength() - replaceIndex
				if (last > 0) {
					//如果有剩下的，就往数组最后添加上
					for (let i = 0; i < last; i++) {
						state.items.push(store.getters.getItemFromTask(tasksList.byIndex(replaceIndex)))
						replaceIndex++
					}
				}

				let newPinItems = state.pinItems

				//由于getter无法监控对象和数组的变化，所以这里设空一下，以促使其响应
				state.pinItems = null
				state.pinItems = newPinItems

				let newItems = state.items
				state.items = null
				state.items = newItems

				state.selected = tasksList.selected
				let newTasksList = tasksList
				state.tasks = null
				state.tasks = newTasksList


        //mark插入对tasks的数据统计
        await userStatsModel.setValue('tasks', state.tasks.tasks.length)
        //mark插入对tabs的数据统计
        let tabsNum = 0
        state.tasks.tasks.forEach(v => {
          tabsNum += v.tabs.length
        });
        await userStatsModel.setValue('tabs', tabsNum)

			}

		},
    actions: {
      async getGroups({ commit }) {
        const result = await groupApi.getGroups()
        if(result.code === 1000) {
          commit('SET_MYGROUPS', result.data)
        }
      },
      async getUserInfo({commit},userInfo){
        const result=await userApi.getUserInfo()
        console.log(result)
        if(result.code===1000){
          commit('set_user_info',result.data)
        }
      },
      async getJoinedCircle({commit}, options) {
        const result = await groupApi.getJoinedCircle(options)
        if(result.code === 1000) {
          const data = toString.call(result.data) === '[object Array]' ? [] : result.data.list
          commit('SET_JOINED_CIRCLE', data)
        }
      },
      async getMyCircle({commit}, options) {
        const result = await groupApi.getMyCircle(options)
        if(result.code === 1000) {
          commit('SET_MANAGER_CIRCLE', result.data)
        }
      },
      async getAllMessage({commit}) {
        const result = await messageModel.allList()
        commit('SET_ALLMESSAGES', result)
      },
      async deleteMessageById({commit}, options) {
        await messageModel.deleteById(options)
        commit('DEL_MESSAGE_BYID', options)
      },
      async deleteMessageByType({commit}, options) {
        await messageModel.deleteByType(options)
        commit('DEL_MESSAGES_BYTYPE', options)
      },
      async deleteAllMessages({commit}) {
        await messageModel.clearTable()
        commit('DEL_ALLMESSAGES')
      }

    }
	})

	Vue.use(antd);

	var appVue = new Vue({
		el: '#appVue',
		store: store,
		components: {
			vuedraggable
		},
		data: {
      mod:'auto',
			window: window
		},
		mounted: function() {
			window.$store = store
      getCurrentUser()
		}
	})
	window.appVue=appVue



	require('./theme.js').initialize()
}

ipc.on('sideSetOpen',(event,args)=>{
  console.log('open')
  document.getElementById('clickThroughElement').style.left = '155px'
  appVue.mod='open'
  appVue.$children[0].mod = 'open'
  localStorage.setItem('sideMode','open')
})
ipc.on('sideSetClose',(event,args)=>{
  document.getElementById('clickThroughElement').style.left = '55px'
  console.log('close')
  appVue.mod='close'
  appVue.$children[0].mod = 'close'
  localStorage.setItem('sideMode','close')
})
ipc.on('sideSetAuto',(event,args)=>{
  console.log('auto')
  document.getElementById('clickThroughElement').style.left = '55px'
  appVue.mod='auto'
  appVue.$children[0].mod = 'auto'
  localStorage.setItem('sideMode','auto')
})

ipc.on('storeMessage', async (event, args) => {
  let message = {}
  message.messageType = args.type
  message.timestamp = Date.now()
  message.title = args.title
  message.body = args.body
  await messageModel.add(message)

  this.$store.commit('ADD_MESSAGE', message)
  console.log(this.$store.getters.getAllMessages, '??????')
})

ipc.on('webOsNotice', async(event, args) => {
  const settingStatus = JSON.parse(localStorage.getItem('messageSetting'))
  let index = settingStatus.findIndex(v => v.title === '浏览器')
  let childIndex = settingStatus[index].childs.findIndex(v => v.title === '网页消息')
  if(settingStatus[index].notice && settingStatus[index].childs[childIndex].notice) {
    //如果允许通知，存入dexie和vuex
    let message = {}
    message.messageType = 'webOs'
    message.timestamp = Date.now()
    message.title = args.url
    message.body = `${args.title}【${args.body}】`
    await messageModel.add(message)

    this.$store.commit('ADD_MESSAGE', message)
  } else {
    return
  }
})

ipc.on('isSilent', (event, args) => {
  let index = this.appVue.$children[0].$children.findIndex(v => v.hasOwnProperty('$tag') && v.$tag === 'message-center')
  this.appVue.$children[0].$children[index].isSilent = args
})
