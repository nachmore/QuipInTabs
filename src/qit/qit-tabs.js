
var QitTabs = module.exports = {

  _config: require('./qit-config'),

  tabGroup: null,

  init: () => {
    const tabGroups = require('electron-tabs');
    QitTabs.tabGroup = document.querySelector("tab-group");

    QitTabs.tabGroup.setDefaultTab({
      title: '',
      src: QitTabs._config.APP_URL,
      visible: true,
      active: true,
      ready: QitTabs.onTabReady
    });

    QitTabs.hookNavigation()
    QitTabs.newTab(getStartUrl())
  },

  hookNavigation: () => {

    document.getElementById('etabs-tab-button-back').addEventListener("click", () => {
      QitTabs.navigateBack()
    })

    document.getElementById('etabs-tab-button-forward').addEventListener("click", () => {
      QitTabs.navigateForward()
    })

  },

  // Checks for a quip URL in the provided arguments and opens a tab for each
  // otherwise opens a default new tab
  // If a tab with the same URL alrady exists, then it is focused instead of creating
  // a new tab
  newTabsFromArgv: (argv) => {

    let opened = false

    for (const arg of argv) {
      const url = getQuipUrl(arg)

      if (url) {

        let foundExisting = false

        for (const tab of QitTabs.tabGroup.tabs) {

          if (tab.webviewAttributes.src === url) {
            foundExisting = true
            tab.activate()

            // special case scenario: When you don't have access to the page, you get a message (where you can
            // request access), and then the rendered page is the Updates page but the URL stays the same.
            // When clicking on the link again, the tab is activated, but also needs to be refreshed to check if access
            // has now been granted.
            if (tab.getTitle() === " Updates") {

              // specifically set the URL again (reload()ing resets the URL to the Updates page)
              tab.webview.src = url
            }

            break
          }

        }

        if (!foundExisting)
          QitTabs.newTab(url)

        opened = true
      }

    }

    // if we couldn't find anything to open a tab with then just open a default tab
    if (!opened)
      QitTabs.newTab()
  },

  newTab: (url) => {

    if (!QitTabs.tabGroup.addTab) {
      console.log("L*(");
      return;
    }

    const newTab = QitTabs.tabGroup.addTab({
      title: '',
      src: url ?? QitTabs._config.APP_URL,
      visible: true,
      active: true,
      ready: QitTabs.onTabReady
    })

    return newTab;
  },

  onTabReady: (tab) => {

    // setting these from the tabGroup as defaults for newTab doesn't work, which means
    // node integration isn't set when coming from the + button. So set them here to
    // capture all tab creation scenarios
    tab.webview.nodeintegration = true

    tab.webview.addEventListener('did-stop-loading', () => {
      // useful for debugging (to get the JS errors from the specific tab)
      //QitTabs.getWebContents(tab).openDevTools()

      console.log('did-stop-loading')
      QitTabs.fixFocus(tab)

      setTabTitle(tab)

      let QitKeyHooks = require('./qit-keyhooks')
      QitKeyHooks.hookTab(tab)
    })
  },

  createNewDocument: () => {

    const activeTab = QitTabs.tabGroup.getActiveTab()

    // don't create a new tab when creating a new document if we're just on the Updates page
    if (activeTab.getTitle() === " Updates") {

      QitTabs.sendKeysToActiveTab(['Ctrl', 'Alt'], 'n')

    } else {
      const tab = QitTabs.newTab()

      //webview doesn't support once()
      const handler = () => {
        QitTabs.sendKeysToActiveTab(['Ctrl', 'Alt'], 'n')
        tab.webview.removeEventListener('did-stop-loading', handler)
      }

      tab.webview.addEventListener('did-stop-loading', handler)
    }

  },

  /**
   * Activates a tab, including working around the disappearing
   * cursor issue (https://github.com/electron/electron/issues/14474)
   */
  activateTab: (tab) => {
    tab.activate()
    QitTabs.fixFocus(tab)
  },

  fixFocus: (tab) => {
    tab.webview.blur()
    tab.webview.focus()
  },

  activatePreviousTab: () => {

    let activeTab = QitTabs.tabGroup.getActiveTab()

    let previousTab = QitTabs.tabGroup.getPreviousTab()

    // getPreviousTab is borked, i.e. it won't return pos 0, so work around it
    if (!previousTab) {
      if (activeTab.id == 1) {
        previousTab = QitTabs.tabGroup.getTabByPosition(0)
      } else if (activeTab.id == 0) {
        previousTab = QitTabs.tabGroup.getTabByPosition(-1)
      }
    }

    QitTabs.activateTab(previousTab)
  },

  activateNextTab: () => {
    let nextTab = QitTabs.tabGroup.getNextTab()

    if (!nextTab) {
      nextTab = QitTabs.tabGroup.getTabByPosition(0)
    }


    QitTabs.activateTab(nextTab)
  },

  navigateBack: () => {
    const tab = QitTabs.tabGroup.getActiveTab()

    if (tab) {
      tab.webview.goBack()
    }
  },

  navigateForward: () => {
    const tab = QitTabs.tabGroup.getActiveTab()

    if (tab) {
      tab.webview.goForward()
    }
  },

  /**
   * @param keyCode can be a char (eg `'j'`) or an actual code (eg `'\u0008'` for backspace)
   * @param modifiers array of [modifiers](https://www.electronjs.org/docs/api/accelerator#available-modifiers) eg `['control']`
   */
  sendKeysToActiveTab: (modifiers, keyCode) => {

    const tab = QitTabs.tabGroup.getActiveTab()
    QitTabs.sendKeysToTab(tab, modifiers, keyCode)
  },

  sendKeysToTab: (tab, modifiers, keyCode) => {
    console.log(`Sending input: ${modifiers}+${keyCode}`)

    const webContents = QitTabs.getWebContents(tab)

    // looks like multiple modifiers doesn't actually work, so need to split them out
    // likely explanation: https://github.com/electron/electron/issues/7089#issuecomment-244631340
    for (const modifier of modifiers) {
      console.log("\tkeyDown: " + modifier)
      webContents.sendInputEvent({ type: 'keyDown', keyCode: modifier })
    }

    console.log(`\t\tKeyDown: ${modifiers}+${keyCode}`)
    webContents.sendInputEvent({ type: 'keyDown', modifiers: modifiers, keyCode: keyCode })
    console.log(`\t\tKeyUp: ${modifiers}+${keyCode}`)
    webContents.sendInputEvent({ type: 'keyUp', modifiers: modifiers, keyCode: keyCode })

    for (const modifier of modifiers) {
      console.log("\tkeyUp: " + modifier)
      webContents.sendInputEvent({ type: 'keyUp', keyCode: modifier })
    }
  },

  getWebContents: (tab) => {
    const remote = require('@electron/remote');
    return remote.webContents.fromId(tab.webview.getWebContentsId())
  }
}

// "private" functions

function getStartUrl() {

  let url = null

  // check if we were invoked as a protocol handler (or with a URL as an arg)
  const argv = require('@electron/remote').process.argv;

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
    const matches = arg.match(/quip:\/\/(.*?)\//)

    if (matches.length < 2) {
      return null
    }

    const quipDocId = matches[1]
    const url = `${QitTabs._config.APP_URL}/${quipDocId}?skip_desktop_app_redirect=1`

    return url

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
