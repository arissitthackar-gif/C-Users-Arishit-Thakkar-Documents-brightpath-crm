import Sidebar from './Sidebar';
import Topbar from './Topbar';

export function AppShell({ 
  activePage, 
  setActivePage, 
  onAddLead, 
  leadsCount = 0, 
  overdueCount = 0,
  userProfile,
  children 
}) {
  return (
    <div className="app-shell">
      <Sidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        leadsCount={leadsCount}
        overdueCount={overdueCount}
        userProfile={userProfile}
      />

      <main className="main-content">
        <Topbar 
          activePage={activePage}
          onAddLead={onAddLead}
          userProfile={userProfile}
        />

        <div className="page-content">
          {children}
          
          <footer className="footer">
            BrightPath CRM <span>•</span> Empowering Student Admissions <span>•</span> Workshop Edition
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AppShell;
