
import { useEffect, useState, } from "react";
import "./playlist.css"
import Player from "../player/player"
import Countdown from "react-countdown";
import axios from "axios";
import _ from "lodash";
function Playlist(props) {

    
    const [selectedPlaylist, setSelectedPlaylist] = useState([]);
    const [savedPlaylists, setSavedPlaylists] = useState([]);
    const [campainArray, setCampaignArray] = useState([]);
    const [newArray, setNewArray] = useState([]); // Şarkı dizisi
    const handlePlaylistClick = (playlist) => {
        setSelectedPlaylist(playlist);
        // Burada seçilen playlisti savedPlaylists array'ine ekleyebilirsiniz.
        
    };
console.log(selectedPlaylist)
    var tarih = new Date(props.data.user.expires_at);
   
    var zamanDamgasi = tarih.getTime();
    if (Date.now() + (Number(zamanDamgasi) - Date.now()) === 0) {
        logOut()
    }
    function logOut() {
        window.electron.ipcRenderer.send("log-out", "log-out");
        window.location.reload()
    }
    const [groupedCampaigns, setGroupedCampaigns] = useState({
        type0: [],
        type1: [],
        type2: []
    });

    async function getCampaigns() {
        const camApi = "https://app.cloudmedia.com.tr/api/comapi/";
        const userId = props?.data?.user?.id
        await axios.get(`${camApi}${userId}`).then(res => {

            const campaigns = res.data;

            const newGroupedCampaigns = {
                type0: [],
                type1: [],
                type2: []
            };

           if(campaigns&&campaigns.data!==null){
            campaigns?.forEach(campaign => {
                newGroupedCampaigns['type' + campaign.CompanyType].push(campaign);
            });
           } 

            setGroupedCampaigns(newGroupedCampaigns);

        }).catch(error => {
            console.error('Error fetching campaigns:', error);
        });
    }

    function shufflePlaylist() {
        let shuffledArray = []; // Yeni bir dizi oluştur
        if (Object.values(selectedPlaylist).length > 0 && selectedPlaylist.songs[0].song) {

            const songs = selectedPlaylist?.songs[0]?.song;

            songs.forEach(song => {
                shuffledArray.push({ // Yeni diziye karıştırılmış şarkıları ekle
                    title: song.title || "",
                    genre: song.genre || "",
                    mood: song.mood || "",
                    duration: song.duration || 0,
                    artwork_url: song.artwork_url || "",
                    playlink: song.playlink || ""
                });
            });

            shuffledArray = _.shuffle(shuffledArray); // Tüm şarkıları karıştır
            setNewArray(shuffledArray); // Karıştırılmış diziyi ayarla
        }
    }
    function convertCampaignsToSongs(campaigns) {
        const songs = [];
        campaigns.sort((a, b) => a.CompanyValue - b.CompanyValue);
        campaigns.forEach(campaign => {
            const companyValue = campaign.CompanyValue;
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const currentDay = days[new Date().getDay()];

            if (campaign[currentDay] === 1) {
                const newSong = {
                    title: campaign.CompanyName || "",
                    genre: "", // Belirtilmemiş
                    mood: "", // Belirtilmemiş
                    duration: 0, // Belirtilmemiş
                    artwork_url: "", // Belirtilmemiş
                    playlink: campaign.path || "",
                    companyValue: campaign.CompanyValue
                };
                songs.push(newSong)
            }
        });

        setCampaignArray(songs);

    }

    function campainJoinToPlaylist() {
        if (newArray.length > 0 && campainArray.length > 0) {
            let joinSongArray = []
            let joinCampainArray = _.clone(campainArray);
            let counter = 1;

            // campainArray'deki her bir kampanyayı işleyelim
            _.each(newArray, (song, songIndex) => {

                const campaing = _.find(joinCampainArray, { 'companyValue': counter });


                if (campaing) {

                    joinSongArray.push(song);
                    joinSongArray.push(campaing)

                    counter = 0;
                    _.remove(joinCampainArray, campaing);
                    if (joinCampainArray.length === 0) {
                        joinCampainArray = _.clone(campainArray);
                    }

                }
                else {
                    joinSongArray.push(song)
                }
                counter++
            });

         return  joinSongArray

        }
    }



    useEffect(() => {
        getCampaigns();
        const interval = setInterval(() => {
            getCampaigns();
        },1000*60*5); // 60000 milisaniye = 1 dakika

        // useEffect kancası sona erdiğinde interval'i temizle
        return () => clearInterval(interval);
    }, [campainArray]);

    useEffect(() => {
        shufflePlaylist()
        convertCampaignsToSongs(groupedCampaigns.type2)
    }, [selectedPlaylist]);

    useEffect(() => {

        if(campainArray?.length>0){
    
            setSavedPlaylists(campainJoinToPlaylist()) 

        }
        else{
            setSavedPlaylists(newArray);
        }
    }, [newArray, campainArray])

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
                    {props?.data?.res?.map(res => (
                        <div className="playlist" key={res?.playlistName} style={{ cursor: "pointer" }} onClick={() => handlePlaylistClick(res)}>
                            <img src={res.playlistImage} alt={res.playlistName} />
                            <h3 >{res.playlistName}</h3>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999 }}>
                  <Player data={{savedPlaylists,props,groupedCampaigns}}/> 
            </div>
        </>
    );


}

export default Playlist