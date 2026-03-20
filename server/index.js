const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// In-memory storage (for hackathon prototype)
let workers = new Map();
let claims = new Map();
let fraudAlerts = [];
let systemStats = {
  activePolicies: 0,
  claimsTriggered: 0,
  fraudFlags: 0,
  totalPayoutVolume: 0
};

// OpenWeather API Key (you'll need to set this)
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';

// Helper functions
function calculateRiskScore(workerData) {
  let riskScore = 30; // Base score
  let premium = 30; // Base premium in ₹
  
  // AI-driven risk heuristics
  if (workerData.floodRiskZone) {
    riskScore += 15;
    premium += 8;
  }
  
  if (workerData.pollutionRiskZone) {
    riskScore += 10;
    premium += 5;
  }
  
  // City-based risk adjustment
  const highRiskCities = ['mumbai', 'kolkata', 'chennai', 'bangalore'];
  if (highRiskCities.includes(workerData.city.toLowerCase())) {
    riskScore += 5;
  }
  
  // Safe region discount
  if (workerData.city.toLowerCase() === 'pune' || workerData.city.toLowerCase() === 'hyderabad') {
    riskScore -= 10;
    premium -= 5;
  }
  
  // Ensure minimum premium
  premium = Math.max(premium, 25);
  
  return { riskScore: Math.max(0, Math.min(100, riskScore)), premium };
}

