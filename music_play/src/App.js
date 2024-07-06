import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const MusicPlayer = () => {
  const [audioSrc, setAudioSrc] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await axios.get('https://storage.googleapis.com/ikara-storage/tmp/beat.mp3', {
          responseType: 'blob',  // specify the response type as blob
        });
        const blob = new Blob([response.data], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (error) {
        console.error('Error fetching audio:', error);
      }
    };

    const fetchLyrics = async () => {
      try {
        const response = await axios.get('https://storage.googleapis.com/ikara-storage/ikara/lyrics.xml');
        setLyrics(response.data);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
      }
    };

    fetchAudio();
    fetchLyrics();

    return () => {
      // Clean up audio object URL when component unmounts
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, []); // Run effect only once on component mount

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioSrc]); // Update effect when audioSrc changes

  const playMusic = () => {
    audioRef.current.src = audioSrc;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const stopMusic = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleSeekBarChange = (e) => {
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
    }}>
      <div style={{ width: '300px', height: '300px', border: '1px solid #ccc', textAlign: 'center',
              backgroundImage: 'url(https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/hinh-nen-dien-thoai-35.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
       }}>
        <button
          onClick={isPlaying ? stopMusic : playMusic}
          style={{
            marginTop: '120px',
            color: 'blue',
            width: '50px',
            height: '30px',
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s ease'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <div style={{marginTop:'130px'}}>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeekBarChange}
            style={{ width: '100%' }}
          />
          <div>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        {/* <div>
          <h2>Lyrics</h2>
          <pre>{lyrics}</pre>
        </div> */}
      </div>
    </div>
  );
};

const formatTime = (time) => {
  if (isNaN(time)) {
    return '--:--';
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

export default MusicPlayer;