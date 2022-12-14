import './App.css';
import ProgressBar from "./progress-bar.jsx";
import { toRecord } from "./sentences"
import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useState } from 'react';
import toWav from 'audiobuffer-to-wav';
import xhr from 'xhr';
import styles from './recorder.module.css';

const audioType = 'audio/*';

let audioContext = new (window.AudioContext)()

let chunks = [];

export function App() {

  const speakerID = uuidv4();
  const [idx, setIdx] = useState(0);

  const [csv, setCsv] = useState(localStorage.getItem('csv') || '');

  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [audioDetails, setAudioDetails] = useState({
    url: null,
    blob: null
  });

  useEffect(() => {
    localStorage.setItem('csv', csv);
  }, [csv]);

  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);

  async function initRecorder() {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.mediaDevices) {
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(newStream);
      setMediaRecorder(mediaRecorder);
      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      setStream(newStream);
      return mediaRecorder;
    }
  }

  async function startRecording(e) {
    e.preventDefault();
    handleReset();
    // wipe old data chunks
    chunks = [];

    const mediaRecorder = await initRecorder();
    // start recorder with 10ms buffer
    mediaRecorder.start(10);
    // say that we're recording
    setRecording(true);
  }

  function stopRecording(e) {
    e.preventDefault();
    // stop the recorder

    if (stream.getAudioTracks) {
      const tracks = stream.getAudioTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    } else {
      console.log('No Tracks Found')
    }

    mediaRecorder.stop();

    // say that we're not recording
    setRecording(false);
    // save the video to memory
    saveAudio();
  }

  function saveAudio() {
    // convert saved chunks to blob
    const blob = new Blob(chunks, { type: audioType });
    // generate video url from blob
    const audioURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    setAudioDetails({
      url: audioURL,
      blob: blob
    });
  }

  function downloadRecordings() {
    xhr({
      uri: audioDetails.url,
      responseType: 'arraybuffer'
    }, function (err, body, resp) {
      if (err) throw err

      let anchor = document.createElement('a')
      document.body.appendChild(anchor)
      anchor.style = 'display: none'

      audioContext.decodeAudioData(resp, function (buffer) {
        let wav = toWav(buffer)
        let blob = new window.Blob([new DataView(wav)], {
          type: 'audio/wav'
        })

        let url = window.URL.createObjectURL(blob)
        anchor.href = url
        anchor.download = speakerID + '-' + idx + '.wav'
        anchor.click()
        window.URL.revokeObjectURL(url)
        setCsv(csv + (csv !== '' ? '\n' : '') + speakerID + '-' + idx + "|" + toRecord[idx]);
        console.log('set csv to ' + csv);
        setIdx(idx + 1);
        handleReset();
      }
        , function () {
          throw new Error('Could not decode audio data.')
        })
    });
  }

  function saveCsv() {
    const file = new window.Blob([csv], { type: 'text/plain' });
    const url = window.URL.createObjectURL(file)
    // download url
    const a = document.createElement('a')
    a.href = url
    a.download = 'metadata.csv'
    a.click()
    // revoke the url
    window.URL.revokeObjectURL(url)
  }

  function clearCsv() {
    setCsv('');
    localStorage.setItem('csv', '');
  }


  function handleReset() {
    const reset = {
      url: null,
      blob: null
    };
    chunks = [];
    setAudioDetails(reset);
  }

  return (
    <div>
      <div className="progress-bar">
        <ProgressBar completed={Math.ceil((idx / toRecord.length) * 100)} />
      </div>
      <div className="text-holder">
        <div className="text">
          <span>{toRecord[idx]}</span>
        </div>
      </div>

      <div className={styles.recorder_library_box}>
        <div className={styles.audio_section}>
          {
            audioDetails.url !== null ?
              (
                <audio controls>
                  <source src={audioDetails.url} type='audio/wav' />
                </audio>
              ) :
              null
          }
        </div>
        {
          !recording ?
            (
              <button
                onClick={e => startRecording(e)}
                href=' #'
                className={styles.mic_icon}
              >
                {/*Record*/}
              </button>
            ) :
            (
              <button
                onClick={e => stopRecording(e)}
                href=' #'
                className={`${styles.icons} ${styles.stop}`}
              >
                {/*Stop*/}
              </button>
            )
        }
      </div>

      <div className="controls">
        <button disabled={!audioDetails.url} className="btn btn-save" onClick={downloadRecordings}>{'Save and Next'}</button>
      </div>
      <div className="csv-controls">
        <button className="btn btn-save" onClick={saveCsv}>{'Save Metadata'}</button>
        <button className="btn btn-clear" onClick={clearCsv}>{'Clear Metadata'}</button>
      </div>
    </div>
  );

}

export default App;