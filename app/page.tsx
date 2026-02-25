"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { Id } from "../convex/_generated/dataModel";

export default function Home() {
  const { user } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const [activeConversation, setActiveConversation] = useState<Id<"conversations"> | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const updateLastSeen = useMutation(api.users.updateLastSeen);

  useEffect(() => {
    if (user) {
      createOrUpdateUser({
        clerkId: user.id,
        name: user.fullName || "Anonymous",
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
      });
    }
  }, [user]);


  useEffect(() => {
    if (!user) return;
    updateLastSeen({ clerkId: user.id });
    const interval = setInterval(() => {
      updateLastSeen({ clerkId: user.id });
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSelectConversation = (conversationId: Id<"conversations">, selectedUser: any) => {
    setActiveConversation(conversationId);
    setOtherUser(selectedUser);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <SignedOut>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900">Chat App</h1>
              <p className="text-xl text-slate-600">Connect with friends instantly</p>
            </div>
            <div className="pt-4">
              <SignInButton mode="modal">
                <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className={`${activeConversation ? "hidden md:flex" : "flex"} w-80 flex-shrink-0 border-r border-slate-200 bg-white`}>
          <Sidebar onSelectConversation={handleSelectConversation} />
        </div>
        <main className="flex-1 flex bg-white">
          {activeConversation && otherUser ? (
            <ChatArea
              conversationId={activeConversation}
              otherUser={otherUser}
              onBack={() => {
                setActiveConversation(null);
                setOtherUser(null);
              }}
            />
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-slate-500">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Select a chat to start messaging</p>
                <p className="text-sm">Pick a friend from the sidebar or start a new conversation</p>
              </div>
            </div>
          )}
        </main>
      </SignedIn>
    </div>
  );
}