var QitKeyboardHook = module.exports = {

  init: () => {
    window.addEventListener('keydown', (ev) => {

      if (ev.ctrlKey) {
        switch (ev.key.toUpperCase()) {
          case 'T':
            newTab()
            break
          case 'W':
            closeActiveTab()
            break
        }
      } 
    }, true)
  
  },

  hookTab: (tab) => {
    let webview = tab.webview
    let remote = require('electron').remote

    // Workaround for: https://github.com/electron/electron/issues/14258
    remote.webContents.fromId(webview.getWebContentsId()).on('before-input-event', (event, input) => {

      if (input.type !== 'keyDown') {
        return;
      }
  
      if (input.control) {
        switch (input.key.toUpperCase()) {
          case 'T':
            newTab()
            break
          case '=':
            // without this you need to use ctrl+shift+= which isn't great
            // this is likely set from the menu, at some point should look to replace these with menu accelerators?
            incrementZoom(tab, 0.5)
            break
          case 'W':
            tab.close()
            break
        }
      }
    }, true)
  }

}

// private functions

const QitTabs = require('./qit-tabs')

function closeActiveTab() {
  QitTabs.tabGroup.getActiveTab().close()
}

function newTab() {
  QitTabs.newTab()
}

function incrementZoom(tab, amount) {
  let level = tab.webview.getZoomLevel() + amount

  // box level into -9 and 9 (minmax zoom levels)
  level = Math.max(Math.min(level, 9), -9)

  tab.webview.setZoomLevel(level)
}

