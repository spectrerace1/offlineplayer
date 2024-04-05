import React, { useState, useEffect } from 'react';
import Home from './components/home/home';
import Playlist from './components/playist/playlist';

function App() {
  const [user, setUser] = useState(null);
  const [isLoggin, setIsLoggin] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    window.electron.ipcRenderer.once("update-message-reply", (_2, data) => {
      setUpdateMessage(data);
      if (data.includes('Güncelleme mevcut')) {
        setIsModalOpen(true);
      }
      else if (data.includes('Güncelleme indiriliyor.')) {
        setIsModalOpen(true);
      }
    });
    return () => {
      window.electron.ipcRenderer.removeAllListeners("update-message-reply");
     
    };
  }, [updateMessage]);
  

  const handleUpdate = () => {
    window.electron.ipcRenderer.send('start-update');
    setIsModalOpen(false);
  };
 
  return (
    <>
      {isLoggin ? <Playlist data={user} /> : <Home />}
       {updateMessage==="Güncelleme mevcut." && (
        <div className="modal" style={{ display: isModalOpen ? 'block' : 'none' }}>
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <p>{updateMessage}</p>
            <button onClick={handleUpdate}>Güncellemeyi Başlat</button>
          </div>
        </div>
      )} 
    </>
  );
}

export default App;
