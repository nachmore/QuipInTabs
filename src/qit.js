// Main app functionality. 
// Loaded in preload as renderer is restricted

window.addEventListener('DOMContentLoaded', () => {

  const qitTabs = require('./qit/qit-tabs')
  qitTabs.init()

  const qitKeyHooks = require('./qit/qit-keyhooks')
  qitKeyHooks.init()

  listenForInstanceLaunch()

})

function listenForInstanceLaunch() {

  const { ipcRenderer } = require('electron')
  const { SECOND_INSTANCE } = require('./qit/qit-ipc-messages')

  ipcRenderer.on(SECOND_INSTANCE, (event, message) => {

    console.log("Renderer process received: second-instance. message: " + message)

    const qitTabs = require('./qit/qit-tabs')
    qitTabs.newTabsFromArgv(message)
  })

}
