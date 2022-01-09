import WebSocket from "ws";
import fetch from "node-fetch";
import { baseWebsocketUrl, telegramBaseUrl } from "./utils/requestUtils.js";
import { EVENT_NAMES, OPCODE } from "./utils/websocketUtils.js";

const discordToken = process.argv[2];
const telegramBotToken = process.argv[3];

const telegramChatIds = ["362089091"];

let ws;

const heartbeat = {
  op: 1,
  d: null,
};

let sessionId;
let heartbeatIntervalId;

const initializeConnection = () => {
  ws = new WebSocket(baseWebsocketUrl);

  ws.on("message", (body) => onWebsocketMessage(JSON.parse(body)));
}

const onWebsocketMessage = (payload) => {
  const { op: opcode, d: eventData, s: sequenceNumber, t: eventName } = payload;
  console.log("Message received", payload);

  switch (opcode) {
    case OPCODE.DISPATCH:
      processMessageDispatch(eventData, eventName);
      break;
    case OPCODE.HEARTBEAT:
      sendHeartbeat();
      break;
    case OPCODE.RECONNECT:
      processReconnectMessage();
      break;
    case OPCODE.INVALID_SESSION:
      identify();
      break;  
    case OPCODE.HELLO:
      processHelloMessage(eventData);
      break;
    default:
      break;
  }

  if (sequenceNumber) {
    heartbeat.d = sequenceNumber;
  }
};

const processReconnectMessage = () => {
  clearInterval(heartbeatIntervalId);
  ws.close();
  initializeConnection();

  // ws.send(JSON.stringify({
  //   op: 6,
  //   d: {
  //     token: discordToken,
  //     session_id: sessionId,
  //     seq: heartbeat.d,
  //   },
  // }));
};

const processMessageDispatch = (eventData, eventName) => {
  switch (eventName) {
    case EVENT_NAMES.READY:
      sessionId = eventData.session_id;
      break;
    case EVENT_NAMES.VOICE_STATE_UPDATE:
      processVoiceStateUpdate(eventData);
      break;
    default:
      console.log("Unknown eventName", eventName);
  }
};

const processHelloMessage = (eventData) => {
  heartbeatIntervalId = setInterval(sendHeartbeat, eventData.heartbeat_interval);
  identify();
};

const identify = () => {
  const identifyPayload = {
    op: 2,
    d: {
      token: discordToken,
      intents: 128,
      properties: {
        $os: "linux",
        $browser: "joincallback",
        $device: "joincallback",
      },
    },
  };

  ws.send(JSON.stringify(identifyPayload));
};

const sendHeartbeat = () => {
  ws.send(JSON.stringify(heartbeat));

  console.log("Heartbeat sent", heartbeat);
};

const processVoiceStateUpdate = (eventData) => {
  let messageContent = eventData.member.user.username + " ";
  if (eventData.channel_id) {
    messageContent += "joined voice channel";
  } else {
    messageContent += "leaved voice channel";
  }

  telegramChatIds.forEach((id) =>
    fetch(
      getTokenizedQuery(
        `${telegramBaseUrl}/sendMessage?chat_id=${id}&text=${messageContent}`
      )
    )
  );
};

const getTokenizedQuery = (query) => {
  return query.replace("$", telegramBotToken);
};


initializeConnection();