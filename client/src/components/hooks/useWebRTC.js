import { useEffect, useState } from 'react';
import { socket } from '../../socket';

const ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function useWebRTC(roomId) {
    const [status, setStatus] = useState('Waiting for peer');
    const [dataChannel, setDataChannel] = useState(null);

    useEffect(() => {
        let pc = null;
        let pendingCandidates = [];

        const attachChannel = (conn, channel) => {
            channel.binaryType = 'arraybuffer';
            channel.onopen = () => {
                if (conn !== pc) return;
                setDataChannel(channel);
                setStatus('Connected');
            };
            channel.onclose = () => {
                if (conn !== pc) return;
                setDataChannel(null);
                setStatus('Peer disconnected');
            };
            if (channel.readyState === 'open') channel.onopen();
        };

        const createPc = () => {
            if (pc) pc.close();
            pendingCandidates = [];
            setDataChannel(null);

            const conn = new RTCPeerConnection(ICE_CONFIG);
            pc = conn;
            setStatus('Connecting...');

            conn.onicecandidate = (e) => {
                if (e.candidate) socket.emit('ice-candidate', { roomId, candidate: e.candidate });
            };
            conn.ondatachannel = (e) => attachChannel(conn, e.channel);
            conn.onconnectionstatechange = () => {
                if (conn !== pc) return;
                if (conn.connectionState === 'failed') setStatus('Connection failed');
            };
            return conn;
        };

        const flushCandidates = async () => {
            for (const c of pendingCandidates) {
                try { await pc.addIceCandidate(c); } catch (err) { console.error(err); }
            }
            pendingCandidates = [];
        };

        const onPeerJoined = async () => {
            const conn = createPc();
            attachChannel(conn, conn.createDataChannel('file-transfer'));
            const offer = await conn.createOffer();
            await conn.setLocalDescription(offer);
            socket.emit('offer', { roomId, offer });
        };

        const onOffer = async (offer) => {
            const conn = createPc();
            await conn.setRemoteDescription(offer);
            await flushCandidates();
            const answer = await conn.createAnswer();
            await conn.setLocalDescription(answer);
            socket.emit('answer', { roomId, answer });
        };

        const onAnswer = async (answer) => {
            if (!pc) return;
            await pc.setRemoteDescription(answer);
            await flushCandidates();
        };

        const onIce = async (candidate) => {
            if (!candidate || !pc) return;
            if (pc.remoteDescription) {
                try { await pc.addIceCandidate(candidate); } catch (err) { console.error(err); }
            } else {
                pendingCandidates.push(candidate);
            }
        };

        const onPeerLeft = () => {
            if (pc) pc.close();
            pc = null;
            setDataChannel(null);
            setStatus('Peer left. Waiting for peer');
        };

        // Handle the new room-full rejection event
        const onRoomFull = () => {
            setStatus('Room is full (Max 2 peers)');
        };

        socket.on('peer-joined', onPeerJoined);
        socket.on('offer', onOffer);
        socket.on('answer', onAnswer);
        socket.on('ice-candidate', onIce);
        socket.on('peer-left', onPeerLeft);
        socket.on('room-full', onRoomFull);

        socket.emit('join-room', roomId);

        return () => {
            socket.emit('leave-room', roomId);
            socket.off('peer-joined', onPeerJoined);
            socket.off('offer', onOffer);
            socket.off('answer', onAnswer);
            socket.off('ice-candidate', onIce);
            socket.off('peer-left', onPeerLeft);
            socket.off('room-full', onRoomFull);
            if (pc) pc.close();
            pc = null;
        };
    }, [roomId]);

    return { status, dataChannel };
}