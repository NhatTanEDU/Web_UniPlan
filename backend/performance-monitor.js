/**
 * Performance Monitoring Script for UniPlan Backend
 * Monitors timeout incidents, response times, and identifies performance bottlenecks
 */

const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      timeouts: 0,
      slowRequests: 0, // >5s
      criticalSlowRequests: 0, // >10s
      averageResponseTime: 0,
      responseTimeDistribution: {
        '0-1s': 0,
        '1-5s': 0,
        '5-10s': 0,
        '10-15s': 0,
        '15s+': 0
      },
      endpointMetrics: {},
      userMetrics: {},
      errors: [],
      timeoutIncidents: []
    };
    
    this.logFile = path.join(__dirname, 'logs', 'performance-monitor.log');
    this.metricsFile = path.join(__dirname, 'logs', 'metrics.json');
    this.startTime = Date.now();
    
    this.ensureLogDirectory();
    this.startMonitoring();
  }

  ensureLogDirectory() {
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  startMonitoring() {
    console.log('🔍 Performance Monitor Started');
    console.log(`📊 Metrics will be saved to: ${this.metricsFile}`);
    console.log(`📝 Logs will be saved to: ${this.logFile}`);
    console.log('📈 Use Ctrl+C to stop monitoring and generate report\n');

    // Save metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.saveMetrics();
    }, 30000);

    // Generate report every 5 minutes
    this.reportInterval = setInterval(() => {
      this.generateLiveReport();
    }, 300000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stopMonitoring();
    });

    process.on('SIGTERM', () => {
      this.stopMonitoring();
    });
  }

  logEvent(event) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(event)}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  recordRequest(requestData) {
    this.metrics.totalRequests++;
    
    const { method, url, duration, status, userId, isTimeout, isError } = requestData;
    
    // Update response time metrics
    this.updateResponseTimeMetrics(duration);
    
    // Track endpoint performance
    const endpoint = `${method} ${url}`;
    if (!this.metrics.endpointMetrics[endpoint]) {
      this.metrics.endpointMetrics[endpoint] = {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        timeouts: 0,
        errors: 0,
        slowRequests: 0
      };
    }
    
    const endpointMetric = this.metrics.endpointMetrics[endpoint];
    endpointMetric.count++;
    endpointMetric.totalTime += duration;
    endpointMetric.averageTime = endpointMetric.totalTime / endpointMetric.count;
    
    if (isTimeout) {
      endpointMetric.timeouts++;
      this.metrics.timeouts++;
      this.recordTimeoutIncident(requestData);
    }
    
    if (isError) {
      endpointMetric.errors++;
      this.metrics.errors.push({
        timestamp: new Date().toISOString(),
        endpoint,
        status,
        duration,
        userId
      });
    }
    
    if (duration > 5000) {
      endpointMetric.slowRequests++;
      this.metrics.slowRequests++;
    }
    
    if (duration > 10000) {
      this.metrics.criticalSlowRequests++;
    }
    
    // Track user performance
    if (userId) {
      if (!this.metrics.userMetrics[userId]) {
        this.metrics.userMetrics[userId] = {
          requests: 0,
          timeouts: 0,
          averageResponseTime: 0,
          totalTime: 0
        };
      }
      
      const userMetric = this.metrics.userMetrics[userId];
      userMetric.requests++;
      userMetric.totalTime += duration;
      userMetric.averageResponseTime = userMetric.totalTime / userMetric.requests;
      
      if (isTimeout) {
        userMetric.timeouts++;
      }
    }
    
    // Log the event
    this.logEvent({
      type: 'REQUEST',
      ...requestData
    });
  }

  updateResponseTimeMetrics(duration) {
    // Update average response time
    const total = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + duration;
    this.metrics.averageResponseTime = total / this.metrics.totalRequests;
    
    // Update distribution
    if (duration < 1000) {
      this.metrics.responseTimeDistribution['0-1s']++;
    } else if (duration < 5000) {
      this.metrics.responseTimeDistribution['1-5s']++;
    } else if (duration < 10000) {
      this.metrics.responseTimeDistribution['5-10s']++;
    } else if (duration < 15000) {
      this.metrics.responseTimeDistribution['10-15s']++;
    } else {
      this.metrics.responseTimeDistribution['15s+']++;
    }
  }

  recordTimeoutIncident(requestData) {
    const incident = {
      timestamp: new Date().toISOString(),
      endpoint: `${requestData.method} ${requestData.url}`,
      userId: requestData.userId,
      duration: requestData.duration,
      requestBody: requestData.body,
      queryParams: requestData.query,
      userAgent: requestData.userAgent
    };
    
    this.metrics.timeoutIncidents.push(incident);
    
    // Keep only last 100 incidents
    if (this.metrics.timeoutIncidents.length > 100) {
      this.metrics.timeoutIncidents = this.metrics.timeoutIncidents.slice(-100);
    }
    
    this.logEvent({
      type: 'TIMEOUT_INCIDENT',
      ...incident
    });
  }

  saveMetrics() {
    const metricsWithTimestamp = {
      ...this.metrics,
      lastUpdated: new Date().toISOString(),
      monitoringDuration: Date.now() - this.startTime
    };
    
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(metricsWithTimestamp, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error.message);
    }
  }

  generateLiveReport() {
    const duration = Date.now() - this.startTime;
    const durationMinutes = Math.round(duration / 60000);
    
    console.log('\n' + '📊'.repeat(30));
    console.log('📈 LIVE PERFORMANCE REPORT');
    console.log('📊'.repeat(30));
    
    console.log(`\n⏱️  Monitoring Duration: ${durationMinutes} minutes`);
    console.log(`📊 Total Requests: ${this.metrics.totalRequests}`);
    console.log(`⚡ Average Response Time: ${Math.round(this.metrics.averageResponseTime)}ms`);
    console.log(`⏰ Timeouts: ${this.metrics.timeouts} (${(this.metrics.timeouts / this.metrics.totalRequests * 100).toFixed(2)}%)`);
    console.log(`🐌 Slow Requests (>5s): ${this.metrics.slowRequests}`);
    console.log(`🚨 Critical Slow (>10s): ${this.metrics.criticalSlowRequests}`);
    
    console.log('\n📈 Response Time Distribution:');
    Object.entries(this.metrics.responseTimeDistribution).forEach(([range, count]) => {
      const percentage = (count / this.metrics.totalRequests * 100).toFixed(1);
      console.log(`   ${range}: ${count} (${percentage}%)`);
    });
    
    // Top slowest endpoints
    const slowestEndpoints = Object.entries(this.metrics.endpointMetrics)
      .sort(([,a], [,b]) => b.averageTime - a.averageTime)
      .slice(0, 5);
      
    if (slowestEndpoints.length > 0) {
      console.log('\n🐌 Slowest Endpoints:');
      slowestEndpoints.forEach(([endpoint, metrics], index) => {
        console.log(`   ${index + 1}. ${endpoint}`);
        console.log(`      Average: ${Math.round(metrics.averageTime)}ms`);
        console.log(`      Requests: ${metrics.count}`);
        console.log(`      Timeouts: ${metrics.timeouts}`);
      });
    }
    
    // Recent timeout incidents
    const recentTimeouts = this.metrics.timeoutIncidents.slice(-3);
    if (recentTimeouts.length > 0) {
      console.log('\n⚠️  Recent Timeout Incidents:');
      recentTimeouts.forEach((incident, index) => {
        console.log(`   ${index + 1}. ${incident.endpoint} at ${incident.timestamp}`);
        console.log(`      User: ${incident.userId || 'Anonymous'}`);
        console.log(`      Duration: ${incident.duration}ms`);
      });
    }
    
    console.log('\n' + '📊'.repeat(30) + '\n');
  }

  generateFinalReport() {
    const duration = Date.now() - this.startTime;
    const durationMinutes = Math.round(duration / 60000);
    
    console.log('\n' + '🎯'.repeat(40));
    console.log('📊 FINAL PERFORMANCE REPORT');
    console.log('🎯'.repeat(40));
    
    console.log(`\n📈 Summary:`);
    console.log(`   Monitoring Duration: ${durationMinutes} minutes`);
    console.log(`   Total Requests: ${this.metrics.totalRequests}`);
    console.log(`   Average Response Time: ${Math.round(this.metrics.averageResponseTime)}ms`);
    console.log(`   Timeout Rate: ${(this.metrics.timeouts / this.metrics.totalRequests * 100).toFixed(2)}%`);
    console.log(`   Slow Request Rate: ${(this.metrics.slowRequests / this.metrics.totalRequests * 100).toFixed(2)}%`);
    
    // Performance Analysis
    console.log(`\n🔍 Performance Analysis:`);
    
    if (this.metrics.timeouts > 0) {
      console.log(`   ⚠️  ${this.metrics.timeouts} timeout incidents detected`);
      console.log(`   🔍 Check server logs for detailed timeout information`);
    } else {
      console.log(`   ✅ No timeout incidents detected`);
    }
    
    if (this.metrics.slowRequests > this.metrics.totalRequests * 0.1) {
      console.log(`   ⚠️  High number of slow requests (${this.metrics.slowRequests})`);
      console.log(`   💡 Consider optimizing slow endpoints`);
    } else {
      console.log(`   ✅ Good performance - low number of slow requests`);
    }
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    
    const slowestEndpoint = Object.entries(this.metrics.endpointMetrics)
      .sort(([,a], [,b]) => b.averageTime - a.averageTime)[0];
      
    if (slowestEndpoint && slowestEndpoint[1].averageTime > 5000) {
      console.log(`   🎯 Optimize slowest endpoint: ${slowestEndpoint[0]}`);
      console.log(`      Average response time: ${Math.round(slowestEndpoint[1].averageTime)}ms`);
    }
    
    if (this.metrics.timeouts > 0) {
      console.log(`   🔧 Investigate timeout incidents in production`);
      console.log(`   📊 Monitor database query performance`);
      console.log(`   🔍 Add more granular logging to slow endpoints`);
    }
    
    console.log(`\n📁 Data saved to:`);
    console.log(`   📊 Metrics: ${this.metricsFile}`);
    console.log(`   📝 Logs: ${this.logFile}`);
    
    console.log('\n' + '🎯'.repeat(40));
  }

  stopMonitoring() {
    console.log('\n🛑 Stopping Performance Monitor...');
    
    clearInterval(this.metricsInterval);
    clearInterval(this.reportInterval);
    
    this.saveMetrics();
    this.generateFinalReport();
    
    console.log('✅ Performance monitoring stopped');
    process.exit(0);
  }
}

