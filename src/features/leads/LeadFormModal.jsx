import { useState } from 'react';
import { X } from 'lucide-react';
import { COURSES, LEAD_SOURCES, LEAD_STATUSES } from '../../constants/crm';

export function LeadFormModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    course_interest: COURSES[0],
    source: LEAD_SOURCES[0],
    status: 'New',
    notes: '',
    assigned_to_name: 'Priya Sharma (Counsellor)'
  });

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      alert('Please fill in Student Name and Contact Phone.');
      return;
    }

    onSave({
      ...formData,
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      notes: formData.notes.trim() || null
    });

    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="form-heading">
          <div>
            <h2>Record Student Enquiry</h2>
            <p>Enter details of prospective student and course enquiry.</p>
          </div>
          <button 
            type="button" 
            className="close-button" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Student Full Name *
            <input
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Ananya Sharma"
            />
          </label>

          <label>
            Phone Number *
            <input
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ananya@example.com"
            />
          </label>

          <label>
            Course Interest *
            <select
              value={formData.course_interest}
              onChange={(e) => setFormData({ ...formData, course_interest: e.target.value })}
            >
              {COURSES.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </label>

          <label>
            Enquiry Source *
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            >
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </label>

          <label>
            Lead Status
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            Counselling Notes / Specific Requirements
            <textarea
              rows={3}
              className="notes-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Working professional interested in weekend batch, requests demo class."
            />
          </label>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save Student Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadFormModal;
