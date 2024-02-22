import { useState } from "react";
import Recorder from "voice-recorder-react";
import RecordUi from "./Pages/RecordUi";
import { Audios } from "./Pages/Audios";
import NavBar from "./Pages/NavBar";
import { Heading } from '@chakra-ui/react'
export default function App() {
  const [isHooks, setHooks] = useState(false);
  return (
    <>
      <NavBar />
 
 
      <br />
      <br />
      <br />
      {isHooks ? (
        <>
          <Heading>Using React Hooks</Heading>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
          <Heading>Record Your Voice </Heading>
          <br/>
          <br/>
          <Recorder Render={RecordUi} />
        </div>
      )}
      <Audios />
    </>
  );
}
