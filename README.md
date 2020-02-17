# QuipInTabs
Quip on Windows doesn't support tabs. That's nuts. Use this to stick Quip into a tab.

### Packaging Instructions

```
src> node node_modules\electron-packager\bin\electron-packager.js . qit --platform=win32 --arch=x64 --icon=img\qit.ico --overwrite
```

(`--overwrite` as needed)

### Development Setup

If you want to touch the protocol handler, or just debug in a more authentic space I recommend packaging the app (see above) and then in an `Administrator` cmd window:

```
src> cd qit-win32-x64\resources
src\qit-win32-x64\resources> move app app_orig 
src\qit-win32-x64\resources> mklink /d app [path-to-repo]\src
symbolic link created for app <<===>> [path-to-repo]\src
```

You can now run `qit.exe` from `src\qit-win32-x64` but have the source pulled from your repo for development.


