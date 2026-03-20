import React, { useState } from 'react';
import axios from 'axios';

const DemoMode = ({ workers, onClaimSubmitted, onNotification }) => {
  const [loading, setLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [simulationLog, setSimulationLog] = useState([]);

  const addLog = (message, type = 'info') => {
    setSimulationLog(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const simulateExtremeWeather = async () => {
    if (!selectedWorker) {
      onNotification('Please select a worker first', 'error');
      return;
    }

    setLoading(true);
    addLog('🌧️ Starting extreme weather simulation...', 'info');

    try {
      // Use coordinates for a known flood-prone area (Mumbai)
      const coordinates = { lat: 19.0760, lng: 72.8777 };
      
      const claimData = {
        workerId: selectedWorker,
        claimType: 'weather',
        coordinates,
        simulatedExtreme: true
      };

      addLog('📍 Using Mumbai coordinates (flood-prone zone)', 'info');
      addLog('🔄 Sending claim request to API...', 'info');

      const response = await axios.post('/api/claims', claimData);
      
      if (response.data.success) {
        const claim = response.data.claim;
        addLog(`✅ Claim ${claim.id} processed successfully!`, 'success');
        addLog(`💰 Payout: ₹${claim.payoutAmount}`, claim.status === 'approved' ? 'success' : 'warning');
        addLog(`🔍 Fraud Score: ${claim.fraudScore} (${claim.fraudCategory})`, 'info');
        
        if (claim.weatherData) {
          addLog(`🌤️ Weather: ${claim.weatherData.condition} in ${claim.weatherData.city}`, 'info');
        }
        
        onClaimSubmitted(claim);
        onNotification('Extreme weather simulation completed!', 'success');
      }
    } catch (error) {
      addLog(`❌ Simulation failed: ${error.message}`, 'error');
      onNotification('Simulation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulateFraudAttempt = async () => {
    if (!selectedWorker) {
      onNotification('Please select a worker first', 'error');
      return;
    }

    setLoading(true);
    addLog('🚨 Starting fraud simulation...', 'warning');

    try {
      // Suspicious coordinates (same location for multiple claims)
      const coordinates = { lat: 28.6139, lng: 77.2090 }; // Delhi
      
      const claimData = {
        workerId: selectedWorker,
        claimType: 'weather',
        coordinates,
        ipAddress: '10.0.0.1', // Suspicious IP
        deviceFingerprint: 'short', // Suspicious device
        reportedWeather: { severity: 'extreme' },
        actualWeather: { severity: 'moderate' }
      };

      addLog('📍 Using Delhi coordinates with suspicious patterns', 'warning');
      addLog('🔍 Adding fraud indicators: VPN, device risk, weather mismatch', 'warning');
      addLog('🔄 Sending claim request to API...', 'info');

      const response = await axios.post('/api/claims', claimData);
      
      if (response.data.success) {
        const claim = response.data.claim;
        addLog(`✅ Claim ${claim.id} processed with fraud detection!`, 'warning');
        addLog(`🚨 Fraud Score: ${claim.fraudScore} (${claim.fraudCategory})`, 'error');
        
        if (claim.fraudFlags && claim.fraudFlags.length > 0) {
          claim.fraudFlags.forEach(flag => {
            addLog(`⚠️ Flag: ${flag}`, 'error');
          });
        }
        
        onClaimSubmitted(claim);
        onNotification('Fraud simulation completed!', 'warning');
      }
    } catch (error) {
      addLog(`❌ Simulation failed: ${error.message}`, 'error');
      onNotification('Simulation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulateCoordinatedFraud = async () => {
    if (workers.length < 2) {
      onNotification('Need at least 2 workers for coordinated fraud simulation', 'error');
      return;
    }

    setLoading(true);
    addLog('🚨 Starting coordinated fraud simulation...', 'error');

    try {
      // Same coordinates for multiple workers
      const coordinates = { lat: 12.9716, lng: 77.5946 }; // Bangalore
      
      // Submit claims from multiple workers with same coordinates
      const claims = [];
      const selectedWorkers = workers.slice(0, Math.min(2, workers.length)); // Reduced to 2 workers
      
      for (let i = 0; i < selectedWorkers.length; i++) {
        const worker = selectedWorkers[i];
        const claimData = {
          workerId: worker.id,
          claimType: 'weather',
          coordinates,
          ipAddress: '10.0.0.1', // Same suspicious IP for all
          deviceFingerprint: 'coordinated_device'
        };

        addLog(`🔄 Submitting claim for ${worker.name}...`, 'info');
        
        try {
          const response = await axios.post('/api/claims', claimData);
          if (response.data.success) {
            claims.push(response.data.claim);
            addLog(`✅ Claim ${response.data.claim.id} submitted`, 'success');
          }
        } catch (error) {
          addLog(`❌ Failed to submit claim for ${worker.name}: ${error.message}`, 'error');
        }
        
        // Small delay between claims
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addLog('🚨 Coordinated fraud pattern detected!', 'error');
      addLog(`📊 Submitted ${claims.length} claims from identical coordinates`, 'error');
      addLog(`📍 Location: ${coordinates.lat}, ${coordinates.lng}`, 'error');
      
      // Check for fraud alerts
      try {
        const analyticsResponse = await axios.get('/api/analytics');
        if (analyticsResponse.data.success && analyticsResponse.data.fraudAlerts) {
          const newAlerts = analyticsResponse.data.fraudAlerts;
          if (newAlerts.length > 0) {
            addLog(`🚨 System generated ${newAlerts.length} fraud alert(s)!`, 'error');
            newAlerts.forEach(alert => {
              addLog(`⚠️ Alert: ${alert.message}`, 'error');
            });
          }
        }
      } catch (error) {
        addLog(`ℹ️ Could not fetch fraud alerts: ${error.message}`, 'info');
      }
      
      onNotification('Coordinated fraud simulation completed!', 'error');
    } catch (error) {
      addLog(`❌ Simulation failed: ${error.message}`, 'error');
      onNotification('Simulation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearLog = () => {
    setSimulationLog([]);
  };

  return (
    <div className="card">
      <h2 className="card-title">
        🎮 Demo Simulation Mode
      </h2>
      <p className="card-subtitle">
        Test GigShield's AI-powered fraud detection and parametric payout systems
      </p>

      {/* Worker Selection */}
      <div className="form-group">
        <label className="form-label">Select Worker for Simulation</label>
        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="form-select"
        >
          <option value="">Choose a worker...</option>
          {workers.map(worker => (
            <option key={worker.id} value={worker.id}>
              {worker.name} - {worker.city} (Risk: {worker.riskScore || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      {/* Simulation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={simulateExtremeWeather}
          disabled={loading || !selectedWorker}
          className="btn btn-primary"
        >
          🌧️ Simulate Extreme Weather
        </button>
        
        <button
          onClick={simulateFraudAttempt}
          disabled={loading || !selectedWorker}
          className="btn btn-warning"
        >
          🚨 Simulate Fraud Attempt
        </button>
        
        <button
          onClick={simulateCoordinatedFraud}
          disabled={loading || workers.length < 2}
          className="btn btn-danger"
        >
          👥 Simulate Coordinated Fraud
        </button>
      </div>

      {/* Enhanced Simulation Log */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#4a5568', margin: 0 }}>📋 Simulation Log</h3>
        <button
          onClick={clearLog}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          Clear Log
        </button>
      </div>

      <div style={{
        backgroundColor: '#1a202c',
        color: '#e2e8f0',
        padding: '1rem',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        height: '300px',
        overflowY: 'auto',
        border: '1px solid #4a5568',
        position: 'relative'
      }}>
        {simulationLog.length === 0 ? (
          <div style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>
            No simulation activity yet. Run a simulation to see the logs.
          </div>
        ) : (
          simulationLog.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: log.type === 'success' ? 'rgba(72, 187, 120, 0.1)' : 
                           log.type === 'error' ? 'rgba(245, 101, 101, 0.1)' : 
                           log.type === 'warning' ? 'rgba(237, 137, 54, 0.1)' : 'rgba(66, 153, 225, 0.1)',
                borderLeft: `3px solid ${
                  log.type === 'success' ? '#48bb78' : 
                  log.type === 'error' ? '#f56565' : 
                  log.type === 'warning' ? '#ed8936' : '#4299e1'
                }`,
                animation: 'slideIn 0.3s ease-out',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              <div style={{
                minWidth: '80px',
                fontSize: '0.8rem',
                opacity: 0.7,
                fontWeight: '500'
              }}>
                [{log.timestamp}]
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: log.type === 'success' ? '#68d391' : 
                         log.type === 'error' ? '#fc8181' : 
                         log.type === 'warning' ? '#f6ad55' : '#63b3ed',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {log.type === 'success' && '✅'}
                  {log.type === 'error' && '❌'}
                  {log.type === 'warning' && '⚠️'}
                  {log.type === 'info' && 'ℹ️'}
                  {log.message}
                </div>
                
                {/* Enhanced context for specific events */}
                {log.message.includes('triggered') && (
                  <div style={{
                    background: 'rgba(72, 187, 120, 0.2)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    border: '1px solid #48bb78'
                  }}>
                    🎯 <strong>Parametric Trigger Event</strong> - Automatic payout initiated
                  </div>
                )}
                
                {log.message.includes('fraud') && (
                  <div style={{
                    background: 'rgba(245, 101, 101, 0.2)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    border: '1px solid #f56565'
                  }}>
                    🚨 <strong>Fraud Detection Alert</strong> - AI security protocols activated
                  </div>
                )}
                
                {log.message.includes('coordinates') && (
                  <div style={{
                    background: 'rgba(66, 153, 225, 0.2)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    border: '1px solid #4299e1'
                  }}>
                    📍 <strong>Location Validation</strong> - Hyperlocal weather analysis
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Statistics */}
      {simulationLog.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f7fafc',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#48bb78', 
              borderRadius: '50%' 
            }}></div>
            <span>Success: {simulationLog.filter(l => l.type === 'success').length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#f56565', 
              borderRadius: '50%' 
            }}></div>
            <span>Errors: {simulationLog.filter(l => l.type === 'error').length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#ed8936', 
              borderRadius: '50%' 
            }}></div>
            <span>Warnings: {simulationLog.filter(l => l.type === 'warning').length}</span>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <div className="alert alert-info">
          <h4 style={{ marginBottom: '0.5rem' }}>🌧️ Extreme Weather Simulation</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Simulates heavy rainfall or storm conditions in flood-prone areas. Tests parametric trigger thresholds and automatic payout processing.
          </p>
        </div>
        
        <div className="alert alert-warning">
          <h4 style={{ marginBottom: '0.5rem' }}>🚨 Fraud Attempt Simulation</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Creates suspicious claim patterns including VPN usage, device integrity risks, and weather data mismatches to test fraud detection algorithms.
          </p>
        </div>
        
        <div className="alert alert-danger">
          <h4 style={{ marginBottom: '0.5rem' }}>👥 Coordinated Fraud Simulation</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Submits claims from 2 workers with identical coordinates to test coordinated fraud detection and alert systems.
          </p>
        </div>
      </div>

      {workers.length < 2 && (
        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
          ⚠️ Need at least 2 workers for coordinated fraud simulation. Currently have {workers.length} worker(s).
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div className="spinner"></div>
          <div style={{ marginTop: '1rem', color: '#718096' }}>Running simulation...</div>
        </div>
      )}
    </div>
  );
};

export default DemoMode;
