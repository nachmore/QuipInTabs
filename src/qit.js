// Main app functionality. 
// Loaded in preload as renderer is restricted

window.addEventListener('DOMContentLoaded', () => {

  let qitTabs = require('./qit/qit-tabs')
  qitTabs.init()

  let qitKeyHooks = require('./qit/qit-keyhooks')
  qitKeyHooks.init()
})
