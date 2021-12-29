import WebSocket from "ws";
import * as https from "https";
import fetch from "node-fetch";

const baseUrl = "https://discord.com/api";
const baseWebsocketUrl = "wss://gateway.discord.gg/?v=9&encoding=json";

const gatewayPath = "/gateway";

// const response = await fetch(baseUrl + gatewayPath);
// const data = await response.json();

// TODO: Implement resume connection feature in case of failures.
const ws = new WebSocket(baseWebsocketUrl);
const token = "OTI0Njc3OTE4MzUxODQ3NDM1.YciDaw.V-hrw_4MNeSHdeeBoE1Hpa2VZzA";

const telegramBotToken = '5012802656:AAEfnQ3YQMxfeOK75G-UdaZrW6NZ7v5Otmg';

const inviteLink =
  "https://discord.com/api/oauth2/authorize?client_id=924677918351847435&scope=bot&permissions=1024";

const heartbeat = {
  op: 1,
  d: null,
};

let pingInterval = 0;
let intervalId;

const identifyPayload = {
  op: 2,
  d: {
    token: token,
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
  const { op: opcode, d: eventData, s: sequenceNumber } = payload;

  console.log("Message received", payload);

  switch (opcode) {
    case 0:
      fetch(getTokenizedQuery("https://api.telegram.org/bot$/sendMessage?chat_id=362089091&text=Voice channel state update"));
    case 1:
      sendHeartbeat();
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
  console.log("Hello message processed", eventData);

  pingInterval = eventData.heartbeat_interval;

  setInterval(sendHeartbeat, eventData.heartbeat_interval);
};

const identify = () => {
  ws.send(JSON.stringify(identifyPayload));
};

const sendHeartbeat = () => {
  ws.send(JSON.stringify(heartbeat));

  console.log("Heartbeat sent", heartbeat);
};

const getTokenizedQuery = query => {
  return query.replace("$", telegramBotToken);
}
