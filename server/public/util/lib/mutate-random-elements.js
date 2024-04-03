/**
 *
 * @param {{
 * array2d: Array<Array<HTMLButtonElement>>,
 * numberOfElements: number,
 * modifierFunction: (buttonElement: HTMLButtonElement) => void,
 * attributeToCheck: string,
 * }} options
 */
export function mutateRandomElements({
  array2d,
  numberOfElements,
  modifierFunction,
  attributeToCheck,
}) {
  /**
   *
   * @param {HTMLButtonElement} buttonElement
   * @param {string} attributeName
   * @returns
   */
  const hasAttribute = (buttonElement, attributeName) => {
    return buttonElement.hasAttribute(attributeName);
  };
  // Check if the element has a specific attribute
  // Flatten the 2D array while keeping track of original indices and filtering out elements with the attribute set
  // Define the type for our result
  /**
   * @type {{element: HTMLButtonElement, originalPosition: number[]}[]}
   */

  // Initialize an empty array to hold the eligible elements
  let eligibleElements = [];

  // Iterate over each row in the 2D array
  for (let rowIndex = 0; rowIndex < array2d.length; rowIndex++) {
    let row = array2d[rowIndex];

    // Filter out elements in the row that have the attribute set
    let filteredRow = row.filter(
      (element) => !hasAttribute(element, attributeToCheck),
    );

    // Map the filtered elements to an object containing the element and its original position
    let mappedRow = filteredRow.map((element, columnIndex) => ({
      element: element,
      originalPosition: [rowIndex, columnIndex],
    }));

    // Add the mapped elements from this row to the overall result
    eligibleElements = [...eligibleElements, ...mappedRow];
  }
  // Determine the random number of elements to select
  const eligibleCount = eligibleElements.length;
  if (eligibleCount === 0) {
    throw new Error("No elements are eligible for selection.");
  }
  if (eligibleCount < numberOfElements) {
    throw new Error(
      `Not enough elements are eligible for selection. eligibleCount: ${eligibleCount}, numberOfElements: ${numberOfElements}`,
    );
  }
  // Shuffle and select a random subset of eligible elements
  for (let i = eligibleCount - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligibleElements[i], eligibleElements[j]] = [
      eligibleElements[j],
      eligibleElements[i],
    ];
  }
  // Select the random elements
  const selectedElements = eligibleElements.slice(0, numberOfElements);
  // Run the modifier function on the selected elements without changing the original structure
  selectedElements.forEach(({ element }) => {
    modifierFunction(element);
    // element.setAttribute(attributeToCheck, "true"); // Mark the element as modified
  });
}
