/**
 * @param { HTMLButtonElement[][]} buttons
 * @param {number} i
 * @param {number} j
 */
export function enableAdjacentButtons(buttons, i, j) {
  //    // Enable button above if exists
  if (i > 0) buttons[i - 1][j].removeAttribute("disabled");
  // Enable button below if exists
  if (i < buttons.length - 1) buttons[i + 1][j].removeAttribute("disabled");
  // Enable the button on the left if exists
  if (j > 0) buttons[i][j - 1].removeAttribute("disabled");
  // Enable the button on the right if exists
  if (j < buttons[i].length - 1) buttons[i][j + 1].removeAttribute("disabled");
  // Enable the button on the top-left if exists
  if (i > 0 && j > 0) buttons[i - 1][j - 1].removeAttribute("disabled");
  // Enable the button on the top-right if exists
  if (i > 0 && j < buttons[i].length - 1)
    buttons[i - 1][j + 1].removeAttribute("disabled");
  // Enable the button on the bottom-left if exists
  if (i < buttons.length - 1 && j > 0)
    buttons[i + 1][j - 1].removeAttribute("disabled");
  // Enable the button on the bottom-right if exists
  if (i < buttons.length - 1 && j < buttons[i].length - 1)
    buttons[i + 1][j + 1].removeAttribute("disabled");
}
