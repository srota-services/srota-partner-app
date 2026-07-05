import type { SettingsSection, SettingsSectionId } from '../settingsSection';

interface SettingsSidebarProps {
  sections: SettingsSection[];
  activeSection: SettingsSectionId;
  onSectionChange: (sectionId: SettingsSectionId) => void;
}

function SettingsSidebar({
  sections,
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <nav className="settings-sidebar" aria-label="Settings sections">
      <ul className="settings-sidebar-list">
        {sections.map(section => (
          <li key={section.id}>
            <button
              type="button"
              className={`settings-sidebar-item${
                activeSection === section.id ? ' settings-sidebar-item--active' : ''
              }`}
              onClick={() => onSectionChange(section.id)}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SettingsSidebar;
