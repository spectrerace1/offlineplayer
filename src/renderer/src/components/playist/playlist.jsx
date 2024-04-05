
import { useEffect, useState, } from "react";
import "./playlist.css"
import Player from "../player/player"
import Countdown from "react-countdown";
import axios from "axios";
import _ from "lodash";
function Playlist(props) {

let counter=0;
    const [selectedPlaylist, setSelectedPlaylist] = useState([]);
    const [click,setClick]=useState(0)
const user=props?.data?.user
  
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
        window.electron.ipcRenderer.send("log-out", "log-out");
        window.location.reload()
    }
   
    
    
    



    
console.log(click)


    return (
        <>
            <div style={{ width: window.innerWidth, marginBottom: "150px" }} className="">
                <nav class="navbar">
                    <div class="navbar-content">
                        <div class="navbar-logo">
                            <img src={props?.data.user?.artwork_url} alt="Logo" />
                            <span>{props?.data?.user?.name}</span>
                        </div>
                        {/* <div style={{ display: "flex", flexDirection: "column" }} className="navbar-info">
                            <span>Lisans Bitiş Süresi</span>
                            <span><Countdown date={Date.now() + (Number(zamanDamgasi) - Date.now())} /></span>
                        </div> */}
                        <div class="navbar-links">
                            <a href="#" onClick={() => logOut()}>Çıkış Yap</a>
                        </div>
                    </div>
                </nav>
                <div class="playlist-container">
                    {props?.data?.allPlaylists?.map(res => (
                        <div className="playlist" key={res?.playlistName} style={{ cursor: "pointer" }} onClick={() => handlePlaylistClick(res)}>
                            <img src={res.playlistImage} alt={res.playlistName} />
                            <h3 >{res.playlistName}</h3>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999 }}>
                <Player data={{selectedPlaylist,user}}/>  
            </div>
        </>
    );


}

export default Playlist