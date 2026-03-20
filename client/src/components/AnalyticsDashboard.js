import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = ({ analytics, loading, onRefresh }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker);
  };

  const closeModal = () => {
    setSelectedWorker(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card">
        <h2 className="card-title">📊 Analytics Dashboard</h2>
        <div className="alert alert-info">
          No analytics data available yet. Start by onboarding workers and processing claims.
        </div>
      </div>
    );
  }

  const { stats, riskDistribution, claimsByType, workers, fraudAlerts } = analytics;

  // Prepare chart data
  const riskData = [
    { name: 'Low Risk', value: riskDistribution.low, color: '#48bb78' },
    { name: 'Medium Risk', value: riskDistribution.medium, color: '#ed8936' },
    { name: 'High Risk', value: riskDistribution.high, color: '#f56565' }
  ];

  const claimsData = [
    { name: 'Weather Claims', value: claimsByType.weather, color: '#4299e1' },
    { name: 'Other Claims', value: claimsByType.other, color: '#9f7aea' }
  ];

  const fraudData = [
    { name: 'Safe', value: workers.filter(w => w.fraudScore <= 30).length, color: '#48bb78' },
    { name: 'Flagged', value: workers.filter(w => w.fraudScore > 30 && w.fraudScore <= 60).length, color: '#ed8936' },
    { name: 'Fraud', value: workers.filter(w => w.fraudScore > 60).length, color: '#f56565' }
  ];

  // Calculate real-time earnings protection data
  const calculateEarningsProtection = () => {
    if (!workers || workers.length === 0) {
      return {
        totalPotential: 0,
        weeklyProtected: 0,
        atRisk: 0,
        protectionPercentage: 0
      };
    }

    // Calculate total weekly potential earnings (daily earnings * 7 days)
    const totalPotential = workers.reduce((sum, worker) => {
      const dailyEarnings = worker.averageDailyEarnings || 0;
      return sum + (dailyEarnings * 7);
    }, 0);

    // Calculate protected amount based on active policies
    // Protection covers up to daily earnings * number of active policy days
    const activePolicies = workers.filter(w => {
      const createdAt = new Date(w.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      return daysDiff < 7; // Active if less than 7 days old
    });

    const weeklyProtected = activePolicies.reduce((sum, worker) => {
      const dailyEarnings = worker.averageDailyEarnings || 0;
      // Protected for up to 3 days of disruption per week
      return sum + (dailyEarnings * 3);
    }, 0);

    const atRisk = totalPotential - weeklyProtected;
    const protectionPercentage = totalPotential > 0 ? Math.round((weeklyProtected / totalPotential) * 100) : 0;

    return {
      totalPotential,
      weeklyProtected,
      atRisk,
      protectionPercentage
    };
  };

  const earningsData = calculateEarningsProtection();

  return (
    <div>
      {/* Emotional Impact Metric */}
      <div className="card">
        <h3 className="card-title">💝 Weekly Earnings Protection</h3>
        
        <div style={{
          background: 'linear-gradient(135deg, #f7fafc, #edf2f7)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
            animation: 'pulse 3s infinite'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Protection Meter */}
            <div style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 2rem',
              position: 'relative'
            }}>
              {/* Circular Progress Background */}
              <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - earningsData.protectionPercentage / 100)}`}
                  style={{
                    transition: 'stroke-dashoffset 1s ease-in-out'
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center Content */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#4a5568',
                  marginBottom: '0.25rem'
                }}>
                  {earningsData.protectionPercentage}%
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  fontWeight: '500'
                }}>
                  Protected
                </div>
              </div>
            </div>

            {/* Protection Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#48bb78',
                  marginBottom: '0.25rem'
                }}>
                  ₹{earningsData.weeklyProtected.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#718096'
                }}>
                  Weekly Protected
                </div>
              </div>
              
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#4a5568',
                  marginBottom: '0.25rem'
                }}>
                  ₹{earningsData.totalPotential.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#718096'
                }}>
                  Total Potential
                </div>
              </div>
              
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#ed8936',
                  marginBottom: '0.25rem'
                }}>
                  ₹{earningsData.atRisk.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#718096'
                }}>
                  At Risk
                </div>
              </div>
            </div>

            {/* Impact Message */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              display: 'inline-block',
              fontSize: '0.95rem',
              fontWeight: '500',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              🛡️ <strong>{earningsData.protectionPercentage}% of weekly earnings</strong> protected by parametric insurance across {workers.length} active workers
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #ebf8ff, #bee3f8)',
          borderLeft: '4px solid #3182ce',
          boxShadow: '0 4px 20px rgba(49, 130, 206, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '0.5rem',
            gap: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              color: '#3182ce' 
            }}>🛡️</div>
            <div className="stat-value" style={{ color: '#2c5282' }}>{workers.length}</div>
          </div>
          <div className="stat-label" style={{ color: '#2c5282', fontWeight: '600' }}>Active Weekly Policies</div>
          <div className="stat-change positive" style={{ 
            background: 'rgba(72, 187, 120, 0.1)', 
            color: '#22543d',
            borderRadius: '20px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem'
          }}>
            ↑ 12% from last week
          </div>
        </div>
        
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          borderLeft: '4px solid #48bb78',
          boxShadow: '0 4px 20px rgba(72, 187, 120, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '0.5rem',
            gap: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              color: '#48bb78' 
            }}>📈</div>
            <div className="stat-value" style={{ color: '#22543d' }}>{stats.claimsTriggered}</div>
          </div>
          <div className="stat-label" style={{ color: '#22543d', fontWeight: '600' }}>Claims Triggered</div>
          <div className="stat-change positive" style={{ 
            background: 'rgba(72, 187, 120, 0.1)', 
            color: '#22543d',
            borderRadius: '20px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem'
          }}>
            ↑ 8% from last week
          </div>
        </div>
        
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #fff5f5, #fed7d7)',
          borderLeft: '4px solid #f56565',
          boxShadow: '0 4px 20px rgba(245, 101, 101, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '0.5rem',
            gap: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              color: '#f56565' 
            }}>⚠️</div>
            <div className="stat-value" style={{ color: '#742a2a' }}>{stats.fraudFlags}</div>
          </div>
          <div className="stat-label" style={{ color: '#742a2a', fontWeight: '600' }}>Fraud Flags</div>
          <div className="stat-change negative" style={{ 
            background: 'rgba(245, 101, 101, 0.1)', 
            color: '#742a2a',
            borderRadius: '20px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem'
          }}>
            ↑ 3% from last week
          </div>
        </div>
        
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          borderLeft: '4px solid #48bb78',
          boxShadow: '0 4px 20px rgba(72, 187, 120, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '0.5rem',
            gap: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              color: '#48bb78' 
            }}>💰</div>
            <div className="stat-value" style={{ color: '#22543d' }}>₹{stats.totalPayoutVolume.toLocaleString()}</div>
          </div>
          <div className="stat-label" style={{ color: '#22543d', fontWeight: '600' }}>Estimated Payout Volume</div>
          <div className="stat-change positive" style={{ 
            background: 'rgba(72, 187, 120, 0.1)', 
            color: '#22543d',
            borderRadius: '20px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem'
          }}>
            ↑ 15% from last week
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Risk Distribution Chart */}
        <div className="card">
          <h3 className="card-title">📊 Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                minAngle={5}
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: '500' }}>
                    {value}: {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Risk Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f7fafc',
            borderRadius: '8px'
          }}>
            {riskData.map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: item.color, 
                  borderRadius: '50%',
                  margin: '0 auto 0.25rem auto'
                }}></div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>{item.name}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4a5568' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claims by Type Chart */}
        <div className="card">
          <h3 className="card-title">📈 Claims by Disruption Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={claimsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#718096', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fill: '#718096', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value} claims`, 'Count']}
              />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                animationBegin={0}
                animationDuration={800}
              >
                {claimsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Claims Summary */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f7fafc',
            borderRadius: '8px'
          }}>
            {claimsData.map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: item.color, 
                  borderRadius: '2px',
                  margin: '0 auto 0.25rem auto'
                }}></div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>{item.name}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4a5568' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fraud Detection Analysis */}
      <div className="card">
        <h3 className="card-title">🔍 Fraud Detection Analysis</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Fraud Distribution Chart */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#4a5568', fontSize: '1.1rem' }}>
              Fraud Risk Distribution
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={fraudData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {fraudData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value} workers`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Fraud Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              {fraudData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: item.color, 
                    borderRadius: '50%'
                  }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fraud Metrics */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#4a5568', fontSize: '1.1rem' }}>
              Fraud Detection Metrics
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fff4',
                border: '1px solid #9ae6b4',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#22543d', fontWeight: '500' }}>
                    ✅ Safe Workers
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#68d391' }}>
                    Low fraud risk
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22543d' }}>
                  {fraudData[0].value}
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                backgroundColor: '#fffdf7',
                border: '1px solid #fbd38d',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#744210', fontWeight: '500' }}>
                    ⚠️ Flagged Workers
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#f6ad55' }}>
                    Requires review
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#744210' }}>
                  {fraudData[1].value}
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                backgroundColor: '#fff5f5',
                border: '1px solid #fc8181',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#742a2a', fontWeight: '500' }}>
                    🚨 Fraud Detected
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#f56565' }}>
                    High risk activity
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#742a2a' }}>
                  {fraudData[2].value}
                </div>
              </div>
            </div>
            
            {/* Fraud Rate */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '8px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Overall Fraud Rate
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                {workers.length > 0 ? ((fraudData[2].value / workers.length) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI Fraud Score Panel */}
      <div className="card">
        <h3 className="card-title">🧠 Explainable AI Fraud Analysis</h3>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f7fafc, #edf2f7)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h4 style={{ 
              margin: 0, 
              color: '#4a5568', 
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Fraud Score Breakdown
            </h4>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              AI-Powered Analysis
            </div>
          </div>

          <div style={{ 
            fontSize: '0.9rem', 
            color: '#718096', 
            marginBottom: '1.5rem',
            fontStyle: 'italic'
          }}>
            "Fraud risk calculated using behavioral anomaly heuristics and real-time pattern recognition."
          </div>

          {/* Sample Fraud Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #f56565'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '500' }}>
                  📍 GPS Location Jump
                </span>
                <span style={{ 
                  background: '#fed7d7', 
                  color: '#c53030', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  +30
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                Suspicious movement patterns detected between claim locations
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #ed8936'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '500' }}>
                  ⚡ High Claim Frequency
                </span>
                <span style={{ 
                  background: '#feebc8', 
                  color: '#c05621', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  +20
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                Multiple claims submitted within suspicious timeframe
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #f6ad55'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '500' }}>
                  🌤️ Weather Mismatch
                </span>
                <span style={{ 
                  background: '#fef5e7', 
                  color: '#d69e2e', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  +10
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                Reported conditions don't match real-time weather data
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #9f7aea'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '500' }}>
                  🌐 Network Anomaly
                </span>
                <span style={{ 
                  background: '#e9d8fd', 
                  color: '#6b46c1', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  +15
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                Suspicious IP address or VPN usage detected
              </div>
            </div>
          </div>

          {/* Risk Threshold Legend */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#495057', marginBottom: '0.75rem' }}>
              Risk Assessment Thresholds
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', background: '#48bb78', borderRadius: '50%' }}></div>
                <span><strong>0-30:</strong> Safe - Process normally</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', background: '#ed8936', borderRadius: '50%' }}></div>
                <span><strong>31-60:</strong> Flagged - Manual review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', background: '#f56565', borderRadius: '50%' }}></div>
                <span><strong>61+:</strong> Fraud - Block & investigate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="card">
        <h3 className="card-title">👥 Workers Overview</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>City</th>
                <th>Premium/Week</th>
                <th>Claim Status</th>
                <th>Last Claim Status</th>
                <th>Last Payout</th>
                <th>Fraud Score</th>
                <th>Risk Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id} style={{ cursor: 'pointer' }} onClick={() => handleWorkerClick(worker)}>
                  <td><strong>{worker.name}</strong></td>
                  <td>{worker.city}</td>
                  <td>₹{worker.premium}</td>
                  <td>
                    <span className={`badge ${worker.claimStatus === 'has_claims' ? 'badge-success' : 'badge-secondary'}`}>
                      {worker.claimStatus === 'has_claims' ? 'Has Claims' : 'No Claims'}
                      <span style={{ opacity: 0.7, marginLeft: '4px', fontSize: '0.75rem' }}>
                        ({worker.claimCount || 0})
                      </span>
                    </span>
                  </td>
                  <td>
                    {worker.lastClaimStatus !== 'N/A' ? (
                      <span className={`badge ${
                        worker.lastClaimStatus === 'approved' ? 'badge-success' : 
                        worker.lastClaimStatus === 'no_payout' ? 'badge-warning' : 'badge-secondary'
                      }`}>
                        {worker.lastClaimStatus === 'approved' ? '✅ Approved' : 
                         worker.lastClaimStatus === 'no_payout' ? '⚠️ No Payout' : worker.lastClaimStatus}
                      </span>
                    ) : (
                      <span style={{ color: '#718096', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {worker.lastClaimPayout > 0 && worker.lastClaimFraudScore <= 30 ? (
                      <span style={{ color: '#48bb78', fontWeight: '600' }}>
                        ₹{worker.lastClaimPayout}
                      </span>
                    ) : worker.lastClaimPayout > 0 ? (
                      <span style={{ color: '#ed8936', fontSize: '0.85rem' }}>
                        Risk High
                      </span>
                    ) : (
                      <span style={{ color: '#718096', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`risk-badge risk-${
                      worker.fraudScore <= 30 ? 'low' : 
                      worker.fraudScore <= 60 ? 'medium' : 'high'
                    }`}>
                      {worker.fraudScore}
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge risk-${
                      worker.fraudScore <= 30 ? 'low' : 
                      worker.fraudScore <= 60 ? 'medium' : 'high'
                    }`}>
                      {worker.fraudScore <= 30 ? 'SAFE' : 
                       worker.fraudScore <= 60 ? 'FLAGGED' : 'FRAUD'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWorkerClick(worker);
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      📋 View Claims
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fraud Alerts */}
      {fraudAlerts && fraudAlerts.length > 0 && (
        <div className="card">
          <h3 className="card-title">🚨 Fraud Alerts</h3>
          {fraudAlerts.map((alert) => (
            <div key={alert.id} className="alert alert-danger">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{alert.type === 'coordinated_fraud' ? '🚨 Coordinated Fraud Detected' : '⚠️ Suspicious Activity'}</strong>
                  <div style={{ marginTop: '0.5rem' }}>{alert.message}</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                    Coordinates: {alert.coordinates?.lat}, {alert.coordinates?.lng} | 
                    Time: {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Refresh Analytics
        </button>
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
        }} onClick={closeModal}>
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
                onClick={closeModal}
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
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedWorker.claimCount || 0}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Total Payout</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{selectedWorker.totalPayout || 0}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>Fraud Score</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedWorker.fraudScore}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>City</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedWorker.city}</div>
                </div>
              </div>
            </div>

            {/* Claims List */}
            {selectedWorker.claims && selectedWorker.claims.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedWorker.claims.map((claim, index) => (
                  <div key={claim.id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: claim.fraudScore <= 30 ? '#f0fff4' : claim.fraudScore <= 60 ? '#fffaf0' : '#fff5f5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{
                          background: claim.status === 'approved' ? '#48bb78' : 
                                     claim.status === 'no_payout' ? '#ed8936' : '#a0aec0',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {claim.status === 'approved' ? '✅ Approved' : 
                           claim.status === 'no_payout' ? '⚠️ No Payout' : claim.status}
                        </span>
                        <span style={{ marginLeft: '0.5rem', color: '#718096', fontSize: '0.85rem' }}>
                          #{index + 1}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: claim.payoutAmount > 0 ? '#48bb78' : '#718096' }}>
                          {claim.payoutAmount > 0 ? `₹${claim.payoutAmount}` : '—'}
                        </div>
                        {claim.fraudScore <= 30 && claim.payoutAmount > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#48bb78' }}>Low Risk - Paid</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                      <div>
                        <span style={{ color: '#718096' }}>Claim Type:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>{claim.claimType}</span>
                      </div>
                      <div>
                        <span style={{ color: '#718096' }}>Fraud Score:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '500', color: claim.fraudScore <= 30 ? '#48bb78' : claim.fraudScore <= 60 ? '#ed8936' : '#e53e3e' }}>
                          {claim.fraudScore} ({claim.fraudCategory})
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#718096' }}>Date:</span>
                        <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                          {new Date(claim.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {claim.weatherData && (
                        <div>
                          <span style={{ color: '#718096' }}>Weather:</span>
                          <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                            {claim.weatherData.condition} ({claim.weatherData.rainfall}mm rain)
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#718096', fontSize: '0.85rem' }}>Claim ID: </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#4a5568' }}>{claim.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>No claims found for this worker.</p>
              </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                className="btn btn-primary"
                onClick={closeModal}
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

export default AnalyticsDashboard;
