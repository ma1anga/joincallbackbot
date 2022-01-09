import fetch from "node-fetch";

export const discordBaseUrl = "https://discord.com/api";
export const telegramBaseUrl = "https://api.telegram.org/bot$";
export const baseWebsocketUrl = "wss://gateway.discord.gg/?v=9&encoding=json";
export const inviteLink =
  "https://discord.com/api/oauth2/authorize?client_id=924677918351847435&scope=bot&permissions=1024";

export const getGuildById = (guildId) => {
  const headers = {
    Authorization: `Bot ${process.argv[2]}`,
  };

  return fetch(discordBaseUrl + `/guilds/${guildId}/preview`, { headers }).then((res) => res.json());
};

export const getGuildChannels = (guildId) => {
  const headers = {
    Authorization: `Bot ${process.argv[2]}`,
  };

  return fetch(discordBaseUrl + `/guilds/${guildId}/channels`, { headers }).then((res) => res.json());
};
