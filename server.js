require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const telegraf = require("./telegram");
const app = express();
const helpers = require("./helpers");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const getMovimientos = async () => {
  const parseCookie = (str) =>
    str
      .split(";")
      .map((v) => v.split("="))
      .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      }, {});

  const response = await axios.post(
    "https://online.bbva.com.ar/fnetcore/servicios/cliente/productos/cuentas/movimientos",
    {
      idProducto: process.env.PROD_ID,
    },
    {
      params: {
        ts: `${new Date().getTime()}`,
      },
      headers: {
        authority: "online.bbva.com.ar",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
        "x-xsrf-token": process.env.XSRF_TOKEN,
        "sec-ch-ua-mobile": "?0",
        "timestamp-uid": "2022-08-03T16:27:12-0300",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
        "content-type": "application/json;charset=UTF-8",
        accept: "application/json, text/plain, */*",
        uid: process.env.UID,
        "sec-ch-ua-platform": '"Windows"',
        origin: "https://online.bbva.com.ar",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        referer: "https://online.bbva.com.ar/fnetcore/",
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
        cookie: process.env.COOKIE,
      },
    }
  );
  //console.log("DATA", response.data.result);
  return response.data.result.movimientos;
};
telegraf.launch();
let lastMovement;
const showMovements = async () => {
  const movements = await getMovimientos();

  if (lastMovement) {
    let newMovements = helpers.getNewMovements(lastMovement, movements);
    if (newMovements.length > 0) {
      console.log("NEW_MOV", newMovements);
      newMovements.reverse().map((mov) => {
        telegraf.telegram.sendMessage(
          process.env.CHAT_ID,
          `🏦Banco BBVA: Nuevo Movimiento❗️  Transferencia:$${mov.importe}`,
          { parse_mode: "MarkdownV2" }
        );
      });
      lastMovement = newMovements[0];
    }
  } else {
    lastMovement = movements[0];
  }

  console.log(lastMovement);
};

setInterval(showMovements, 10000);

app.listen(3000, () => {
  console.log("Serve Listening on PORT:3000");
});
