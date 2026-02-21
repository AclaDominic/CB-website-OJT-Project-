import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosClient from "./axios";

window.Pusher = Pusher;
Pusher.logToConsole = true;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? 8080),
  wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? 8080),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
  enabledTransports: ["ws", "wss"],
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        axiosClient
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(false, response.data);
          })
          .catch((error) => {
            callback(true, error);
          });
      },
    };
  },
});

window.Echo = echo;

export default echo;
