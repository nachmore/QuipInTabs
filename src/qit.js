// Main app functionality. 
// Loaded in preload as renderer is restricted

window.addEventListener('DOMContentLoaded', () => {
  initTabs();
})

const APP_URL = getAppUrl()

function getAppUrl() {

  try {
    const {APP_URL} = require('./qit.userconf.js')

    return APP_URL
  } catch (err) {
    var msg = `Could not load userconf!

Rename qit.userconf -> qit.userconf.js and fill in the values.
If you've done this already then please check for syntax errors.

Error: ${err}`

    console.log(msg)
    alert(msg)
  }
}

function initTabs() {

  const TabGroup = require('electron-tabs')

  let tabGroup = new TabGroup({
    newTab: {
      title: '',
      icon: 'fa fa-comment-medical',
      src: APP_URL,
      visible: true,
      active: true
    },    
    closeButtonText: '❌',
    newTabButtonText: '➕'
  })

  let initialTab = tabGroup.addTab({
    title: "",
    src: APP_URL,
    icon: 'fa fa-comment-medical',
    visible: true,
    active: true
  })
  
}