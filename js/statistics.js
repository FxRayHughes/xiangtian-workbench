const settings = require('util/settings/settings.js')
const axios = require('./util/axios')
const { db } = require('./util/database');

const statistics = {
  envGetters: [],
  registerGetter: function (key, fn) {
    statistics.envGetters.push({ key, fn })
  },
  usageDataCache: {},
  getValue: function (key) {
    return statistics.usageDataCache[key]
  },
  setValue: function (key, value) {
    statistics.usageDataCache[key] = value
  },
  incrementValue: function (key, value) {
    if (statistics.usageDataCache[key]) {
      statistics.usageDataCache[key]++
    } else {
      statistics.usageDataCache[key] = 1
    }
  },
  async upload () {
    if (settings.get('collectUsageStats') === false) {
      return
    }

    var usageData = Object.assign({}, statistics.usageDataCache || {})

    // avoid uploading more than a week's worth of old data, in the case that uploads fail indefinitely
    if (usageData.created && (Date.now() - usageData.created) > (7 * 24 * 60 * 60 * 1000)) {
      usageData = {}
      statistics.usageDataCache = {
        created: Date.now()
      }
    }

    statistics.envGetters.forEach(function (getter) {
      try {
        usageData[getter.key] = getter.fn()
      } catch (e) {
        console.warn(e)
      }
    })

    const result = await db.system.where('name').equals('currentUser').first()

    const options = {
      client_id: settings.get('clientID'),
      install_time: `${Date.now()}`,
      os: process.platform,
      lang: navigator.language,
      app_version: window.globalArgs['app-version'],
      app_name: window.globalArgs['app-name'],
      is_dev: 'development-mode' in window.globalArgs,
      usage_data: result.value.uid != 0 ? Object.assign(usageData, result.value) : usageData
    }
    axios.post('/app/open/usageStats/add', options).then(res => {
      statistics.usageDataCache = {
        created: Date.now()
      }
      settings.set('usageData', null)
    }).catch(e => {
      console.warn('failed to send usage statistics', e)
    })
  },
  initialize: function () {
    setTimeout(statistics.upload, 10000)
    setInterval(statistics.upload, 24 * 60 * 60 * 1000)

    statistics.usageDataCache = settings.get('usageData') || ({
      created: Date.now()
    })

    setInterval(function () {
      if (settings.get('collectUsageStats') === false) {
        settings.set('usageData', null)
      } else {
        settings.set('usageData', statistics.usageDataCache)
      }
    }, 60000)

    settings.listen('collectUsageStats', function (value) {
      if (value === false) {
        // disabling stats collection should reset client ID
        settings.set('clientID', undefined)
      } else if (!settings.get('clientID')) {
        settings.set('clientID', Math.random().toString().slice(2))
      }
    })

    if (!settings.get('installTime')) {
      // round install time to nearest hour to reduce uniqueness
      const roundingFactor = 60 * 60 * 1000
      settings.set('installTime', Math.floor(Date.now() / roundingFactor) * roundingFactor)
    }

    statistics.registerGetter('contentTypeFilters', function () {
      return (settings.get('filtering') || {}).contentTypes
    })
  }
}

module.exports = statistics
