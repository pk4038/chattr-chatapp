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
    <div className="flex h-screen bg-gray-800">
      <SignedOut>
        <div className="m-auto">
          <SignInButton />
        </div>
      </SignedOut>
      <SignedIn>
        
          <div className={`${activeConversation ? "hidden md:flex" : "flex"} w-64 flex-shrink-0`}>
            <Sidebar onSelectConversation={handleSelectConversation} />
          </div>
          <main className="flex-1 flex">
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
              <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
                Select a user to start chatting
              </div>
            )}
          </main>
      </SignedIn>
    </div>
  );
}