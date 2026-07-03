import AppImage from './AppImage';

interface OrganizationBrandPreviewProps {
  organizationName: string;
  logoPreviewUrl: string | null;
  compact?: boolean;
}

function OrganizationBrandPreview({
  organizationName,
  logoPreviewUrl,
  compact = false,
}: OrganizationBrandPreviewProps) {
  const displayName = organizationName.trim() || 'Your Organization';

  return (
    <div
      className={`org-brand-preview${compact ? ' org-brand-preview--compact' : ' marketing-card'}`}
    >
      <p className="org-brand-preview-label">Brand preview</p>
      <div className="org-brand-preview-card">
        <div className="org-brand-preview-header">
          <AppImage
            src={logoPreviewUrl}
            alt=""
            variant="organization"
            className="org-brand-preview-logo"
          />
          <div>
            <p className="org-brand-preview-name">{displayName}</p>
            <span className="org-brand-preview-badge">Partner</span>
          </div>
        </div>
        {!compact && (
          <>
            <p className="org-brand-preview-desc">
              Discover and listen to amazing audiobooks from our catalog.
            </p>
            <div className="org-brand-preview-stats">
              <span>128 Titles</span>
              <span>10M+ Listeners</span>
              <span>4.8 Rating</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrganizationBrandPreview;
