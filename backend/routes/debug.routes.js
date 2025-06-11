const express = require('express');
const router = express.Router();

// Test endpoint for timeout middleware - takes 20 seconds (longer than 15s timeout)
router.get('/slow-endpoint', async (req, res) => {
  const requestId = `slow-endpoint-${Date.now()}`;
  console.log(`🐌 [${requestId}] Starting intentionally slow endpoint (20 seconds)...`);
  
  try {
    // Simulate a very slow operation (20 seconds)
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    console.log(`🐌 [${requestId}] Slow endpoint completed (this should not appear due to timeout)`);
    res.json({ 
      message: 'Slow endpoint completed successfully',
      requestId: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`🐌 [${requestId}] Error in slow endpoint:`, error);
    res.status(500).json({ 
      message: 'Error in slow endpoint', 
      error: error.message,
      requestId: requestId 
    });
  }
});

// Test endpoint for moderate delay - takes 8 seconds (should complete but trigger slow warning)
router.get('/moderate-endpoint', async (req, res) => {
  const requestId = `moderate-endpoint-${Date.now()}`;
  console.log(`⏳ [${requestId}] Starting moderate delay endpoint (8 seconds)...`);
  
  try {
    // Simulate moderate delay (8 seconds)
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    console.log(`⏳ [${requestId}] Moderate endpoint completed successfully`);
    res.json({ 
      message: 'Moderate endpoint completed successfully',
      requestId: requestId,
      duration: '8 seconds',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`⏳ [${requestId}] Error in moderate endpoint:`, error);
    res.status(500).json({ 
      message: 'Error in moderate endpoint', 
      error: error.message,
      requestId: requestId 
    });
  }
});

// Test endpoint that throws an error after delay
router.get('/error-endpoint', async (req, res) => {
  const requestId = `error-endpoint-${Date.now()}`;
  console.log(`💥 [${requestId}] Starting error endpoint (will fail after 3 seconds)...`);
  
  try {
    // Wait 3 seconds then throw error
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`💥 [${requestId}] About to throw intentional error`);
    throw new Error('Intentional test error to verify error handling');
  } catch (error) {
    console.error(`💥 [${requestId}] Error endpoint caught error:`, error.message);
    res.status(500).json({ 
      message: 'Intentional error endpoint', 
      error: error.message,
      requestId: requestId 
    });
  }
});

// Test endpoint for database simulation - hangs indefinitely
router.get('/hang-endpoint', async (req, res) => {
  const requestId = `hang-endpoint-${Date.now()}`;
  console.log(`🔒 [${requestId}] Starting hang endpoint (will never respond)...`);
  
  try {
    // Simulate a database query that hangs indefinitely
    await new Promise(() => {
      // This promise never resolves, simulating a hanging database connection
      console.log(`🔒 [${requestId}] Simulating hanging database operation...`);
    });
    
    // This should never execute due to timeout
    res.json({ 
      message: 'This should never be sent',
      requestId: requestId 
    });
  } catch (error) {
    console.error(`🔒 [${requestId}] Error in hang endpoint:`, error);
    res.status(500).json({ 
      message: 'Error in hang endpoint', 
      error: error.message,
      requestId: requestId 
    });
  }
});

// Quick test endpoint - should complete instantly
router.get('/quick-endpoint', (req, res) => {
  const requestId = `quick-endpoint-${Date.now()}`;
  console.log(`⚡ [${requestId}] Quick endpoint accessed`);
  
  res.json({ 
    message: 'Quick endpoint completed instantly',
    requestId: requestId,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
