// Demo file with intentional errors to show CI/CD failure

// Error 1: Syntax error - missing semicolon and bracket
function calculateTotal(items) {
  let total = 0;
  
  // Error 2: Using undefined variable
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity
    // Missing semicolon above will cause syntax error
  }
  
  // Error 3: Return statement with wrong variable
  return totalAmount; // totalAmount is not defined
}

// Error 4: Function called with wrong parameters
const result = calculateTotal("not an array");

// Error 5: Console log with undefined variable
console.log("Result:", undefinedVariable);

module.exports = { calculateTotal };
