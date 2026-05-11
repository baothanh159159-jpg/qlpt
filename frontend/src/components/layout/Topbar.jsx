import React from 'react'
import { Bell, Search } from 'lucide-react'

const Topbar = ({ role }) => {
  const getTitle = () => {
    return 'Bảng Điều Khiển Tổng Quan'
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{getTitle()}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Trải nghiệm mượt mà, quản lý trong tầm tay.
        </p>
      </div>

      <div className="topbar-right flex items-center gap-2" style={{ gap: '1.5rem' }}>
        <button style={{ position: 'relative', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            width: '8px', 
            height: '8px', 
            backgroundColor: 'var(--danger)', 
            borderRadius: '50%',
            border: '2px solid white'
          }}></span>
        </button>
        
        <div className="user-profile" style={{ margin: 0, padding: '0.25rem 0.5rem', background: 'none' }}>
           <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
             {role === 'admin' ? 'A' : role === 'landlord' ? 'L' : 'T'}
           </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar
