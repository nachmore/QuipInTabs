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
  
    let initialTab = QitTabs.tabGroup.addTab({
      title: '',
      src: QitTabs._config.APP_URL,
      visible: true,
      active: true,
      ready: QitTabs.onTabReady
    })
    
  },

  onTabReady: (tab) => {

    tab.webview.addEventListener('did-stop-loading', () => {

      // workaround for cursor disappearing
      // https://github.com/electron/electron/issues/14474
      tab.webview.blur()
      tab.webview.focus()

      setTabTitle(tab)
    });
  }
}

// "private" functions

function setTabTitle(tab) {

  // strip the " - Quip" from the page title for cleaner tab titles

  let title = tab.webview.getTitle().replace(' - Quip', '')
  tab.setTitle(title)
}
