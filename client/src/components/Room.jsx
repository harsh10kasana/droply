
import { useState } from 'react';
import {
    Copy,
    Check,
    Upload,
    Download,
    File as FileIcon,
    X,
    Link2,
    LogOut,
    Zap,
} from 'lucide-react';

import { useWebRTC } from './hooks/useWebRTC';
import { useFileTransfer } from './hooks/useFileTransfer';

const formatSize = (b) =>
    b < 1024
        ? `${b} B`
        : b < 1048576
          ? `${(b / 1024).toFixed(1)} KB`
          : `${(b / 1048576).toFixed(1)} MB`;

export default function Room({ roomId, onLeave }) {
    const { status, dataChannel } = useWebRTC(roomId);

    const {
        sendFile,
        progress,
        transferStatus,
        receivedFileUrl,
        receivedFileName,
    } = useFileTransfer(dataChannel);

    const [selectedFile, setSelectedFile] = useState(null);
    const [copied, setCopied] = useState('');

    const connected = !!dataChannel;

    const busy =
        transferStatus === 'Sending' ||
        transferStatus === 'Receiving';

    const roomUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

    const copy = async (text, key) => {
        await navigator.clipboard.writeText(text);

        setCopied(key);

        setTimeout(() => setCopied(''), 1500);
    };

    const handleSend = async () => {
        await sendFile(selectedFile);
        setSelectedFile(null);
    };

    return (
        <div className="min-h-screen relative overflow-hidden px-4 py-6 sm:py-10">

            {/* Background glow */}
            <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-brand/10 blur-3xl pointer-events-none" />

            <main className="relative w-full max-w-xl mx-auto">

                {/* Same Droply Header */}
                <div className="flex items-center justify-between mb-4 px-1">

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

                    <button
                        onClick={onLeave}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink hover:bg-surface border border-transparent hover:border-line transition-all cursor-pointer"
                    >
                        <LogOut size={14} />
                        Leave
                    </button>

                </div>

                {/* Room Card */}
                <div className="bg-surface/95 backdrop-blur-xl border border-line rounded-[1.75rem] p-6 sm:p-8 shadow-[0_20px_60px_rgba(18,21,28,0.08)]">

                    {/* Status */}
                    <div className="flex items-center justify-between mb-6">

                        <div className="flex items-center gap-3">

                            <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    connected
                                        ? 'bg-ok/10 text-ok'
                                        : 'bg-paper text-muted'
                                }`}
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                        connected
                                            ? 'bg-ok animate-pulse'
                                            : 'bg-muted/40'
                                    }`}
                                />
                            </div>

                            <div>
                                <p className="font-display font-bold text-sm">
                                    {connected
                                        ? 'Connected'
                                        : status}
                                </p>

                                <p className="text-xs text-muted mt-0.5">
                                    Room {roomId}
                                </p>
                            </div>

                        </div>

                        <span
                            className={`px-3 py-1.5 rounded-full text-[10px] font-semibold ${
                                connected
                                    ? 'bg-ok/10 text-ok'
                                    : 'bg-paper text-muted'
                            }`}
                        >
                            {connected ? 'Ready' : 'Waiting'}
                        </span>

                    </div>

                    {/* Share Room */}
                    <div className="rounded-2xl border border-line bg-paper/70 p-4 mb-5">

                        <div className="flex items-center justify-between mb-3">

                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                Share this room
                            </p>

                            <Link2
                                size={14}
                                className="text-brand"
                            />

                        </div>

                        {/* Room Code */}
                        <div className="flex gap-2 mb-2">

                            <div className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-surface border border-line font-mono font-bold tracking-[0.2em] text-sm text-center truncate">
                                {roomId}
                            </div>

                            <button
                                onClick={() => copy(roomId, 'code')}
                                className="shrink-0 w-11 rounded-xl bg-surface border border-line hover:border-brand hover:text-brand flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Copy room code"
                            >
                                {copied === 'code' ? (
                                    <Check size={16} />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>

                        </div>

                        {/* Room Link */}
                        <div className="flex gap-2">

                            <div className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-surface border border-line text-xs text-muted truncate">
                                {roomUrl}
                            </div>

                            <button
                                onClick={() => copy(roomUrl, 'link')}
                                className="shrink-0 w-11 rounded-xl bg-surface border border-line hover:border-brand hover:text-brand flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Copy room link"
                            >
                                {copied === 'link' ? (
                                    <Check size={16} />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>

                        </div>

                    </div>

                    {connected ? (
                        <div className="space-y-4">

                            {/* Upload */}
                            <label
                                htmlFor="fileInput"
                                className={`group flex flex-col items-center justify-center min-h-48 rounded-2xl border-2 border-dashed transition-all ${
                                    busy
                                        ? 'border-line opacity-50 cursor-not-allowed'
                                        : 'border-line hover:border-brand hover:bg-brand-soft/30 cursor-pointer'
                                }`}
                            >

                                <div className="h-12 w-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <Upload size={23} />
                                </div>

                                <p className="font-display font-bold text-sm">
                                    Choose a file to send
                                </p>

                                <p className="text-xs text-muted mt-1">
                                    Click here to browse your device
                                </p>

                                <input
                                    id="fileInput"
                                    type="file"
                                    className="sr-only"
                                    disabled={busy}
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setSelectedFile(
                                                e.target.files[0]
                                            );
                                        }
                                    }}
                                />

                            </label>

                            {/* Selected File */}
                            {selectedFile && !busy && (
                                <div className="p-3 rounded-2xl border border-brand/20 bg-brand-soft/40">

                                    <div className="flex items-center gap-3">

                                        <div className="h-10 w-10 rounded-xl bg-surface flex items-center justify-center text-brand shrink-0">
                                            <FileIcon size={19} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold truncate">
                                                {selectedFile.name}
                                            </p>

                                            <p className="text-xs text-muted mt-0.5">
                                                {formatSize(selectedFile.size)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setSelectedFile(null)
                                            }
                                            className="h-8 w-8 rounded-lg hover:bg-surface flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
                                            aria-label="Remove file"
                                        >
                                            <X size={16} />
                                        </button>

                                        <button
                                            onClick={handleSend}
                                            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors cursor-pointer"
                                        >
                                            Send
                                        </button>

                                    </div>

                                </div>
                            )}

                            {/* Progress */}
                            {transferStatus !== 'Idle' && (
                                <div className="rounded-2xl border border-line bg-paper p-4">

                                    <div className="flex justify-between items-center mb-2">

                                        <span className="text-sm font-semibold">
                                            {transferStatus}
                                        </span>

                                        <span className="text-xs text-muted font-mono">
                                            {progress}%
                                        </span>

                                    </div>

                                    <div className="h-2 rounded-full bg-line overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-brand transition-all duration-150"
                                            style={{
                                                width: `${progress}%`,
                                            }}
                                        />
                                    </div>

                                </div>
                            )}

                            {/* Received File */}
                            {receivedFileUrl && (
                                <div className="rounded-2xl border border-ok/20 bg-ok/5 p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="h-10 w-10 rounded-xl bg-ok/10 text-ok flex items-center justify-center shrink-0">
                                            <FileIcon size={19} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-ok font-semibold mb-0.5">
                                                File received
                                            </p>

                                            <p className="text-sm font-semibold truncate">
                                                {receivedFileName}
                                            </p>
                                        </div>

                                        <a
                                            href={receivedFileUrl}
                                            download={receivedFileName}
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ink hover:bg-ink/85 text-white text-sm font-semibold transition-colors"
                                        >
                                            <Download size={16} />
                                            Save
                                        </a>

                                    </div>

                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="rounded-2xl bg-paper border border-line p-7 text-center">

                            <div className="h-11 w-11 mx-auto rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-3">
                                <Link2 size={19} />
                            </div>

                            <p className="font-display font-bold text-sm">
                                Waiting for your peer
                            </p>

                            <p className="text-xs text-muted mt-1 max-w-xs mx-auto leading-relaxed">
                                Share the room code or link above.
                                File sharing will appear once they join.
                            </p>

                        </div>
                    )}

                </div>

                <p className="text-center text-[10px] text-muted mt-4">
                    Direct browser-to-browser transfer
                </p>

            </main>

        </div>
    );
}
