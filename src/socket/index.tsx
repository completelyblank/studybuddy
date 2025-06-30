import { io } from "socket.io-client";
const socket = io(); // Defaults to current origin

export default socket;
