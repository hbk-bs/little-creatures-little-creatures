let listOne = [
  "wacky",
  "bumpy",
  "prickly",
  "hokey",
  "frisky",
  "quacky",
  "itchy",
  "goofy",
  "kinky",
  "loopy",
  "zany",
  "witty",
];
let listTwo = [
  "hopper",
  "bouncer",
  "tumbler",
  "pouncer",
  "romper",
  "bungler",
  "dabbler",
  "jumbler",
  "scrambler",
  "fumbler",
  "stumbler",
  "squabbler",
];

function generateRandomRoomName(wordList1, wordList2) {
  let randomWord1 = wordList1[Math.floor(Math.random() * wordList1.length)];
  let randomWord2 = wordList2[Math.floor(Math.random() * wordList2.length)];

  return `${randomWord1}-${randomWord2}-room`;
}

document.addEventListener("DOMContentLoaded", () => {
  const videoButton = document.querySelector("button#video");
  if (!videoButton) {
    throw new Error("button#video not found");
  }
  const roomButton = document.querySelector("button#room");
  if (!roomButton) {
    throw new Error("button#room not found");
  }
  const inputChannel = document.querySelector("input#channelid");
  if (!inputChannel) {
    throw new Error("input#channelid not found");
  }
  inputChannel.value = generateRandomRoomName(listOne, listTwo);
  const id = inputChannel.value;
  roomButton.setAttribute("disabled", "true");
  videoButton.addEventListener("click", (e) => {
    roomButton.removeAttribute("disabled");
    let newWindow = window.open(
      `/index.html?channel=${id}`,
      "_blank",
      `width=200,height=200,left=${screen.width / 2},top=0`,
    );
    newWindow.resizeTo(screen.width / 2, screen.height);
  });
  roomButton.addEventListener("click", (e) => {
    let newWindow = window.open(
      `/util/room.html?channel=${id}`,
      "_blank",
      `width=200,height=200,left=${0},top=0`,
    );
    newWindow.resizeTo(screen.width / 2, screen.height);
    window.close();
  });
});
