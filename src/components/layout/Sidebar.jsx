import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Activity, 
  BarChart3, 
  Settings,
  HelpCircle,
  MoreVertical
} from 'lucide-react';

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
  overdueCount = 0,
  userProfile = { name: 'Arishit Thakkar', role: 'Administrator', initials: 'AT' }
}) {
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

        <div className="profile">
          <div className="avatar">{userProfile.initials || 'AT'}</div>
          <div className="profile-info">
            <strong>{userProfile.name}</strong>
            <span>{userProfile.role}</span>
          </div>
          <button className="icon-btn-ghost" aria-label="Profile actions">
            <MoreVertical size={16} className="profile-menu" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
