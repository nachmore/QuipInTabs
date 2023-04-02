// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron')
const path = require('path')

async function createWindow() {

  app.allowRendererProcessReuse = true
  app.setAppUserModelId(process.execPath)

  app.setAsDefaultProtocolClient("quip")
  
  console.log(process.argv)
  var mainWindow = null

  const gotLock = app.requestSingleInstanceLock()

  if (!gotLock) {
    app.quit()
    return
  }

  app.on('second-instance', (event, argv, cwd) => {
    console.log("secondary instance launched...")

    if (mainWindow) {
      if (mainWindow.isMinimized())
        mainWindow.restore()
      mainWindow.focus()

      mainWindow.webContents.send(require('./qit/qit-ipc-messages').SECOND_INSTANCE, argv)
    }

  })

  // Open links targtting "new window" in an external browser. This works well as Quip
  // automatically targets non-Quip URLs to _blank (new window) while QUIP links work
  // inline.
  // c/o https://stackoverflow.com/a/48945477
  app.on('web-contents-created', (e, contents) => {

    // Check for a webview
    if (contents.getType() == 'webview') {

      // Listen for any new window events
      contents.on('new-window', (e, url) => {
        e.preventDefault()
        shell.openExternal(url)
      })
    }
  })

  ipcMain.on(require('./qit/qit-ipc-messages').PLEASE_QUIT, (event, args) => {
    app.quit()
  })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "./img/icon.png",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      nodeIntegrationInWorker: true,
      spellcheck: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });

  const {preload} = require('./qit/qit-config');
  await preload(mainWindow);

  app.webContents = {};

  // depending on when the main window is closed, it can sometimes leave behind zombie
  // renderers. Force closure when the window is closed...
  mainWindow.on('closed', () => {
    app.quit()
  })

  const remote = require('@electron/remote/main');

  remote.initialize();
  remote.enable(mainWindow.webContents);

  mainWindow.webContents.on('did-attach-webview', (e, webContents) => {
    console.log(`Attached webContents: ${webContents.id}`)
    app.webContents[webContents.id] = webContents;
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  
  
  // disable ctrl+w. Yes, could update whole menu, but that's a task for another day :)
  Menu.getApplicationMenu().items[3].submenu.items[2].enabled = false

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
