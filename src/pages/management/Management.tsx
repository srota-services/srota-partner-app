/**
 * Manage page — assets placeholder
 */
import React from 'react';
import '../../styles/pages/management/Management.css';

const Management: React.FC = () => {
  return (
    <div className="management-page">
      <div className="management-header">
        <h1 className="page-title">Manage</h1>
        <p className="page-subtitle">
          Configure and manage your publishing assets.
        </p>
      </div>

      <section className="manage-assets-section marketing-card">
        <h2 className="manage-assets-heading">Assets</h2>
        <div className="manage-assets-empty">
          <p className="manage-assets-empty-message">
            No assets yet. Asset management will be available here.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Management;
