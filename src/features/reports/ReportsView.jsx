import { useState } from 'react';
import { Download, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { COURSES, LEAD_SOURCES } from '../../constants/crm';

export function ReportsView({ leads = [] }) {
  const [dateRange, setDateRange] = useState('All Time');

  const total = leads.length;
  const converted = leads.filter(l => l.status === 'Converted').length;
  const qualified = leads.filter(l => l.status === 'Qualified').length;
  const lost = leads.filter(l => l.status === 'Lost').length;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

  function exportCSV() {
    const headers = ['ID', 'Student Name', 'Phone', 'Email', 'Course Interest', 'Source', 'Status', 'Counsellor', 'Created At'];
    const rows = leads.map(l => [
      l.id,
      `"${l.full_name}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${l.course_interest}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      `"${l.assigned_to_name || ''}"`,
      `"${l.created_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brightpath_leads_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">ACADEMIC PERFORMANCE & PIPELINE</div>
          <h1>Admissions & Course Demand Analytics</h1>
          <p className="page-subtitle">
            Evaluate lead source channels, popular courses, and conversion efficacy.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
          </select>
          <button className="primary-button" onClick={exportCSV}>
            <Download size={15} /> Export Enquiries (CSV)
          </button>
        </div>
      </section>

      {/* Summary Highlights */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-top"><span>Total Enquiries</span><BarChart3 size={16} /></div>
          <strong>{total}</strong>
          <div className="stat-foot">Student enquiries recorded</div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Qualified Prospects</span><TrendingUp size={16} /></div>
          <strong>{qualified}</strong>
          <div className="stat-foot">High probability candidates</div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Confirmed Admissions</span><TrendingUp size={16} /></div>
          <strong>{converted}</strong>
          <div className="stat-foot"><span className="positive">{conversionRate}%</span> conversion rate</div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Lost Enquiries</span><PieChart size={16} /></div>
          <strong>{lost}</strong>
          <div className="stat-foot">{total ? ((lost / total) * 100).toFixed(1) : 0}% drop-off rate</div>
        </article>
      </section>

      {/* Course & Source Breakdown */}
      <section className="bottom-grid">
        <div className="content-card">
          <div className="card-heading">
            <div>
              <h2>Course Interest Breakdown</h2>
              <p>Demand distribution across coaching programs.</p>
            </div>
          </div>

          {COURSES.map((course) => {
            const count = leads.filter(l => l.course_interest === course).length;
            const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
            return (
              <div className="pipeline-row" key={course}>
                <div className="pipeline-label">
                  <span>{course}</span>
                  <strong>{count} ({percent}%)</strong>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percent}%`, background: '#5365e8' }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="content-card">
          <div className="card-heading">
            <div>
              <h2>Lead Acquisition Sources</h2>
              <p>Enquiry volume by marketing channel.</p>
            </div>
          </div>

          {LEAD_SOURCES.map((source) => {
            const count = leads.filter(l => l.source === source).length;
            const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
            return (
              <div className="pipeline-row" key={source}>
                <div className="pipeline-label">
                  <span>{source}</span>
                  <strong>{count} ({percent}%)</strong>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percent}%`, background: '#24a982' }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default ReportsView;
