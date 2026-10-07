import { useState, useRef, useEffect } from 'react';

const CHUNK_SIZE = 16384;
const MAX_BUFFER = 1024 * 1024; // pause sending when 1MB is queued

export function useFileTransfer(dataChannel) {
    const [progress, setProgress] = useState(0);
    const [transferStatus, setTransferStatus] = useState('Idle');
    const [receivedFileUrl, setReceivedFileUrl] = useState(null);
    const [receivedFileName, setReceivedFileName] = useState('');

    const metaRef = useRef(null);
    const chunksRef = useRef([]);
    const receivedSizeRef = useRef(0);

    // SENDER
    const sendFile = async (file) => {
        if (!dataChannel || dataChannel.readyState !== 'open') return;

        setTransferStatus('Sending');
        setProgress(0);
        dataChannel.send(
            JSON.stringify({
                type: 'file-meta',
                metadata: { name: file.name, size: file.size, type: file.type },
            })
        );

        dataChannel.bufferedAmountLowThreshold = MAX_BUFFER / 4;
        let offset = 0;
        while (offset < file.size) {
            // Backpressure: wait if the channel buffer is full (prevents big files from failing)
            if (dataChannel.bufferedAmount > MAX_BUFFER) {
                await new Promise((resolve) => {
                    dataChannel.onbufferedamountlow = () => {
                        dataChannel.onbufferedamountlow = null;
                        resolve();
                    };
                });
            }
            if (dataChannel.readyState !== 'open') return setTransferStatus('Idle');
            const chunk = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
            dataChannel.send(chunk);
            offset += chunk.byteLength;
            setProgress(Math.round((offset / file.size) * 100));
        }
        dataChannel.send(JSON.stringify({ type: 'file-done' }));
        setProgress(100);
        setTransferStatus('Sent');
    };

    // RECEIVER
    useEffect(() => {
        if (!dataChannel) return;

        dataChannel.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const message = JSON.parse(event.data);

                if (message.type === 'file-meta') {
                    metaRef.current = message.metadata;
                    chunksRef.current = [];
                    receivedSizeRef.current = 0;
                    setReceivedFileUrl(null);
                    setReceivedFileName(message.metadata.name);
                    setProgress(0);
                    setTransferStatus('Receiving');
                } else if (message.type === 'file-done') {
                    const blob = new Blob(chunksRef.current, { type: metaRef.current.type });
                    setReceivedFileUrl(URL.createObjectURL(blob));
                    setProgress(100);
                    setTransferStatus('Received');
                }
            } else {
                chunksRef.current.push(event.data);
                receivedSizeRef.current += event.data.byteLength;
                if (metaRef.current?.size) {
                    setProgress(Math.round((receivedSizeRef.current / metaRef.current.size) * 100));
                }
            }
        };

        return () => {
            dataChannel.onmessage = null;
        };
    }, [dataChannel]);

    return { sendFile, progress, transferStatus, receivedFileUrl, receivedFileName };
}