//room-utils.js

/**
 * @param {Record<string,number>} object
 * @param {number} value
 */
export function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}
