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

  // Checks for a quip URL in the provided arguments and opens a tab for each
  // otherwise opens a default new tab
  newTabsFromArgv: (argv) => {

    let opened = false

    for (let arg of argv) {
      let url = getQuipUrl(arg)

      if (url) {
        QitTabs.newTab(url)
        opened = true
      }

    }

    // if we couldn't find anything to open a tab with then just open a default tab
    if (!opened)
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

function getStartUrl() {

  let url = null

  // check if we were invoked as a protocol handler (or with a URL as an arg)
  let argv = require('electron').remote.process.argv

  for (let arg of argv) {

    url = getQuipUrl(arg)

    if (url)
      break
  }

  return url ?? QitTabs._config.APP_URL
}

// returns a Quip url from a string
// quip:// protocol gets converted into a useable browser url
// https?://[something with quip in it]/ gets reused as is
function getQuipUrl(arg) {

  if (arg.startsWith('quip://')) {
    let quipDocId = arg.replace('quip://', '').replace('/', '')

    return `${QitTabs._config.APP_URL}/${quipDocId}?skip_desktop_app_redirect=1`

  } else if (arg.match(/^https?:\/\/.*?quip.*?\//)) {
    return arg
  } 

  return null
}

function setTabTitle(tab) {

  // strip " - Quip" and the '([update_count])' from the page title for cleaner tab titles
  // update count is highlighted within the Quip UI, so useless in the tab header

  let title = tab.webview.getTitle().replace(' - Quip', '').replace(/\(\d+\)/, "")
  tab.setTitle(title)
}
