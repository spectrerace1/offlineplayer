
import { useState,useEffect } from 'react';
import Home from './components/home/home'
import Playlist from './components/playist/playlist'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [user, setUser] = useState(null);
  const [isLoggin,setİsLoggin]=useState(false)
  const [profil,setProfil]=useState()

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
    
      // Temizlik işlemi
      return () => {
        window.electron.ipcRenderer.removeAllListeners('get-user-reply');
      };
    }, []);
    useEffect(() => {
      if (user) {
        setİsLoggin(true);
      }
    }, [user]);
  
  return (
    <>
    
   {isLoggin?<Playlist data={user}/>:<Home />}
   
    </>
  )
}

export default App