// Simulate some performance data for testing
function simulatePerformanceData(monitor) {
  console.log('🔄 Simulating performance data...\n');
  
  // Simulate various request patterns
  const endpoints = [
    { method: 'GET', url: '/api/teams/123', avgTime: 1200 },
    { method: 'POST', url: '/api/projects', avgTime: 2500 },
    { method: 'GET', url: '/api/kanban-tasks/search', avgTime: 8000 },
    { method: 'PUT', url: '/api/teams/456/members', avgTime: 1800 },
    { method: 'DELETE', url: '/api/projects/789', avgTime: 900 }
  ];
  
  // Simulate 100 requests over time
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const variance = Math.random() * 2000 - 1000; // ±1000ms variance
      const duration = Math.max(100, endpoint.avgTime + variance);
      
      // Simulate occasional timeouts and errors
      const isTimeout = Math.random() < 0.05; // 5% chance
      const isError = Math.random() < 0.03; // 3% chance
      
      monitor.recordRequest({
        method: endpoint.method,
        url: endpoint.url,
        duration: isTimeout ? 15000 + Math.random() * 5000 : duration,
        status: isError ? 500 : isTimeout ? 503 : 200,
        userId: `user${Math.floor(Math.random() * 10) + 1}`,
        isTimeout,
        isError,
        body: { test: 'data' },
        query: { page: 1 },
        userAgent: 'UniPlan-Test-Client'
      });
    }, i * 100); // Spread requests over 10 seconds
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const simulate = args.includes('--simulate');
  
  console.log('🚀 UniPlan Performance Monitor');
  console.log('===============================');
  
  if (simulate) {
    console.log('🎭 Running in simulation mode');
  } else {
    console.log('🔍 Running in live monitoring mode');
    console.log('💡 Tip: Use --simulate flag to test with mock data');
  }
  
  const monitor = new PerformanceMonitor();
  
  if (simulate) {
    simulatePerformanceData(monitor);
  }
}

main();
