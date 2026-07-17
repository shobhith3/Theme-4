"use client";

import { useState, useTransition } from "react";
import { X, Bot, User, Send, BrainCircuit } from "lucide-react";
import { askAssistant } from "@/app/actions/chat-actions";

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiAssistantDrawer({ isOpen, onClose }: AiAssistantDrawerProps) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hi! I'm ProcureIQ Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isPending) return;

    const userMessage = input.trim();
    const newMessages: { role: "user" | "ai"; content: string }[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      try {
        const responseText = await askAssistant(newMessages);
        setMessages(prev => [...prev, { role: "ai", content: responseText }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again." }]);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
      <div className="w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-intelligence)] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-text-primary">ProcureIQ Assistant</span>
              <span className="text-[11px] text-text-secondary">AI Procurement Expert</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-full text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#FAFAFA]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-black text-white" : "bg-[var(--color-intelligence)] text-white"}`}>
                {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === "user" 
                  ? "bg-black text-white rounded-tr-sm" 
                  : "bg-white border border-border shadow-sm text-text-primary rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isPending && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-intelligence)] text-white">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-white border border-border shadow-sm rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[42px]">
                <div className="w-1.5 h-1.5 bg-border-strong rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-border-strong rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-border-strong rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-border">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask about inventory or suppliers..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full pl-4 pr-12 py-3 bg-surface border border-border rounded-xl text-[13px] focus:outline-none focus:border-text-muted focus:ring-1 focus:ring-text-muted transition-shadow"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isPending}
              className="absolute right-2 p-2 bg-black text-white rounded-lg disabled:opacity-50 hover:bg-black/90 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-text-muted">AI can make mistakes. Check important information.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
