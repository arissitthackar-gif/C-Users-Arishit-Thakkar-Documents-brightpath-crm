import { Bell, Plus } from 'lucide-react';

export function Topbar({ 
  activePage, 
  onAddLead, 
  userProfile = { initials: 'AT' }
}) {
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

        <div className="avatar top-avatar" title="Signed in user">
          {userProfile.initials || 'AT'}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
