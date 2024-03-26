import React, { useState, useEffect } from 'react';
import { PiPauseCircleLight } from "react-icons/pi";
import { PiPlayCircleLight } from "react-icons/pi";
import _ from "lodash"
import './player.css';
import axios from 'axios';

const AudioPlayer = (props) => {
  const [audioIndex, setAudioIndex] = useState(0); // Şu an çalınan şarkının indeksi
  const [playing, setPlaying] = useState(false); // Çalma durumu
  const [campainPlaying, setCampainPlaying]=useState(false);
  const [campainClone,setCampainClone]=useState(props.data.groupedCampaigns.type0)

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
          
        if (matchedCampaign!==undefined) {
         
          campainAudioPlay(matchedCampaign.path);
          _.remove(campainClone,matchedCampaign);
          setCampainClone(campainClone);
        

        }
       
   
    }, 6000); // Her dakika kontrol etmek için

    return  () => clearInterval(intervalId); 
  
  

    
  }, [audioIndex,props.data.groupedCampaigns]);


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
  }, [ props?.data?.savedPlaylists]);

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
  }, [audioIndex,props.data.savedPlaylists]);

  useEffect(() => {
    console.log(props.data.savedPlaylists)
    setAudioIndex(0)
    if(props?.data?.savedPlaylists?.length > 0){
      playAudio()
    }
  
    
  }, [props.data.savedPlaylists]);
  

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
        <audio id="audio-player1"  autoPlay={campainPlaying}  />
      </div>
    </>
  );
};

export default AudioPlayer;
