import { useChatStore } from "@/store/chat.store";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import peer from "@/service/PeerService.service"

export default function IncomingCall() {
  // const [incoming, setIncoming] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const { incomingCall, myStream, cancelIncomingCall, acceptVideoCall, handleNegoNeeded } = useChatStore()

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      console.log("remote streem",remoteStream)
      setRemoteStream(remoteStream[0])
    })
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);


  return (
    <>
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-4 w-[350px] relative">
            <h2 className="text-lg font-bold text-center mb-2">📞 Incoming Call</h2>

            {/* My Stream */}
            {/* <video
              //   ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[200px] bg-black rounded-lg"
            /> */}

            <ReactPlayer
              playing
              muted
              height="250px"
              width="500px"
              url={myStream}
            />

            <ReactPlayer
              playing
              muted
              height="250px"
              width="500px"
              url={remoteStream}
            />


            {/* Buttons */}
            <div className="flex justify-around mt-4">
              <button
                onClick={acceptVideoCall}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Accept
              </button>
              <button
                onClick={cancelIncomingCall}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
