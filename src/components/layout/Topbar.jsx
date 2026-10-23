import { useState } from 'react';
import { Bell, Plus, LogIn, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export function Topbar({ activePage, onAddLead }) {
  const { user, role, displayName, initials, openAuthModal, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        Workspace <span>/</span> {activePage}
      </div>

      <div className="topbar-actions">
        <button 
          className="topbar-quick-add" 
          onClick={onAddLead}
          title="Add a new student enquiry"
        >
          <Plus size={14} />
          <span>New Lead</span>
        </button>

        <span className="today-label">BrightPath Academy</span>
        
        <button className="notification" aria-label="Notifications" title="Notifications">
          <Bell size={16} />
        </button>

        {user ? (
          <div className="user-menu-wrapper">
            <button 
              className="user-profile-button" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User account menu"
            >
              <div className="avatar top-avatar">
                {initials}
              </div>
              <ChevronDown size={13} className={`chevron-icon ${showUserMenu ? 'rotated' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="user-dropdown-card">
                <div className="dropdown-header">
                  <strong>{displayName}</strong>
                  <small>{user.email}</small>
                  <div className="role-chip">
                    <Shield size={11} />
                    <span>{role.toUpperCase()}</span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="signin-topbar-btn"
            onClick={() => openAuthModal('signin')}
            title="Sign in to your staff account"
          >
            <LogIn size={14} />
            <span>Staff Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Topbar;
