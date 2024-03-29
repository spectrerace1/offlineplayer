import React, { useState, useEffect } from 'react';
import Home from './components/home/home'
import Playlist from './components/playist/playlist'

function App() {
  const [user, setUser] = useState(null);
  const [isLoggin, setIsLoggin] = useState(false);
  const [profil, setProfil] = useState();
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      window.electron.ipcRenderer.send('get-user');
      const data = await new Promise(resolve => {
        window.electron.ipcRenderer.once('get-user-reply', (_, data) => {
          resolve(data);
        });
      });
      setUser(data);
    };

    getUser();

    return () => {
      window.electron.ipcRenderer.removeAllListeners('get-user-reply');
    };
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoggin(true);
    }
  }, [user]);

  useEffect(() => {
    window.electron.ipcRenderer.send("updateMessage");
    window.electron.ipcRenderer.once('update-message-reply', (_, data) => {
      console.log(data)
      setUpdateMessage(data);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('update-message-reply');
    };
  }, []);
console.log(updateMessage);
  return (
    <>
      {isLoggin ? <Playlist data={user} /> : <Home />}
      {updateMessage && <p>{updateMessage}</p>}
    </>
  )
}

export default App;
