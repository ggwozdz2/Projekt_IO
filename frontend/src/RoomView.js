import React, { useEffect, useState } from "react";
import GameRoom from "./GameRoom";

function RoomView({ roomCode, nickname }) {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [userId, setUserId] = useState(null);
    const [ownerId, setOwnerId] = useState(null);
    const [isLobbyVisible, setLobbyVisible] = useState(true);
    const [isGameRoomVisible, setGameRoomVisible] = useState(false);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/room/${roomCode}/`);

        const handleOpen = () => {
            console.log("Connected to socket");
            if (userId == null) {
                console.log("Sending new-user msg");
                const message = {
                    type: 'user_joined',
                    nickname: nickname,
                };
                socket.send(JSON.stringify(message));
            }
        };

        const handleClose = () => {
            console.log("Disconnected from socket");
        };

        const handleBeforeunload = () => {
            if (userId != null) {
                const message = {
                    type: 'user_left',
                    user_id: userId,
                };
                socket.send(JSON.stringify(message));
            }
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data).payload;
            switch (data.event) {
                case 'connected_users':
                    setConnectedUsers(data.connected_users);
                    setOwnerId(data.owner_id);
                    if (userId == null)
                        setUserId(data.connected_users[data.connected_users.length - 1].id);

                    break;
                default:
                    break;
            }
        }

        window.addEventListener('beforeunload', handleBeforeunload);
        socket.addEventListener('open',       handleOpen);
        socket.addEventListener('close',      handleClose);
        socket.addEventListener('message',    handleMessage);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeunload);
            socket.removeEventListener('open',       handleOpen);
            socket.removeEventListener('close',      handleClose);
            socket.removeEventListener('message',    handleMessage);
            socket.close();
        }
    }, [nickname, roomCode, userId]);

    const handleStartGame = () => {
        setGameRoomVisible(true);
        setLobbyVisible(false);
    };

    return (
        <div id="join-room-section" className="text-center">
            <div className="container">
                {isLobbyVisible && (
                    <div id="join-room-section" className="text-center">
                        <h2 className="text-center">Room: { roomCode }</h2>
                        <ul>
                            {connectedUsers.map((user, index) => (
                                <li key={index}>{user.nickname}</li>
                            ))}
                        </ul>
                        <div className="text-center">
                            <button
                                type="button"
                                className="btn btn-primary mx-3"
                                id="create-room-btn"
                                onClick={handleStartGame}
                            >
                                Start Game
                            </button>
                        </div>
                    </div>
                )}

                {isGameRoomVisible && (
                    <GameRoom
                        connectedUsers={connectedUsers}
                    />
                )}
            </div>
        </div>
    );
}

export default RoomView;