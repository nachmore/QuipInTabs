var QitConfig = module.exports = {
  preload: (browserWindow) => {return _preload(browserWindow)}, 
  APP_URL: readAppUrl()
}

function _preload(browserWindow) {
  try {
    const {preload} = require('../qit.userconf.js')

    return preload(browserWindow)
    
  } catch (err) {
    console.log(`QIT: no valid preload found: ${err}`)
  }
}

function readAppUrl() {

  try {
    const {APP_URL} = require('../qit.userconf.js')

    let rv = APP_URL

    if (rv.endsWith('/')) {
      rv = rv.slice(0, -1)
    }

    return rv
  } catch (err) {
    // TODO: don't love having UI functionality this far down

    let msg = `Could not load userconf!

Rename qit.userconf -> qit.userconf.js and fill in the values.
If you've done this already then please check for syntax errors.

Error: ${err}`

    console.log(msg)
    alert(msg)
  }
}
