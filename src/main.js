// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, ipcMain, shell } = require('electron')
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
    console.log(`secondary instance launched... argv: ${argv}`)

    if (mainWindow) {
      if (mainWindow.isMinimized())
        mainWindow.restore()
      mainWindow.focus()

      mainWindow.webContents.send(require('./qit/qit-ipc-messages').SECOND_INSTANCE, argv)
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

  const { preload } = require('./qit/qit-config');
  await preload(mainWindow);

  // depending on when the main window is closed, it can sometimes leave behind zombie
  // renderers. Force closure when the window is closed...
  mainWindow.on('closed', () => {
    app.quit()
  })

  const remote = require('@electron/remote/main');

  remote.initialize();
  remote.enable(mainWindow.webContents);

  mainWindow.webContents.on('did-attach-webview', (e, webContents) => {

    webContents.on('new-window', (e, url) => {
      console.log("in second new-window")
    })

    webContents.on('context-menu', (event, params) => {

      const menu = new Menu()

      if (params.linkURL) {
        const url = new URL(params.linkURL)

        // if the url doesn't include "quip" then it is likely an external URL,
        // open it in the system browser
        if (!url.host.includes('quip')) {
          menu.append(new MenuItem({
            label: '↗️ Open link',
            click: () => shell.openExternal(url.href)
          }))

          menu.append(new MenuItem({
            type: 'separator'
          }))
        }
      }

      // Add each spelling suggestion
      for (const suggestion of params.dictionarySuggestions) {
        menu.append(new MenuItem({
          label: suggestion,
          click: () => mainWindow.webContents.replaceMisspelling(suggestion)
        }))
      }

      // Allow users to add the misspelled word to the dictionary
      if (params.misspelledWord) {
        menu.append(
          new MenuItem({
            label: '➕ Add to dictionary',
            click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
          })
        )

        menu.append(new MenuItem({
          type: 'separator'
        }))
      }

      menu.append(new MenuItem({
        role: 'cut'
      }));

      menu.append(new MenuItem({
        role: 'copy'
      }));

      menu.append(new MenuItem({
        role: 'paste'
      }));

      menu.append(new MenuItem({
        role: 'selectAll'
      }));

      if (params.misspelledWord) {
        menu.append(new MenuItem({
          type: 'separator'
        }))
      }

      menu.append(new MenuItem({
        role: 'toggleSpellChecker'
      }));

      menu.popup()
    })


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
