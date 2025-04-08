import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100/50">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6 rounded-lg bg-base-200/50 max-w-md">
              <p className="text-base-content/70">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message._id}
              className={`flex ${message.senderId === authUser._id ? "justify-end" : "justify-start"} mb-4`}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              {message.senderId !== authUser._id && (
                <div className="mr-2 flex-shrink-0">
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt="profile pic"
                    className="size-8 rounded-full border border-base-300 shadow-sm object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col max-w-[75%]">
                <div className="flex items-center mb-1">
                  <span className="text-xs text-base-content/60">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                <div
                  className={`rounded-lg p-3 ${message.senderId === authUser._id
                    ? "bg-primary/10 text-primary-content border border-primary/20"
                    : "bg-base-200 border border-base-300/50"}
                  ${message.image ? "p-2" : ""}`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-full rounded-md mb-2 hover:opacity-95 transition-opacity cursor-pointer"
                      onClick={() => window.open(message.image, "_blank")}
                    />
                  )}
                  {message.text && <p className="break-words text-base-content">{message.text}</p>}
                </div>
              </div>
              {message.senderId === authUser._id && (
                <div className="ml-2 flex-shrink-0">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="profile pic"
                    className="size-8 rounded-full border border-base-300 shadow-sm object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
