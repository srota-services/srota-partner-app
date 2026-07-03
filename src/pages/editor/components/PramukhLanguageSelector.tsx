import Select from '../../../components/common/Select';
import {
  DEFAULT_PRAMUKH_LANGUAGE_ID,
  PRAMUKH_LANGUAGES,
} from '../../../constants/pramukhLanguages';

interface PramukhLanguageSelectorProps {
  value: string;
  onChange: (languageId: string) => void;
  isAvailable: boolean;
  disabled?: boolean;
}

function PramukhLanguageSelector({
  value,
  onChange,
  isAvailable,
  disabled = false,
}: PramukhLanguageSelectorProps) {
  return (
    <div className="editor-pramukh-selector">
      <label htmlFor="editor-pramukh-language" className="editor-pramukh-label">
        Typing language
      </label>
      <Select
        id="editor-pramukh-language"
        placeholder={false}
        options={PRAMUKH_LANGUAGES.map(language => ({
          value: language.id,
          label: language.label,
        }))}
        value={value || DEFAULT_PRAMUKH_LANGUAGE_ID}
        onChange={event => onChange(event.target.value)}
        disabled={disabled}
      />
      {!isAvailable && (
        <p className="editor-pramukh-hint">
          PramukhIME not loaded. Ensure `public/pramukhime/js/pramukhime.js` exists and
          reload the page.
        </p>
      )}
    </div>
  );
}

export default PramukhLanguageSelector;
