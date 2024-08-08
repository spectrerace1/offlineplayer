const { app, shell, BrowserWindow, ipcMain, dialog } = require('electron');
const { join } = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');

const path = require('path');
const Store = require('electron-store');
const axios = require('axios');
const { autoUpdater } = require("electron-updater");
const store = new Store();
const AutoLaunch = require('auto-launch');
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

app.commandLine.appendSwitch('NSApplicationSupportsSecureRestorableState'); // NSApplicationDelegate protokolünü etkinleştirin

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 960,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../src/renderer/src/assets/icon.ico'),
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
  app.setLoginItemSettings({
    openAtLogin:true
  })
  autoUpdater.checkForUpdates();

  // Güncelleme olaylarını dinleme


  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-message-reply', 'Güncelleme mevcut.');
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-message-reply', 'Güncelleme mevcut değil.');
  });
  autoUpdater.on("download-progress", () => {
    mainWindow.webContents.send('update-message-reply', 'Güncelleme indiriliyor.');
  });


  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-message-reply', 'Güncelleme indirildi. Uygulama yeniden başlatılıyor...');
   
  
      autoUpdater.quitAndInstall();
   
  });

  autoUpdater.on('error', (error) => {
    mainWindow.webContents.send('update-message-reply', `Güncelleme sırasında bir hata oluştu: ${error.message}`);
  });

  ipcMain.on("start-update", () => {
    autoUpdater.downloadUpdate();
  });


});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.on("login-info", (event, data) => {
  if (data) {
    store.set("userinfo", data)
  }
});

ipcMain.on("log-out", (event, data) => {
  if (data === "log-out") {
    store.clear("userinfo")
  }
});

ipcMain.on("get-user", async (event) => {
  const user = store.get("userinfo");
  if (user) {
   
  // const genres = await getAllMoodsAndGenre()
    const allPlaylists = await getAllSongsInPlaylists(user);
    event.reply("get-user-reply", { allPlaylists, user });
  }
});



async function getAllSongsInPlaylists(user) {
  try {
    const response = await axios.get(`https://app.cloudmedia.com.tr/api/playlista/${String(user?.user?.id)}`);
    if (response.data) {
     
      const playlists = response.data.Playlist;
      const allPlaylists = [];

      for (const playlist of playlists) {
        const playlistResponse = await axios.get(`https://app.cloudmedia.com.tr/api/getsong/${playlist.id}`);
        if (playlistResponse.data) {
          const songs = [playlistResponse.data];
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

async function getAllMoodsAndGenre() {
  const allow_genres = [
      {
          "id": 2,
          "name": "Pop",
          "discover": 1,
          "permalink_url": "https://app.cloudmedia.com.tr/discover/genre/pop"
      },
      {
          "id": 3,
          "name": "Lofi",
          "discover": 1,
          "permalink_url": "https://app.cloudmedia.com.tr/discover/genre/lofi"
      },
      // Diğer türler burada
  ];

  const genreApi = "https://app.cloudmedia.com.tr/api/genre/";

  const downloadedSongsByGenre = {}; // Her tür için şarkıları gruplamak için boş bir nesne

  try {
      for (const allow_genre of allow_genres) {
          const genreResponse = await axios.get(`${genreApi}${allow_genre.name.replace(/\s+/g, '-').toLowerCase()}`);
          if (genreResponse.data) {
              const genre = genreResponse.data.genre;
              if (genre && genre.songs && genre.songs.data) {
                  const songsData = genre.songs.data;
                  // İlgili türün altındaki şarkıları downloadedSongsByGenre nesnesine ekleyelim
                  if (!downloadedSongsByGenre[genre.name]) {
                      downloadedSongsByGenre[genre.name] = [];
                  }
                  downloadedSongsByGenre[genre.name].push(...songsData);
              }
          }
      }
  } catch (error) {
      console.error("Error occurred:", error);
      return [];
  }

  // Her türün altındaki şarkıları gruplamış nesneyi döndürelim
  return downloadedSongsByGenre;
}



