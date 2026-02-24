"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface Props {
  conversationId: Id<"conversations">;
  otherUser: any;
  onBack: () => void;
}

export default function ChatArea({ conversationId, otherUser, onBack  }: Props) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.getMessages, { conversationId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const clearTyping = useMutation(api.typing.clearTyping);
  const typingIndicators = useQuery(api.typing.getTyping, {
    conversationId,
    currentUserId: user?.id || "",
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    await sendMessage({
      conversationId,
      senderId: user.id,
      content: input.trim(),
    });
    clearTyping({ conversationId, userId: user.id });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (isThisYear) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) + ", " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  return (
    <div className="flex flex-col h-screen flex-1">
      <div className="p-4 border-b border-gray-700 flex items-center gap-3 bg-gray-900 text-white">
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white mr-2">
          ←
        </button>
        <img src={otherUser.imageUrl} alt={otherUser.name} className="w-4 h-4 rounded-full object-cover" />
        <span className="font-semibold">{otherUser.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages?.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No messages yet. Say hi!</p>
        )}
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className={`flex flex-col ${msg.senderId === user?.id ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm text-white ${
                msg.senderId === user?.id ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {msg.content}
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {msg.timestamp ? formatTime(msg.timestamp) : ""}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-700 flex gap-2 bg-gray-900">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (user) setTyping({ conversationId, userId: user.id });
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700"
        >
          Send
        </button>
        {typingIndicators && typingIndicators.length > 0 && (
          <p className="text-xs text-gray-400 px-4 pb-1">{otherUser.name} is typing...</p>
        )}
      </div>
    </div>
  );
}