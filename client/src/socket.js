import { io } from 'socket.io-client';

// Use the same host the page was opened from, so links work from other devices too
const SOCKET_URL = `http://${window.location.hostname}:3000`;

export const socket = io(SOCKET_URL, { autoConnect: true });