function detectFraud(workerData, claimData) {
  let fraudScore = 0;
  let flags = [];
  
  // GPS location jump detection
  if (workerData.lastLocation && claimData.coordinates) {
    const distance = calculateDistance(
      workerData.lastLocation.lat, 
      workerData.lastLocation.lng,
      claimData.coordinates.lat,
      claimData.coordinates.lng
    );
    if (distance > 5) {
      fraudScore += 25;
      flags.push('GPS location jump > 5km detected');
    }
  }
  
  // Multiple claims per day
  const today = new Date().toDateString();
  const todayClaims = Array.from(claims.values()).filter(claim => 
    claim.workerId === workerData.id && 
    new Date(claim.timestamp).toDateString() === today
  );
  
  if (todayClaims.length > 3) {
    fraudScore += 30;
    flags.push('More than 3 claims submitted today');
  }
  
  // Suspicious network detection (simplified)
  if (claimData.ipAddress && claimData.ipAddress.startsWith('10.')) {
    fraudScore += 15;
    flags.push('Suspicious network detected');
  }
  
  // Device integrity risk
  if (claimData.deviceFingerprint && claimData.deviceFingerprint.length < 10) {
    fraudScore += 10;
    flags.push('Device integrity risk');
  }
  
  // Weather mismatch detection
  if (claimData.claimType === 'weather' && claimData.reportedWeather) {
    // This would be validated against real API in production
    if (claimData.reportedWeather.severity !== claimData.actualWeather.severity) {
      fraudScore += 20;
      flags.push('Weather data mismatch detected');
    }
  }
  
  return { fraudScore, flags };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getFraudCategory(score) {
  if (score <= 30) return 'SAFE';
  if (score <= 60) return 'FLAGGED';
  return 'FRAUD';
}

// API Routes

// Worker onboarding
app.post('/api/workers', async (req, res) => {
  try {
    const workerData = req.body;
    const workerId = uuidv4();
    
    const { riskScore, premium } = calculateRiskScore(workerData);
    
    const worker = {
      id: workerId,
      ...workerData,
      riskScore,
      weeklyPremium: premium,
      createdAt: new Date().toISOString(),
      lastLocation: null,
      claimHistory: []
    };
    
    workers.set(workerId, worker);
    systemStats.activePolicies++;
    
    res.json({
      success: true,
      worker: {
        id: worker.id,
        name: worker.name,
        city: worker.city,
        platform: worker.platform,
        riskScore: worker.riskScore,
        weeklyPremium: worker.weeklyPremium,
        riskLevel: riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all workers
app.get('/api/workers', (req, res) => {
  res.json({
    success: true,
    workers: Array.from(workers.values()).map(w => ({
      id: w.id,
      name: w.name,
      city: w.city,
      platform: w.platform,
      weeklyPremium: w.weeklyPremium,
      riskScore: w.riskScore,
      averageDailyEarnings: w.averageDailyEarnings,
      workingHours: w.workingHours,
      floodRiskZone: w.floodRiskZone,
      pollutionRiskZone: w.pollutionRiskZone,
      claimHistory: w.claimHistory
    }))
  });
});

// Update worker
app.put('/api/workers/:id', async (req, res) => {
  try {
    const workerId = req.params.id;
    const updateData = req.body;
    
    const existingWorker = workers.get(workerId);
    if (!existingWorker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    
    // Recalculate risk score and premium based on updated data
    const { riskScore, premium } = calculateRiskScore(updateData);
    
    // Update worker with new data and recalculated values
    const updatedWorker = {
      ...existingWorker,
      ...updateData,
      riskScore,
      weeklyPremium: premium,
      updatedAt: new Date().toISOString()
    };
    
    workers.set(workerId, updatedWorker);
    
    res.json({
      success: true,
      worker: {
        id: updatedWorker.id,
        name: updatedWorker.name,
        city: updatedWorker.city,
        platform: updatedWorker.platform,
        riskScore: updatedWorker.riskScore,
        weeklyPremium: updatedWorker.weeklyPremium,
        averageDailyEarnings: updatedWorker.averageDailyEarnings,
        workingHours: updatedWorker.workingHours,
        floodRiskZone: updatedWorker.floodRiskZone,
        pollutionRiskZone: updatedWorker.pollutionRiskZone,
        claimHistory: updatedWorker.claimHistory,
        riskLevel: riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete worker
app.delete('/api/workers/:id', (req, res) => {
  try {
    const workerId = req.params.id;
    
    const worker = workers.get(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    
    // Remove worker from the map
    workers.delete(workerId);
    
    // Decrement active policies counter
    systemStats.activePolicies = Math.max(0, systemStats.activePolicies - 1);
    
    res.json({
      success: true,
      message: `Worker ${worker.name} has been deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit claim
app.post('/api/claims', async (req, res) => {
  try {
    const claimData = req.body;
    const claimId = uuidv4();
    
    const worker = workers.get(claimData.workerId);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    
    let payoutAmount = 0;
    let claimStatus = 'pending';
    let weatherData = null;
    
    // Real weather validation for weather disruption claims
    if (claimData.claimType === 'weather' && claimData.coordinates) {
      try {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${claimData.coordinates.lat}&lon=${claimData.coordinates.lng}&appid=${OPENWEATHER_API_KEY}`
        );
        
        weatherData = weatherResponse.data;
        const rainfall = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;
        const windSpeed = weatherData.wind ? weatherData.wind.speed : 0;
        const weatherCondition = weatherData.weather[0].main.toLowerCase();
        
        // Parametric trigger thresholds
        const extremeWeather = (
          rainfall > 10 || // Heavy rainfall
          windSpeed > 15 || // Strong winds
          weatherCondition.includes('storm') ||
          weatherCondition.includes('thunderstorm')
        );
        
        if (extremeWeather) {
          payoutAmount = 300; // Estimated daily loss for gig worker
          claimStatus = 'approved';
          systemStats.claimsTriggered++;
          systemStats.totalPayoutVolume += payoutAmount;
        } else {
          claimStatus = 'no_payout';
        }
      } catch (error) {
        console.log('Weather API error, using fallback logic');
        // Fallback logic for demo
        if (claimData.simulatedExtreme) {
          payoutAmount = 300;
          claimStatus = 'approved';
          systemStats.claimsTriggered++;
          systemStats.totalPayoutVolume += payoutAmount;
        }
      }
    }
    
    // Fraud detection
    const { fraudScore, flags } = detectFraud(worker, claimData);
    const fraudCategory = getFraudCategory(fraudScore);
    
    const claim = {
      id: claimId,
      workerId: claimData.workerId,
      claimType: claimData.claimType,
      coordinates: claimData.coordinates,
      timestamp: new Date().toISOString(),
      status: claimStatus,
      payoutAmount,
      fraudScore,
      fraudCategory,
      fraudFlags: flags,
      weatherData: weatherData ? {
        city: weatherData.name,
        condition: weatherData.weather[0].main,
        temperature: weatherData.main.temp,
        rainfall: weatherData.rain ? weatherData.rain['1h'] || 0 : 0
      } : null
    };
    
    claims.set(claimId, claim);
    worker.claimHistory.push(claimId);
    worker.lastLocation = claimData.coordinates;
    
    // Check for coordinated fraud
    const similarLocationClaims = Array.from(claims.values()).filter(c =>
      c.coordinates &&
      claimData.coordinates &&
      calculateDistance(c.coordinates.lat, c.coordinates.lng, claimData.coordinates.lat, claimData.coordinates.lng) < 0.1 &&
      c.id !== claimId
    );
    
    if (similarLocationClaims.length > 2) {
      fraudAlerts.push({
        id: uuidv4(),
        type: 'coordinated_fraud',
        message: `Multiple claims from identical coordinates detected`,
        coordinates: claimData.coordinates,
        timestamp: new Date().toISOString(),
        claimIds: [claimId, ...similarLocationClaims.map(c => c.id)]
      });
      systemStats.fraudFlags++;
    }
    
    if (fraudCategory === 'FRAUD') {
      systemStats.fraudFlags++;
    }
    
    res.json({
      success: true,
      claim: {
        id: claim.id,
        status: claim.status,
        payoutAmount: claim.payoutAmount,
        fraudScore: claim.fraudScore,
        fraudCategory: claim.fraudCategory,
        weatherData: claim.weatherData,
        message: claim.status === 'approved' 
          ? `Extreme Weather Detected in ${claim.weatherData?.city || 'Location'}. Estimated Income Loss ₹${payoutAmount}. Payout Initiated (Simulated)`
          : claim.status === 'no_payout'
          ? 'Coverage Active – No payout triggered.'
          : 'Claim under review.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get analytics
app.get('/api/analytics', (req, res) => {
  const allWorkers = Array.from(workers.values());
  const allClaims = Array.from(claims.values());
  
  const riskDistribution = {
    low: allWorkers.filter(w => w.riskScore <= 30).length,
    medium: allWorkers.filter(w => w.riskScore > 30 && w.riskScore <= 60).length,
    high: allWorkers.filter(w => w.riskScore > 60).length
  };
  
  const claimsByType = {
    weather: allClaims.filter(c => c.claimType === 'weather').length,
    other: allClaims.filter(c => c.claimType !== 'weather').length
  };
  
  res.json({
    success: true,
    stats: systemStats,
    riskDistribution,
    claimsByType,
    workers: allWorkers.map(w => {
      const workerClaims = w.claimHistory.map(claimId => claims.get(claimId)).filter(Boolean);
      const lastClaim = workerClaims[workerClaims.length - 1];
      const totalPayout = workerClaims.reduce((sum, c) => sum + (c.payoutAmount || 0), 0);
      
      return {
        id: w.id,
        name: w.name,
        city: w.city,
        premium: w.weeklyPremium,
        claimStatus: w.claimHistory.length > 0 ? 'has_claims' : 'no_claims',
        claimCount: w.claimHistory.length,
        fraudScore: w.claimHistory.length > 0 
          ? Math.max(...w.claimHistory.map(claimId => claims.get(claimId)?.fraudScore || 0))
          : 0,
        lastClaimStatus: lastClaim?.status || 'N/A',
        lastClaimPayout: lastClaim?.payoutAmount || 0,
        lastClaimFraudScore: lastClaim?.fraudScore || 0,
        totalPayout: totalPayout,
        claims: workerClaims.map(c => ({
          id: c.id,
          status: c.status,
          payoutAmount: c.payoutAmount,
          fraudScore: c.fraudScore,
          fraudCategory: c.fraudCategory,
          claimType: c.claimType,
          timestamp: c.timestamp,
          weatherData: c.weatherData
        }))
      };
    }),
    fraudAlerts
  });
});

// Demo simulation endpoints
app.post('/api/demo/simulate-extreme-weather', (req, res) => {
  const { workerId, coordinates } = req.body;
  
  // Simulate extreme weather claim
  const claimData = {
    workerId,
    claimType: 'weather',
    coordinates,
    simulatedExtreme: true
  };
  
  return req.app.locals.simulateClaim ? req.app.locals.simulateClaim(claimData, res) : 
    res.json({ success: false, error: 'Simulation not available' });
});

app.post('/api/demo/simulate-fraud', (req, res) => {
  const { workerId, coordinates } = req.body;
  
  // Simulate suspicious claim
  const claimData = {
    workerId,
    claimType: 'weather',
    coordinates,
    ipAddress: '10.0.0.1',
    deviceFingerprint: 'short',
    reportedWeather: { severity: 'extreme' },
    actualWeather: { severity: 'moderate' }
  };
  
  return req.app.locals.simulateClaim ? req.app.locals.simulateClaim(claimData, res) : 
    res.json({ success: false, error: 'Simulation not available' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'GigShield API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GigShield Server running on port ${PORT}`);
  console.log(`📊 Analytics available at http://localhost:${PORT}/api/analytics`);
  console.log(`🔗 Health check at http://localhost:${PORT}/api/health`);
});

module.exports = app;
