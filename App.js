import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { Buffer } from 'buffer';
import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';

const App = () =>  {
  let sound = null
  const [audioFile, setAudioFile] = useState('')
  const [recording, setRecording] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'test.wav'
    };
    AudioRecord.init(options);
    AudioRecord.on('data', data => {
      const chunk = Buffer.from(data, 'base64');
      console.log('chunk size', chunk.byteLength);
    });
  }, [])


  const start = () => {
    console.log('start record');
    setAudioFile('')
    setRecording(true)
    setLoaded(false)
    AudioRecord.start();
  };

  const stop = async () => {
    if (!recording) return;
    console.log('stop record');
    let audioFile = await AudioRecord.stop();
    console.log('audioFile', audioFile);
    setAudioFile(audioFile)
    setRecording(false)
  };

  const load = () => {
    return new Promise((resolve, reject) => {
      if (!audioFile) {
        return reject('file path is empty');
      }

      sound = new Sound(audioFile, '', error => {
        if (error) {
          console.log('failed to load the file', error);
          return reject(error);
        }
        setLoaded(true)
        return resolve();
      });
    });
  };

  const play = async () => {
    if (!loaded) {
      try {
        await load();
      } catch (error) {
        console.log(error);
      }
    }

    setPaused(false)
    Sound.setCategory('Playback');

    sound.play(success => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
      }
      setPaused(true)
    });
  };

 const pause = () => {
    sound.pause();
    setPaused(true)
  };

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Button onPress={start} title="Record" disabled={recording} />
          <Button onPress={stop} title="Stop" disabled={!recording} />
          {paused ? (
            <Button onPress={play} title="Play" disabled={!audioFile} />
          ) : (
            <Button onPress={pause} title="Pause" disabled={!audioFile} />
          )}
        </View>
      </View>
    );
  }

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  }
});
