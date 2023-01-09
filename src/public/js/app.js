const socket = io();
const myFace = document.getElementById("myFace");
const muteBtm = document.getElementById("mute");
const cameraBtm = document.getElementById("camera");


let myStream;
let muted = false;
let cameraOff = false;

async function getMedia(){
    try{
        myStream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video: true,
        });
        // console.log(myStream);
        myFace.srcObject = myStream;
    } catch(e){
        console.log(e);
    }
}

getMedia();

function hMuteBtnClick(){
    if(!muted){
        muteBtm.innerText = "Unmute"
        muted=true;
    }
    else{
        muteBtm.innerText = "Mute"
        muted=false;
    }
}

function hCameraBtnClick(){
    if(cameraOff){
        cameraBtm.innerText = "Camera Off"
        cameraOff = false;
    }
    else{
        cameraBtm.innerText = "Camera On"
        cameraOff = true;
    }
}



muteBtm.addEventListener("click", hMuteBtnClick);
cameraBtm.addEventListener("click", hCameraBtnClick);