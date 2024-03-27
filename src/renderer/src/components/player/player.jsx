import React, { useState, useEffect } from 'react';
import { PiPauseCircleLight } from "react-icons/pi";
import { PiPlayCircleLight } from "react-icons/pi";
import _ from "lodash"
import './player.css';
import axios from 'axios';

const AudioPlayer = (props) => {
  const [audioIndex, setAudioIndex] = useState(0); // Şu an çalınan şarkının indeksi
  const [playing, setPlaying] = useState(false); // Çalma durumu
  const [campainPlaying, setCampainPlaying] = useState(false);
  const [campainClone, setCampainClone] = useState(props.data.groupedCampaigns.type0)
  const [showModal, setShowModal] = useState(false);

  async function ezanDurumuKontrol() {

    return new Promise(function (resolve, reject) {
      fetch("https://app.cloudmedia.com.tr/api/isezan/" + props?.data?.props?.data.user.id)
        .then(response => {
          if (!response.ok) {
            throw new Error("HTTP error, status = " + response.status);
          }
          return response.json();
        })
        .then(data => {

          EzanVaktiApi(data)

        })
        .catch(error => {
          console.error("Fetch Hatası:", error);
          reject(error);
        });
    });

  }


  function EzanVaktiApi(city) {
    let socket; // Soket değişkenini dışarıda tanımlıyoruz.
   
    // WebSocket bağlantısını kurma işlemini fonksiyon içine alıyoruz.
    function connectWebSocket() {
      // city.city değeri varsa sokete bağlan
      if (city.city != "" && city.city && city.ezan === "True") {

        // WebSocket'e bağlan
        socket = new WebSocket("wss://ezansocket-v6fk.onrender.com");

        // WebSocket bağlantısı açıldığında
        socket.onopen = function (event) {
          console.log("WebSocket bağlantısı açıldı.");
          console.log(city.city);
          socket.send(city.city); // Şehir bilgisini mesaj olarak gönder
        };

        // WebSocket üzerinden mesaj alındığında
        socket.onmessage = function (event) {
          console.log("WebSocket'ten mesaj alındı:", JSON.parse(event.data)["ezan"]);

          if (JSON.parse(event.data)["ezan"]["genelEzanDurumu"] === "Ezan Okunuyor" && city.ezan === "True") {
            ezanPlaying(JSON.parse(event.data)["ezan"]["dif"]);
           
          }
        };

        // WebSocket bağlantısı kapandığında
        socket.onclose = function (event) {
          console.log("WebSocket bağlantısı kapatıldı.");

          // 2 saniye sonra tekrar bağlanmak için setTimeout kullanıyoruz.
          setTimeout(connectWebSocket, 2000);
        };

        // WebSocket bağlantısında hata olduğunda
        socket.onerror = function (error) {
          console.error("WebSocket hatası:", error);
        };
      } else {
        console.log("Şehir bilgisi bulunamadı. WebSocket bağlantısı kurulamadı.");
      }
    }

    // Bağlantıyı başlatıyoruz.
    connectWebSocket();
  }
  function ezanPlaying(dif) {



    setShowModal(true);
    pauseAudio()
    if (dif === 10) {
      setTimeout(() => {
        setShowModal(false)
        playAudio()
      }, 60*1000)
    }

  }


  useEffect(() => {


    const intervalId = setInterval(() => {

      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const currentSecond = new Date().getSeconds();
      const today = new Date();
      const options = { weekday: 'short' };
      const day = today.toLocaleDateString('eu-US', options);

      const matchedCampaign = campainClone.find(campaign => {
        const [campaignHour, campaignMinute] = campaign.CompanyValue.split(':');
        return parseInt(campaignHour) === currentHour && parseInt(campaignMinute) === currentMinute && campaign[day] === 1;
      });

      if (matchedCampaign !== undefined) {

        campainAudioPlay(matchedCampaign.path);
        _.remove(campainClone, matchedCampaign);
        setCampainClone(campainClone);


      }


    }, 6000); // Her dakika kontrol etmek için

    return () => clearInterval(intervalId);




  }, [audioIndex, props.data.groupedCampaigns]);


  const campainAudioPlay = (audioUrl) => {
    if (audioUrl) { // Check if audioUrl exists
      setCampainPlaying(true);
      const audioElement = document.getElementById('audio-player');
      const audioElement1 = document.getElementById('audio-player1');
      audioElement1.src = audioUrl;
      audioElement.pause()

      audioElement1.play();
      audioElement1.addEventListener('ended', campainAudioPause)
    }
  };
  const campainAudioPause = () => {
    // Check if audioUrl exists
    setCampainPlaying(false);
    const audioElement = document.getElementById('audio-player');
    audioElement.play();


  };
  useEffect(() => {
    const audioElement = document.getElementById('audio-player');
    if (playing) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
  }, [playing]);

  // Şarkı dizisi veya audioIndex değiştiğinde yeni şarkıyı yükle
  useEffect(() => {
    if (props?.data.savedPlaylists.length > 0) {
      const audioUrl = props?.data.savedPlaylists[audioIndex]?.playlink;
      if (audioUrl) {
        const audioElement = document.getElementById('audio-player');
        audioElement.src = audioUrl;
        audioElement.load();
      }
    }
  }, [props?.data?.savedPlaylists]);

  // Bir sonraki şarkıya geç
  const playNext = () => {

    if (audioIndex < props?.data.savedPlaylists.length - 1) {

      setAudioIndex(prevIndex => prevIndex + 1);
    } else {
      setAudioIndex(0); // Eğer son şarkıysa başa dön
    }
  };

  // Bir önceki şarkıya geç
  const playPrevious = () => {
    if (audioIndex > 0) {
      setAudioIndex(prevIndex => prevIndex - 1);
    }
  };

  const playAudio = () => {
    setPlaying(true);
  };

  const pauseAudio = () => {
    setPlaying(false);
  };

  useEffect(() => {
    const audioElement = document.getElementById('audio-player');
    audioElement.addEventListener('ended', playNext);

    return () => {
      audioElement.removeEventListener('ended', playNext);
    };
  }, [audioIndex, props.data.savedPlaylists]);

  useEffect(() => {
    console.log(props.data.savedPlaylists)
    setAudioIndex(0)
    if (props?.data?.savedPlaylists?.length > 0) {
      playAudio()
    }


  }, [props.data.savedPlaylists]);
  useEffect(() => {
    ezanDurumuKontrol()
  }, [])

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} className="audio-player">
        <div className="audio-controls">
          {playing ? (
            <button onClick={pauseAudio}><PiPauseCircleLight style={{ width: "100px", height: "100px" }} fill='black' /></button>
          ) : (
            <button onClick={playAudio}><PiPlayCircleLight style={{ width: "100px", height: "100px" }} fill='black' /></button>
          )}
        </div>
        <div className='song-info'>
          <img src={props?.data?.savedPlaylists[audioIndex]?.artwork_url} alt="" srcset="" />
          <div className='text-container'>
            <span style={{ fontSize: "22px" }}>{props?.data?.savedPlaylists.playlistName}</span>
            <span>{props?.data?.savedPlaylists[audioIndex]?.title}</span>
          </div>
        </div>
      </div>
      <div>
        <audio id="audio-player" src={props?.data?.savedPlaylists[audioIndex]?.playlink}  autoPlay={playing} />
        <audio id="audio-player1" autoPlay={campainPlaying} />
      </div>

      <div className="modal-container">
       
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              
              <p>Ezan vakti. Müzik durduruldu.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AudioPlayer;
