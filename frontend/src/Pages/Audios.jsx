import {
  Heading, Button, useDisclosure, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';

export const Audios = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [transcript, settranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);

  useEffect(() => {
    fetchAudioFiles();
    const timer = setTimeout(() => {
      setShowTranscript(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/getAllAudio');
      const data = await response.json();
      setAudioFiles(data);
    } catch (error) {
      console.error('Error fetching audio files:', error);
    }
  };
  const getTranscript = (filename) => {
    fetch(`http://localhost:5000/getTranscript/${filename}`).then((res) => {
      return res.json()
    }).then((res) => {
      settranscript(res.translation)
      setShowTranscript(false)
    })

  }
  const renderAudioPlayers = () => {

    return audioFiles.length > 0 ?
      audioFiles && audioFiles.map((filename, index) => (
        <div key={index} style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", padding: "12px", borderRadius: "12px", border: "2px solid " }}>
          <span style={{
            display: "flex", gap: "12px", padding: "12px"
          }}>
            {filename}
            <Button onClick={() => { getTranscript(filename); onOpen(); }} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px" }} colorScheme='blue'> Get Transcript </Button>

          </span>
          <audio controls>
            <source src={`http://localhost:5000/getAudio/${filename}`} type="audio/ogg" />
            <source src={`http://localhost:5000/getAudio/${filename}`} type="audio/mpeg" />
          </audio>
        </div>
      )) : <div>Not Data Found </div>
  };


  return (
    <>

      <Heading textAlign={"center"}>Recorded Voice's</Heading>
      <br />
      <br />
      <br />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "23px", width: "98%", flexWrap: "wrap" }}>


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
    </>
  )
}
