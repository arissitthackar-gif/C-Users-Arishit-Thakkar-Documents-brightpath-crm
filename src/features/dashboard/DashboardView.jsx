import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  CalendarClock, 
  BarChart2 
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { LEAD_STATUSES } from '../../constants/crm';

export function DashboardView({ 
  leads = [], 
  followUps = [], 
  onAddLead, 
  onNavigate 
}) {
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  
  // Overdue follow-ups: pending and due before now
  const now = new Date();
  const overdueFollowUps = followUps.filter(f => {
    return f.status === 'pending' && new Date(f.due_at) < now;
  });

  const conversionRate = totalLeads > 0 
    ? ((convertedLeads / totalLeads) * 100).toFixed(1) 
    : '0.0';

  const recentLeads = leads.slice(0, 5);

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">BRIGHTPATH ACADEMY OVERVIEW</div>
          <h1>Good to see you again.</h1>
          <p className="page-subtitle">
            Here is the current status of student enquiries and admissions pipeline today.
          </p>
        </div>
        <button className="primary-button" onClick={onAddLead}>
          <span>＋</span> Add new student lead
        </button>
      </section>

      {/* KPI Cards */}
      <section className="stats-grid">
        <StatCard
          title="Total Enquiries"
          value={totalLeads}
          subtext="Active student records"
          highlightText="Permitted"
          icon={Users}
          colorClass="blue"
        />
        <StatCard
          title="New Enquiries"
          value={newLeads}
          subtext="Awaiting first counselling"
          highlightText="Fresh"
          icon={Sparkles}
          colorClass="violet"
        />
        <StatCard
          title="Overdue Follow-ups"
          value={overdueFollowUps.length}
          subtext={overdueFollowUps.length > 0 ? 'Requires immediate action' : 'All follow-ups on track'}
          highlightText={overdueFollowUps.length > 0 ? 'Attention' : 'On Track'}
          icon={AlertCircle}
          colorClass={overdueFollowUps.length > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title="Admissions Converted"
          value={convertedLeads}
          subtext={`Conversion Rate: ${conversionRate}%`}
          highlightText="Enrolled"
          icon={CheckCircle2}
          colorClass="green"
        />
      </section>

      {/* Recent Enquiries Table */}
      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Recent Student Enquiries</h2>
            <p>Latest prospects received across website, walk-ins, and referrals.</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('Leads')}>
            View all enquiries →
          </button>
        </div>

        {recentLeads.length === 0 ? (
          <div className="empty-table">No student enquiries recorded yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>PHONE</th>
                  <th>COURSE INTEREST</th>
                  <th>SOURCE</th>
                  <th>STATUS</th>
                  <th>COUNSELLOR</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="lead-person">
                        <div className="lead-avatar">
                          {lead.full_name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>{lead.full_name}</strong>
                          <small>{lead.email || 'No email provided'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{lead.phone}</td>
                    <td>
                      <strong>{lead.course_interest}</strong>
                    </td>
                    <td>{lead.source}</td>
                    <td>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td>{lead.assigned_to_name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pipeline Snapshot & Quick Actions */}
      <section className="bottom-grid">
        <div className="content-card">
          <div className="card-heading">
            <div>
              <h2>Admissions Funnel Snapshot</h2>
              <p>Breakdown of enquiries by counselling stage.</p>
            </div>
          </div>

          {LEAD_STATUSES.map((status) => {
            const count = leads.filter((l) => l.status === status).length;
            const percent = totalLeads ? ((count / totalLeads) * 100).toFixed(0) : 0;
            return (
              <div className="pipeline-row" key={status}>
                <div className="pipeline-label">
                  <span>{status}</span>
                  <strong>
                    {count} ({percent}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill status-${status.toLowerCase()}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="content-card quick-card">
          <div className="card-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Common operational workflows.</p>
            </div>
          </div>

          <button onClick={onAddLead} className="quick-action">
            <span className="quick-icon">
              <PlusCircle size={18} />
            </span>
            <span>
              <strong>Record New Student Enquiry</strong>
              <small>Capture walk-in or website lead details</small>
            </span>
            <b>→</b>
          </button>

          <button onClick={() => onNavigate('Follow-ups')} className="quick-action">
            <span className="quick-icon violet">
              <CalendarClock size={18} />
            </span>
            <span>
              <strong>Review Today's Follow-ups</strong>
              <small>
                {overdueFollowUps.length > 0 
                  ? `${overdueFollowUps.length} follow-up(s) overdue`
                  : 'Check upcoming student callbacks'}
              </small>
            </span>
            <b>→</b>
          </button>

          <button onClick={() => onNavigate('Reports')} className="quick-action">
            <span className="quick-icon green">
              <BarChart2 size={18} />
            </span>
            <span>
              <strong>Course & Conversion Reports</strong>
              <small>Analyze source efficacy & batch demand</small>
            </span>
            <b>→</b>
          </button>
        </div>
      </section>
    </>
  );
}

export default DashboardView;
