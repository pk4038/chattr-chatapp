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
    <div className="w-full h-screen bg-white text-slate-900 flex flex-col">
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10">
          <UserButton />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-slate-900 block truncate">{user?.fullName}</span>
          <span className="text-xs text-slate-500">Online</span>
        </div>
      </div>

      <div className="p-3 border-b border-slate-200">
        <input
          type="text"
          placeholder={tab === "users" ? "Search users..." : "Search chats..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
        />
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab("chats")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "chats"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setTab("users")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "users"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Users
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "users" && (
          <>
            {filteredUsers?.map((u) => (
              <div
                key={u._id}
                onClick={() => handleUserClick(u)}
                className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <img src={u.imageUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      u.lastSeen && Date.now() - u.lastSeen < 60000
                        ? "bg-green-500"
                        : "bg-slate-300"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500">
                    {u.lastSeen && Date.now() - u.lastSeen < 60000
                      ? "Active now"
                      : "Away"}
                  </p>
                </div>
              </div>
            ))}
            {filteredUsers?.length === 0 && (
              <p className="text-slate-400 text-sm p-4 text-center">No users found</p>
            )}
          </>
        )}

        {tab === "chats" && (
          <>
              {conversations?.map(({ conversation, otherUser, lastMessage, unreadCount }: any) => (
                <div
                key={conversation._id}
                onClick={() => otherUser && handleUserClick(otherUser)}
                className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={otherUser?.imageUrl}
                    alt={otherUser?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      otherUser?.lastSeen && Date.now() - otherUser.lastSeen < 60000
                        ? "bg-green-500"
                        : "bg-slate-300"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{otherUser?.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <div className="ml-2">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                      {unreadCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {conversations?.length === 0 && (
              <p className="text-slate-400 text-sm p-4 text-center">No conversations yet</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}