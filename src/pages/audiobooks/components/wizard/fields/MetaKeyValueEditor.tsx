import { useEffect, useState } from 'react';
import CloseButton from '../../../../../components/common/CloseButton';
import '../../../../../styles/pages/audiobooks/components/forms/AudiobookForm.css';

interface MetaKeyValueEditorProps {
  meta: Record<string, string>;
  onChange: (meta: Record<string, string>) => void;
}

function MetaKeyValueEditor({ meta, onChange }: MetaKeyValueEditorProps) {
  const [editingMetaKeys, setEditingMetaKeys] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setEditingMetaKeys(prev => {
      const currentKeys = Object.keys(meta);
      const editingKeys = { ...prev };
      let needsUpdate = false;

      currentKeys.forEach(key => {
        if (!(key in editingKeys)) {
          editingKeys[key] = key;
          needsUpdate = true;
        }
      });

      Object.keys(editingKeys).forEach(key => {
        if (!currentKeys.includes(key)) {
          delete editingKeys[key];
          needsUpdate = true;
        }
      });

      return needsUpdate ? editingKeys : prev;
    });
  }, [meta]);

  const metaEntries = Object.entries(meta).map(([key, value]) => {
    const displayKey =
      editingMetaKeys[key] !== undefined ? editingMetaKeys[key] : key;
    return [displayKey, value, key] as [string, string, string];
  });

  const handleMetaKeyChange = (originalKey: string, newKey: string) => {
    setEditingMetaKeys({
      ...editingMetaKeys,
      [originalKey]: newKey,
    });
  };

  const handleMetaKeyBlur = (originalKey: string) => {
    const newKey = (editingMetaKeys[originalKey] ?? originalKey).trim();

    if (newKey && newKey !== originalKey) {
      const value = meta[originalKey] || '';
      const newMeta = { ...meta };
      delete newMeta[originalKey];
      newMeta[newKey] = value;

      const updatedEditingKeys = { ...editingMetaKeys };
      delete updatedEditingKeys[originalKey];
      updatedEditingKeys[newKey] = newKey;
      setEditingMetaKeys(updatedEditingKeys);
      onChange(newMeta);
    } else if (!newKey.trim()) {
      const newMeta = { ...meta };
      delete newMeta[originalKey];
      const updatedEditingKeys = { ...editingMetaKeys };
      delete updatedEditingKeys[originalKey];
      setEditingMetaKeys(updatedEditingKeys);
      onChange(newMeta);
    }
  };

  const handleMetaValueChange = (key: string, newValue: string) => {
    const newMeta = { ...meta };
    if (key.trim()) {
      newMeta[key] = newValue;
    }
    onChange(newMeta);
  };

  const handleMetaAdd = () => {
    const emptyKey = `__empty_${Date.now()}`;
    onChange({ ...meta, [emptyKey]: '' });
    setEditingMetaKeys({
      ...editingMetaKeys,
      [emptyKey]: '',
    });
  };

  const handleMetaRemove = (key: string) => {
    const newMeta = { ...meta };
    delete newMeta[key];
    onChange(newMeta);
  };

  return (
    <div className="wizard-field-group">
      <label>Additional Info</label>
      <div className="meta-container">
        {metaEntries.length === 0 ? (
          <p className="meta-empty-message">
            No additional info added. Click &quot;Add New&quot; to add more
            details about the audiobook.
          </p>
        ) : (
          metaEntries.map(([displayKey, value, originalKey], index) => (
            <div key={`${originalKey}-${index}`} className="meta-row">
              <input
                type="text"
                value={displayKey}
                onChange={e => handleMetaKeyChange(originalKey, e.target.value)}
                onBlur={() => handleMetaKeyBlur(originalKey)}
                placeholder="Add key (e.g., Producer, DOP, etc.)"
                className="meta-key-input"
              />
              <span className="meta-separator">:</span>
              <input
                type="text"
                value={value}
                onChange={e =>
                  handleMetaValueChange(originalKey, e.target.value)
                }
                placeholder="Add value"
                className="meta-value-input"
              />
              <CloseButton
                size="sm"
                className="meta-remove-button"
                label={`Remove ${originalKey || 'entry'}`}
                onClick={() => handleMetaRemove(originalKey)}
              />
            </div>
          ))
        )}
        <button type="button" className="meta-add-button" onClick={handleMetaAdd}>
          + Add New
        </button>
      </div>
      <p className="meta-hint">
        Add custom key-value pairs for additional information
      </p>
    </div>
  );
}

export default MetaKeyValueEditor;
