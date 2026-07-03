/**
 * Dashboard page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { useCurrentOrganization } from '../../hooks/useCurrentOrganization';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AppImage from '../../components/common/AppImage';
import { isAuthorMarketplaceContext } from '../../utils/marketplaceContext';
import '../../styles/pages/dashboard/Dashboard.css';

const Dashboard: React.FC = () => {
  const { role, appType, user } = useAppSelector(state => state.auth);
  const { organization, loading } = useCurrentOrganization();
  const isAuthorContext = isAuthorMarketplaceContext(appType, role);
  const displayName = user?.name?.trim() || 'Author';

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
            <AppImage
              src={organization.image}
              alt=""
              variant="organization"
              className="dashboard-org-brand-logo"
            />
            <span className="dashboard-org-brand-name">{organization.name}</span>
          </div>
        ) : null}
      </header>

      {isAuthorContext ? (
        <div className="dashboard-welcome marketing-card">
          <h3 className="dashboard-welcome-title">Welcome, {displayName}!</h3>
          <p className="dashboard-welcome-text">
            Your author workspace is ready. Analytics and insights are coming
            soon. In the meantime, visit the{' '}
            <Link to="/marketplace" className="dashboard-welcome-link">
              Marketplace
            </Link>{' '}
            to discover organizations you can connect with.
          </p>
        </div>
      ) : (
        <div className="placeholder-content">
          <p>Analytics dashboard coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
