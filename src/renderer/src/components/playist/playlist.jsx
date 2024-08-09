import { useEffect, useState } from "react";
import "./playlist.css";
import Player from "../player/player";
import axios from "axios";
import _ from "lodash";
import logout from "./Log_Out.png";

function Playlist(props) {
    const [selectedPlaylist, setSelectedPlaylist] = useState([]);
    const [click, setClick] = useState(0);
    const [searchTerm, setSearchTerm] = useState(""); // Arama terimini tutmak için state
    const [filteredPlaylists, setFilteredPlaylists] = useState([]); // Filtrelenmiş playlistler için state
    const user = props?.data?.user?.user;
    const [showLogout, setShowLogOut] = useState(false);

    useEffect(() => {
        // Arama terimi değiştikçe playlistleri filtrele
        const results = props?.data?.allPlaylists?.filter(playlist =>
            playlist?.playlistName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPlaylists(results);
    }, [searchTerm, props?.data?.allPlaylists]);

    const handlePlaylistClick = (playlist) => {
        setSelectedPlaylist(playlist);
        setClick(prevClick => prevClick + 1);
    };

    const logOut = () => {
        setShowLogOut(true);
    };

    const logOut2 = () => {
        window.electron.ipcRenderer.send("log-out", "log-out");
        window.location.reload();
    };

    return (
        <>
            <div style={{ width: window.innerWidth, marginBottom: "150px" }}>
                <div className="frame">
                    <div className="div-wrapper">
                        <div className="text-wrapper">{user?.name}</div>
                    </div>
                    <div className="div">
                        <input
                            className="r-n-kategori-veya"
                            placeholder="Ara"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // Arama terimi değiştiğinde state güncelle
                        />
                    </div>
                    <div className="logout">
                        <img
                            style={{ cursor: "pointer" }}
                            alt="Interface log out"
                            src={logout}
                            onClick={() => logOut()}
                        />
                    </div>
                </div>

                <div className="playlist-container">
                    {(searchTerm ? filteredPlaylists : props?.data?.allPlaylists)?.map(res => (
                        <div
                            className="playlist"
                            key={res?.playlistName}
                            style={{ cursor: "pointer" }}
                            onClick={() => handlePlaylistClick(res)}
                        >
                            <img src={res.playlistImage} alt={res.playlistName} />
                            <span>{res.playlistName}</span>
                        </div>
                    ))}
                   {/*  {searchTerm && filteredPlaylists.length === 0 && (
                        <div className="no-results" style={{ padding: "10px" }}>Sonuç bulunamadı</div>
                    )} */}
                </div>
            </div>

            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999 }}>
                <Player data={{ selectedPlaylist, user, click }} />
            </div>

            {showLogout === true && (
                <div className="modal2" style={{ display: 'block' }}>
                    <div className="modal-content2">
                        <p>Çıkış yapmak istiyor musun?</p>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                            <button className='btn-mes1' onClick={() => logOut2()}>Evet</button>
                            <button className='btn-mes1' onClick={() => setShowLogOut(false)}>Hayır</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Playlist;
