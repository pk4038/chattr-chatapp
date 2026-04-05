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
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    <div className="flex h-screen bg-white">
      <SignedOut>
        <div className="flex-1 flex flex-col bg-white">
          {/* Navbar */}
          <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-blue-500">Chattr</h1>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors duration-200">
                Get Started
              </button>
            </SignInButton>
          </nav>

          {/* Hero Section */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-3xl space-y-8">
              {/* Heading and Subheading */}
              <div className="text-center space-y-6">
                <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-black leading-tight">
                  Chat in real time. No delays. No clutter.
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Chattr is a fast, minimal 1:1 messaging app with typing indicators, read receipts, and instant message delivery.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center pt-4">
                <SignInButton mode="modal">
                  <button className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors duration-200">
                    Try Chattr
                  </button>
                </SignInButton>
              </div>

              {/* Chat Mockup */}
              <div className="pt-8 w-full max-w-md mx-auto">
                <div className="rounded-2xl bg-gray-900 p-6 shadow-lg border border-gray-800">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-white">Elena</p>
                        <p className="text-xs text-gray-400">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3">
                    {/* Message 1 - Received */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="bg-gray-800 rounded-lg p-3 w-fit">
                          <p className="text-sm text-gray-100">Hey, ready to test the new chat flow?</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Delivered</p>
                      </div>
                    </div>

                    {/* Message 2 - Sent */}
                    <div className="flex justify-end gap-3">
                      <div className="flex-1 text-right">
                        <div className="bg-blue-500 rounded-lg p-3 w-fit ml-auto">
                          <p className="text-sm text-white">Looks great. I can already feel how fast this is.</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <p className="text-xs text-gray-400">Seen</p>
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Typing Indicator */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="bg-gray-800 rounded-lg p-3 w-fit">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0s" }} />
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Typing...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className={`flex w-full h-screen ${isDarkMode ? "bg-slate-950" : "bg-white"}`}>
          {/* Theme Toggle Button */}
          <div className={`absolute top-3 right-4 z-10 ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"} border rounded-full p-1 transition-colors`}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>

          <div className={`${activeConversation ? "hidden md:flex" : "flex"} w-80 flex-shrink-0 ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"} border-r transition-colors`}>
            <Sidebar onSelectConversation={handleSelectConversation} isDarkMode={isDarkMode} />
          </div>
          <main className={`flex-1 flex ${isDarkMode ? "bg-slate-950" : "bg-white"} transition-colors`}>
            {activeConversation && otherUser ? (
              <ChatArea
                conversationId={activeConversation}
                otherUser={otherUser}
                onBack={() => {
                  setActiveConversation(null);
                  setOtherUser(null);
                }}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className={`hidden md:flex flex-1 items-center justify-center ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                <div className="text-center space-y-2">
                  <p className={`text-lg font-medium ${isDarkMode ? "text-slate-300" : "text-slate-900"}`}>Select a chat to start messaging</p>
                  <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Pick a friend from the sidebar or start a new conversation</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </SignedIn>
    </div>
  );
}