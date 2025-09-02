interface MessageProps {
    content: string;
    sender: "me" | "other";
    // time?: string;
    // avatar?: string;
}

function ChatMessage({ content, sender }: MessageProps) {
    // console.log(content,sender)
    return (
        <div className={`flex ${sender === "me" ? "justify-end" : "justify-start"} mb-2`}>
            {/* {sender === "other" && avatar && (
                <img
                    src={avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                />
            )} */}

            <div className="max-w-xs md:max-w-md">
                <div
                    className={`px-4 py-2 rounded-lg ${sender === "me" ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                >
                    {content}
                </div>
                {/* {time && (
                    <span className={`text-xs text-gray-400 mt-1 block ${sender === "me" ? "text-right" : "text-left"}`}>
                        {time}
                    </span>
                )} */}
            </div>

            {/* {sender === "me" && avatar && (
                <img
                    src={avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ml-2"
                />
            )} */}
        </div>
    );
}

export default ChatMessage