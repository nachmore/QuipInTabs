// Need to explore moving some of the overlapping keyhooks to https://www.electronjs.org/docs/api/global-shortcut

var QitKeyboardHook = module.exports = {

  init: () => {
    window.addEventListener('keydown', (ev) => {

      if (ev.ctrlKey) {
        switch (ev.key.toUpperCase()) {
          case 'TAB':
            if (ev.shiftKey) {
              QitTabs.activatePreviousTab()
            } else {
              QitTabs.activateNextTab()
            }
            break
          case 'T':
            QitTabs.newTab()
            break
          case 'W':

            const tab = QitTabs.tabGroup.getActiveTab()

            if (tab) {
              tab.close()
            } else {
              // if there is no tab, and we again hit ctrl+w then exit the app
              const {ipcRenderer} = require('electron');
              ipcRenderer.send(require('./qit-ipc-messages').PLEASE_QUIT)
            }

            break
          case 'J':
            QitTabs.sendKeysToActiveTab(['control'], 'j')
            break
          case 'N':
            QitTabs.createNewDocument()
            break
          case '[':
            QitTabs.navigateBack()
            break
          case ']':
            QitTabs.navigateForward()
            break
        }
      } 
    }, true)
  
  },

  hookTab: (tab) => {
    const remote = require('electron').remote
    const webContents = remote.webContents.fromId(tab.webview.getWebContentsId())

    // we want to avoid multiple listeners. Could restructure this with named functions
    // but this has proven more reliable
    webContents.removeAllListeners('before-input-event')

    // Workaround for: https://github.com/electron/electron/issues/14258
    webContents.on('before-input-event', (event, input) => {

      if (input.type !== 'keyDown') {
        return;
      }
  
      // these are the Control+key handlers, ensure they don't fire when Alt is held down as well
      if (input.control && !input.alt) {
        switch (input.key.toUpperCase()) {
          case 'TAB':
            if (input.shift) {
              QitTabs.activatePreviousTab()
            } else {
              QitTabs.activateNextTab()
            }
            break
          case 'T':
            QitTabs.newTab()
            break
          case '=':
            // without this you need to use ctrl+shift+= which isn't great
            // this is likely set from the menu, at some point should look to replace these with menu accelerators?
            incrementZoom(tab, 0.5)
            break
          case 'W':
            tab.close()
            break
          case 'N':
            QitTabs.createNewDocument()
            break
          case '[':
            QitTabs.navigateBack()
            break
          case ']':
            QitTabs.navigateForward()
            break
        }
      }
    }, true)
  }

}

// private functions

const QitTabs = require('./qit-tabs')

function incrementZoom(tab, amount) {
  let level = tab.webview.getZoomLevel() + amount

  // box level into -9 and 9 (minmax zoom levels)
  level = Math.max(Math.min(level, 9), -9)

  tab.webview.setZoomLevel(level)
}

