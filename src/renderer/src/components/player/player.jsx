import React, { useState, useEffect } from 'react';
import { PiPauseCircleLight } from "react-icons/pi";
import { PiPlayCircleLight } from "react-icons/pi";

import './player.css';

const AudioPlayer = (props) => {
  const [audioIndex, setAudioIndex] = useState(0); // State to hold current audio index
  const [playing, setPlaying] = useState(false); // State to track playing status
  const [playedSongs, setPlayedSongs] = useState([]);

  const playAudio = () => {
    setPlaying(true);
  };

  const pauseAudio = () => {
    setPlaying(false);
  };

  const playNext = () => {
    if (Object.values(props.data).length > 0) {
      const totalSongs = props.data.songs[0].song.length;
      let randomIndex = Math.floor(Math.random() * totalSongs);
  
      // Keep generating random index until it's not in playedSongs
      while (playedSongs.includes(randomIndex)) {
        randomIndex = Math.floor(Math.random() * totalSongs);
      }
  
      // Add the played song to playedSongs array
      const updatedPlayedSongs = [...playedSongs, audioIndex];
      setPlayedSongs(updatedPlayedSongs);
  
      // Reset playedSongs array if all songs are played
      if (updatedPlayedSongs.length === totalSongs) {
        setPlayedSongs([]);
      }
  
      setAudioIndex(randomIndex);
      console.log('Playing next audio');
    }
  };

  const playPrevious = () => {
    if (Object.values(props.data).length > 0) {
      const previousIndex = (audioIndex - 1 + props?.data?.songs[0].song?.length) % props?.data?.songs[0].song?.length;
      setAudioIndex(previousIndex);
      console.log('Playing previous audio');
    }
  };
 let songData=[]
  let audioUrl = "";
  if (Object.values(props.data).length > 0&&props.data.songs[0].song) {
   
    audioUrl = props.data.songs[0].song[audioIndex]?.playlink;
    songData.push(props.data.songs[0].song[audioIndex])
  }
 console.log(songData[0])
  useEffect(() => {
    const audioElement = document.getElementById('audio-player');
    audioElement.addEventListener('ended', playNext);

    return () => {
      audioElement.removeEventListener('ended', playNext);
    };
  }, [props.data]); // Listen to changes in props.data
 
  useEffect(() => {
    const audioElement = document.getElementById('audio-player');
    if (audioElement) {
      if (playing) {
        audioElement.play();
      } else {
        audioElement.pause();
      }
    }
  }, [playing]); // Listen to changes in playing state

  useEffect(()=>{
    setAudioIndex(0);
  },[props.data])
  useEffect(() => {
    if(Object.values(props.data).length > 0){
      playAudio();
    }
    // Otomatik çalma işlemini gerçekleştir
   
  }, [props.data])

  return (<>
    <div style={{display:"flex",flexDirection:"row",justifyContent:"space-between"}} className="audio-player">
      <div className="audio-controls">
      
      {playing ? (
        <button onClick={pauseAudio}><PiPauseCircleLight style={{width:"100px",height:"100px"}} fill='black' /></button>
      ) : (
        <button onClick={playAudio}><PiPlayCircleLight style={{width:"100px",height:"100px"}} fill='black' />
        </button>
      )}
      
    </div>
      <div className='song-info'>
        <img src={songData[0]?.artwork_url} alt="" srcset="" />
          
          <div className='text-container'>
          <span style={{fontSize:"22px"}}>{props?.data?.playlistName}</span>
          <span>{songData[0]?.title}</span>
          </div>
      </div>
      
     
      
    </div>
    <div>
       <audio id="audio-player" src={audioUrl}  autoPlay={playing} />
    </div>
    </>
  );
};

export default AudioPlayer;
