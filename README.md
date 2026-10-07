# Droply

A peer-to-peer file sharing web app that lets you send files directly between browsers using WebRTC. Create a room, share the room code or link, and transfer files without uploading them to a central server.

## Features

- **One-click room creation** — create a unique room and start sharing instantly.
- **Peer-to-peer file sharing** — files are transferred directly between browsers using WebRTC.
- **Shareable room link** — share the complete room URL with another person to let them join directly.
- **Room code** — each room has a short 6-character code that can be shared manually.
- **No accounts required** — start sharing without signing up or logging in.
- **No file storage** — files are transferred between peers instead of being permanently stored on a server.
- **Transfer progress** — track the progress of files being sent or received.
- **Download received files** — save files received from another peer directly to your device.
- **Connection status** — shows when another peer has successfully connected.
- **Responsive UI** — works across desktop and mobile screen sizes.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript
- Lucide React

### Real-time Communication

- WebRTC
- WebRTC Data Channels

### Backend / Signaling

- Node.js
- Express
- WebSocket / Signaling Server

## Project Structure

```text
p2p-file-drop/
├── public/
│   └── droply.svg             # Application favicon
│
├── src/
│   ├── components/
│   │   ├── Room.jsx           # File sharing room UI
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useWebRTC.js       # WebRTC connection management
│   │   └── useFileTransfer.js # File transfer logic
│   │
│   ├── App.jsx                # Main application and room routing
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
│
├── index.html
├── package.json
└── ...