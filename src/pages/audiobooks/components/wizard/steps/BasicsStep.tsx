import { AlignLeft, BookOpen, Globe, Sparkles } from 'lucide-react';
import Select from '../../../../../components/common/Select';
import WizardFieldLabel from '../../../../../components/wizard/WizardFieldLabel';
import WizardSinglePillSelector from '../../../../../components/wizard/WizardSinglePillSelector';
import type { AudiobookWizardData } from '../../../../../types/audiobook';
import { AUDIOBOOK_LANGUAGE_OPTIONS } from '../../../../../utils/audiobookWizard';
import type { GenreItem, MoodItem, TagItem } from '../../../../../utils/audiobookApi';
import GenreTagSelectors from '../fields/GenreTagSelectors';

interface BasicsStepProps {
  data: AudiobookWizardData;
  errors: Partial<Record<keyof AudiobookWizardData, string>>;
  genres: GenreItem[];
  tags: TagItem[];
  moods: MoodItem[];
  genresLoading: boolean;
  tagsLoading: boolean;
  moodsLoading: boolean;
  isLoading?: boolean;
  onChange: (updates: Partial<AudiobookWizardData>) => void;
}

function BasicsStep({
  data,
  errors,
  genres,
  tags,
  moods,
  genresLoading,
  tagsLoading,
  moodsLoading,
  isLoading = false,
  onChange,
}: BasicsStepProps) {
  const moodOptions = (moods ?? []).map(mood => ({
    id: mood.id,
    label: mood.name,
  }));

  return (
    <div className="wizard-step-form">
      <div className="wizard-field-group">
        <WizardFieldLabel htmlFor="audiobook-title" icon={BookOpen} required>
          Audiobook Title
        </WizardFieldLabel>
        <input
          id="audiobook-title"
          type="text"
          value={data.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="Enter audiobook title"
          disabled={isLoading}
        />
        {errors.title && (
          <span className="wizard-field-error">{errors.title}</span>
        )}
      </div>

      <div className="wizard-description-genres-row">
        <div className="wizard-field-group wizard-description-col">
          <WizardFieldLabel
            htmlFor="audiobook-description"
            icon={AlignLeft}
            required
          >
            Short Description
          </WizardFieldLabel>
          <textarea
            id="audiobook-description"
            value={data.description}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Enter audiobook description"
            rows={3}
            maxLength={500}
            disabled={isLoading}
          />
          <span className="wizard-field-hint">
            {data.description.length}/500 characters
          </span>
          {errors.description && (
            <span className="wizard-field-error">{errors.description}</span>
          )}
        </div>

        <GenreTagSelectors
          genres={genres}
          tags={tags}
          selectedGenres={data.genres}
          selectedTags={data.tags}
          genresLoading={genresLoading}
          genreError={errors.genres}
          showGenres
          showTags={false}
          onGenreToggle={genreId => {
            const next = data.genres.includes(genreId)
              ? data.genres.filter(id => id !== genreId)
              : [...data.genres, genreId];
            onChange({ genres: next });
          }}
          onTagToggle={() => undefined}
        />
      </div>

      <GenreTagSelectors
        genres={genres}
        tags={tags}
        selectedGenres={data.genres}
        selectedTags={data.tags}
        tagsLoading={tagsLoading}
        tagError={errors.tags}
        showGenres={false}
        showTags
        onGenreToggle={() => undefined}
        onTagToggle={tagId => {
          const next = data.tags.includes(tagId)
            ? data.tags.filter(id => id !== tagId)
            : [...data.tags, tagId];
          onChange({ tags: next });
        }}
      />

      <div className="wizard-field-group">
        <WizardFieldLabel htmlFor="audiobook-language" icon={Globe}>
          Language
        </WizardFieldLabel>
        <Select
          id="audiobook-language"
          placeholder={false}
          options={AUDIOBOOK_LANGUAGE_OPTIONS.map(language => ({
            value: language,
            label: language,
          }))}
          value={data.language}
          onChange={e => onChange({ language: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="wizard-field-group">
        <WizardFieldLabel icon={Sparkles}>Mood</WizardFieldLabel>
        {moodsLoading ? (
          <span className="wizard-field-hint">Loading moods...</span>
        ) : moodOptions.length > 0 ? (
          <WizardSinglePillSelector
            name="audiobook-mood"
            options={moodOptions}
            value={data.moodId}
            onChange={moodId => onChange({ moodId })}
            disabled={isLoading}
          />
        ) : (
          <span className="wizard-field-hint">No moods available</span>
        )}
      </div>
    </div>
  );
}

export default BasicsStep;
