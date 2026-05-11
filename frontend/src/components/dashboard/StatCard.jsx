import React from 'react'

const StatCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <div className="label">{label}</div>
        <div className="value">{value}</div>
      </div>
    </div>
  )
}

export default StatCard
