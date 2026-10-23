import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Activity, 
  BarChart3, 
  Settings,
  HelpCircle,
  LogIn,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

const NAV_ITEMS = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Leads', label: 'Student Leads', icon: Users, badgeKey: 'leads' },
  { id: 'Follow-ups', label: 'Follow-ups', icon: CalendarClock, badgeKey: 'followUps' },
  { id: 'Activities', label: 'Activities', icon: Activity },
  { id: 'Reports', label: 'Reports', icon: BarChart3 },
  { id: 'Settings', label: 'Settings', icon: Settings }
];

export function Sidebar({ 
  activePage, 
  setActivePage, 
  leadsCount = 0, 
  overdueCount = 0
}) {
  const { user, displayName, role, initials, openAuthModal, signOut } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">B</div>
        <div>
          <strong>BrightPath</strong>
          <span>ACADEMY CRM</span>
        </div>
      </div>

      <div className="workspace-label">WORKSPACE</div>
      <nav className="navigation" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          let countBadge = null;
          if (item.badgeKey === 'leads' && leadsCount > 0) {
            countBadge = <span className="nav-count">{leadsCount}</span>;
          } else if (item.badgeKey === 'followUps' && overdueCount > 0) {
            countBadge = <span className="nav-count nav-count-alert">{overdueCount}</span>;
          }

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
              {countBadge}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon">
            <HelpCircle size={18} />
          </div>
          <strong>BrightPath Academy</strong>
          <p>Enquiry & admissions workflow organized in one place.</p>
        </div>

        {user ? (
          <div className="profile">
            <div className="avatar">{initials}</div>
            <div className="profile-info">
              <strong>{displayName}</strong>
              <span style={{ textTransform: 'capitalize' }}>{role}</span>
            </div>
            <button 
              className="icon-btn-ghost" 
              onClick={signOut} 
              aria-label="Sign out"
              title="Sign Out"
            >
              <LogOut size={15} className="profile-menu" />
            </button>
          </div>
        ) : (
          <div className="sidebar-guest-card">
            <div className="guest-info">
              <strong>Guest / Demo Mode</strong>
              <span>Sign in to access team data</span>
            </div>
            <button 
              className="sidebar-signin-btn"
              onClick={() => openAuthModal('signin')}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
