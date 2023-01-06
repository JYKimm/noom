import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

// 뷰엔진을 퍼그로 설정하고, 뷰 경로를 설정.
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// 프론트엔드코드(퍼블릭코드) 설정 (app.js)
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));// 유저가 보는 퍼블릭코드 
app.get("/*", (req, res) => res.redirect("/"));//catchall 무조건 이리 보냄

const handleListen = () => console.log('Listening on http://localhost:3000'); 
// app.listen(3200, handleListen);

const server = http.createServer(app);//http server from express
const wss = new WebSocket.Server({ server });//http, websocket server 둘다 만듬

const sockets =[];

wss.on("connection", (socket) => {//socket = 연결된 브라우저
    sockets.push(socket);
    console.log(sockets.length)
    console.log("connected to BROWSER");
    socket.on("close", ()=>{
        // sockets.pop(socket);
        console.log("Disconnected from BROWSER");
    });
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
          case "new_message":
            sockets.forEach((aSocket) =>
              aSocket.send(`${socket.nickname}: ${message.payload}`)
            );
          case "nickname":
            socket["nickname"] = message.payload;
        }
      });
});

server.listen(3000, handleListen);