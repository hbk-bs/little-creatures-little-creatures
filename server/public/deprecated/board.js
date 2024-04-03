/// <reference path="../../node_modules/@types/p5/lib/addons/p5.sound.d.ts" />
/// <reference path="../../node_modules/@types/p5/global.d.ts" />
/// <reference path="../../node_modules/@types/p5/literals.d.ts" />
/// <reference path="../../node_modules/@types/p5/constants.d.ts" />
/// <reference path="../../node_modules/@types/p5/index.d.ts" />

// Keep these comments alive.
// They will help you while writing code.

let serverUrl = "";
let scheme = "ws";
const { location: loc } = document;

if (loc.protocol === "https:") {
  scheme += "s";
}
serverUrl = `${scheme}://${loc.hostname}:${loc.port}`;

const ws = new WebSocket(`${serverUrl}/ws/little-creatures`);

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * @type {Element[]}
 */
const buttons = [];
function setup() {
  noCanvas();
  const b0 = createButton("aufwachen()");
  b0.attribute("id", "0");
  const b1 = createButton("start()");
  b1.attribute("id", "1");
  const b2 = createButton("knarren()");
  b2.attribute("id", "2");
  const b3 = createButton("schnarchen()");
  b3.attribute("id", "3");
  const b4 = createButton("gewonnen()");
  b4.attribute("id", "4");
  // @ts-ignore
  buttons.push(b0, b1, b2, b3, b4);
  // @ts-ignore
  const down = (e) => {
    sendData(e.target.id, "down");
  };
  // @ts-ignore
  const up = (e) => {
    sendData(e.target.id, "up");
  };
  buttons.forEach((button) => {
    //@ts-ignore
    button.mousePressed(down);
    //@ts-ignore
    button.mouseReleased(up);
  });
}
/**
 * @param {string} id
 * @param {"up"|"down"} state
 */
function dataTemplate(id, state) {
  const calculatedMeasurements = [0, 0, 0, 0, 0].map((_e, i) => {
    if (i === parseInt(id)) {
      return state === "down" ? 1 : 0;
    } else {
      return 0;
    }
  });
  const template = {
    channel: "little-creatures",
    measurements: calculatedMeasurements,
  };
  return template;
}

/**
 * @param {string} id
 * @param {"up"|"down"} state
 */
function checkState(id, state) {
  if (state === "up") {
    console.log(`Button ${id} up`);
  } else if (state === "down") {
    console.log(`Button ${id} down`);
  }
}
/**
 * @param {string} id
 * @param {"up"|"down"} state
 */
function sendData(id, state) {
  const data = dataTemplate(id, state);
  ws.send(JSON.stringify(data));
  switch (id) {
    case "0":
      checkState(id, state);
      break;
    case "1":
      checkState(id, state);
      break;
    case "2":
      checkState(id, state);
      break;
    case "3":
      checkState(id, state);
      break;
    case "4":
      checkState(id, state);
      break;
  }
}

function draw() {}
