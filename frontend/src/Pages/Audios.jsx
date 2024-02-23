import {
  Heading, Button, useDisclosure, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody, Spinner,
  ModalCloseButton, Spacer
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { FaCloudDownloadAlt } from "react-icons/fa";

export const Audios = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [transcript, settranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchAudioFiles();
    const timer = setTimeout(() => {
      setShowTranscript(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch('https://calm-cyan-rattlesnake-hose.cyclic.app/getAllAudio');
      const data = await response.json();
      setAudioFiles(data);
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching audio files:', error);
    }
  };
  const getTranscript = (filename) => {
    fetch(`https://calm-cyan-rattlesnake-hose.cyclic.app/getTranscript/${filename}`).then((res) => {
      return res.json()
    }).then((res) => {
      settranscript(res.transcript)
      setShowTranscript(false)
    })

  }
  // console.log(transcript)
  const renderAudioPlayers = () => {

    return audioFiles.length > 0 ?
      audioFiles && audioFiles.map((filename, index) => (
        <div key={index} style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", padding: "12px", borderRadius: "12px", border: "2px solid " }}>
          <span style={{
            display: "flex", gap: "12px", padding: "12px"
          }}>
            {filename}
            <Button  onClick={() => { getTranscript(filename); onOpen(); }}  colorScheme='blue'> Get Transcript </Button> 
            <a href={`https://calm-cyan-rattlesnake-hose.cyclic.app/getAudio/${filename}`} download="audio.mp3">
              <Button style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px" }} colorScheme='blue'>
                <FaCloudDownloadAlt />
              </Button>
            </a>
          </span>
          <audio controls>
            <source src={`https://calm-cyan-rattlesnake-hose.cyclic.app/getAudio/${filename}`} type="audio/ogg" />
            <source src={`https://calm-cyan-rattlesnake-hose.cyclic.app/getAudio/${filename}`} type="audio/mpeg" />
          </audio>

        </div>
      )) : <div>Not Data Found </div>
  };
  if (loading) {
    return <div><Spinner
      thickness='4px'
      speed='0.65s'
      emptyColor='gray.200'
      color='blue.500'
      size='xl'
    /></div>
  }

  return (
    <>

      <Heading textAlign={"center"}>Recorded Voice's</Heading>
      <Spacer />
      <Spacer />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "23px", width: "98%", flexWrap: "wrap", marginTop: "45px" }}>


        {renderAudioPlayers()}
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transcription </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {showTranscript ? (
              <div>Loading...</div>
            ) : transcript.length > 0 ? (
              <div>
                <p>{transcript && transcript}</p>

              </div>
            ) : (
              <div>No transcript available</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Spacer />
      <Spacer />
    </>
  )
}
