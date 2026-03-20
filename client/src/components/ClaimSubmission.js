import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParametricClaimResult = ({ claim }) => {
  const [animationPhase, setAnimationPhase] = useState('validating');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase('processing'), 1000);
    const timer2 = setTimeout(() => setAnimationPhase('completed'), 2500);
    const timer3 = setTimeout(() => setShowSuccess(true), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const getAnimationContent = () => {
    switch (animationPhase) {
      case 'validating':
        return {
          icon: '🔍',
          title: 'Validating Weather Conditions',
          subtitle: 'Checking real-time disruption signals...'
        };
      case 'processing':
        return {
          icon: '⚡',
          title: 'Parametric Claim Triggered',
          subtitle: 'Automatic payout processing initiated...'
        };
      case 'completed':
        return {
          icon: claim.status === 'approved' ? '✅' : 'ℹ️',
          title: claim.status === 'approved' ? 'Income Protection Credited' : 'Coverage Active — No payout triggered',
          subtitle: claim.status === 'approved' ? 'Funds transferred successfully' : 'Policy remains active for future disruptions'
        };
      default:
        return { icon: '🔄', title: 'Processing...', subtitle: '' };
    }
  };

  const animation = getAnimationContent();

  return (
    <div style={{
      background: claim.status === 'approved' 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      borderRadius: '16px',
      padding: '2rem',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      animation: 'slideIn 0.5s ease-out'
    }}>
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        animation: 'pulse 2s infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Weather Condition Header */}
        {claim.weatherData && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              📍 {claim.weatherData.city} • {new Date(claim.timestamp).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {claim.weatherData.condition}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
              {claim.weatherData.temperature}°C
              {claim.weatherData.rainfall > 0 && ` • ${claim.weatherData.rainfall}mm/h rainfall`}
            </div>
          </div>
        )}

        {/* Animation Content */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: animationPhase !== 'completed' ? 'bounce 1s infinite' : 'none'
          }}>
            {animation.icon}
          </div>
          
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            margin: 0
          }}>
            {animation.title}
          </h3>
          
          <p style={{
            fontSize: '1rem',
            opacity: 0.9,
            margin: '0.5rem 0 2rem 0'
          }}>
            {animation.subtitle}
          </p>

          {/* Processing Loader */}
          {animationPhase !== 'completed' && (
            <div style={{
              width: '60px',
              height: '4px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '2px',
              margin: '1rem auto',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '30px',
                height: '100%',
                background: 'white',
                borderRadius: '2px',
                animation: 'slide 1.5s infinite'
              }} />
            </div>
          )}

          {/* Success Animation */}
          {showSuccess && claim.status === 'approved' && (
            <div style={{
              animation: 'scaleIn 0.5s ease-out',
              marginTop: '1rem'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: '2rem'
              }}>
                💰
              </div>
            </div>
          )}
        </div>

        {/* Estimated Income Loss */}
        {claim.status === 'approved' && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Estimated Daily Income Loss Covered
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              ₹{claim.payoutAmount}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Parametric payout automatically calculated
            </div>
          </div>
        )}

        {/* Claim Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Claim ID</div>
            <div style={{ fontWeight: '600' }}>{claim.id.slice(0, 8)}</div>
          </div>
          <div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Fraud Score</div>
            <div style={{ fontWeight: '600' }}>{claim.fraudScore}</div>
          </div>
          <div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Risk Level</div>
            <div style={{ 
              fontWeight: '600',
              color: claim.fraudCategory === 'SAFE' ? '#68d391' : 
                     claim.fraudCategory === 'FLAGGED' ? '#fbd38d' : '#fc8181'
            }}>
              {claim.fraudCategory}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Status</div>
            <div style={{ fontWeight: '600' }}>
              {claim.status === 'approved' ? 'APPROVED' : 'ACTIVE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClaimSubmission = ({ workers, onClaimSubmitted }) => {
  const [formData, setFormData] = useState({
    workerId: '',
    claimType: 'weather',
    locationInput: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    inputMethod: 'location' // 'location' or 'coordinates'
  });
  const [loading, setLoading] = useState(false);
  const [validatingLocation, setValidatingLocation] = useState(false);
  const [result, setResult] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showTooltip, setShowTooltip] = useState('');
  const [animationState, setAnimationState] = useState('');

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: latitude.toString(),
              lng: longitude.toString()
            },
            inputMethod: 'coordinates'
          }));
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Geocoding function to convert location name to coordinates
  const geocodeLocation = async (locationName) => {
    try {
      // Using Nominatim OpenStreetMap geocoding (free API)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`
      );
      
      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0];
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          displayName: display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (formData.locationInput.trim()) {
      setValidatingLocation(true);
      setAnimationState('validating');
      setShowTooltip('🔍 Validating location coordinates...');
      
      try {
        const geocoded = await geocodeLocation(formData.locationInput);
        if (geocoded) {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: geocoded.lat.toString(),
              lng: geocoded.lng.toString()
            }
          }));
          setCurrentLocation({ lat: geocoded.lat, lng: geocoded.lng });
          setShowTooltip('✅ Location validated successfully');
          setAnimationState('success');
          setTimeout(() => {
            setShowTooltip('');
            setAnimationState('');
          }, 2000);
        } else {
          setShowTooltip('❌ Location not found');
          setAnimationState('error');
          setTimeout(() => {
            setShowTooltip('');
            setAnimationState('');
          }, 2000);
        }
      } catch (error) {
        setShowTooltip('❌ Error converting location to coordinates');
        setAnimationState('error');
        setTimeout(() => {
          setShowTooltip('');
          setAnimationState('');
        }, 2000);
      } finally {
        setValidatingLocation(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const claimData = {
        ...formData,
        coordinates: {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng)
        }
      };

      const response = await axios.post('/api/claims', claimData);
      
      if (response.data.success) {
        setResult(response.data.claim);
        onClaimSubmitted(response.data.claim);
        
        // Reset form
        setFormData({
          workerId: '',
          claimType: 'weather',
          locationInput: '',
          coordinates: {
            lat: '',
            lng: ''
          },
          inputMethod: 'location'
        });
        setCurrentLocation(null);
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      setResult({ 
        error: 'Failed to submit claim. Please try again.',
        details: error.response?.data?.error || 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        🌧️ File Parametric Claim
      </h2>
      <p className="card-subtitle">
        Automated claim processing using real-time weather data and AI validation
      </p>

      {/* Parametric Insurance Concept Awareness Box */}
      <div style={{
        background: 'linear-gradient(135deg, #e6fffa, #f0fff4)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid #9ae6b4',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '20px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        }}>
          🚀 FINTECH INNOVATION
        </div>
        
        <div style={{ marginTop: '0.5rem' }}>
          <h4 style={{ 
            color: '#22543d', 
            fontSize: '1.1rem', 
            fontWeight: '600',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚡ What is Parametric Insurance?
          </h4>
          
          <p style={{ 
            color: '#2d3748', 
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            <strong>Traditional insurance</strong> requires manual claims, paperwork, and long waiting periods. 
            <strong> Parametric insurance</strong> eliminates manual claims by using <strong>real-time disruption signals</strong> such as weather severity to <strong>automatically trigger payouts</strong>.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>🌧️</div>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#4a5568',
                textAlign: 'center',
                marginBottom: '0.25rem'
              }}>
                Real-Time Triggers
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#718096',
                textAlign: 'center'
              }}>
                Weather APIs detect disruptions automatically
              </div>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>⚡</div>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#4a5568',
                textAlign: 'center',
                marginBottom: '0.25rem'
              }}>
                Instant Payouts
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#718096',
                textAlign: 'center'
              }}>
                No paperwork, immediate income protection
              </div>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>🤖</div>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#4a5568',
                textAlign: 'center',
                marginBottom: '0.25rem'
              }}>
                AI-Powered
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#718096',
                textAlign: 'center'
              }}>
                Smart fraud detection and risk scoring
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            🎯 <strong>Result:</strong> Gig workers get paid immediately when disruptions occur, 
            without complex claim processes or delays.
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select Worker</label>
          <select
            name="workerId"
            className="form-select"
            value={formData.workerId}
            onChange={handleChange}
            required
          >
            <option value="">Choose a worker...</option>
            {workers.map(worker => (
              <option key={worker.id} value={worker.id}>
                {worker.name} - {worker.city} ({worker.platform})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Claim Type</label>
          <select
            name="claimType"
            className="form-select"
            value={formData.claimType}
            onChange={handleChange}
          >
            <option value="weather">Weather Disruption</option>
            <option value="pollution">Severe Pollution</option>
            <option value="curfew">Curfew/Lockdown</option>
            <option value="zone_closure">Delivery Zone Closure</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Location Method</label>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="inputMethod"
                value="location"
                checked={formData.inputMethod === 'location'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <span>📍 Location Name</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="inputMethod"
                value="coordinates"
                checked={formData.inputMethod === 'coordinates'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <span>🌐 Coordinates</span>
            </label>
          </div>
        </div>

        {formData.inputMethod === 'location' ? (
          <div className="form-group">
            <label className="form-label">Location Name</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                name="locationInput"
                className="form-input"
                value={formData.locationInput}
                onChange={handleChange}
                placeholder="e.g., Mumbai, Bangalore, Delhi"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLocationSubmit}
                disabled={!formData.locationInput.trim()}
              >
                🔄 Convert
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>
              Enter a location name and click "Convert" to get coordinates
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Coordinates</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="number"
                name="coordinates.lat"
                className="form-input"
                value={formData.coordinates.lat}
                onChange={handleChange}
                placeholder="Latitude"
                step="0.000001"
                required
              />
              <input
                type="number"
                name="coordinates.lng"
                className="form-input"
                value={formData.coordinates.lng}
                onChange={handleChange}
                placeholder="Longitude"
                step="0.000001"
                required
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={getCurrentLocation}
              >
                📍 Use Current
              </button>
            </div>
            {currentLocation && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#718096' }}>
                📍 Current location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </div>
            )}
          </div>
        )}

        {/* Display converted coordinates if available */}
        {formData.coordinates.lat && formData.coordinates.lng && (
          <div className="form-group">
            <div style={{
              padding: '1rem',
              backgroundColor: '#f7fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.5rem' }}>
                📍 Selected Location:
              </div>
              <div style={{ fontSize: '1rem', color: '#4a5568', fontWeight: '500' }}>
                {formData.coordinates.lat}, {formData.coordinates.lng}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`btn btn-primary ${animationState}`}
          disabled={loading || !formData.workerId}
          style={{
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing claim validation...
            </span>
          ) : (
            <span>🚀 Submit Claim</span>
          )}
        </button>

        {/* Tooltip Display */}
        {showTooltip && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: animationState === 'success' ? '#48bb78' : 
                       animationState === 'error' ? '#f56565' : '#3182ce',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {showTooltip}
          </div>
        )}

      </form>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          {result.error ? (
            <div className="alert alert-danger">
              ❌ {result.error}
              {result.details && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Details: {result.details}
                </div>
              )}
            </div>
          ) : (
            <ParametricClaimResult claim={result} />
          )}
        </div>
      )}

      {workers.length === 0 && (
        <div className="alert alert-info">
          ℹ️ No workers registered yet. Please onboard workers first before filing claims.
        </div>
      )}
    </div>
  );
};

export default ClaimSubmission;
