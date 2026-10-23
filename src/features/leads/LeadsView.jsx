import { useState, useMemo } from 'react';
import { Search, Plus, RotateCcw, Calendar, Trash2 } from 'lucide-react';
import { LEAD_STATUSES, LEAD_SOURCES, COURSES } from '../../constants/crm';

export function LeadsView({ 
  leads = [], 
  onAddLead, 
  onDeleteLead, 
  onStatusChange,
  onScheduleFollowUp 
}) {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || [
        lead.full_name,
        lead.phone,
        lead.email,
        lead.notes,
        lead.course_interest
      ].some(val => val && val.toLowerCase().includes(query));

      const matchesCourse = selectedCourse === 'All' || lead.course_interest === selectedCourse;
      const matchesStatus = selectedStatus === 'All' || lead.status === selectedStatus;
      const matchesSource = selectedSource === 'All' || lead.source === selectedSource;

      return matchesSearch && matchesCourse && matchesStatus && matchesSource;
    });
  }, [leads, search, selectedCourse, selectedStatus, selectedSource]);

  const hasActiveFilters = search || selectedCourse !== 'All' || selectedStatus !== 'All' || selectedSource !== 'All';

  function resetFilters() {
    setSearch('');
    setSelectedCourse('All');
    setSelectedStatus('All');
    setSelectedSource('All');
  }

  return (
    <section className="content-card">
      <div className="card-heading leads-header-row">
        <div>
          <h2>Student Enquiries ({filteredLeads.length})</h2>
          <p>Manage, qualify, and track prospective student admissions.</p>
        </div>
        <button className="primary-button" onClick={onAddLead}>
          <Plus size={16} /> Add Student Lead
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-bar">
        <div className="search-box-wrap">
          <Search size={16} className="search-icon-inside" />
          <input
            className="search-input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, phone, email..."
          />
        </div>

        <div className="filter-selects">
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Courses</option>
            {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            {LEAD_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>

          <select 
            value={selectedSource} 
            onChange={(e) => setSelectedSource(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Sources</option>
            {LEAD_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
          </select>

          {hasActiveFilters && (
            <button className="reset-filter-btn" onClick={resetFilters} title="Reset all filters">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredLeads.length === 0 ? (
        <div className="empty-table">
          <p>No student leads match your current search and filter criteria.</p>
          {hasActiveFilters && (
            <button className="secondary-button" onClick={resetFilters} style={{ marginTop: '10px' }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>PHONE / CONTACT</th>
                <th>COURSE INTEREST</th>
                <th>SOURCE</th>
                <th>STATUS</th>
                <th>COUNSELLOR</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
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
                  <td>
                    <span className="phone-cell">{lead.phone}</span>
                  </td>
                  <td>
                    <strong>{lead.course_interest}</strong>
                  </td>
                  <td>{lead.source}</td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange && onStatusChange(lead.id, e.target.value)}
                      className="status-dropdown-inline"
                    >
                      {LEAD_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>{lead.assigned_to_name || 'Unassigned'}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="table-action-btn"
                        onClick={() => onScheduleFollowUp && onScheduleFollowUp(lead)}
                        title="Schedule Follow-up"
                      >
                        <Calendar size={14} />
                      </button>
                      <button 
                        className="table-action-btn danger"
                        onClick={() => onDeleteLead && onDeleteLead(lead.id)}
                        title="Delete Enquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

export default LeadsView;
