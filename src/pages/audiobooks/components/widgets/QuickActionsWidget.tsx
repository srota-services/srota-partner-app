import {
  BarChart3,
  Plus,
  Store,
  Upload,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../../hooks/redux';
import SolidIcon from '../../../../components/common/SolidIcon';
import {
  isAuthorMarketplaceContext,
  isOrgMarketplaceContext,
} from '../../../../utils/marketplaceContext';
import '../../../../styles/pages/audiobooks/components/widgets/Widgets.css';

function QuickActionsWidget() {
  const navigate = useNavigate();
  const { role, appType } = useAppSelector(state => state.auth);

  const discoveryAction = useMemo(() => {
    if (isOrgMarketplaceContext(appType, role)) {
      return {
        label: 'Browse Discovery',
        icon: Store,
        onClick: () => navigate('/discovery'),
      };
    }
    if (isAuthorMarketplaceContext(appType, role)) {
      return {
        label: 'Find Organizations',
        icon: Store,
        onClick: () => navigate('/discovery'),
      };
    }
    return null;
  }, [appType, role, navigate]);

  const actions = [
    {
      label: 'Upload Audio',
      icon: Upload,
      onClick: () => navigate('/library/create'),
    },
    {
      label: 'Add Chapter',
      icon: Plus,
      onClick: () => navigate('/library/create'),
    },
    { label: 'View Analytics', icon: BarChart3, onClick: () => navigate('/analytics') },
    ...(discoveryAction ? [discoveryAction] : []),
  ];

  return (
    <div className="audiobook-widget marketing-card">
      <h3 className="audiobook-widget-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              className="quick-action-btn"
              onClick={action.onClick}
            >
              <span className="quick-action-icon">
                <SolidIcon icon={Icon} size={18} />
              </span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActionsWidget;
