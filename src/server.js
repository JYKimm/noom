import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

// 뷰엔진을 퍼그로 설정하고, 뷰 경로를 설정.
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// 프론트엔드코드(퍼블릭코드) 설정 (app.js)
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));// 유저가 보는 퍼블릭코드 
app.get("/*", (req, res) => res.redirect("/"));//catchall 무조건 이리 보냄

const httpServer = http.createServer(app);//http server from express
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket=>{
    socket.on("join_room", (roomName)=>{//나중에 들어온쪽이 실행
        socket.join(roomName);
        // console.log(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName)=>{
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName)=>{
        socket.to(roomName).emit("answer", answer);
    });
});

const handleListen = () => console.log('Listening on http://localhost:3000'); 
httpServer.listen(3000, handleListen);