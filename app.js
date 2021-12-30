import WebSocket from "ws";
import fetch from "node-fetch";

const EVENT_NAMES = {
  VOICE_STATE_UPDATE: "VOICE_STATE_UPDATE",
  READY: "READY",
};

const baseUrl = "https://discord.com/api";
const baseWebsocketUrl = "wss://gateway.discord.gg/?v=9&encoding=json";

const gatewayPath = "/gateway";


const ws = new WebSocket(baseWebsocketUrl);
const discordToken = process.argv[2];

const telegramBotToken = process.argv[3];

const inviteLink =
  "https://discord.com/api/oauth2/authorize?client_id=924677918351847435&scope=bot&permissions=1024";

const heartbeat = {
  op: 1,
  d: null,
};

let sessionId = null;

const identifyPayload = {
  op: 2,
  d: {
    token: discordToken,
    intents: 128,
    properties: {
      $os: "linux",
      $browser: "my_library",
      $device: "my_library",
    },
  },
};

ws.on("message", function message(data) {
  const payload = JSON.parse(data);
  const { op: opcode, d: eventData, s: sequenceNumber, t: eventName } = payload;

  console.log("Message received", payload);

  switch (opcode) {
    case 0:
      switch (eventName) {
        case EVENT_NAMES.READY:
          sessionId = eventData.session_id;
          break;
        case EVENT_NAMES.VOICE_STATE_UPDATE:
          fetch(
            getTokenizedQuery(
              "https://api.telegram.org/bot$/sendMessage?chat_id=362089091&text=Voice channel state update"
            )
          );
          break;
        default:
          console.log("Unknown eventName", eventName);
      }
    case 1:
      sendHeartbeat();
      break;
    case 7:
      ws.send({
        op: 6,
        d: {
          token: discordToken,
          session_id: sessionId,
          seq: heartbeat.d,
        },
      });
      break;
    case 10:
      processHelloMessage(eventData);
      identify();
      break;
    default:
      break;
  }

  if (sequenceNumber) {
    heartbeat.d = sequenceNumber;
  }
});

const processHelloMessage = (eventData) => {
  setInterval(sendHeartbeat, eventData.heartbeat_interval);
};

const identify = () => {
  ws.send(JSON.stringify(identifyPayload));
};

const sendHeartbeat = () => {
  ws.send(JSON.stringify(heartbeat));

  console.log("Heartbeat sent", heartbeat);
};

const getTokenizedQuery = (query) => {
  return query.replace("$", telegramBotToken);
};
