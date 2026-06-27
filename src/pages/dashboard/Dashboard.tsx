/**
 * Dashboard page
 */
import React from 'react';
import { useCurrentOrganization } from '../../hooks/useCurrentOrganization';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/pages/dashboard/Dashboard.css';

const Dashboard: React.FC = () => {
  const { organization, loading } = useCurrentOrganization();

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        {loading ? (
          <div className="dashboard-org-brand dashboard-org-brand--loading">
            <LoadingSpinner />
          </div>
        ) : organization ? (
          <div className="dashboard-org-brand">
            {organization.image ? (
              <img
                src={organization.image}
                alt=""
                className="dashboard-org-brand-logo"
              />
            ) : (
              <div
                className="dashboard-org-brand-logo dashboard-org-brand-logo--placeholder"
                aria-hidden="true"
              />
            )}
            <span className="dashboard-org-brand-name">{organization.name}</span>
          </div>
        ) : null}
      </header>

      <div className="placeholder-content">
        <p>Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
};

export default Dashboard;
