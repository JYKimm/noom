const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");//room name
const room = document.getElementById("room");//message

room.hidden = true;
let roomName;

function hMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    console.log("say:", value);
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value="";
}

function hNameSubmit(event){
    event.preventDefault(); 
    const input = room.querySelector("#name input");
    const value = input.value;
    console.log("name:", value);
    socket.emit("nickname", value);
    input.value="";
}

function showRoom(){
    welcome.hidden=true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");//message
    const nameForm = room.querySelector("#name");//name
    msgForm.addEventListener("submit", hMessageSubmit);//message submit
    nameForm.addEventListener("submit", hNameSubmit);//name submit
}

function hRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

form.addEventListener("submit", hRoomSubmit);


socket.on("welcome", (user)=>{
    addMessage(`${user} joined`);
});
socket.on("bye", (user)=>{
    addMessage(`${user} left`);
});
// socket.on("new_message", (message)=>{
//     addMessage(message);
// });
socket.on("new_message", addMessage);