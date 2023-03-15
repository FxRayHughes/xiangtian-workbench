var searchbar = require('searchbar/searchbar.js')
var webviews = require('webviews.js')
var modalMode = require('modalMode.js')
var urlParser = require('util/urlParser.js')
var keyboardNavigationHelper = require('util/keyboardNavigationHelper.js')
var bookmarkStar = require('navbar/bookmarkStar.js')
var contentBlockingToggle = require('navbar/contentBlockingToggle.js')
var toolbar = require('toolbar/toolbar.js')
const tabEditor = {
  container: document.getElementById('tab-editor'),
  input: document.getElementById('tab-editor-input'),
  addButton: document.getElementById('card-btn-wrapper'),
  tabsEl: document.getElementById('tabs'),
  star: null,

  updateUrl: function (url) {
    tabEditor.input.value = url
  },
  show: function (tabId, editingValue, showSearchbar) {
    /* Edit mode is not available in modal mode. */
    if (modalMode.enabled()) {
      return
    }

    var currentURL = urlParser.getSourceURL(tabs.get(tabId).url)
    if (currentURL === 'ts://newtab') {
      currentURL = ''
    }
    if (!toolbar.expanded) {
      tabEditor.container.hidden = false
    }

    bookmarkStar.update(tabId, tabEditor.star)
    contentBlockingToggle.update(tabId, tabEditor.contentBlockingToggle)

    webviews.requestPlaceholder('editMode')
    if (!toolbar.expanded) {
      document.body.classList.add('is-edit-mode')
    }
    tabEditor.updateUrl(editingValue || currentURL)
    if (!toolbar.expanded) {
      tabEditor.addButton.hidden = true
      tabEditor.input.focus()
      tabEditor.tabsEl.classList.add('fixWidth')
    }
    if (!editingValue) {
      setTimeout(() => {
        tabEditor.input.select()
      }, 200)
    }
    // https://github.com/minbrowser/min/discussions/1506
    tabEditor.input.scrollLeft = 0

    searchbar.show(tabEditor.input)

    if (showSearchbar !== false) {
      if (editingValue) {
        searchbar.showResults(editingValue, null)
      } else {
        searchbar.showResults('', null)
      }
    }

    /* animation */
    if (tabs.count() > 1) {
      requestAnimationFrame(function () {
        var item = document.querySelector(`.tab-item[data-tab="${tabId}"]`)
        var originCoordinates = item.getBoundingClientRect()

        var finalCoordinates = document.querySelector('#tabs').getBoundingClientRect()

        var translateX = Math.min(Math.round(originCoordinates.x - finalCoordinates.x) * 0.45, window.innerWidth)

        tabEditor.container.style.opacity = 0
        tabEditor.container.style.transform = `translateX(${translateX}px)`
        requestAnimationFrame(function () {
          tabEditor.container.style.transition = '0.135s all'
          tabEditor.container.style.opacity = 1
          tabEditor.container.style.transform = ''
        })
      })
    }
  },
  hide: function () {
    if (!toolbar.expanded) {
      tabEditor.container.hidden = true
      tabEditor.addButton.hidden = false
      tabEditor.tabsEl.classList.remove('fixWidth')
    }
    tabEditor.container.removeAttribute('style')

    tabEditor.input.blur()
    searchbar.hide()
    if (!toolbar.expanded) {
      document.body.classList.remove('is-edit-mode')
    }
    webviews.hidePlaceholder('editMode')
  },
  updateTool (tabId) {
    bookmarkStar.update(tabId, tabEditor.star)
    contentBlockingToggle.update(tabId, tabEditor.contentBlockingToggle)
  },
  initialize: function () {
    tabEditor.input.setAttribute('placeholder', l('searchbarPlaceholder'))

    tabEditor.star = bookmarkStar.create()
    tabEditor.container.appendChild(tabEditor.star)

    tabEditor.contentBlockingToggle = contentBlockingToggle.create()
    tabEditor.container.appendChild(tabEditor.contentBlockingToggle)

    keyboardNavigationHelper.addToGroup('searchbar', tabEditor.container)

    // keypress doesn't fire on delete key - use keyup instead
    tabEditor.input.addEventListener('keyup', function (e) {
      if (e.keyCode === 8) {
        searchbar.showResults(this.value, e)
      }
    })

    tabEditor.input.addEventListener('keypress', function (e) {
      if (e.keyCode === 13) { // return key pressed; update the url
        if (this.getAttribute('data-autocomplete') && this.getAttribute('data-autocomplete').toLowerCase() === this.value.toLowerCase()) {
          // special case: if the typed input is capitalized differently from the actual URL that was autocompleted (but is otherwise the same), then we want to open the actual URL instead of what was typed.
          // see https://github.com/minbrowser/min/issues/314#issuecomment-276678613
          searchbar.openURL(this.getAttribute('data-autocomplete'), e)
        } else {
          searchbar.openURL(this.value, e)
        }
      } else if (e.keyCode === 9) {
        return
        // tab key, do nothing - in keydown listener
      } else if (e.keyCode === 16) {
        return
        // shift key, do nothing
      } else if (e.keyCode === 8) {
        return
        // delete key is handled in keyUp
      } else { // show the searchbar
        searchbar.showResults(this.value, e)
      }

      // on keydown, if the autocomplete result doesn't change, we move the selection instead of regenerating it to avoid race conditions with typing. Adapted from https://github.com/patrickburke/jquery.inlineComplete

      var v = e.key
      var sel = this.value.substring(this.selectionStart, this.selectionEnd).indexOf(v)

      if (v && sel === 0) {
        this.selectionStart += 1
        e.preventDefault()
      }
    })
    tabEditor.input.addEventListener('compositionend', function (e) {
      searchbar.showResults(this.value, e)
    })
    document.getElementById('webviews').addEventListener('click', function () {
      tabEditor.hide()
    })
  }
}
const tipEl = document.getElementById('clipboardTip')
tipEl.addEventListener('click', () => {
  var newTab = tabs.add({
    url: tipEl.getAttribute('title')
  })
  require('../browserUI').addTab(newTab, {
    enterEditMode: false
  })
  tipEl.hidden = true
})
let tick = 0
let timerShowClipTip = null
ipc.on('showClipboard', (event, args) => {
  tipEl.setAttribute('title', args.url)
  tipEl.hidden = false
  if (tick > 0) {
    tick = 10
    return
  }
  tick = 10
  timerShowClipTip = setInterval(() => {
    tick--
    if (tick <= 0) {
      tipEl.hidden = true
      clearInterval(timerShowClipTip)
      timerShowClipTip = null
    }
  }, 1000)
})
tabEditor.initialize()

module.exports = tabEditor
