import ChatLayout from "@/components/common/ChatLayout"
import ConversationSidebar from "@/components/common/ConversionsSidebar"
import { useGetAllUsers } from "@/helper/message"
import { useChatStore } from "@/store/chat.store"
import { useEffect } from "react"

function Chat() {
  // const selectedContact = useLayOutStore(state => state.selectedContact)
  // const location = useLocation()

  const { data } = useGetAllUsers();
  const { setConversations } = useChatStore();

  useEffect(() => {
    setConversations(data?.data.data)
  }, [data, setConversations])

  return (
    <div className="flex h-screen">
      <ConversationSidebar />
      <ChatLayout />
    </div>
  )
}

export default Chat