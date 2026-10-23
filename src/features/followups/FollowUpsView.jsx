import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export function FollowUpsView({ 
  followUps = [], 
  onCompleteFollowUp,
  onOpenScheduleModal 
}) {
  const [filterTab, setFilterTab] = useState('All');

  const now = new Date();

  const enrichedFollowUps = followUps.map((fu) => {
    const isOverdue = fu.status === 'pending' && new Date(fu.due_at) < now;
    return {
      ...fu,
      isOverdue,
      displayStatus: isOverdue ? 'Overdue' : fu.status
    };
  });

  const overdueCount = enrichedFollowUps.filter((f) => f.isOverdue).length;

  const filtered = enrichedFollowUps.filter((fu) => {
    if (filterTab === 'Overdue') return fu.isOverdue;
    if (filterTab === 'Upcoming') return fu.status === 'pending' && !fu.isOverdue;
    if (filterTab === 'Completed') return fu.status === 'completed';
    return true; // All
  });

  function formatDateTime(isoString) {
    if (!isoString) return 'Not set';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <section className="content-card">
      <div className="card-heading leads-header-row">
        <div>
          <h2>Student Follow-up Tasks ({followUps.length})</h2>
          <p>Track scheduled callbacks, demo class reminders, and counselling sessions.</p>
        </div>
        {onOpenScheduleModal && (
          <button className="primary-button" onClick={onOpenScheduleModal}>
            <Plus size={16} /> Schedule Follow-up
          </button>
        )}
      </div>

      {overdueCount > 0 && (
        <div className="overdue-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Attention: {overdueCount} follow-up callback(s) are overdue!</strong>
            <p>Please contact these students promptly to keep admissions momentum.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar">
        {['All', 'Overdue', 'Upcoming', 'Completed'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${filterTab === tab ? 'active' : ''}`}
            onClick={() => setFilterTab(tab)}
          >
            {tab}
            {tab === 'Overdue' && overdueCount > 0 && (
              <span className="tab-pill-badge">{overdueCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-table">
          <p>No follow-ups found in this view.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STUDENT LEAD</th>
                <th>DUE DATE & TIME</th>
                <th>COUNSELLING NOTE</th>
                <th>STATUS</th>
                <th>COUNSELLOR</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fu) => (
                <tr key={fu.id} className={fu.isOverdue ? 'row-overdue' : ''}>
                  <td>
                    <strong>{fu.lead_name || 'Enquiry #' + fu.lead_id}</strong>
                  </td>
                  <td>
                    <div className="due-date-cell">
                      <Clock size={13} />
                      <span>{formatDateTime(fu.due_at)}</span>
                    </div>
                  </td>
                  <td className="note-cell">{fu.note}</td>
                  <td>
                    <StatusBadge status={fu.displayStatus} />
                  </td>
                  <td>{fu.assigned_to_name || 'Assigned Counsellor'}</td>
                  <td>
                    {fu.status === 'pending' ? (
                      <button
                        className="complete-btn"
                        onClick={() => onCompleteFollowUp && onCompleteFollowUp(fu.id)}
                        title="Mark follow-up as completed"
                      >
                        <CheckCircle size={14} /> Done
                      </button>
                    ) : (
                      <span className="completed-label">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default FollowUpsView;
