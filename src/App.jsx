import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import DashboardView from './features/dashboard/DashboardView';
import LeadsView from './features/leads/LeadsView';
import FollowUpsView from './features/followups/FollowUpsView';
import ActivitiesView from './features/activities/ActivitiesView';
import ReportsView from './features/reports/ReportsView';
import SettingsView from './features/settings/SettingsView';
import LeadFormModal from './features/leads/LeadFormModal';
import FollowUpModal from './features/followups/FollowUpModal';
import { INITIAL_DEMO_LEADS, INITIAL_DEMO_FOLLOW_UPS } from './constants/crm';
import './App.css';

export function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [leads, setLeads] = useState(INITIAL_DEMO_LEADS);
  const [followUps, setFollowUps] = useState(INITIAL_DEMO_FOLLOW_UPS);
  const [activities, setActivities] = useState([
    {
      id: 'act-init-1',
      type: 'created',
      description: 'Enquiry recorded for Aarav Shah (Full Stack Web Development).',
      actor: 'Priya Sharma (Counsellor)',
      timestamp: '2 hours ago'
    },
    {
      id: 'act-init-2',
      type: 'status_changed',
      description: 'Admission confirmed for Neha Desai (Python for Beginners).',
      actor: 'Arishit Thakkar (Admin)',
      timestamp: 'Yesterday'
    }
  ]);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [leadForFollowUp, setLeadForFollowUp] = useState(null);

  const userProfile = {
    name: 'Arishit Thakkar',
    role: 'Administrator',
    initials: 'AT',
    email: 'arishit@brightpath.edu'
  };

  // Overdue follow-ups count for sidebar badge
  const now = new Date();
  const overdueCount = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) < now
  ).length;

  function handleAddLead(leadData) {
    const newLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setLeads((prev) => [newLead, ...prev]);

    // Log Activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'created',
        description: `New enquiry captured for ${newLead.full_name} (${newLead.course_interest}).`,
        actor: `${userProfile.name} (${userProfile.role})`,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    setActivePage('Leads');
  }

  function handleDeleteLead(leadId) {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!window.confirm(`Are you sure you want to delete the enquiry for ${targetLead?.full_name || 'this student'}?`)) {
      return;
    }

    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setFollowUps((prev) => prev.filter((f) => f.lead_id !== leadId));

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'deleted',
        description: `Enquiry removed for ${targetLead?.full_name || 'Student'}.`,
        actor: `${userProfile.name} (${userProfile.role})`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
  }

  function handleStatusChange(leadId, newStatus) {
    let lostReason = null;
    if (newStatus === 'Lost') {
      lostReason = window.prompt('Please enter the reason for marking this enquiry as Lost:');
      if (!lostReason) return; // Cancelled
    }

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, lost_reason: lostReason } : l))
    );

    const targetLead = leads.find((l) => l.id === leadId);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'status_changed',
        description: `Status changed to ${newStatus} for ${targetLead?.full_name}${
          lostReason ? ` (Reason: ${lostReason})` : ''
        }.`,
        actor: `${userProfile.name} (${userProfile.role})`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
  }

  function handleOpenScheduleFollowUp(lead = null) {
    setLeadForFollowUp(lead);
    setIsFollowUpModalOpen(true);
  }

  function handleSaveFollowUp(followUpData) {
    const newFollowUp = {
      ...followUpData,
      id: `fu-${Date.now()}`
    };

    setFollowUps((prev) => [newFollowUp, ...prev]);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'followup_scheduled',
        description: `Follow-up callback scheduled for ${newFollowUp.lead_name}: "${newFollowUp.note}".`,
        actor: `${userProfile.name} (${userProfile.role})`,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    setActivePage('Follow-ups');
  }

  function handleCompleteFollowUp(followUpId) {
    const target = followUps.find((f) => f.id === followUpId);
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUpId ? { ...f, status: 'completed', completed_at: new Date().toISOString() } : f
      )
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: 'followup_completed',
        description: `Follow-up completed for ${target?.lead_name || 'Student'}.`,
        actor: `${userProfile.name} (${userProfile.role})`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
  }

  return (
    <AppShell
      activePage={activePage}
      setActivePage={setActivePage}
      onAddLead={() => setIsLeadModalOpen(true)}
      leadsCount={leads.length}
      overdueCount={overdueCount}
      userProfile={userProfile}
    >
      {activePage === 'Dashboard' && (
        <DashboardView
          leads={leads}
          followUps={followUps}
          onAddLead={() => setIsLeadModalOpen(true)}
          onNavigate={(page) => setActivePage(page)}
        />
      )}

      {activePage === 'Leads' && (
        <LeadsView
          leads={leads}
          onAddLead={() => setIsLeadModalOpen(true)}
          onDeleteLead={handleDeleteLead}
          onStatusChange={handleStatusChange}
          onScheduleFollowUp={handleOpenScheduleFollowUp}
        />
      )}

      {activePage === 'Follow-ups' && (
        <FollowUpsView
          followUps={followUps}
          onCompleteFollowUp={handleCompleteFollowUp}
          onOpenScheduleModal={() => handleOpenScheduleFollowUp(null)}
        />
      )}

      {activePage === 'Activities' && <ActivitiesView activities={activities} />}

      {activePage === 'Reports' && <ReportsView leads={leads} />}

      {activePage === 'Settings' && <SettingsView userProfile={userProfile} />}

      {/* Modals */}
      <LeadFormModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={handleAddLead}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setLeadForFollowUp(null);
        }}
        onSave={handleSaveFollowUp}
        leads={leads}
        preselectedLead={leadForFollowUp}
      />
    </AppShell>
  );
}

export default App;
