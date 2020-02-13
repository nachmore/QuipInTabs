var QitConfig = module.exports = {
  
  APP_URL: readAppUrl()
}

function readAppUrl() {

  try {
    const {APP_URL} = require('../qit.userconf.js')

    return APP_URL
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
