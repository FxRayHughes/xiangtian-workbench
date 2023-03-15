import { passwordManager, passwordManagers } from './passwordManager'
import { searchEnginePage, searchEngine } from './searchEngine.js'

import theme from './theme.js'
import { defaultKeyMap, userKeyMap } from './keyMap'

const settingPage = {
  callSetDefaultBrowser () {
    postMessage({ message: 'callSetOrRemoveDefaultBrowser' })
  },
  init () {
    window.localeInit()
    document.title = l('settingsPreferencesHeading')
    let settings = window.settings
    settings.load()
    var contentTypeBlockingContainer = document.getElementById('content-type-blocking')
    var banner = document.getElementById('restart-required-banner')
    var siteThemeCheckbox = document.getElementById('checkbox-site-theme')
    var showDividerCheckbox = document.getElementById('checkbox-show-divider')
    var userscriptsCheckbox = document.getElementById('checkbox-userscripts')
    var separateTitlebarCheckbox = document.getElementById('checkbox-separate-titlebar')
    var openTabsInForegroundCheckbox = document.getElementById('checkbox-open-tabs-in-foreground')
    var autoPlayCheckbox = document.getElementById('checkbox-enable-autoplay')
    var userAgentCheckbox = document.getElementById('checkbox-user-agent')
    var userAgentInput = document.getElementById('input-user-agent')


    function showRestartRequiredBanner () {
      banner.hidden = false
      settings.set('restartNow', true)
    }

    /* content blocking settings */

    var trackingLevelContainer = document.getElementById('tracking-level-container')
    var trackingLevelOptions = Array.from(trackingLevelContainer.querySelectorAll('input[name=blockingLevel]'))
    var blockingExceptionsContainer = document.getElementById('content-blocking-information')
    var blockingExceptionsInput = document.getElementById('content-blocking-exceptions')
    var blockedRequestCount = document.querySelector('#content-blocking-blocked-requests strong')

    /* 起始页 */

    var browserTabContainer = document.querySelector('.tab-choose')
    var browserTabOptions = Array.from(document.querySelectorAll('input[name=tabChoosed]'))
    var browserTabExceptionsInput = document.querySelector('#tab-text-input')
    passwordManager.init()
    settings.get('restartNow', (value) => {
      if (value === true) {
        showRestartRequiredBanner()
      }
    })

    function changeBrowserTab (tabIdx) {
      settings.get('browserTab', (value) => {
        if (!value) {
          value = {}
        }
        value.tabIdx = tabIdx
        settings.set('browserTab', value)
        updateBrowserTabUI(tabIdx)     //updateUI
      })
    }

    function updateBrowserTabUI (tabIdx) {
      var radio = browserTabOptions[tabIdx]
      radio.checked = true

      if (tabIdx === 4) {
        browserTabExceptionsInput.hidden = false
      } else {
        browserTabExceptionsInput.hidden = true
      }

      if (document.querySelector('#tab-choose .setting-option.selected')) {
        document.querySelector('#tab-choose .setting-option.selected').classList.remove('selected')
      }
      radio.parentNode.classList.add('selected')
    }

    settings.get('browserTab', (value) => {
      if (value && value.tabIdx !== undefined) {
        updateBrowserTabUI(value.tabIdx)
      }
    })

    settings.get('customTabUrl', (value) => {
      if (value) {
        document.querySelector('#tab-text-input').value = value      //update UI
      }
    })

    browserTabExceptionsInput.addEventListener('input', (event) => {
      settings.set('customTabUrl', event.target.value)
    })

    browserTabOptions.forEach((item, idx) => {
      item.addEventListener('change', () => {
        changeBrowserTab(idx)
      })
    })

    /* 起始页 */
    settings.listen('filteringBlockedCount', function (value) {
      var valueStr
      var count = value || 0
      if (count > 50000) {
        valueStr = new Intl.NumberFormat(navigator.locale, {
          notation: 'compact',
          maximumSignificantDigits: 4
        }).format(count)
      } else {
        valueStr = new Intl.NumberFormat().format(count)
      }
      blockedRequestCount.textContent = valueStr
    })

    function updateBlockingLevelUI (level) {
      var radio = trackingLevelOptions[level]
      radio.checked = true
      if (level === 0) {
        blockingExceptionsContainer.hidden = true
      } else {
        blockingExceptionsContainer.hidden = false
        radio.parentNode.appendChild(blockingExceptionsContainer)
      }

      if (document.querySelector('#tracking-level-container .setting-option.selected')) {
        document.querySelector('#tracking-level-container .setting-option.selected').classList.remove('selected')
      }
      radio.parentNode.classList.add('selected')
    }

    function changeBlockingLevelSetting (level) {
      settings.get('filtering', function (value) {
        if (!value) {
          value = {}
        }
        value.blockingLevel = level
        settings.set('filtering', value)
        updateBlockingLevelUI(level)
      })
    }

    function setExceptionInputSize () {
      blockingExceptionsInput.style.height = (blockingExceptionsInput.scrollHeight + 2) + 'px'
    }

    settings.get('filtering', function (value) {
      // migrate from old settings (<v1.9.0)
      if (value && typeof value.trackers === 'boolean') {
        if (value.trackers === true) {
          value.blockingLevel = 2
        } else if (value.trackers === false) {
          value.blockingLevel = 0
        }
        delete value.trackers
        settings.set('filtering', value)
      }

      if (value && value.blockingLevel !== undefined) {
        updateBlockingLevelUI(value.blockingLevel)
      } else {
        updateBlockingLevelUI(0)
      }

      if (value && value.exceptionDomains && value.exceptionDomains.length > 0) {
        blockingExceptionsInput.value = value.exceptionDomains.join(', ') + ', '
        setExceptionInputSize()
      }
    })

    trackingLevelOptions.forEach(function (item, idx) {
      item.addEventListener('change', function () {
        changeBlockingLevelSetting(idx)
      })
    })

    blockingExceptionsInput.addEventListener('input', function () {
      setExceptionInputSize()

      // remove protocols because of https://github.com/minbrowser/min/issues/1428
      var newValue = this.value.split(',').map(i => i.trim().replace('http://', '').replace('https://', '')).filter(i => !!i)

      settings.get('filtering', function (value) {
        if (!value) {
          value = {}
        }
        value.exceptionDomains = newValue
        settings.set('filtering', value)
      })
    })

    /* content type settings */

    var contentTypes = {
      // humanReadableName: contentType
      scripts: 'script',
      images: 'image'
    }
// used for showing localized strings
    var contentTypeSettingNames = {
      scripts: 'settingsBlockScriptsToggle',
      images: 'settingsBlockImagesToggle'
    }

    for (var contentType in contentTypes) {
      (function (contentType) {
        settings.get('filtering', function (value) {
          // create the settings section for blocking each content type

          var section = document.createElement('div')
          section.classList.add('setting-section')

          var id = 'checkbox-block-' + contentTypes[contentType]

          var checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          checkbox.id = id

          if (value && value.contentTypes) {
            checkbox.checked = value.contentTypes.indexOf(contentTypes[contentType]) != -1
          }

          var label = document.createElement('label')
          label.setAttribute('for', id)
          label.textContent = l(contentTypeSettingNames[contentType])

          section.appendChild(checkbox)
          section.appendChild(label)
          contentTypeBlockingContainer.appendChild(section)

          checkbox.addEventListener('change', function (e) {
            settings.get('filtering', function (value) {
              if (!value) {
                value = {}
              }
              if (!value.contentTypes) {
                value.contentTypes = []
              }

              if (e.target.checked) { // card the item to the array
                value.contentTypes.push(contentTypes[contentType])
              } else { // remove the item from the array
                var idx = value.contentTypes.indexOf(contentTypes[contentType])
                value.contentTypes.splice(idx, 1)
              }

              settings.set('filtering', value)
            })
          })
        })
      })(contentType)
    }
    /* dark mode setting */
    var darkModeNever = document.getElementById('dark-mode-never')
    var darkModeNight = document.getElementById('dark-mode-night')
    var darkModeAlways = document.getElementById('dark-mode-always')
    var darkModeSystem = document.getElementById('dark-mode-system')

// -1 - off ; 0 - auto ; 1 - on
    settings.get('darkMode', function (value) {
      //调整到默认关闭
      darkModeNever.checked = (value === -1 || value === undefined || value === false)
      darkModeNight.checked = (value === 0)
      darkModeAlways.checked = (value === 1 || value === true)
      darkModeSystem.checked = (value === 2)
    })

    darkModeNever.addEventListener('change', function (e) {
      if (this.checked) {
        settings.set('darkMode', -1)
      }
    })
    darkModeNight.addEventListener('change', function (e) {
      if (this.checked) {
        settings.set('darkMode', 0)
      }
    })
    darkModeAlways.addEventListener('change', function (e) {
      if (this.checked) {
        settings.set('darkMode', 1)
      }
    })
    darkModeSystem.addEventListener('change', function (e) {
      if (this.checked) {
        settings.set('darkMode', 2)
      }
    })

    /* site theme setting */

    settings.get('siteTheme', function (value) {
      if (value === true || value === undefined) {
        siteThemeCheckbox.checked = true
      } else {
        siteThemeCheckbox.checked = false
      }
    })

    siteThemeCheckbox.addEventListener('change', function (e) {
      settings.set('siteTheme', this.checked)
    })

    /* userscripts setting */

    settings.get('userscriptsEnabled', function (value) {
      if (value === true) {
        userscriptsCheckbox.checked = true
      }
    })

    userscriptsCheckbox.addEventListener('change', function (e) {
      settings.set('userscriptsEnabled', this.checked)
    })

    /* show divider between tabs setting */

    settings.get('showDividerBetweenTabs', function (value) {
      if (value === true) {
        showDividerCheckbox.checked = true
      }
    })

    showDividerCheckbox.addEventListener('change', function (e) {
      settings.set('showDividerBetweenTabs', this.checked)
    })

    /* separate titlebar setting */

    settings.get('useSeparateTitlebar', function (value) {
      if (value === true) {
        separateTitlebarCheckbox.checked = true
      }
    })

    separateTitlebarCheckbox.addEventListener('change', function (e) {
      settings.set('useSeparateTitlebar', this.checked)
      showRestartRequiredBanner()
    })

    /* tabs in foreground setting */

    settings.get('openTabsInForeground', function (value) {
      if (value === true) {
        openTabsInForegroundCheckbox.checked = true
      }
    })

    openTabsInForegroundCheckbox.addEventListener('change', function (e) {
      settings.set('openTabsInForeground', this.checked)
    })

    /* media autoplay setting */

    settings.get('enableAutoplay', function (value) {

      autoPlayCheckbox.checked = value === undefined ? true : value
    })

    autoPlayCheckbox.addEventListener('change', function (e) {
      settings.set('enableAutoplay', this.checked)
    })

    /* user agent settting */

    settings.get('customUserAgent', function (value) {
      if (value) {
        userAgentCheckbox.checked = true
        userAgentInput.style.visibility = 'visible'
        userAgentInput.value = value
      }
    })

    userAgentCheckbox.addEventListener('change', function (e) {
      if (this.checked) {
        userAgentInput.style.visibility = 'visible'
      } else {
        settings.set('customUserAgent', null)
        userAgentInput.style.visibility = 'hidden'
        showRestartRequiredBanner()
      }
    })

    userAgentInput.addEventListener('input', function (e) {
      if (this.value) {
        settings.set('customUserAgent', this.value)
      } else {
        settings.set('customUserAgent', null)
      }
      showRestartRequiredBanner()
    })

    /* update notifications setting */

// var updateNotificationsCheckbox = document.getElementById('checkbox-update-notifications')
//
// settings.get('updateNotificationsEnabled', function (value) {
//   if (value === false) {
//     updateNotificationsCheckbox.checked = false
//   } else {
//     updateNotificationsCheckbox.checked = true
//   }
// })
//
// updateNotificationsCheckbox.addEventListener('change', function (e) {
//   settings.set('updateNotificationsEnabled', this.checked)
// })

    /* usage statistics setting */

    var usageStatisticsCheckbox = document.getElementById('checkbox-usage-statistics')

    settings.get('collectUsageStats', function (value) {
      if (value === false) {
        usageStatisticsCheckbox.checked = false
      } else {
        usageStatisticsCheckbox.checked = true
      }
    })

    usageStatisticsCheckbox.addEventListener('change', function (e) {
      settings.set('collectUsageStats', this.checked)
    })

    /* default search engine setting */

    var searchEngineDropdown = document.getElementById('default-search-engine')
    var searchEngineInput = document.getElementById('custom-search-engine')
    searchEnginePage.init()
    searchEngineInput.setAttribute('placeholder', l('customSearchEngineDescription'))
    let currentSearchEngine = window.currentSearchEngine
    settings.onLoad(function () {
      if (currentSearchEngine.custom) {
        searchEngineInput.hidden = false
        searchEngineInput.value = currentSearchEngine.searchURL
      }
      for (var searchEngine in searchEngines) {
        var item = document.createElement('option')
        item.value=searchEngines[searchEngine].name
        item.setAttribute('id','searchEngine_'+searchEngines[searchEngine].name)
        let displayName= searchEngines[searchEngine].alias!==searchEngines[searchEngine].name?"（"+searchEngines[searchEngine].name+"）":''
        item.textContent = searchEngines[searchEngine].alias +displayName

        if (searchEngines[searchEngine].name === currentSearchEngine.name) {

          item.setAttribute('selected', 'true')
        }

        searchEngineDropdown.appendChild(item)
      }

      // card custom option
      item = document.createElement('option')
      item.textContent = '自定义'
      item.setAttribute('id','searchEngine_custom')
      item.value='custom'
      if (currentSearchEngine.custom) {
        item.setAttribute('selected', 'true')
      }
      searchEngineDropdown.appendChild(item)
    })

    searchEngineDropdown.addEventListener('change', function (e) {
      if (this.value === 'custom') {
        searchEngineInput.hidden = false
      } else {
        searchEngineInput.hidden = true
        settings.set('searchEngine', { name: this.value })
      }
    })

    searchEngineInput.addEventListener('input', function (e) {
      settings.set('searchEngine', { url: this.value })
    })

    /* 默认浏览器设置 */
//每秒钟循环询问主进程，我是不是默认浏览器，先发消息到渲染preload.js渲染进程
    setInterval(function () {
      postMessage({ message: 'getIsDefaultBrowser' })
    }, 1000)

//先发消息到渲染preload.js渲染进程，因为页面本身无法直接发送ipc消息

    /*默认浏览器结束*/

//
// var myVar = setInterval(function(){
//       postMessage({message:'valueCount',count:valueStr})
//       if(valueStr>'3,430'){
//         clearInterval(myVar)
//       }
// },1000)

    /* key map settings */

    settings.get('keyMap', function (keyMapSettings) {
      var keyMap = userKeyMap(keyMapSettings)

      var keyMapList = document.getElementById('key-map-list')

      Object.keys(keyMap).forEach(function (action) {
        var li = createKeyMapListItem(action, keyMap)
        keyMapList.appendChild(li)
      })
    })

    function formatCamelCase (text) {
      var result = text.replace(/([A-Z])/g, ' $1')
      return result.charAt(0).toUpperCase() + result.slice(1)
    }

    function createKeyMapListItem (action, keyMap) {
      var li = document.createElement('li')
      var label = document.createElement('label')
      var input = document.createElement('input')
      label.innerText = l(action)
      label.htmlFor = action

      input.type = 'text'
      input.id = input.name = action
      input.value = formatKeyValue(keyMap[action])
      input.addEventListener('input', onKeyMapChange)

      li.appendChild(label)
      li.appendChild(input)

      return li
    }

    function formatKeyValue (value) {
      // multiple shortcuts should be separated by commas
      if (value instanceof Array) {
        value = value.join(', ')
      }
      // use either command or ctrl depending on the platform
      if (navigator.platform === 'MacIntel') {
        value = value.replace(/\bmod\b/g, 'command')
      } else {
        value = value.replace(/\bmod\b/g, 'ctrl')
        value = value.replace(/\boption\b/g, 'alt')
      }
      return value
    }

    function parseKeyInput (input) {
      // input may be a single mapping or multiple mappings comma separated.
      var parsed = input.toLowerCase().split(',')
      parsed = parsed.map(function (e) { return e.trim() })
      // Remove empty
      parsed = parsed.filter(Boolean)
      // convert key names back to generic equivalents
      parsed = parsed.map(function (e) {
        if (navigator.platform === 'MacIntel') {
          e = e.replace(/\b(command)|(cmd)\b/g, 'mod')
        } else {
          e = e.replace(/\b(control)|(ctrl)\b/g, 'mod')
          e = e.replace(/\balt\b/g, 'option')
        }
        return e
      })
      return parsed.length > 1 ? parsed : parsed[0]
    }

    function onKeyMapChange (e) {
      var action = this.name
      var newValue = this.value

      settings.get('keyMap', function (keyMapSettings) {
        if (!keyMapSettings) {
          keyMapSettings = {}
        }

        keyMapSettings[action] = parseKeyInput(newValue)
        settings.set('keyMap', keyMapSettings)
        showRestartRequiredBanner()
      })
    }


    // settings.listen('passwordManager', function (value) {
    //   keychainViewLink.hidden = !(currentPasswordManager.name === 'Built-in password manager')
    // })

    /* proxy settings */

    const proxyTypeInput = document.getElementById('selected-proxy-type')
    const proxyInputs = Array.from(document.querySelectorAll('#proxy-settings-container input'))

    const toggleProxyOptions = proxyType => {
      document.getElementById('manual-proxy-section').hidden = proxyType != 1
      document.getElementById('pac-option').hidden = proxyType != 2
    }

    const setProxy = (key, value) => {
      settings.get('proxy', (proxy = {}) => {
        proxy[key] = value
        settings.set('proxy', proxy)
      })
    }

    settings.get('proxy', (proxy = {}) => {
      toggleProxyOptions(proxy.type)
      proxyTypeInput.options.selectedIndex = proxy.type || 3
      proxyInputs.forEach(item => item.value = proxy[item.name] || '')
    })

    proxyTypeInput.addEventListener('change', e => {
      const proxyType = e.target.options.selectedIndex
      setProxy('type', proxyType)
      toggleProxyOptions(proxyType)
    })

    proxyInputs.forEach(item => item.addEventListener('change', e => setProxy(e.target.name, e.target.value)))

    settings.get('customBangs', (value) => {
      const bangslist = document.getElementById('custom-bangs')

      if (value) {
        value.forEach(function (bang) {
          bangslist.appendChild(createBang(bang.phrase, bang.snippet, bang.redirect))
        })
      }
    })
    const dolEle = document.getElementById('dropOpenLink')
    settings.get('dropOpenLink', (value) => {
      if (value === 'true') {
        dolEle.checked = true
      } else {
        dolEle.checked = false
      }
    })
    dolEle.addEventListener('change', e => {
      settings.set('dropOpenLink', e.target.checked === true ? 'true' : 'false')
    })
    const dccEle = document.getElementById('dbClickClose')
    settings.get('dbClickClose', (value) => {
      if (value === 'true') {
        dccEle.checked = true
      } else {
        dccEle.checked = false
      }
    })
    dccEle.addEventListener('change', e => {
      settings.set('dbClickClose', e.target.checked === true ? 'true' : 'false')
    })

    document.getElementById('add-custom-bang').addEventListener('click', function () {
      const bangslist = document.getElementById('custom-bangs')
      bangslist.appendChild(createBang())
    })

    function createBang (bang, snippet, redirect) {
      var li = document.createElement('li')
      var bangInput = document.createElement('input')
      var snippetInput = document.createElement('input')
      var redirectInput = document.createElement('input')
      var xButton = document.createElement('button')
      var current = { phrase: bang ?? '', snippet: snippet ?? '', redirect: redirect ?? '' }

      function update (key, input) {
        settings.get('customBangs', function (d) {
          const filtered = d ? d.filter((bang) => bang.phrase !== current.phrase && (key !== 'phrase' || bang.phrase !== input.value)) : []
          filtered.push({ phrase: bangInput.value, snippet: snippetInput.value, redirect: redirectInput.value })
          settings.set('customBangs', filtered)
          current[key] = input.value
        })
      }

      bangInput.type = 'text'
      snippetInput.type = 'text'
      redirectInput.type = 'text'
      bangInput.value = bang ?? ''
      snippetInput.value = snippet ?? ''
      redirectInput.value = redirect ?? ''
      xButton.className = 'i carbon:close custom-bang-delete-button'

      bangInput.placeholder = l('settingsCustomBangsPhrase')
      snippetInput.placeholder = l('settingsCustomBangsSnippet')
      redirectInput.placeholder = l('settingsCustomBangsRedirect')
      xButton.addEventListener('click', function () {
        li.remove()
        settings.get('customBangs', (d) => {
          settings.set('customBangs', d.filter((bang) => bang.phrase !== bangInput.value))
        })
        showRestartRequiredBanner()
      })

      bangInput.addEventListener('change', function () {
        if (this.value.startsWith('!')) {
          this.value = this.value.slice(1)
        }
        update('phrase', bangInput)
        showRestartRequiredBanner()
      })
      snippetInput.addEventListener('change', function () {
        update('snippet', snippetInput)
        showRestartRequiredBanner()
      })
      redirectInput.addEventListener('change', function () {
        update('redirect', redirectInput)
        showRestartRequiredBanner()
      })

      li.appendChild(bangInput)
      li.appendChild(snippetInput)
      li.appendChild(redirectInput)
      li.appendChild(xButton)

      return li
    }

    theme.init()
    this.watchGesture()
  },
  /**
   * 监听手势
   */
  watchGesture(){
    this.watchCheckBox('gestureBack','true')
    this.watchCheckBox('gestureZoom','true')
  },
  /**
   * watch一个配置项，id为配置项的名称，页面元素需和配置项同名
   * @param id
   * @param defaultValue
   */
  watchCheckBox(id,defaultValue='true'){
    const ele = document.getElementById(id)
    settings.get(id, (value) => {
      if(value===undefined){
        value=defaultValue
      }
      if (value === 'true') {
        ele.checked = true
      } else {
        ele.checked = false
      }
    })
    ele.addEventListener('change', e => {
      settings.set(id, e.target.checked === true ? 'true' : 'false')
    })
  }

}
export default settingPage
