//@ts-nocheck
let Fullscreen = false;

//AUDIO
let soundAufwachen;
let soundKnarren;

//VIDEO
//schlafendes Monster
let videoStart;
//sich bewegendes Monster
let videoSchnarchen;
//Wütendes Monster (Verloren)
let videoCow;
//Sandwich (Gewonnen)
let videoSandwich;

let currentVideo;

function preload() {
  soundAufwachen = loadSound("assets/monster_roar.mp3");
  soundKnarren = loadSound("assets/knarren.mp3");
  //VIDEO
  videoStart = createVideo("assets/start.mp4");
  videoSchnarchen = createVideo("assets/schnarchen.mp4");
  videoCow = createVideo("assets/cow.mp4");
  videoSandwich = createVideo("assets/sandwich.mp4");
}

let serverUrl = "";
let scheme = "ws";
const { location: loc } = document;
const params = new URLSearchParams(loc.search);
const channel = params.get("channel") ?? "little-creatures";
if (loc.protocol === "https:") {
  scheme += "s";
}
serverUrl = `${scheme}://${loc.hostname}:${loc.port}`;

const ws = new WebSocket(`${serverUrl}/ws/little-creatures`);
ws.onmessage = function (event) {
  try {
    const data = JSON.parse(event.data);
    const { measurements } = data;
    console.log(measurements);
    // 0 = start
    // 1 = knarren
    // 2 = schnarchen
    // 3 = aufwachen
    // 4 = gewonnen

    if (measurements[0] === 1) {
      aufwachen();
    }
    if (measurements[1] === 1) {
      start();
    }
    if (measurements[2] === 1) {
      knarren();
    }
    if (measurements[3] === 1) {
      schnarchen();
    }
    if (measurements[4] === 1) {
      gewonnen();
    }
  } catch (error) {
    console.error("Error in websocket message handler", error);
  }
};

function setup() {
  const canvas = createCanvas(1920, 1080);
  canvas.parent("sketch");
  currentVideo = videoStart;
  videoStart.hide();
  videoSchnarchen.hide();
  videoCow.hide();
  videoSandwich.hide();
}

function draw() {
  background(250);
  image(currentVideo, 0, 0, width, height);
}

function start() {
  videoSandwich.stop();
  videoSchnarchen.stop();
  videoCow.stop();
  currentVideo = videoStart;
  currentVideo.loop();
}

function knarren() {
  soundKnarren.play();
  soundKnarren.onended(start);
}

function schnarchen() {
  videoStart.stop();
  currentVideo = videoSchnarchen;
  currentVideo.play();
  currentVideo.onended(start);
}

//Wütendes Monster (Verloren)
function aufwachen() {
  videoStart.stop();
  soundAufwachen.play();
  //VIDEO
  currentVideo = videoCow;
  currentVideo.volume(0);
  currentVideo.play();
}

function gewonnen() {
  videoStart.stop();
  currentVideo = videoSandwich;
  currentVideo.play();
}

function keyPressed() {
  if (key === "F" || key === "f") {
    fullscreen(!Fullscreen);
    Fullscreen = !Fullscreen;
  }
}
