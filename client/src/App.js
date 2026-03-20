import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import WorkerOnboarding from './components/WorkerOnboarding';
import ClaimSubmission from './components/ClaimSubmission';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DemoMode from './components/DemoMode';
import WorkerProfileCards from './components/WorkerProfileCards';

// Set base URL for API calls
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://gigshield-backend-2y02.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://gigshield-backend-2y02.onrender.com'
});

function App() {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [workers, setWorkers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Failed to fetch analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch workers
  const fetchWorkers = async () => {
    try {
      const response = await api.get('/api/workers');
      setWorkers(response.data.workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchWorkers();
  }, []);

  // Handle worker creation
  const handleWorkerCreated = (worker) => {
    setWorkers([...workers, worker]);
    showNotification('Worker onboarded successfully!');
    fetchAnalytics();
  };

  // Handle worker update
  const handleWorkerUpdated = (updatedWorker) => {
    if (updatedWorker.deleted) {
      // Worker was deleted
      setWorkers(workers.filter(w => w.id !== updatedWorker.id));
      showNotification('Worker deleted successfully!');
    } else {
      // Worker was updated
      setWorkers(workers.map(w => w.id === updatedWorker.id ? updatedWorker : w));
      showNotification('Worker profile updated successfully!');
    }
    fetchAnalytics();
  };

  // Handle claim submission
  const handleClaimSubmitted = (claim) => {
    showNotification(claim.message, claim.status === 'approved' ? 'success' : 'info');
    fetchAnalytics();
    fetchWorkers();
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            🛡️ <span>GigShield</span>
          </div>
          <div className="tagline">
            AI-Powered Income Protection for Gig Workers
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Navigation */}
      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
          onClick={() => setActiveTab('onboarding')}
        >
          📝 Worker Onboarding
        </button>
        <button
          className={`nav-btn ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          👥 Worker Profiles
        </button>
        <button
          className={`nav-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          🌧️ File Claim
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`nav-btn ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          🎮 Demo Mode
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'onboarding' && (
          <WorkerOnboarding onWorkerCreated={handleWorkerCreated} />
        )}
        
        {activeTab === 'profiles' && (
          <WorkerProfileCards 
            workers={workers} 
            onWorkerUpdated={handleWorkerUpdated}
          />
        )}
        
        {activeTab === 'claims' && (
          <ClaimSubmission 
            workers={workers} 
            onClaimSubmitted={handleClaimSubmitted}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            analytics={analytics} 
            loading={loading}
            onRefresh={fetchAnalytics}
          />
        )}
        
        {activeTab === 'demo' && (
          <DemoMode 
            workers={workers}
            onClaimSubmitted={handleClaimSubmitted}
            onNotification={showNotification}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2026 GigShield Hackathon Prototype | Real-time AI-driven insurance for the gig economy</p>
      </footer>
    </div>
  );
}

export default App;
