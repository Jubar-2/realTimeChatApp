import { useChatStore } from '@/store/chat.store'
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player'
import peer from "@/service/PeerService.service"
// import peer from '@/service/PeerService.service'
function Setting() {
    const { myStream, handleCallUser, handleNegoNeeded, sendStreams } = useChatStore();
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    // (async () => {
    //     // const offer = await peer.getOffer();
    //     // console.log(offer)

    //     const stream =  navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //         video: true,
    //     }).then((strem)=>{
    //         console.log(strem)
    //     }).catch(err=>{
    //         console.log(err)
    //     })

    //     // console.log(stream)
    // })()

    // const sendStreams = useCallback(() => {
    //     console.log("start streams")
    //     for (const track of myStream.getTracks()) {
    //         console.log(track)
    //         peer.peer.addTrack(track, myStream);
    //     }
    // }, [myStream]);

    // const videoRef = useRef<HTMLVideoElement>(null);
    // const remoteRef = useRef<HTMLVideoElement>(null);

    // useEffect(() => {
    //     if (videoRef.current && myStream) {
    //         videoRef.current.srcObject = myStream;
    //         console.log("my streem", myStream)
    //     }
    // }, [myStream]);

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            // console.log(remoteStream)
            // remoteRef.current.srcObject = myStream;
            setRemoteStream(remoteStream[0])
            console.log(remoteStream[0])
            // console.log(URL.createObjectURL(remoteStream[0]))
            // if (remoteRef.current && remoteStream[0]) {
            //     remoteRef.current.srcObject = remoteStream[0];
            //     console.log("remoteRef current srcObject", remoteRef.current.srcObject)
            // }

        });
    }, []);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    return (
        <div>
            <h1>Room Page</h1>
            {myStream && <button onClick={sendStreams}>Send Stream</button>}
            <button onClick={handleCallUser}>CALL</button>
            {myStream && (
                <>
                    <h1>My Stream</h1>
                    <ReactPlayer
                        playing
                        muted
                        height="250px"
                        width="500px"
                        url={myStream}
                    />
                </>
            )}
            {remoteStream && (
                <>
                    <h1>Remote Stream</h1>
                    <ReactPlayer
                        playing
                        muted
                        height="250px"
                        width="500px"
                        url={remoteStream}
                    />
                </>
            )}
        </div>
    )
}

export default Setting