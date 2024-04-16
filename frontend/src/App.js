
import Recorder from "voice-recorder-react";
import RecordUi from "./Pages/RecordUi";
import { Audios } from "./Pages/Audios";
import NavBar from "./Pages/NavBar";
import { Heading, Spacer } from '@chakra-ui/react'
export default function App() {

  return (
    <>
      <NavBar />
      <div style={{ display: "flex", alignItems: "center", flexDirection: "column", marginTop: "55px" }}>
        <Heading>Record Your Voice </Heading>
        <Spacer />
        <Spacer />
        <Spacer />
        <Recorder Render={RecordUi} />
      </div>
      <Audios />
    </>
  );
}
