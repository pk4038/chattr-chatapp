"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";


interface Props {
  onSelectConversation: (conversationId: Id<"conversations">, otherUser: any) => void;
}

export default function Sidebar({ onSelectConversation }: Props) {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"users" | "chats">("chats");
  const users = useQuery(api.users.getAllUsers, {
    currentClerkId: user?.id || "",
  });
  const conversations = useQuery(api.conversations.getConversationsWithUsers, {
    clerkId: user?.id || "",
  });
  const getOrCreateConversation = useMutation(api.conversations.getOrCreateConversation);

  const filteredUsers = users?.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = async (otherUser: any) => {
    if (!user) return;
    const conversationId = await getOrCreateConversation({
      currentClerkId: user.id,
      otherClerkId: otherUser.clerkId,
    });
    onSelectConversation(conversationId, otherUser);
  };

  return (
  <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
    <div className="p-4 border-b border-gray-700 flex items-center gap-2">
      <UserButton />
      <span className="font-semibold">{user?.fullName}</span>
    </div>

    <div className="flex border-b border-gray-700">
      <button
        onClick={() => setTab("chats")}
        className={`flex-1 py-2 text-sm ${tab === "chats" ? "bg-gray-700" : ""}`}
      >
        Chats
      </button>
      <button
        onClick={() => setTab("users")}
        className={`flex-1 py-2 text-sm ${tab === "users" ? "bg-gray-700" : ""}`}
      >
        Users
      </button>
    </div>

    <div className="p-4">
      <input
        type="text"
        placeholder={tab === "users" ? "Search users..." : "Search chats..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-700 rounded px-3 py-2 text-sm outline-none"
      />
    </div>

    <div className="flex-1 overflow-y-auto">
      {tab === "users" && (
        <>
          {filteredUsers?.map((u) => (
            <div
              key={u._id}
              onClick={() => handleUserClick(u)}
              className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
            >
              <div className="relative">
                <img src={u.imageUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-900 ${
                  u.lastSeen && Date.now() - u.lastSeen < 60000 ? "bg-green-500" : "bg-gray-500"
                }`} />
              </div>
              <span className="text-sm">{u.name}</span>
            </div>
          ))}
          {filteredUsers?.length === 0 && (
            <p className="text-gray-400 text-sm p-4">No users found</p>
          )}
        </>
      )}

      {tab === "chats" && (
        <>
          {conversations?.map(({ conversation, otherUser, lastMessage }) => (
            <div
              key={conversation._id}
              onClick={() => otherUser && handleUserClick(otherUser)}
              className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
            >
              <div className="relative">
                <img src={otherUser?.imageUrl} alt={otherUser?.name} className="w-8 h-8 rounded-full object-cover" />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-900 ${
                  otherUser?.lastSeen && Date.now() - otherUser.lastSeen < 60000 ? "bg-green-500" : "bg-gray-500"
                }`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{otherUser?.name}</span>
                <span className="text-xs text-gray-400 truncate w-40">
                  {lastMessage?.content || "No messages yet"}
                </span>
              </div>
            </div>
          ))}
          {conversations?.length === 0 && (
            <p className="text-gray-400 text-sm p-4">No conversations yet</p>
          )}
        </>
      )}
    </div>
  </div>
);
}