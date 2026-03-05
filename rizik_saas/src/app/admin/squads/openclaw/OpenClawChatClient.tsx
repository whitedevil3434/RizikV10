"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { sendOpenClawCommand, clearOpenClawLogs } from "@/lib/actions/openclaw";
import { createBrowserClient } from "@supabase/ssr";
import { PaperAirplaneIcon, TrashIcon, CpuChipIcon } from "@heroicons/react/24/solid";

type Message = {
    id: string;
    sender: "USER" | "OPENCLAW" | "ANTIGRAVITY";
    msg_type: "COMMAND" | "LOG" | "ERROR" | "SUCCESS" | "CHAT";
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
};

export default function OpenClawChatClient({
    initialMessages,
    userRole
}: {
    initialMessages: Message[];
    userRole: string;
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isPending, startTransition] = useTransition();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize Supabase correctly for Client Components according to @supabase/ssr docs
    // We only need the URL and ANON key to connect to the public channel (RLS protects data)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    useEffect(() => {
        const supabase = createBrowserClient(supabaseUrl, supabaseKey);

        const channel = supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'rizik_openclaw_comms',
                },
                (payload) => {
                    setMessages((current) => [...current, payload.new as Message]);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'rizik_openclaw_comms',
                },
                () => {
                    // Refresh completely on clear to sync state
                    window.location.reload();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsConnected(true);
                else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setIsConnected(false);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabaseUrl, supabaseKey]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const cmd = input;
        setInput(""); // clear immediately for UX

        startTransition(async () => {
            await sendOpenClawCommand(cmd, { source: "web_ui" });
        });
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear agent logs?")) {
            startTransition(async () => {
                await clearOpenClawLogs();
            });
        }
    };

    const isAdmin = ["SUPER_ADMIN", "PRODUCTION_MANAGER"].includes(userRole);

    return (
        <div className="flex flex-col h-full bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-2xl border border-white/10 font-mono">

            {/* Header */}
            <div className="bg-[#0D0D0D] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <CpuChipIcon className="w-8 h-8 text-[#00B16A]" />
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0D0D0D] ${isConnected ? 'bg-[#00B16A]' : 'bg-red-500 animate-pulse'}`}></span>
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg leading-tight uppercase tracking-wider">OpenClaw Agent</h2>
                        <p className="text-[#00B16A] text-xs">● Local Printer Bridge (Epson L8050) {isConnected ? 'Online' : 'Reconnecting...'}</p>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={handleClear} disabled={isPending} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-red-400 transition-colors" title="Clear Logs">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/30 text-sm">
                        Waiting for agent uplink...
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isUser = msg.sender === "USER";
                        const isError = msg.msg_type === "ERROR";
                        const isSuccess = msg.msg_type === "SUCCESS";
                        const isCommand = msg.msg_type === "COMMAND";

                        return (
                            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 ${isUser ? 'bg-[#2A2A2A] text-white rounded-tr-sm border border-white/10' :
                                    isError ? 'bg-red-950/50 text-red-400 border border-red-900/50 rounded-tl-sm' :
                                        isSuccess ? 'bg-[#00B16A]/10 text-[#00B16A] border border-[#00B16A]/20 rounded-tl-sm' :
                                            isCommand ? 'bg-purple-900/20 text-purple-300 border border-purple-500/20 rounded-tl-sm' :
                                                'bg-[#0D0D0D] text-green-400 border border-green-500/20 rounded-tl-sm' // Terminal style for logs
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase tracking-wider">
                                        <span>{isUser ? ((msg.metadata?.user_email as string) || "User") : msg.sender}</span>
                                        <span>•</span>
                                        <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                                        {msg.msg_type !== "CHAT" && (
                                            <>
                                                <span>•</span>
                                                <span className={isError ? "text-red-400 font-bold" : ""}>[{msg.msg_type}]</span>
                                            </>
                                        )}
                                    </div>
                                    <div className={`whitespace-pre-wrap text-sm ${!isUser && 'font-mono'}`}>
                                        {msg.content}
                                    </div>

                                    {/* Show metadata payload if OpenClaw sends it (like print job IDs) */}
                                    {!isUser && msg.metadata && Object.keys(msg.metadata).length > 0 && msg.metadata.source !== "web_ui" && (
                                        <div className="mt-2 pt-2 border-t border-current/10 text-[10px] opacity-70 break-all">
                                            {JSON.stringify(msg.metadata)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            {isAdmin ? (
                <div className="p-4 bg-[#0D0D0D] border-t border-white/10">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-end gap-2"
                    >
                        <div className="flex-1 bg-[#1A1A1A] rounded-xl border border-white/10 focus-within:border-[#00B16A] overflow-hidden transition-colors">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Type a print command (e.g., 'Print 50x Physics Mats')..."
                                className="w-full bg-transparent text-white p-3 md:p-4 outline-none resize-none min-h-[60px] max-h-[120px] text-sm"
                                rows={1}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isPending}
                            className="bg-[#00B16A] text-[#031E49] p-4 rounded-xl font-bold hover:bg-[#00D17D] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-white/30 mt-2">
                        Commands sent here are dispatched to the local Mac Mini executing the Python Agent.
                    </p>
                </div>
            ) : (
                <div className="p-4 bg-red-950/20 text-red-500 text-center text-sm border-t border-red-900/30">
                    You do not have authorization to command the OpenClaw Agent.
                </div>
            )}
        </div>
    );
}
