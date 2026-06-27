import {
  BarChart3,
  FileText,
  Plus,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SolidIcon from '../../../../components/common/SolidIcon';
import '../../../../styles/pages/audiobooks/components/widgets/Widgets.css';

function QuickActionsWidget() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Upload Audio',
      icon: Upload,
      onClick: () => navigate('/audiobooks/create'),
    },
    {
      label: 'Add Chapter',
      icon: Plus,
      onClick: () => navigate('/audiobooks/create'),
    },
    { label: 'View Analytics', icon: BarChart3, onClick: () => navigate('/analytics') },
    { label: 'Manage Authors', icon: FileText, onClick: () => navigate('/management') },
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
