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
  isDarkMode?: boolean;
}

export default function ChatArea({ conversationId, otherUser, onBack, isDarkMode = false  }: Props) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.getMessages, { conversationId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const markAsRead = useMutation(api.messages.markMessageAsRead);
  const markConversationRead = useMutation(api.conversations.markConversationRead);
  const setTyping = useMutation(api.typing.setTyping);
  const clearTyping = useMutation(api.typing.clearTyping);
  const typingIndicators = useQuery(api.typing.getTyping, {
    conversationId,
    currentUserId: user?.id || "",
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // mark messages as read when they appear
  useEffect(() => {
    if (!user || !messages) return;
    messages.forEach((msg: any) => {
      if (msg.senderId !== user.id && !msg.isDeleted) {
        markAsRead({ messageId: msg._id, userId: user.id });
      }
    });
    // also update conversation-level read position to last message
    const lastMsg = messages[messages.length - 1];
    if (lastMsg) {
      markConversationRead({
        conversationId,
        clerkId: user.id,
        lastReadAt: lastMsg.timestamp || Date.now(),
        lastReadMessageId: lastMsg._id,
      });
    }
  }, [messages, user, markAsRead]);

  const otherRead = useQuery(api.conversations.getConversationRead, {
    conversationId,
    clerkId: otherUser?.clerkId || "",
  });

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

  const handleEdit = async (messageId: string) => {
    if (!editText.trim() || !user) return;
    try {
      await editMessage({
        messageId: messageId as Id<"messages">,
        newContent: editText.trim(),
        senderId: user.id,
      });
      setEditingId(null);
      setEditText("");
    } catch (err: any) {
      console.error("Edit failed", err);
      alert(err?.message || "Failed to edit message");
    }
  };

  const handleDelete = async (messageId: string, senderId: string) => {
    if (!user || senderId !== user.id) return;
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage({
        messageId: messageId as Id<"messages">,
        senderId: user.id,
      });
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err?.message || "Failed to delete message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className={`flex flex-col h-screen flex-1 transition-colors ${isDarkMode ? "bg-slate-950" : "bg-white"}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-3 transition-colors ${
        isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}>
        <button onClick={onBack} className={`md:hidden p-2 rounded-lg transition-colors ${
          isDarkMode 
            ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" 
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        }`}>
          ←
        </button>
        <div className="relative flex-shrink-0">
          <img src={otherUser.imageUrl} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{otherUser.name}</h2>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 ${isDarkMode ? "bg-slate-950" : "bg-white"}`}>
        {messages?.length === 0 && (
          <div className={`flex items-center justify-center h-full ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            <div className="text-center">
              <p className="font-medium mb-1">No messages yet</p>
              <p className="text-sm">Say hi to start the conversation!</p>
            </div>
          </div>
        )}
        {messages?.map((msg: any) => (
          <div
            key={msg._id}
            className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div className="group flex flex-col max-w-xs">
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm transition-colors ${
                  msg.senderId === user?.id
                    ? "bg-blue-600 text-white rounded-br-none"
                    : isDarkMode ? "bg-slate-800 text-slate-100 rounded-bl-none" : "bg-slate-100 text-slate-900 rounded-bl-none"
                }`}
              >
                {msg.isDeleted ? (
                  <span className="italic opacity-60">This message was deleted</span>
                ) : (
                  msg.content
                )}
              </div>
              <div className={`flex items-center gap-2 mt-1.5 px-1 ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {msg.timestamp ? formatTime(msg.timestamp) : ""}
                </span>
                {msg.isEdited && (
                  <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>(edited)</span>
                )}
                {/* show Seen under the last message when other user has read it */}
                {messages && messages.length > 0 && msg._id === messages[messages.length - 1]._id && msg.senderId === user?.id && otherRead && otherRead.lastReadMessageId === msg._id && (
                  <span className={`text-xs ml-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Seen</span>
                )}
                {msg.senderId === user?.id && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!msg.isDeleted && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(msg._id);
                            setEditText(msg.content);
                          }}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDarkMode
                              ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(msg._id, msg.senderId)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDarkMode
                              ? "bg-red-900 text-red-200 hover:bg-red-800"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {editingId === msg._id && (
                <div className={`mt-2 rounded-lg p-2 border transition-colors ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEdit(msg._id);
                      }
                    }}
                    className={`w-full text-sm rounded px-2 py-1 outline-none border transition-colors ${
                      isDarkMode
                        ? "bg-slate-700 text-slate-100 border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        : "bg-white text-slate-900 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(msg._id)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                          : "bg-slate-300 text-slate-700 hover:bg-slate-400"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t transition-colors ${
        isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}>
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (user) setTyping({ conversationId, userId: user.id });
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={`flex-1 rounded-full px-4 py-2.5 text-sm outline-none border transition-colors ${
              isDarkMode
                ? "bg-slate-800 text-slate-100 border-slate-700 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                : "bg-slate-100 text-slate-900 border-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            }`}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all flex-shrink-0"
          >
            Send
          </button>
        </div>
        {typingIndicators && typingIndicators.length > 0 && (
          <p className={`text-xs px-4 pt-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{otherUser.name} is typing...</p>
        )}
      </div>
    </div>
  );
}