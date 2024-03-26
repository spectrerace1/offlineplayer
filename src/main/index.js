const { app, shell, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const fs = require('fs');
const https = require('https');
const path = require('path');
const Store = require('electron-store');
const   axios  = require('axios');
const store = new Store();
app.commandLine.appendSwitch('NSApplicationSupportsSecureRestorableState'); // NSApplicationDelegate protokolünü etkinleştirin



function createWindow() {

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {


  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("login-info",(event,data)=>{
  if(data){

    store.set("userinfo",data)
   
  }
})
ipcMain.on("log-out",(event,data)=>{
  console.log(data)
  if(data==="log-out"){

    store.clear("userinfo")
   
  } 
})

ipcMain.on("get-user", (event) => {
  const user = store.get("userinfo");
  if (user) {

    getAllSongsInPlaylists(user).then(res=>{

      if(res){
        event.reply("get-user-reply", {res,user});
      }
    })
    
  }
});

async function getAllSongsInPlaylists(user) {
  try {
    const response = await axios.get(`https://app.cloudmedia.com.tr/api/playlista/${String(user.user.id)}`);
    
    if (response.data) {
      const playlists = response.data.Playlist;
      const allPlaylists = [];

      for (const playlist of playlists) {
       
        const playlistResponse = await axios.get(`https://app.cloudmedia.com.tr/api/getsong/${playlist.id}`);
        
        if (playlistResponse.data) {
          const songs = [playlistResponse.data]; // Şarkıları bir dizi içine yerleştir

          // Download each song and get its local path
          const downloadedSongs = [];
          for (const song of songs) {
            try {
              
              downloadedSongs.push({ ...song });
            } catch (error) {
              console.error("Error occurred while downloading song:", error);
            }
          }

          const playlistWithSongs = {
            playlistId: playlist.id,
            playlistName: playlist.title,
            playlistImage: playlist.artwork_url,
            songs: downloadedSongs
          };
          allPlaylists.push(playlistWithSongs);
        }
      }

      return allPlaylists;
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return [];
  }
}


