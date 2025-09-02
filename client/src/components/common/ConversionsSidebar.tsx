import { useState } from "react";
import { Search, MessageCircle, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import useLayOutStore from "@/store/LayOut.store";
import { useChatStore, type UserConversation } from "@/store/chat.store";
import useUserStore from "@/store/user.store";
import timeAgo from "@/helper/timing";
import OpenModel from "./OpenModel";
import IncomingCall from "./IncomingCall"

export default function ConversationSidebar() {
  const [search, setSearch] = useState("");

  const { conversions } = useChatStore();

  const setSelectedContact = useLayOutStore((state) => state.setSelectedContact);
  const selectedContact = useLayOutStore((state) => state.selectedContact);
  const { user } = useUserStore();

  if (!conversions) return;

  const filtered = conversions.filter((c: UserConversation) =>
    c?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <MessageCircle className="w-5 h-5 text-gray-500" />
      </div>

      <div>
        <OpenModel />
      </div>
      <IncomingCall/>
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-blue-100"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((c: UserConversation) => (
          <button
            key={c.userId}
            onClick={() => setSelectedContact(c)}
            className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 focus:bg-blue-50 text-left ${selectedContact?.userId === c.userId ? "bg-gray-50" : ""}`}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 ms-1.5">
              <p className="text-sm font-medium truncate">{c.name}</p>
              <p className="text-xs text-gray-500 truncate">{c.ConversationParticipant[0].conversation?.lastMessage?.content}</p>
            </div>
            <div className="flex flex-col items-end ml-3">
              <span className="text-xs text-gray-400">{timeAgo(c.lastSeen)}</span>
              {c.ConversationParticipant[0].conversation.unreadCount > 0 &&
                c.ConversationParticipant[0].conversation.lastMessage?.userUserId !== user?.userId && (
                  <span className="mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                    {c.ConversationParticipant[0].conversation.unreadCount}
                  </span>
                )}
            </div>
          </button>
        ))}
      </div>

      <div className="w-full bg-fuchsia-200 flex justify-between px-4 py-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <button>
          <LogOut color="oklch(55.1% 0.027 264.364)" />
        </button>
      </div>
    </aside>
  );
}
