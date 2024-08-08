
import { useEffect, useState, } from "react";
import "./playlist.css"
import Player from "../player/player"
import Countdown from "react-countdown";
import axios from "axios";
import _ from "lodash";
import logout from "./Log_Out.png"
function Playlist(props) {


    const [selectedPlaylist, setSelectedPlaylist] = useState([]);
    const [click, setClick] = useState(0)
    const user = props?.data?.user?.user
    const [showLogout,setShowLogOut]=useState(false) 
    const handlePlaylistClick = (playlist) => {
        setSelectedPlaylist(playlist);
        setClick(prevClick => prevClick + 1);
        // Burada seçilen playlisti savedPlaylists array'ine ekleyebilirsiniz.

    };

    var tarih = new Date(props.data.user.expires_at);

    var zamanDamgasi = tarih.getTime();
    if (Date.now() + (Number(zamanDamgasi) - Date.now()) === 0) {
        logOut()
    }
    function logOut() {
        setShowLogOut(true)
      
    }

function logOut2(){
      window.electron.ipcRenderer.send("log-out", "log-out");
        window.location.reload() 
}









    return (
        <>
            <div style={{ width: window.innerWidth, marginBottom: "150px" }} className="">
                <div className="frame">
                    <div className="div-wrapper">
                        <div className="text-wrapper">{user?.name}</div>
                    </div>
                  
                  {/*   <div className="div">
                        <input className="r-n-kategori-veya" placeholder="Ara"/>
                        <Magnifer className="outline-search" /> 
                    </div> */}
                      
                      <div className="logout">
                      <img style={{cursor:"pointer"}}  alt="Interface log out" src={logout}  onClick={()=>logOut()}/>
                      </div>
                </div>
                <div class="playlist-container">
                    {props?.data?.allPlaylists?.map(res => (
                        <div className="playlist" key={res?.playlistName} style={{ cursor: "pointer" }} onClick={() => handlePlaylistClick(res)}>
                            <img src={res.playlistImage} alt={res.playlistName} />
                            <span >{res.playlistName}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999 }}>
                <Player data={{ selectedPlaylist, user, click }} />
            </div>
            {showLogout === true && (
        <div className="modal2" style={{ display:  'block'  }}>
          <div className="modal-content2">
           
            <p>Çıkış yapmak istiyor musun?</p>
            <div style={{ display: "flex", flexDirection: "row",alignItems:"center",justifyContent:"center",gap:"20px" }}>
            <button className='btn-mes1' onClick={()=>logOut2()} >Evet</button>
            <button className='btn-mes1' onClick={() => setShowLogOut(false)} >Hayır</button>
            </div>
          </div>
        </div>
      )}
        </>
    );


}

export default Playlist