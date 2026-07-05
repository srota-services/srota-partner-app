import AppImage from './AppImage';

interface IndividualProfilePreviewProps {
  fullName: string;
  photoPreviewUrl: string | null;
  compact?: boolean;
}

function IndividualProfilePreview({
  fullName,
  photoPreviewUrl,
  compact = false,
}: IndividualProfilePreviewProps) {
  const displayName = fullName.trim() || 'Your Name';

  return (
    <div
      className={`individual-profile-preview${
        compact ? ' individual-profile-preview--compact' : ' marketing-card'
      }`}
    >
      <p className="individual-profile-preview-label">Preview</p>
      <div className="individual-profile-preview-card">
        <div className="individual-profile-preview-header">
          <AppImage
            src={photoPreviewUrl}
            alt=""
            variant="author"
            className="individual-profile-preview-avatar"
          />
          <div>
            <p className="individual-profile-preview-name">{displayName}</p>
            <span className="individual-profile-preview-badge">Individual</span>
          </div>
        </div>
        {!compact && (
          <p className="individual-profile-preview-desc">
            Visible to listeners and collaborators
          </p>
        )}
      </div>
    </div>
  );
}

export default IndividualProfilePreview;
