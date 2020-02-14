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
  
    QitTabs.newTab()
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

function setTabTitle(tab) {

  // strip " - Quip" and the '([update_count])' from the page title for cleaner tab titles
  // update count is highlighted within the Quip UI, so useless in the tab header

  let title = tab.webview.getTitle().replace(' - Quip', '').replace(/\(\d+\)/, "")
  tab.setTitle(title)
}
