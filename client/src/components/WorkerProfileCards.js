import React, { useState } from 'react';
import axios from 'axios';

// Set base URL for API calls
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://gigshield-backend-2y02.onrender.com';

const WorkerProfileCards = ({ workers, onWorkerUpdated }) => {
  const [editingWorker, setEditingWorker] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleViewClaims = (worker) => {
    setSelectedWorker(worker);
  };

  const closeClaimsModal = () => {
    setSelectedWorker(null);
  };
  if (!workers || workers.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">👥 Worker Profiles</h3>
        <div className="alert alert-info">
          ℹ️ No workers onboarded yet. Start by registering workers to see their profiles.
        </div>
      </div>
    );
  }

  const getRiskLevelColor = (score) => {
    if (score <= 30) return 'risk-low';
    if (score <= 60) return 'risk-medium';
    return 'risk-high';
  };

  const getRiskLevelText = (score) => {
    if (score <= 30) return 'LOW';
    if (score <= 60) return 'MEDIUM';
    return 'HIGH';
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'swiggy': return '🟡';
      case 'zomato': return '🔴';
      case 'uber_eats': return '⚫';
      default: return '🚚';
    }
  };

  const getCoverageStatus = (worker) => {
    const createdAt = new Date(worker.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const coveragePeriod = 7; // Weekly coverage
    const daysLeft = Math.max(0, coveragePeriod - daysDiff);
    
    return {
      status: daysLeft > 0 ? 'Active' : 'Expired',
      daysLeft,
      startDate: createdAt.toLocaleDateString(),
      endDate: new Date(createdAt.getTime() + coveragePeriod * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isActive: daysLeft > 0
    };
  };

  const getOperatingZoneLabel = (worker) => {
    if (worker.floodRiskZone && worker.pollutionRiskZone) {
      return 'High-Risk Coastal Region';
    } else if (worker.floodRiskZone) {
      return 'Flood-Prone Coastal Region';
    } else if (worker.pollutionRiskZone) {
      return 'High-Pollution Urban Zone';
    } else {
      return 'Standard Operating Zone';
    }
  };

  const handleEditClick = (worker) => {
    setEditingWorker(worker.id);
    setEditFormData({
      name: worker.name,
      city: worker.city,
      platform: worker.platform,
      averageDailyEarnings: worker.averageDailyEarnings || '',
      workingHours: worker.workingHours || '',
      floodRiskZone: worker.floodRiskZone || false,
      pollutionRiskZone: worker.pollutionRiskZone || false
    });
  };

  const handleEditCancel = () => {
    setEditingWorker(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`/api/workers/${editingWorker}`, editFormData);
      
      if (response.data.success) {
        onWorkerUpdated && onWorkerUpdated(response.data.worker);
        setEditingWorker(null);
        setEditFormData({});
      }
    } catch (error) {
      console.error('Error updating worker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorker = async (workerId, workerName) => {
    if (!window.confirm(`Are you sure you want to delete ${workerName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`/api/workers/${workerId}`);
      
      if (response.data.success) {
        onWorkerUpdated && onWorkerUpdated({ id: workerId, deleted: true });
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting worker:', error);
      alert('Failed to delete worker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">👥 Worker Profiles</h3>
      <p className="card-subtitle">
        Active gig workers with AI-calculated risk profiles and coverage details
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem',
        marginTop: '1.5rem'
      }}>
        {workers.map((worker) => (
          <div 
            key={worker.id} 
            className="worker-profile-card"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            }}
          >
            {/* Worker Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div>
                <h4 style={{ 
                  margin: '0 0 0.25rem 0', 
                  color: '#2d3748',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  {worker.name}
                </h4>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#718096',
                  fontSize: '0.9rem'
                }}>
                  <span>{getPlatformIcon(worker.platform)}</span>
                  <span>{worker.platform}</span>
                  <span>•</span>
                  <span>📍 {worker.city}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span className={`risk-badge ${getRiskLevelColor(worker.riskScore)}`}>
                  {getRiskLevelText(worker.riskScore)}
                </span>
                <button
                  onClick={() => handleEditClick(worker)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    color: '#718096',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f7fafc';
                    e.currentTarget.style.color = '#4a5568';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'none';
                    e.currentTarget.style.color = '#718096';
                  }}
                  title="Edit worker profile"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteWorker(worker.id, worker.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    color: '#718096',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff5f5';
                    e.currentTarget.style.color = '#e53e3e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'none';
                    e.currentTarget.style.color = '#718096';
                  }}
                  title="Delete worker profile"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Edit Form */}
            {editingWorker === worker.id && (
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '16px',
                padding: '1.5rem',
                zIndex: 10,
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.1rem' }}>
                    ✏️ Edit Worker Profile
                  </h3>
                  <button
                    onClick={handleEditCancel}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      color: '#718096'
                    }}
                  >
                    ❌
                  </button>
                </div>
                
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Worker Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={editFormData.city}
                      onChange={handleEditChange}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Platform</label>
                    <select
                      name="platform"
                      className="form-select"
                      value={editFormData.platform}
                      onChange={handleEditChange}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    >
                      <option value="swiggy">Swiggy</option>
                      <option value="zomato">Zomato</option>
                      <option value="uber_eats">Uber Eats</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Average Daily Earnings (₹)</label>
                    <input
                      type="number"
                      name="averageDailyEarnings"
                      className="form-input"
                      value={editFormData.averageDailyEarnings}
                      onChange={handleEditChange}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>Working Hours per Day</label>
                    <input
                      type="number"
                      name="workingHours"
                      className="form-input"
                      value={editFormData.workingHours}
                      onChange={handleEditChange}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                      min="1"
                      max="16"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Risk Assessment</label>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="floodRiskZone"
                          className="form-checkbox"
                          checked={editFormData.floodRiskZone}
                          onChange={handleEditChange}
                          style={{ marginRight: '0.25rem' }}
                        />
                        <span>🌊 Flood Risk Zone</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="pollutionRiskZone"
                          className="form-checkbox"
                          checked={editFormData.pollutionRiskZone}
                          onChange={handleEditChange}
                          style={{ marginRight: '0.25rem' }}
                        />
                        <span>💨 High Pollution Zone</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      {loading ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Worker Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                background: '#f7fafc', 
                padding: '0.75rem', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#4a5568' 
                }}>
                  ₹{worker.weeklyPremium}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#718096',
                  marginTop: '0.25rem'
                }}>
                  Weekly Premium
                </div>
              </div>
              <div style={{ 
                background: '#f7fafc', 
                padding: '0.75rem', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#4a5568' 
                }}>
                  {worker.riskScore}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#718096',
                  marginTop: '0.25rem'
                }}>
                  Risk Score
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#718096',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Average Daily Earnings:</span>
                <strong style={{ color: '#4a5568' }}>₹{worker.averageDailyEarnings || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Working Hours:</span>
                <strong style={{ color: '#4a5568' }}>{worker.workingHours || 0}h/day</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Claims History:</span>
                <strong style={{ color: '#4a5568' }}>
                  {worker.claimHistory ? worker.claimHistory.length : 0} claims
                </strong>
              </div>
            </div>

            {/* Coverage Lifecycle */}
            {(() => {
              const coverage = getCoverageStatus(worker);
              return (
                <div style={{ 
                  background: coverage.isActive 
                    ? 'linear-gradient(135deg, #f0fff4, #e6fffa)' 
                    : 'linear-gradient(135deg, #fff5f5, #fed7d7)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: `1px solid ${coverage.isActive ? '#9ae6b4' : '#fc8181'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: '600',
                      color: coverage.isActive ? '#22543d' : '#742a2a'
                    }}>
                      {coverage.isActive ? '🛡️ Active Weekly Coverage' : '⚠️ Coverage Expired'}
                    </span>
                    <span style={{
                      background: coverage.isActive ? '#48bb78' : '#f56565',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {coverage.daysLeft} days left
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: coverage.isActive ? '#68d391' : '#fc8181',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{coverage.startDate}</span>
                    <span>→</span>
                    <span>{coverage.endDate}</span>
                  </div>
                </div>
              );
            })()}

            {/* Operating Zone Intelligence */}
            <div style={{
              background: 'linear-gradient(135deg, #f7fafc, #edf2f7)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#718096', 
                marginBottom: '0.25rem',
                fontWeight: '500'
              }}>
                Operating Zone Intelligence
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#4a5568',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1rem' }}>📍</span>
                {getOperatingZoneLabel(worker)}
              </div>
            </div>

            {/* Risk Indicators */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              flexWrap: 'wrap',
              marginTop: 'auto'
            }}>
              {worker.floodRiskZone && (
                <span style={{
                  background: 'linear-gradient(135deg, #4299e1, #3182ce)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  🌊 Flood Zone
                </span>
              )}
              {worker.pollutionRiskZone && (
                <span style={{
                  background: 'linear-gradient(135deg, #9f7aea, #805ad5)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  💨 Pollution Zone
                </span>
              )}
              {worker.claimHistory && worker.claimHistory.length > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #48bb78, #38a169)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  ✅ Active Coverage
                </span>
              )}
            </div>

            {/* View Claims Button */}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={() => handleViewClaims(worker)}
                className="btn btn-sm btn-primary"
                style={{ 
                  width: '100%',
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                📋 View Claims History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem',
        background: '#f7fafc',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a5568' }}>
            {workers.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#718096' }}>Total Workers</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#48bb78' }}>
            {workers.filter(w => w.riskScore <= 30).length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#718096' }}>Low Risk</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ed8936' }}>
            {workers.filter(w => w.riskScore > 30 && w.riskScore <= 60).length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#718096' }}>Medium Risk</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f56565' }}>
            {workers.filter(w => w.riskScore > 60).length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#718096' }}>High Risk</div>
        </div>
      </div>

      {/* Worker Claims Detail Modal */}
      {selectedWorker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={closeClaimsModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#2d3748' }}>
                📋 {selectedWorker.name}'s Claims History
              </h2>
              <button 
                onClick={closeClaimsModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                ✕
              </button>
            </div>

            {/* Worker Summary */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Total Claims</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {selectedWorker.claimHistory ? selectedWorker.claimHistory.length : 0}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Risk Score</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedWorker.riskScore}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>City</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedWorker.city}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Premium/Week</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{selectedWorker.weeklyPremium}</div>
                </div>
              </div>
            </div>

            {/* Claims List */}
            {selectedWorker.claimHistory && selectedWorker.claimHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedWorker.claimHistory.map((claimId, index) => (
                  <div key={claimId} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{
                          background: '#4299e1',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          Claim #{index + 1}
                        </span>
                        <span style={{ marginLeft: '0.5rem', color: '#718096', fontSize: '0.85rem' }}>
                          Claim ID: {claimId}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#718096' }}>
                          View Details
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                      <div>
                        <span style={{ color: '#718096' }}>Claim Type:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>Weather Disruption</span>
                      </div>
                      <div>
                        <span style={{ color: '#718096' }}>Date:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#4299e1', fontSize: '0.85rem', cursor: 'pointer' }}>
                        🔍 Click to view full claim details in Analytics Dashboard
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>No claims found for this worker.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  This worker has not filed any claims yet.
                </p>
              </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                className="btn btn-primary"
                onClick={closeClaimsModal}
                style={{ minWidth: '150px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfileCards;
