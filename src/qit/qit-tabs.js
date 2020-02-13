var QitTabs = module.exports = {

  _config: require('./qit-config'),

  tabGroup: null,

  init: () => {
    const TabGroup = require('electron-tabs')
    const dragula = require('dragula')

    QitTabs.tabGroup = new TabGroup({
      newTab: {
        title: '',
        icon: 'fa fa-comment-medical',
        src: QitTabs._config.APP_URL,
        visible: true,
        active: true
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
      title: "",
      src: QitTabs._config.APP_URL,
      icon: 'fa fa-comment-medical',
      visible: true,
      active: true
    })
    
  }

}