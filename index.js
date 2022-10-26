const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, GroupChat } = require("whatsapp-web.js");

const client = new Client();
const groupchat = new GroupChat();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// let groupname = async () => await GroupChat.getChatLabels();

// let groupname2 = GroupChat.client.on("message", (message) => {
//   console.log(`${groupname}`, message.body);
// });

client.on("message", async (msg) => {
  let number = msg.body.split(" ")[1];
  let messageIndex = msg.body.indexOf(number) + number.length;
  let message = msg.body.slice(messageIndex, msg.body.length);
  number = number.includes("@c.us") ? number : `${number}@c.us`;
  let chat = await msg.getChat();
  chat.sendSeen();
  client.sendMessage(number, message);
});

client.on("ready", () => {
  client.sendMessage("+543472502817", "HOLA BEBOTA");
  console.log();
});

client.initialize();
