/**
 * @param {string} id
 * @param {"up"|"down"} state
 * @param {string} [channel="little-creatures"]
 */
function dataTemplate(id, state, channel = "little-creatures") {
  const calculatedMeasurements = [0, 0, 0, 0, 0].map((_e, i) => {
    if (i === parseInt(id)) {
      return state === "down" ? 1 : 0;
    } else {
      return 0;
    }
  });
  const template = {
    channel: channel,
    measurements: calculatedMeasurements,
  };
  return template;
}

/**
 * @param {WebSocket} ws
 * @param {string} id
 * @param {"up"|"down"} state
 * @param {string} [channel="little-creatures"]
 */
export function sendData(ws, id, state, channel = "little-creatures") {
  const data = dataTemplate(id, state, channel);
  console.log(data);
  ws.send(JSON.stringify(data));
}
