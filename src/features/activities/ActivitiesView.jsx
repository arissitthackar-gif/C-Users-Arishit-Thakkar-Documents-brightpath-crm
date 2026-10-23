import { Activity, Clock, UserCheck, CalendarCheck, FileText, CheckCircle } from 'lucide-react';

export function ActivitiesView({ activities = [] }) {
  const defaultActivities = [
    {
      id: 'act-1',
      type: 'created',
      description: 'New enquiry recorded for Aarav Shah (Full Stack Web Development).',
      actor: 'Priya Sharma (Counsellor)',
      timestamp: '2 hours ago',
      icon: FileText
    },
    {
      id: 'act-2',
      type: 'status_changed',
      description: 'Status updated to Converted for Neha Desai (Python for Beginners).',
      actor: 'Arishit Thakkar (Admin)',
      timestamp: '1 day ago',
      icon: CheckCircle
    },
    {
      id: 'act-3',
      type: 'followup_scheduled',
      description: 'Follow-up scheduled with Priya Patel regarding Data Science demo lecture.',
      actor: 'Rohan Verma (Counsellor)',
      timestamp: '1 day ago',
      icon: CalendarCheck
    },
    {
      id: 'act-4',
      type: 'status_changed',
      description: 'Status updated to Lost for Kabir Joshi (Reason: Location too far).',
      actor: 'Rohan Verma (Counsellor)',
      timestamp: '2 days ago',
      icon: UserCheck
    }
  ];

  const items = activities.length > 0 ? activities : defaultActivities;

  return (
    <section className="content-card">
      <div className="card-heading">
        <div>
          <h2>Operational Activity History</h2>
          <p>Chronological audit log of student interactions, admissions, and follow-up activities.</p>
        </div>
      </div>

      <div className="timeline-container">
        {items.map((item) => {
          const Icon = item.icon || Activity;
          return (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-icon-wrap">
                <Icon size={16} />
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>{item.description}</strong>
                  <span className="timeline-time">
                    <Clock size={12} /> {item.timestamp}
                  </span>
                </div>
                <div className="timeline-actor">
                  <span>Logged by: </span>
                  <strong>{item.actor}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ActivitiesView;
