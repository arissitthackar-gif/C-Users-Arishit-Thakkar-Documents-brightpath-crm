import { User, Shield, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export function SettingsView({ 
  userProfile = { name: 'Arishit Thakkar', role: 'Administrator', email: 'arishit@brightpath.edu' } 
}) {
  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id')
  );

  return (
    <section className="content-card">
      <div className="card-heading">
        <div>
          <h2>Workspace & Profile Settings</h2>
          <p>Review user access permissions, academy configuration, and database connectivity.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* User Profile Card */}
        <div className="settings-card">
          <div className="settings-card-head">
            <User size={18} />
            <h3>Your Profile</h3>
          </div>
          <div className="settings-field">
            <label>Full Name</label>
            <div>{userProfile.name}</div>
          </div>
          <div className="settings-field">
            <label>Assigned Role</label>
            <div className="role-pill">
              <Shield size={13} /> {userProfile.role}
            </div>
            <small style={{ color: '#8892a4', display: 'block', marginTop: '4px' }}>
              Note: Roles are protected by Row Level Security (RLS) and cannot be escalated through the frontend.
            </small>
          </div>
        </div>

        {/* Database Connection Card */}
        <div className="settings-card">
          <div className="settings-card-head">
            <Database size={18} />
            <h3>Database & Persistence Status</h3>
          </div>
          <div className="settings-field">
            <label>Supabase Backend</label>
            {isSupabaseConfigured ? (
              <div className="conn-status-badge success">
                <CheckCircle2 size={15} /> Configured with Remote PostgreSQL
              </div>
            ) : (
              <div className="conn-status-badge pending">
                <AlertCircle size={15} /> Ready for Supabase Credentials (Phase 2 & 3)
              </div>
            )}
            <small style={{ color: '#8892a4', display: 'block', marginTop: '6px' }}>
              VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'Not yet set in .env'}
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsView;
