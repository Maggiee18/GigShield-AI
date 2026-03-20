import React, { useState } from 'react';
import axios from 'axios';

const WorkerOnboarding = ({ onWorkerCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    platform: 'swiggy',
    averageDailyEarnings: '',
    workingHours: '',
    floodRiskZone: false,
    pollutionRiskZone: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/workers', formData);
      
      if (response.data.success) {
        setResult(response.data.worker);
        onWorkerCreated(response.data.worker);
        
        // Reset form
        setFormData({
          name: '',
          city: '',
          platform: 'swiggy',
          averageDailyEarnings: '',
          workingHours: '',
          floodRiskZone: false,
          pollutionRiskZone: false
        });
      }
    } catch (error) {
      console.error('Error creating worker:', error);
      setResult({ error: 'Failed to onboard worker. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        📝 Worker Onboarding
      </h2>
      <p className="card-subtitle">
        Register gig workers for AI-driven income protection coverage
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Worker Name</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter worker name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            name="city"
            className="form-input"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., Mumbai, Bangalore, Delhi"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Platform</label>
          <select
            name="platform"
            className="form-select"
            value={formData.platform}
            onChange={handleChange}
          >
            <option value="swiggy">Swiggy</option>
            <option value="zomato">Zomato</option>
            <option value="uber_eats">Uber Eats</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Average Daily Earnings (₹)</label>
          <input
            type="number"
            name="averageDailyEarnings"
            className="form-input"
            value={formData.averageDailyEarnings}
            onChange={handleChange}
            placeholder="e.g., 800"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Working Hours per Day</label>
          <input
            type="number"
            name="workingHours"
            className="form-input"
            value={formData.workingHours}
            onChange={handleChange}
            placeholder="e.g., 8"
            min="1"
            max="16"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Risk Assessment</label>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="floodRiskZone"
                className="form-checkbox"
                checked={formData.floodRiskZone}
                onChange={handleChange}
              />
              <span style={{ marginLeft: '0.5rem' }}>🌊 Flood Risk Zone</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="pollutionRiskZone"
                className="form-checkbox"
                checked={formData.pollutionRiskZone}
                onChange={handleChange}
              />
              <span style={{ marginLeft: '0.5rem' }}>💨 High Pollution Zone</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Processing...' : '🚀 Onboard Worker'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          {result.error ? (
            <div className="alert alert-danger">
              ❌ {result.error}
            </div>
          ) : (
            <div className="alert alert-success">
              <h3 style={{ marginBottom: '1rem' }}>✅ Worker Successfully Onboarded!</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Name:</strong> {result.name}
                </div>
                <div>
                  <strong>City:</strong> {result.city}
                </div>
                <div>
                  <strong>Platform:</strong> {result.platform}
                </div>
                <div>
                  <strong>Weekly Premium:</strong> ₹{result.weeklyPremium}
                </div>
                <div>
                  <strong>Risk Level:</strong> 
                  <span className={`risk-badge risk-${result.riskLevel.toLowerCase()}`} style={{ marginLeft: '0.5rem' }}>
                    {result.riskLevel}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                <strong>🤖 AI Risk Analysis:</strong> Premium adjusted using AI-driven hyperlocal risk modeling based on location, weather patterns, and historical data.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerOnboarding;
