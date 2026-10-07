import { io } from 'socket.io-client';

// If on localhost or a local Wi-Fi IP, use the local port 3000. 
// Otherwise (when deployed on Vercel), use the live Render server.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname.match(/^\d/);

const SOCKET_URL = isLocal 
    ? `http://${window.location.hostname}:3000` 
    : 'https://droply-server-xxrx.onrender.com'; 

export const socket = io(SOCKET_URL, { autoConnect: true });