import React, { useState, useEffect } from 'react';
import { PiPauseCircleLight } from "react-icons/pi";
import { PiPlayCircleLight } from "react-icons/pi";
import _ from "lodash"
import './player.css';
import axios from 'axios';

const AudioPlayer = (props) => {


  const [audioIndex, setAudioIndex] = useState(0); // Şu an çalınan şarkının indeksi
  const [playing, setPlaying] = useState(false); // Çalma durumu

  // newArray güncellendiğinde audioIndex'i sıfırla

  // Şarkı dizisi güncellendiğinde ilk şarkıyı çalmaya başla


  // audioIndex veya playing değiştiğinde çalma durumunu güncelle
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
  }, [audioIndex, props.data.savedPlaylists]);

  // Bir sonraki şarkıya geç
  const playNext = () => {
    if (audioIndex < props?.data.savedPlaylists.length - 1) {
      setAudioIndex(prevIndex => prevIndex + 1);
    } else {
      setPlaying(false); // Eğer son şarkıysa çalmayı durdur
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
  }, [audioIndex]);
  useEffect(() => {

   
      playAudio();

   
    // Otomatik çalma işlemini gerçekleştir

  }, [props.data])


  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} className="audio-player">
        <div className="audio-controls">

          {playing ? (
            <button onClick={pauseAudio}><PiPauseCircleLight style={{ width: "100px", height: "100px" }} fill='black' /></button>
          ) : (
            <button onClick={playAudio}><PiPlayCircleLight style={{ width: "100px", height: "100px" }} fill='black' />
            </button>
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
        <audio id="audio-player" src={props?.data?.savedPlaylists[audioIndex]?.playlink} controls autoPlay={playing} />
        {/*   <audio id="audio-player1"   autoPlay={campainPlaying} /> */}
      </div>
    </>
  );
};

export default AudioPlayer;
