import { useState } from "react";
import Modal from "./Modal";
import { Button } from "@headlessui/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


function OpenModel() {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="px-4 py-3">
            <Button
                className="px-4 py-2 bg-gray-50 text-black rounded hover:bg-blue-600"
                onClick={() => setIsOpen(true)}
            >
                add user
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="My Modal">
                <button
                    // key={c.userId}
                    // onClick={() => setSelectedContact(c)}
                    className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 focus:bg-blue-50 text-left `}
                >
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 ms-1.5">
                        <p className="text-sm font-medium truncate">Juber</p>
                        {/* <p className="text-xs text-gray-500 truncate">{c.ConversationParticipant[0].conversation?.lastMessage?.content}</p> */}
                    </div>
                    <div className="flex flex-col items-end ml-3">
                        <span className="text-xs text-gray-400"></span>
                        {/* {c.ConversationParticipant[0].conversation.unreadCount > 0 &&
                      c.ConversationParticipant[0].conversation.lastMessage?.userUserId !== user?.userId && (
                        <span className="mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                          {c.ConversationParticipant[0].conversation.unreadCount}
                        </span>
                      )} */}
                    </div>
                </button>
            </Modal>
        </div>
    );


}

export default OpenModel