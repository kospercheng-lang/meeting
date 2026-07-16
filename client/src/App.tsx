import { useEffect, useState } from "react";
import { socket } from "./socket";
import type { RoomState } from "./types";
import Home from "./components/Home";
import Room from "./components/Room";

function App() {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [mySocketId, setMySocketId] = useState("");

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setConnected(true);
      setMySocketId(socket.id ?? "");
    }
    function onDisconnect() {
      setConnected(false);
    }
    function onRoomUpdate(update: RoomState) {
      setRoom(update);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:update", onRoomUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:update", onRoomUpdate);
    };
  }, []);

  if (!room) {
    return <Home connected={connected} onEnterRoom={(r) => setRoom(r)} />;
  }

  return <Room room={room} mySocketId={mySocketId} />;
}

export default App;
