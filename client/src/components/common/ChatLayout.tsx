import { useChatStore } from "@/store/chat.store";
import useLayOutStore from "@/store/LayOut.store";
import useUserStore from "@/store/user.store";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import { VideoIcon } from "lucide-react";
import VideoModel from "./VideoModel";

export default function ChatLayout() {
  // const [selectedConversation] = useState(conversations[0]);
  const selectedContact = useLayOutStore(state => state.selectedContact)
  const [message, setMessage] = useState('');
  const { user } = useUserStore();
  const {
    sendMessage,
    messages,
    isUserOnline,
    startTyping,
    fetchMessages,
    loading,
    isUserTyping,
    handleCallUser,
  } = useChatStore();

  const isTyping = isUserTyping(Number(selectedContact?.userId));
  const [videoModel, setVideoModel] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedContact?.userId && selectedContact.ConversationParticipant[0]?.conversation.conversationId) {
      fetchMessages(selectedContact.ConversationParticipant[0]?.conversation.conversationId)
    }
  }, [selectedContact, selectedContact?.ConversationParticipant[0]?.conversation.conversationId]);


  useEffect(() => {
    if (message && selectedContact) {

      startTyping(selectedContact?.userId);
    }

  }, [selectedContact, message, startTyping]);

  const handelSendMessage = async () => {

    const fromData = new FormData();

    fromData.append("senderId", String(user?.userId));
    fromData.append("receiverId", String(selectedContact?.userId));
    fromData.append("status", String("send"));
    fromData.append("content", String(message.trim()));

    await sendMessage(fromData);

    setMessage("")
  }

  const videoCall = useCallback(async () => {
    if (await handleCallUser()) {
      setVideoModel(true)
    } else {
      setVideoModel(false)
    }
  }, [setVideoModel, videoModel, handleCallUser])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        is loading....
      </div>
    );
  }

  console.log(isUserOnline(Number(selectedContact?.userId)))

  return (
    <>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat header */}
        <div className="border-b p-4 flex justify-between">
          <h3 className="text-lg font-semibold">
            <span className={`w-3 h-3 rounded-full ${isUserOnline(Number(selectedContact?.userId)) ? "bg-emerald-600" : "bg-gray-300"}   inline-flex mr-2`}></span>
            {selectedContact?.name}
          </h3>
          <button onClick={videoCall}>
            <VideoIcon />
          </button>
        </div>

        {/* video model */}
        {videoModel && (<VideoModel setModel={setVideoModel} />)}


        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages && messages.map((data, i) => (
            <ChatMessage content={data.content} sender={data.receiverUser !== user?.userId ? "me" : "other"} key={i} />
          ))}
          {isTyping ? 'typing ...' : ''}

          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="border-t p-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow border rounded-l px-4 py-2 focus:outline-none focus:ring"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
              onClick={handelSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div >
    </>
  );
}
