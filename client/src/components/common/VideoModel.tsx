import { useChatStore } from "@/store/chat.store";
import { useCallback, useEffect } from "react";
import ReactPlayer from "react-player";

export default function VideoModel({ setModel }: Props) {
    const { myStream, cancelCall } = useChatStore();

    const cancelButtonHandler = useCallback(() => {
        cancelCall()
        setModel(false)
    }, [])

    useEffect(() => {
        if (!myStream) {
            setModel(false)
        }
    }, [myStream])

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl shadow-lg p-4 w-[400px]">

                {/* Cancel Button */}
                <button
                    onClick={cancelButtonHandler}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-md z-10"
                >
                    Cancel
                </button>

                {/* Video */}
                <ReactPlayer
                    playing
                    muted
                    height="250px"
                    width="500px"
                    url={myStream ?? undefined}
                />

                {/* Overlay Calling Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                        Calling...
                    </h2>
                </div>
            </div>
        </div>
    )
}


type Props = {
    setModel: React.Dispatch<React.SetStateAction<boolean>>;
};