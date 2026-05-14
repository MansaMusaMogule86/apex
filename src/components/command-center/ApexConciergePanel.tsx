"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

const QUICK_PROMPTS = [
  "What's driving luxury sentiment this week?",
  "Recommend a founder authority play for Q3",
  "Analyze competitor positioning in Palm Jumeirah",
  "How do I improve HNWI conversion rates?",
];

const SILK = [0.16, 1, 0.3, 1] as const;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gold/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: SILK }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {!isUser && (
        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
          <Sparkles className="h-3 w-3 text-gold" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-[2px] px-3 py-2.5 text-sm leading-6",
          isUser
            ? "border border-white/15 bg-white/[0.07] text-warm-white"
            : "border border-gold/15 bg-gold/[0.06] text-beige",
        )}
      >
        {message.streaming && !message.content ? (
          <TypingIndicator />
        ) : (
          <span>
            {message.content}
            {message.streaming && (
              <motion.span
                className="ml-0.5 inline-block h-3.5 w-0.5 bg-gold/70"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </span>
        )}
      </div>
    </motion.div>
  );
}

type ConciergeProps = {
  open: boolean;
  onClose: () => void;
};

export default function ApexConciergePanel({ open, onClose }: ConciergeProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "APEX Concierge online. I have full visibility into your market signals, lead intelligence, and strategic pipeline. How can I assist?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsLoading(true);

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch("/api/ai/concierge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, stream: true }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") break;

            try {
              const parsed = JSON.parse(raw) as { delta?: string };
              if (parsed.delta) {
                accumulated += parsed.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulated }
                      : m,
                  ),
                );
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, streaming: false, content: accumulated || m.content }
              : m,
          ),
        );
      } catch (err) {
        const errorText =
          err instanceof Error ? err.message : "The concierge is temporarily unavailable.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  streaming: false,
                  content: `Unable to connect to the AI engine. ${errorText}`,
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            className="fixed bottom-4 right-4 z-50 flex h-[620px] w-[420px] max-h-[90dvh] max-w-[96vw] flex-col rounded-[2px] border border-gold/20 bg-[#0e0c09] shadow-2xl shadow-black/60"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: SILK }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold/15 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
                    APEX Concierge
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist">
                    Strategic AI Advisor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-white/10 text-mist hover:border-white/25 hover:text-warm-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="border-t border-white/8 px-4 py-3">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-mist">
                  Quick intelligence requests
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-[2px] border border-white/10 bg-white/[0.03] px-2.5 py-1 text-left text-xs text-titanium transition-colors hover:border-gold/25 hover:text-warm-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the concierge..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-warm-white placeholder-mist/50 outline-none focus:border-gold/35 focus:ring-0 disabled:opacity-50"
                  style={{ minHeight: "40px", maxHeight: "100px" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
                  }}
                />
                <button
                  type="button"
                  onClick={() => void sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border transition-all duration-200",
                    input.trim() && !isLoading
                      ? "border-gold/40 bg-gold/[0.12] text-gold hover:bg-gold/20"
                      : "border-white/10 bg-white/[0.03] text-mist",
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-mist/40">
                Powered by APEX Intelligence Engine · Enter to send
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
