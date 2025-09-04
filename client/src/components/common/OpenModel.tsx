import { useState } from "react";
import Modal from "./Modal";
import { Button } from "@headlessui/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useFiendUsers } from "@/helper/message";
import type { UserConversation } from "@/store/chat.store";
import useLayOutStore from "@/store/LayOut.store";


function OpenModel() {

    const setSelectedContact = useLayOutStore((state) => state.setSelectedContact);
    const [isOpen, setIsOpen] = useState(false);

    const [searchValue, setSearchValue] = useState('');

    const { data } = useFiendUsers(searchValue);


    console.log(data?.data)
    return (
        <div className="px-4 py-3">
            <Button
                className="px-4 py-2 bg-gray-50 text-black rounded hover:bg-blue-600"
                onClick={() => setIsOpen(true)}
            >
                add user
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="My Modal"
                searchValue={searchValue}
                setSearchValue={setSearchValue}
            >
                {data?.data.map((c: UserConversation) => (
                    <button
                        key={c.userId}
                        onClick={() => setSelectedContact(c)}
                        className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 focus:bg-blue-50 text-left `}
                    >
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 ms-1.5">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-xs text-gray-500 truncate">@{c.username}</p>
                        </div>
                        <div className="flex flex-col items-end ml-3">
                            <span className="text-xs text-gray-400"></span>
                        </div>
                    </button>
                ))}

            </Modal>
        </div>
    );


}

export default OpenModel