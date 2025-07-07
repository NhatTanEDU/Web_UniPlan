// Test file that will fail due to errors in error-demo.js

const { calculateTotal } = require('./error-demo.js');

describe('calculateTotal function', () => {
  test('should calculate total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 }
    ];
    
    const result = calculateTotal(items);
    expect(result).toBe(35); // 10*2 + 5*3 = 35
  });

  test('should handle empty array', () => {
    const result = calculateTotal([]);
    expect(result).toBe(0);
  });
});
