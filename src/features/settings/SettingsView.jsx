import { useState } from 'react';
import { 
  User, 
  Shield, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Code2,
  Table
} from 'lucide-react';
import { CONSOLIDATED_MIGRATION_SQL } from '../../constants/migrationSql';

export function SettingsView({ 
  userProfile = { name: 'Arishit Thakkar', role: 'Administrator', email: 'arishit@brightpath.edu' } 
}) {
  const [copied, setCopied] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id')
  );

  function handleCopySql() {
    navigator.clipboard.writeText(CONSOLIDATED_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const schemaTables = [
    { name: 'profiles', desc: '1:1 with auth.users (roles: admin, manager, counsellor)', rls: 'Enabled' },
    { name: 'leads', desc: 'Student enquiries (courses, sources, status, assigned counsellor)', rls: 'Enabled' },
    { name: 'follow_ups', desc: 'Scheduled callbacks, demo sessions, overdue detection', rls: 'Enabled' },
    { name: 'activities', desc: 'Immutable chronological audit trail of admissions workflow', rls: 'Enabled' }
  ];

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Workspace & Profile Settings</h2>
            <p>Review staff access permissions, academy configuration, and database connectivity.</p>
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
                Note: Roles are strictly enforced by Row Level Security (RLS) policies.
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
                  <AlertCircle size={15} /> Ready for Supabase Credentials
                </div>
              )}
              <small style={{ color: '#8892a4', display: 'block', marginTop: '6px' }}>
                VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'Pending setup in .env'}
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* Database Migration & RLS Suite (Phase 3 Feature) */}
      <section className="content-card">
        <div className="card-heading" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2>Database Schema, Migrations & RLS Suite</h2>
            <p>All PostgreSQL tables, RLS policies, and seed data are prepared and version-controlled under <code>supabase/migrations/</code>.</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noreferrer" 
              className="secondary-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <span>Open Supabase</span>
              <ExternalLink size={13} />
            </a>

            <button 
              className="primary-button" 
              onClick={handleCopySql}
              style={{ minWidth: '190px' }}
            >
              {copied ? (
                <>
                  <Check size={15} /> <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={15} /> <span>Copy Migration SQL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Setup Walkthrough Banner */}
        <div className="sql-setup-steps">
          <div className="setup-step-item">
            <span className="step-num">1</span>
            <div>
              <strong>Create Project</strong>
              <p>Sign in at <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a> and create a free project.</p>
            </div>
          </div>
          <div className="setup-step-item">
            <span className="step-num">2</span>
            <div>
              <strong>Open SQL Editor</strong>
              <p>In Supabase dashboard left menu, select <strong>SQL Editor</strong>.</p>
            </div>
          </div>
          <div className="setup-step-item">
            <span className="step-num">3</span>
            <div>
              <strong>Paste & Run</strong>
              <p>Click the <strong>Copy Migration SQL</strong> button above, paste, and click <strong>Run</strong>.</p>
            </div>
          </div>
          <div className="setup-step-item">
            <span className="step-num">4</span>
            <div>
              <strong>Copy API Keys</strong>
              <p>From <strong>Project Settings → API</strong>, copy URL & Anon Key into your <code>.env</code> file.</p>
            </div>
          </div>
        </div>

        {/* Database Tables Overview */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '13px', margin: '0 0 10px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Table size={15} />
            <span>Target Tables & Row Level Security (RLS) Status</span>
          </h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>TABLE NAME</th>
                  <th>PURPOSE & SCOPE</th>
                  <th>SECURITY (RLS)</th>
                  <th>SOURCE MIGRATION</th>
                </tr>
              </thead>
              <tbody>
                {schemaTables.map((tbl) => (
                  <tr key={tbl.name}>
                    <td>
                      <code style={{ background: '#eef2ff', color: '#4359df', padding: '3px 7px', borderRadius: '5px', fontWeight: 600 }}>
                        public.{tbl.name}
                      </code>
                    </td>
                    <td>{tbl.desc}</td>
                    <td>
                      <span className="status-badge badge-qualified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={11} /> {tbl.rls}
                      </span>
                    </td>
                    <td>
                      <small style={{ color: '#8892a4' }}>supabase/migrations/000_full_setup.sql</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collapsible SQL Preview */}
        <div style={{ marginTop: '20px' }}>
          <button 
            className="secondary-button"
            onClick={() => setShowSqlPreview(!showSqlPreview)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Code2 size={14} />
            <span>{showSqlPreview ? 'Hide SQL Code Preview' : 'Show SQL Code Preview (000_full_setup.sql)'}</span>
          </button>

          {showSqlPreview && (
            <div className="sql-code-preview">
              <pre><code>{CONSOLIDATED_MIGRATION_SQL}</code></pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default SettingsView;
