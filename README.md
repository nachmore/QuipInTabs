# QuipInTabs
Quip on Windows doesn't support tabs. That's nuts. Use this to stick Quip into a tab.

### Auto-opening Quip Links in Qit on Windows

1. Get a User-Agent switcher for your browser
2. Visit your Quip site
3. Override the UA for your domain and set it to a browser running on a Mac
4. Reload
5. Click on your profile icon -> Appearance -> Open Links in App
6. Close the tab
7. Open a quip link
8. Select `qit` as your handler for Quip links

### Packaging Instructions

```
src> node node_modules\electron-packager\bin\electron-packager.js . qit --platform=win32 --arch=x64 --icon=img\qit.ico --overwrite
```

(`--overwrite` as needed)

### Development Setup

If you want to touch the protocol handler, or just debug in a more authentic space I recommend packaging the app (see above) and then in an `Administrator` cmd window (or with `gsudo` for the last step):

```
src> cd qit-win32-x64\resources
src\qit-win32-x64\resources> move app app_orig
src\qit-win32-x64\resources> mklink /d app [path-to-repo]\src
symbolic link created for app <<===>> [path-to-repo]\src
```

You can now run `qit.exe` from `src\qit-win32-x64` but have the source pulled from your repo for development.

#### Updating Packages

```
src> npm upgrade
```

#### Updating Electron

```
src> npm install electron@latest
```

Good luck 😂
