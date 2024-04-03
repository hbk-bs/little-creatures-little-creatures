import { enableAdjacentButtons } from "./lib/enable-adjacent-buttons.js";
import { mutateRandomElements } from "./lib/mutate-random-elements.js";
import { sendData } from "./lib/send-data.js";
import { getKeyByValue } from "./lib/util.js";

const attributeName = "data-type";

const ButtonTypes = {
  start: 0,
  win: 1,
  lose: 2,
  creak: 3,
  snorring: 4,
  empty: 5,
};

let serverUrl = "";
let scheme = "ws";
const { location: loc } = document;
let params = new URLSearchParams(document.location.search);
const channel = params.get("channel") ?? "little-creatures";

if (loc.protocol === "https:") {
  scheme += "s";
}
serverUrl = `${scheme}://${loc.hostname}:${loc.port}`;

const ws = new WebSocket(`${serverUrl}/ws/${channel}`);

const buttonsInX = 7;
const buttonsInY = 9;
let w = 50;
let h = 50;

/**
 * @type {HTMLButtonElement[][]}
 */
const buttons = [];
const sketch = document.getElementById("sketch");
if (!sketch) {
  throw new Error("sketch is null");
}
for (let i = 0; i < buttonsInY; i++) {
  buttons[i] = [];

  for (let j = 0; j < buttonsInX; j++) {
    const btnId = `btn-${i}-${j}`;
    const button = document.createElement("button");
    button.id = btnId;
    button.style.width = `${w}px`;
    button.style.height = `${h}px`;
    button.disabled = true;
    sketch.appendChild(button);
    buttons[i][j] = button;
  }
}

buttons[0][0].setAttribute(attributeName, `${ButtonTypes.start}`);
buttons[0][0].innerText = "Start";
buttons[0][0].disabled = false;
buttons[8][6].setAttribute(attributeName, `${ButtonTypes.win}`);
buttons[8][6].innerText = "Win";

mutateRandomElements({
  array2d: buttons,
  numberOfElements: 5,
  modifierFunction: (buttonElement) => {
    buttonElement.setAttribute(attributeName, `${ButtonTypes.creak}`);
  },
  attributeToCheck: attributeName,
});

mutateRandomElements({
  array2d: buttons,
  numberOfElements: 7,
  modifierFunction: (buttonElement) => {
    buttonElement.setAttribute(attributeName, `${ButtonTypes.snorring}`);
  },
  attributeToCheck: attributeName,
});

mutateRandomElements({
  array2d: buttons,
  numberOfElements: 5,
  modifierFunction: (buttonElement) => {
    buttonElement.setAttribute(attributeName, `${ButtonTypes.lose}`);
  },
  attributeToCheck: attributeName,
});

/**
 * Arrow function for handling a mouse down event.
 * @param {MouseEvent} e - The mouse event.
 * @param {"up"|"down"} type
 */
const mouseHandler = (e, type) => {
  if (!e) return;

  if (e.target) {
    /** @type {Element} */
    const element = e.target;
    if (element.hasAttribute(attributeName)) {
      console.log(
        type,
        getKeyByValue(
          ButtonTypes,
          parseInt(element.attributes[attributeName].value),
        ),
      );

      sendData(ws, element.attributes[attributeName].value, type, channel);
    } else {
      console.log("no attribute");
    }
  }
};

buttons.forEach((row, i) => {
  row.forEach((button, j) => {
    button.addEventListener("mousedown", (e) => {
      mouseHandler(e, "down");
      // button.removeAttribute("disabled");
    });
    button.addEventListener("mouseup", (e) => {
      mouseHandler(e, "up");
      button.removeAttribute("disabled");
      enableAdjacentButtons(buttons, i, j);
    });
  });
});
