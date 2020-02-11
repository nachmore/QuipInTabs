// Main app functionality. 
// Loaded in preload as renderer is restricted

window.addEventListener('DOMContentLoaded', () => {
  initTabs();
})


function initTabs() {

  const TabGroup = require('electron-tabs')

  let tabGroup = new TabGroup();
  
}