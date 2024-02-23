
import { useEffect, useRef, useState } from "react";

import { Box, Button, useToast } from '@chakra-ui/react'
import staticicons from '../icons/icons8-audio-wave-100.png'
import { VscDebugStart } from "react-icons/vsc";
import { RiStopCircleLine } from "react-icons/ri";
import { MdMotionPhotosPaused } from "react-icons/md";
import { GrResume } from "react-icons/gr";
import { IoCloudUpload } from "react-icons/io5";
import icons from '../icons/icons8-audio-wave.gif'
export default function RecordUi({
  time,
  stop,
  data,
  start,
  pause,
  resume,
  paused,
  recording
}) {
  const audioRef = useRef(null);
  const [hasRecording, setHasRecording] = useState(false);
  const toast = useToast()

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  };

  useEffect(() => {
    if (data.url && audioRef.current) {
      audioRef.current.src = data.url;
    }
  }, [data.url]);

  const uploadAudio = async () => {
    if (!data.blob) {
      console.log('No recorded data to upload.');
      return;
    }

    console.log('Uploading audio:', data.blob);

    const formData = new FormData();
    formData.append('audio', data.blob, 'recording.wav');
    
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.log('Upload failed:', errorMessage);

      return;
    }

    if (response.status === 200) {

      toast({
        title: 'Uploaded Voice.',
        description: "Uploaded Voice for you.",
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: "top-right"
      })
    } else {
      toast({
        title: 'Voice Not Uploaded.',
        description: "Voice Not Uploaded try again .",
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: "top-right"
      })
    }


  };




  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "23px" }}>
        <button
          type="button"
          onClick={() => {
            if (recording) {
              stop();
              setHasRecording(true);
            } else {
              start();
              setHasRecording(false);
            }
          }}
          style={{ margin: "10px" }}
        >
          {recording ? <Box display={"flex"} alignItems={"center"}>
            <Button style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px" }} colorScheme='blue'> Stop   <RiStopCircleLine /> </Button>

          </Box>
            :
            <Box display={"flex"} alignItems={"center"}>
              <Button style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px" }} colorScheme='blue'> Start <VscDebugStart /> </Button>

            </Box>
          }
        </button>

        {recording === true && recording === false ? (
          <div>
            <img src={icons} alt='sound' />
          </div>
        ) : (
          null
        )}
        {audioRef.current?.paused ? (
          <div>
            <img src={staticicons} alt='sound' />
          </div>
        ) : null}




        {recording && (
          <>
            <button
              type="button"
              onClick={() => {
                if (recording) {
                  if (paused) resume();
                  else pause();
                }
              }}
              style={{ margin: "10px" }}
            >
              {paused ? <Box display={"flex"} alignItems={"center"}>   <Button style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px" }} colorScheme='blue'> Resume <GrResume /> </Button>
              </Box> : <Box display={"flex"} alignItems={"center"}>  <Button style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px" }} colorScheme='blue'> Paused <MdMotionPhotosPaused /></Button></Box>}
            </button>
            <p>
              {time.h}:{time.m}:{time.s}
            </p>
          </>
        )}

        {!recording && hasRecording && (
          <>


            <Button type="button" onClick={togglePlay} style={{ margin: "10px" }} colorScheme='blue'> Play/Pause</Button>
          </>
        )}
        <audio ref={audioRef} hidden />

        {
          data?.url ? <Button style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px" }} onClick={uploadAudio} colorScheme='blue'> Upload <IoCloudUpload /></Button>

            : null
        }
      </div>
    </>
  );
}
