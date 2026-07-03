/**
 * Audiobook Form component
 */

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux';
import { fetchGenres } from '../../../../store/slices/genresSlice';
import { fetchTags } from '../../../../store/slices/tagsSlice';
import {
  createAudiobookThunk,
  updateAudiobookThunk,
  fetchAudiobooks,
} from '../../../../store/slices/audiobooksSlice';
import type {
  AudiobookFormData,
  AudiobookApiResponse,
  AudioBookOwnerInput,
} from '../../../../types/audiobook';
import { resolveAudiobookOwner } from '../../../../utils/resolveAudiobookOwner';
import Button from '../../../../components/common/Button';
import AppImage from '../../../../components/common/AppImage';
import { showApiError } from '../../../../utils/toast';
import { DEFAULT_AUDIOBOOK_LANGUAGE, createEmptyAudiobookFormData, resolveAudiobookMoodId } from '../../../../utils/audiobookWizard';
import { resolveAudiobookLanguageName } from '../../../../utils/languages';
import '../../../../styles/pages/audiobooks/components/forms/AudiobookForm.css';

interface AudiobookFormProps {
  audiobookId?: string;
  initialData?: AudiobookApiResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AudiobookForm: React.FC<AudiobookFormProps> = ({
  audiobookId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const { genres, loading: genresLoading } = useAppSelector(
    state => state.genres
  );
  const { tags, loading: tagsLoading } = useAppSelector(state => state.tags);
  const { loading: isCreating, filter } = useAppSelector(
    state => state.audiobooks
  );
  const { role, appType } = useAppSelector(state => state.auth);
  const isEditMode = !!audiobookId && !!initialData;

  // Initialize form data from initialData if provided
  const getInitialFormData = (): AudiobookFormData => {
    const defaults = createEmptyAudiobookFormData();

    if (initialData) {
      // Handle multiple genres - support both old (genre) and new (genres) API response formats
      const genreIds: string[] = [];
      if (initialData.genres && initialData.genres.length > 0) {
        genreIds.push(
          ...initialData.genres
            .map(g => genres.find(genre => genre.name === g.name)?.id || '')
            .filter(id => id)
        );
      } else if (initialData.genre?.name) {
        const genreId = genres.find(
          g => g.name === initialData.genre?.name
        )?.id;
        if (genreId) genreIds.push(genreId);
      }

      // Handle multiple narrators - support both old (narrator) and new (narrators) API response formats
      const narrators: string[] = [];
      if (initialData.narrators && initialData.narrators.length > 0) {
        narrators.push(...initialData.narrators);
      } else if (initialData.narrator) {
        narrators.push(initialData.narrator);
      }

      return {
        title: initialData.title || '',
        author: initialData.author || '',
        narrators,
        description: initialData.description || '',
        genres: genreIds,
        tags:
          initialData.audiobookTags
            ?.map(tag => tags.find(t => t.name === tag.name)?.id || '')
            .filter(id => id) || [],
        coverImage: null,
        scheduledAt: undefined, // Note: scheduledAt may not be in API response
        meta: initialData.meta || {},
        language: resolveAudiobookLanguageName(
          initialData.language,
          [],
          DEFAULT_AUDIOBOOK_LANGUAGE
        ),
        isPaid: false,
        minSubscriptionTier: initialData.minSubscriptionTier ?? null,
        moodId: resolveAudiobookMoodId(initialData),
        subscriptionGatingMode: initialData.subscriptionGatingMode ?? 'NONE',
      };
    }
    return defaults;
  };

  const [formData, setFormData] =
    useState<AudiobookFormData>(getInitialFormData());

  const [errors, setErrors] = useState<
    Partial<Record<keyof AudiobookFormData, string>>
  >({});

  const [audiobookOwner, setAudiobookOwner] = useState<AudioBookOwnerInput | null>(
    null
  );
  const [ownerLabel, setOwnerLabel] = useState<string>('');
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string>('');

  // Fetch genres and tags on mount
  useEffect(() => {
    if (genres.length === 0) {
      dispatch(fetchGenres());
    }
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
  }, [dispatch, genres.length, tags.length]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const fetchOwner = async () => {
      setOrganizationsLoading(true);
      setOwnerError('');
      try {
        const owner = await resolveAudiobookOwner(role, appType);
        if (owner) {
          setAudiobookOwner(owner);
          setOwnerLabel(
            owner.type === 'AUTHOR' ? 'Author workspace' : 'Organization workspace'
          );
        } else {
          setOwnerError('No organization or author workspace found for your account');
        }
      } catch (error) {
        showApiError(error);
        setOwnerError('Failed to resolve audiobook owner');
      } finally {
        setOrganizationsLoading(false);
      }
    };

    void fetchOwner();
  }, [isEditMode, role, appType]);

  // Update form data when initialData or genres/tags change (for edit mode)
  useEffect(() => {
    if (initialData && genres.length > 0 && tags.length > 0) {
      // Handle multiple genres
      const genreIds: string[] = [];
      if (initialData.genres && initialData.genres.length > 0) {
        genreIds.push(
          ...initialData.genres
            .map(g => genres.find(genre => genre.name === g.name)?.id || '')
            .filter(id => id)
        );
      } else if (initialData.genre?.name) {
        const genreId = genres.find(
          g => g.name === initialData.genre?.name
        )?.id;
        if (genreId) genreIds.push(genreId);
      }

      // Handle multiple narrators
      const narrators: string[] = [];
      if (initialData.narrators && initialData.narrators.length > 0) {
        narrators.push(...initialData.narrators);
      } else if (initialData.narrator) {
        narrators.push(initialData.narrator);
      }

      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        narrators,
        description: initialData.description || '',
        genres: genreIds,
        tags:
          initialData.audiobookTags
            ?.map(tag => tags.find(t => t.name === tag.name)?.id || '')
            .filter(id => id) || [],
        coverImage: null,
        scheduledAt: undefined,
        meta: initialData.meta || {},
        language: resolveAudiobookLanguageName(
          initialData.language,
          [],
          DEFAULT_AUDIOBOOK_LANGUAGE
        ),
        isPaid: false,
        minSubscriptionTier: initialData.minSubscriptionTier ?? null,
        moodId: resolveAudiobookMoodId(initialData),
        subscriptionGatingMode: initialData.subscriptionGatingMode ?? 'NONE',
      });
    }
  }, [initialData, genres, tags]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const newErrors: Partial<Record<keyof AudiobookFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.genres.length === 0) {
      newErrors.genres = 'At least one genre is required';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!isEditMode && !audiobookOwner) {
      setOwnerError('Audiobook owner is required');
    }

    if (
      Object.keys(newErrors).length > 0 ||
      (!isEditMode && !audiobookOwner)
    ) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditMode && audiobookId) {
        // Update mode
        // Filter out empty keys and temporary keys (starting with __empty_) from meta
        const filteredMeta = Object.entries(formData.meta)
          .filter(
            ([key, value]) =>
              !key.startsWith('__empty_') && key.trim() && value.trim()
          )
          .reduce(
            (acc, [key, value]) => {
              acc[key.trim()] = value.trim();
              return acc;
            },
            {} as Record<string, string>
          );

        const updateRequest = {
          audiobookId,
          title: formData.title.trim(),
          author: formData.author.trim(),
          narrators:
            formData.narrators.length > 0
              ? formData.narrators.map(n => n.trim()).filter(n => n)
              : undefined,
          description: formData.description.trim(),
          genreIds: formData.genres,
          tagIds: formData.tags,
          duration: 0,
          fileSize: 0,
          scheduledAt: formData.scheduledAt,
          coverImage: formData.coverImage || undefined,
          meta: Object.keys(filteredMeta).length > 0 ? filteredMeta : undefined,
        };

        await dispatch(updateAudiobookThunk(updateRequest)).unwrap();
        await dispatch(fetchAudiobooks({ page: 1, filter }));
      } else {
        // Create mode
        // Filter out empty keys and temporary keys (starting with __empty_) from meta
        const filteredMeta = Object.entries(formData.meta)
          .filter(
            ([key, value]) =>
              !key.startsWith('__empty_') && key.trim() && value.trim()
          )
          .reduce(
            (acc, [key, value]) => {
              acc[key.trim()] = value.trim();
              return acc;
            },
            {} as Record<string, string>
          );

        const createRequest = {
          title: formData.title.trim(),
          author: formData.author.trim(),
          narrators:
            formData.narrators.length > 0
              ? formData.narrators.map(n => n.trim()).filter(n => n)
              : undefined,
          description: formData.description.trim(),
          genreIds: formData.genres,
          tagIds: formData.tags,
          ...(audiobookOwner ? { owner: audiobookOwner } : {}),
          duration: 0,
          fileSize: 0,
          coverImage: formData.coverImage || undefined,
          meta: Object.keys(filteredMeta).length > 0 ? filteredMeta : undefined,
        };

        await dispatch(createAudiobookThunk(createRequest)).unwrap();
        await dispatch(fetchAudiobooks({ page: 1, filter }));

        // Reset form only in create mode
        setFormData(createEmptyAudiobookFormData());
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const handleSchedule = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const newErrors: Partial<Record<keyof AudiobookFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.genres.length === 0) {
      newErrors.genres = 'At least one genre is required';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Schedule date and time is required';
    }

    if (!isEditMode && !audiobookOwner) {
      setOwnerError('Audiobook owner is required');
    }

    if (
      Object.keys(newErrors).length > 0 ||
      (!isEditMode && !audiobookOwner)
    ) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditMode && audiobookId) {
        // Update mode with schedule
        // Filter out empty keys and temporary keys (starting with __empty_) from meta
        const filteredMeta = Object.entries(formData.meta)
          .filter(
            ([key, value]) =>
              !key.startsWith('__empty_') && key.trim() && value.trim()
          )
          .reduce(
            (acc, [key, value]) => {
              acc[key.trim()] = value.trim();
              return acc;
            },
            {} as Record<string, string>
          );

        const updateRequest = {
          audiobookId,
          title: formData.title.trim(),
          author: formData.author.trim(),
          narrators:
            formData.narrators.length > 0
              ? formData.narrators.map(n => n.trim()).filter(n => n)
              : undefined,
          description: formData.description.trim(),
          genreIds: formData.genres,
          tagIds: formData.tags,
          duration: 0,
          fileSize: 0,
          scheduledAt: formData.scheduledAt,
          coverImage: formData.coverImage || undefined,
          meta: Object.keys(filteredMeta).length > 0 ? filteredMeta : undefined,
        };

        await dispatch(updateAudiobookThunk(updateRequest)).unwrap();
        await dispatch(fetchAudiobooks({ page: 1, filter }));
      } else {
        // Create mode with schedule
        // Filter out empty keys and temporary keys (starting with __empty_) from meta
        const filteredMeta = Object.entries(formData.meta)
          .filter(
            ([key, value]) =>
              !key.startsWith('__empty_') && key.trim() && value.trim()
          )
          .reduce(
            (acc, [key, value]) => {
              acc[key.trim()] = value.trim();
              return acc;
            },
            {} as Record<string, string>
          );

        const createRequest = {
          title: formData.title.trim(),
          author: formData.author.trim(),
          narrators:
            formData.narrators.length > 0
              ? formData.narrators.map(n => n.trim()).filter(n => n)
              : undefined,
          description: formData.description.trim(),
          genreIds: formData.genres,
          tagIds: formData.tags,
          ...(audiobookOwner ? { owner: audiobookOwner } : {}),
          duration: 0,
          fileSize: 0,
          coverImage: formData.coverImage || undefined,
          scheduledAt: formData.scheduledAt,
          meta: Object.keys(filteredMeta).length > 0 ? filteredMeta : undefined,
        };

        await dispatch(createAudiobookThunk(createRequest)).unwrap();
        await dispatch(fetchAudiobooks({ page: 1, filter }));

        // Reset form only in create mode
        setFormData(createEmptyAudiobookFormData());
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (formData.tags.includes(tagId)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tagId),
      });
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagId],
      });
    }
    if (errors.tags) {
      setErrors({ ...errors, tags: '' });
    }
  };

  const handleGenreToggle = (genreId: string) => {
    if (formData.genres.includes(genreId)) {
      setFormData({
        ...formData,
        genres: formData.genres.filter(g => g !== genreId),
      });
    } else {
      setFormData({
        ...formData,
        genres: [...formData.genres, genreId],
      });
    }
    if (errors.genres) {
      setErrors({ ...errors, genres: '' });
    }
  };

  const narratorInputRef = useRef<HTMLInputElement>(null);
  const [narratorInputValue, setNarratorInputValue] = useState('');

  const handleNarratorInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if ((e.key === 'Enter' || e.key === ',') && narratorInputValue.trim()) {
      e.preventDefault();
      const trimmedValue = narratorInputValue.trim();
      if (trimmedValue && !formData.narrators.includes(trimmedValue)) {
        setFormData({
          ...formData,
          narrators: [...formData.narrators, trimmedValue],
        });
        setNarratorInputValue('');
      }
    } else if (
      e.key === 'Backspace' &&
      narratorInputValue === '' &&
      formData.narrators.length > 0
    ) {
      // Remove last narrator if input is empty and backspace is pressed
      setFormData({
        ...formData,
        narrators: formData.narrators.slice(0, -1),
      });
    }
  };

  const handleNarratorRemove = (narratorToRemove: string) => {
    setFormData({
      ...formData,
      narrators: formData.narrators.filter(n => n !== narratorToRemove),
    });
  };

  // Use a state to track temporary editing keys to prevent re-rendering issues
  // This allows the user to type in the key field without losing focus
  const [editingMetaKeys, setEditingMetaKeys] = useState<
    Record<string, string>
  >({});

  // Initialize editing keys when meta changes (but not on every render)
  useEffect(() => {
    const currentKeys = Object.keys(formData.meta);

    setEditingMetaKeys(prev => {
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
  }, [formData.meta]);

  // Convert meta object to array of [key, value] pairs for easier UI management
  const metaEntries = Object.entries(formData.meta).map(([key, value]) => {
    // Use editing key if available, otherwise use actual key
    const displayKey =
      editingMetaKeys[key] !== undefined ? editingMetaKeys[key] : key;
    return [displayKey, value, key] as [string, string, string]; // [displayKey, value, originalKey]
  });

  const handleMetaKeyChange = (originalKey: string, newKey: string) => {
    // Update the editing key state (this doesn't cause re-render of the input)
    setEditingMetaKeys({
      ...editingMetaKeys,
      [originalKey]: newKey,
    });
  };

  const handleMetaKeyBlur = (originalKey: string) => {
    const newKey = (editingMetaKeys[originalKey] ?? originalKey).trim();

    // Only update meta if key actually changed and is not empty
    if (newKey && newKey !== originalKey) {
      const value = formData.meta[originalKey] || '';
      const newMeta = { ...formData.meta };
      delete newMeta[originalKey];
      newMeta[newKey] = value;

      // Update editing keys to reflect the new key
      const updatedEditingKeys = { ...editingMetaKeys };
      delete updatedEditingKeys[originalKey];
      updatedEditingKeys[newKey] = newKey;
      setEditingMetaKeys(updatedEditingKeys);

      setFormData({
        ...formData,
        meta: newMeta,
      });
    } else if (!newKey.trim()) {
      // If key is empty, remove the entry
      const newMeta = { ...formData.meta };
      delete newMeta[originalKey];

      const updatedEditingKeys = { ...editingMetaKeys };
      delete updatedEditingKeys[originalKey];
      setEditingMetaKeys(updatedEditingKeys);

      setFormData({
        ...formData,
        meta: newMeta,
      });
    }
  };

  const handleMetaValueChange = (key: string, newValue: string) => {
    const newMeta = { ...formData.meta };
    if (key.trim()) {
      newMeta[key] = newValue;
    }

    setFormData({
      ...formData,
      meta: newMeta,
    });
  };

  const handleMetaAdd = () => {
    const newMeta = { ...formData.meta };
    // Add a new entry with empty key and value
    // Use a unique empty key to allow multiple empty entries
    const emptyKey = `__empty_${Date.now()}`;
    newMeta[emptyKey] = '';

    // Add to editing keys
    setEditingMetaKeys({
      ...editingMetaKeys,
      [emptyKey]: '',
    });

    setFormData({
      ...formData,
      meta: newMeta,
    });
  };

  const handleMetaRemove = (key: string) => {
    const newMeta = { ...formData.meta };
    delete newMeta[key];

    setFormData({
      ...formData,
      meta: newMeta,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="audiobook-form">
      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={e => {
            setFormData({ ...formData, title: e.target.value });
            setErrors({ ...errors, title: '' });
          }}
          placeholder="Enter audiobook title"
          className={errors.title ? 'input-error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="author">
          Author <span className="required">*</span>
        </label>
        <input
          id="author"
          type="text"
          value={formData.author}
          onChange={e => {
            setFormData({ ...formData, author: e.target.value });
            setErrors({ ...errors, author: '' });
          }}
          placeholder="Enter author name"
          className={errors.author ? 'input-error' : ''}
        />
        {errors.author && (
          <span className="error-message">{errors.author}</span>
        )}
      </div>

      {!isEditMode && (
        <div className="form-group">
          <label htmlFor="owner">Owner</label>
          <input
            id="owner"
            type="text"
            value={
              organizationsLoading
                ? 'Loading owner...'
                : ownerLabel || audiobookOwner?.type || ''
            }
            readOnly
            className="readonly-input"
          />
          {ownerError && (
            <span className="error-message">{ownerError}</span>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="narrators">Narrators</label>
        <div className="narrators-input-container">
          {formData.narrators.map((narrator, index) => (
            <span key={`${narrator}-${index}`} className="narrator-tag">
              {narrator}
              <button
                type="button"
                className="narrator-tag-remove"
                onClick={() => handleNarratorRemove(narrator)}
                aria-label={`Remove ${narrator}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={narratorInputRef}
            id="narrators"
            type="text"
            value={narratorInputValue}
            onChange={e => setNarratorInputValue(e.target.value)}
            onKeyDown={handleNarratorInputKeyDown}
            placeholder={
              formData.narrators.length === 0
                ? 'Enter narrator name and press Enter or comma (optional)'
                : 'Add another narrator...'
            }
            className="narrators-input"
          />
        </div>
        <p className="narrators-hint">Press Enter or comma to add a narrator</p>
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e => {
            setFormData({ ...formData, description: e.target.value });
            setErrors({ ...errors, description: '' });
          }}
          placeholder="Enter audiobook description"
          rows={5}
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="coverImage">
          Cover Image {!isEditMode && <span className="required">*</span>}
          {isEditMode && (
            <span className="optional-text">
              (optional - leave empty to keep current image)
            </span>
          )}
        </label>
        {isEditMode && initialData?.coverImage && !formData.coverImage && (
          <div className="current-image-preview">
            <AppImage
              src={initialData.coverImage}
              alt="Current cover"
              variant="cover"
              className="current-image-preview-image"
            />
            <p className="current-image-text">Current cover image</p>
          </div>
        )}
        <input
          id="coverImage"
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0] || null;
            setFormData({ ...formData, coverImage: file });
          }}
          className="file-input"
        />
        {formData.coverImage && (
          <div className="file-preview">
            <span className="file-name">{formData.coverImage.name}</span>
            <button
              type="button"
              className="file-remove"
              onClick={() => setFormData({ ...formData, coverImage: null })}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>
          Genres <span className="required">*</span>
        </label>
        {genresLoading ? (
          <div className="loading-message">Loading genres...</div>
        ) : (
          <div
            className={`genres-container ${errors.genres ? 'genres-error' : ''}`}
          >
            {genres.map(genre => (
              <label key={genre.id} className="genre-checkbox">
                <input
                  type="checkbox"
                  checked={formData.genres.includes(genre.id)}
                  onChange={() => handleGenreToggle(genre.id)}
                />
                <span>{genre.name}</span>
              </label>
            ))}
          </div>
        )}
        {errors.genres && (
          <span className="error-message">{errors.genres}</span>
        )}
      </div>

      <div className="form-group">
        <label>
          Tags <span className="required">*</span>
        </label>
        {tagsLoading ? (
          <div className="loading-message">Loading tags...</div>
        ) : (
          <div className="tags-container">
            {tags.map(tag => (
              <label key={tag.id} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        )}
        {errors.tags && <span className="error-message">{errors.tags}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="audiobook-schedule-at">Schedule at</label>
        <DatePicker
          id="audiobook-schedule-at"
          selected={
            formData.scheduledAt ? new Date(formData.scheduledAt) : null
          }
          onChange={(date: Date | null) => {
            if (date) {
              // Convert Date to datetime-local format (YYYY-MM-DDTHH:mm)
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
              setFormData({ ...formData, scheduledAt: formattedDate });
            } else {
              setFormData({ ...formData, scheduledAt: undefined });
            }
            setErrors({ ...errors, scheduledAt: '' });
          }}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          placeholderText="Select date and time"
          className={`date-picker-input ${errors.scheduledAt ? 'input-error' : ''}`}
          minDate={new Date()}
          isClearable
        />
        {errors.scheduledAt && (
          <span className="error-message">{errors.scheduledAt}</span>
        )}
      </div>

      <div className="form-group">
        <label>Additional Info</label>
        <div className="meta-container">
          {metaEntries.length === 0 ? (
            <p className="meta-empty-message">
              No additional info added. Click "Add New" to add more details
              about the audiobook.
            </p>
          ) : (
            metaEntries.map(([displayKey, value, originalKey], index) => (
              <div key={`${originalKey}-${index}`} className="meta-row">
                <input
                  type="text"
                  value={displayKey}
                  onChange={e =>
                    handleMetaKeyChange(originalKey, e.target.value)
                  }
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
                  placeholder="Add value (e.g., Producer, DOP, etc.)"
                  className="meta-value-input"
                />
                <button
                  type="button"
                  className="meta-remove-button"
                  onClick={() => handleMetaRemove(originalKey)}
                  aria-label={`Remove ${originalKey || 'entry'}`}
                >
                  ×
                </button>
              </div>
            ))
          )}
          <button
            type="button"
            className="meta-add-button"
            onClick={handleMetaAdd}
          >
            + Add New
          </button>
        </div>
        <p className="meta-hint">
          Add custom key-value pairs for additional information
        </p>
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="warning"
          onClick={handleSchedule}
          disabled={!formData.scheduledAt || isCreating}
          isLoading={isCreating}
        >
          Schedule
        </Button>
        <Button
          type="submit"
          disabled={!!formData.scheduledAt || isCreating}
          isLoading={isCreating}
        >
          {isEditMode ? 'Update Audiobook' : 'Create Audiobook'}
        </Button>
      </div>
    </form>
  );
};

export default AudiobookForm;
