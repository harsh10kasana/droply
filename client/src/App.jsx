
import { useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import Room from './components/Room';

const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    return Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
};

export default function App() {
    const [roomId, setRoomId] = useState(
        () =>
            new URLSearchParams(window.location.search)
                .get('room')
                ?.toUpperCase() || null
    );

    const [inputRoomId, setInputRoomId] = useState('');

    const enterRoom = (code) => {
        window.history.replaceState(null, '', `?room=${code}`);
        setRoomId(code);
    };

    const handleLeave = () => {
        window.history.replaceState(null, '', window.location.pathname);
        setRoomId(null);
    };

    const handleJoin = (e) => {
        e.preventDefault();

        const code = inputRoomId.trim().toUpperCase();

        if (code) {
            enterRoom(code);
        }
    };

    if (roomId) {
        return <Room roomId={roomId} onLeave={handleLeave} />;
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-6 overflow-hidden">

            {/* Background glow */}
            <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-brand/10 blur-3xl pointer-events-none" />

            <main className="relative w-full max-w-md">

                {/* Main Card */}
                <div className="bg-surface/95 backdrop-blur-xl border border-line rounded-[1.75rem] p-6 sm:p-8 shadow-[0_20px_60px_rgba(18,21,28,0.08)]">

                    {/* Brand Header */}
                    <div className="flex items-center justify-between mb-8">

                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/20">
                                <Zap
                                    size={18}
                                    fill="currentColor"
                                />
                            </div>

                            <span className="font-display text-xl font-extrabold tracking-tight">
                                Droply
                            </span>
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted bg-paper border border-line px-2.5 py-1.5 rounded-full">
                            P2P Sharing
                        </span>

                    </div>

                    {/* Heading */}
                    <div className="mb-6">

                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                            Send files.
                            <br />
                            <span className="text-brand">
                                No friction.
                            </span>
                        </h1>

                        <p className="text-muted mt-3 text-sm leading-relaxed">
                            Send files directly between browsers.
                            <br />
                            No uploads. No accounts.
                        </p>

                    </div>

                    {/* Create Room */}
                    <button
                        onClick={() => enterRoom(generateRoomCode())}
                        className="group w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all cursor-pointer shadow-md shadow-brand/20 flex items-center justify-center gap-2"
                    >
                        Create a room

                        <ArrowRight
                            size={17}
                            className="group-hover:translate-x-0.5 transition-transform"
                        />
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">

                        <div className="flex-1 h-px bg-line" />

                        <span className="text-[10px] text-muted font-semibold tracking-wider">
                            OR
                        </span>

                        <div className="flex-1 h-px bg-line" />

                    </div>

                    {/* Join Room */}
                    <form onSubmit={handleJoin}>

                        <div className="flex gap-2">

                            <input
                                type="text"
                                aria-label="Room code"
                                placeholder="Enter room code"
                                maxLength={6}
                                value={inputRoomId}
                                onChange={(e) =>
                                    setInputRoomId(e.target.value)
                                }
                                className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-paper border border-line focus:border-brand focus:outline-none text-sm font-mono tracking-[0.2em] uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-muted/60"
                            />

                            <button
                                type="submit"
                                disabled={!inputRoomId.trim()}
                                className="px-5 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-ink/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Join
                            </button>

                        </div>

                    </form>

                </div>

                {/* Minimal footer */}
                <p className="text-center text-[11px] text-muted mt-4">
                    Direct browser-to-browser file transfer
                </p>

            </main>

        </div>
    );
}
