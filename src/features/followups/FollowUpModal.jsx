import { useState } from 'react';
import { X } from 'lucide-react';

function getInitialDueDate() {
  const tomorrow = new Date(Date.now() + 86400000);
  return new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString().slice(0, 16);
}

export function FollowUpModal({ isOpen, onClose, onSave, leads = [], preselectedLead = null }) {
  const [leadId, setLeadId] = useState(preselectedLead ? preselectedLead.id : (leads[0]?.id || ''));
  const [dueAt, setDueAt] = useState(getInitialDueDate);
  const [note, setNote] = useState('');
  const [assignedToName, setAssignedToName] = useState('Priya Sharma (Counsellor)');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!leadId || !dueAt || !note.trim()) {
      alert('Please fill in all follow-up details.');
      return;
    }

    const matchedLead = leads.find(l => l.id === leadId);

    onSave({
      lead_id: leadId,
      lead_name: matchedLead ? matchedLead.full_name : 'Student Enquiry',
      due_at: new Date(dueAt).toISOString(),
      note: note.trim(),
      status: 'pending',
      assigned_to_name: assignedToName
    });

    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="form-heading">
          <div>
            <h2>Schedule Student Follow-up</h2>
            <p>Set a reminder for counselling callback or admission inquiry.</p>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ gridColumn: '1 / -1' }}>
            Select Student Lead *
            <select 
              value={leadId} 
              onChange={(e) => setLeadId(e.target.value)}
              required
            >
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.full_name} ({lead.course_interest} — {lead.phone})
                </option>
              ))}
            </select>
          </label>

          <label>
            Due Date & Time *
            <input
              type="datetime-local"
              required
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </label>

          <label>
            Assigned Counsellor
            <input
              value={assignedToName}
              onChange={(e) => setAssignedToName(e.target.value)}
            />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            Follow-up Agenda / Note *
            <textarea
              required
              rows={3}
              className="notes-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Follow up on fee installment plan and invite for weekend batch demo."
            />
          </label>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FollowUpModal;
