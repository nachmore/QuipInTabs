var QitTabs = module.exports = {

  _config: require('./qit-config'),

  tabGroup: null,

  init: () => {
    const TabGroup = require('electron-tabs')
    const dragula = require('dragula')

    QitTabs.tabGroup = new TabGroup({
      newTab: {
        title: '',
        src: QitTabs._config.APP_URL,
        visible: true,
        active: true,
        ready: QitTabs.onTabReady
      },    
      closeButtonText: '❌',
      newTabButtonText: '➕',
      ready: function (tabGroup) {
        dragula([tabGroup.tabContainer], {
          direction: "horizontal"
        });
      }      
    })
  
    QitTabs.newTab(getStartUrl())
  },

  newTab: (url) => {

    let newTab = QitTabs.tabGroup.addTab({
      title: '',
      src: url ?? QitTabs._config.APP_URL,
      visible: true,
      active: true,
      ready: QitTabs.onTabReady
    })

    return newTab

  },

  onTabReady: (tab) => {

    tab.webview.addEventListener('did-stop-loading', () => {

      // workaround for cursor disappearing
      // https://github.com/electron/electron/issues/14474
      tab.webview.blur()
      tab.webview.focus()

      setTabTitle(tab)

      let QitKeyHooks = require('./qit-keyhooks')
      QitKeyHooks.hookTab(tab)
    });
  }
}

// "private" functions

function getStartUrl() {

  let url = null

  // check if we were invoked as a protocol handler (or with a URL as an arg)
  let argv = require('electron').remote.process.argv

  for (let arg of argv) {

    if (arg.startsWith('quip://')) {
      let quipDocId = arg.replace('quip://', '').replace('/', '')

      url = `https://quip-amazon.com/${quipDocId}?skip_desktop_app_redirect=1`
    }
  }

  return url ?? QitTabs._config.APP_URL
}

function setTabTitle(tab) {

  // strip " - Quip" and the '([update_count])' from the page title for cleaner tab titles
  // update count is highlighted within the Quip UI, so useless in the tab header

  let title = tab.webview.getTitle().replace(' - Quip', '').replace(/\(\d+\)/, "")
  tab.setTitle(title)
}
