// Main app functionality. 
// Loaded in preload as renderer is restricted

window.addEventListener('DOMContentLoaded', () => {

  let qitConfig = require('./qit/qit-config')
  qitConfig.APP_URL

  let qitTabs = require('./qit/qit-tabs')
  qitTabs.init();
})
