/**
 * Chapter Form component
 */

import React, { useState, FormEvent, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux';
import {
  createChapterThunk,
  updateChapterThunk,
} from '../../../../store/slices/chaptersSlice';
import { formatDurationDetailed } from '../../../../utils/formatting';
import type {
  ChapterFormData,
  ChapterApiResponse,
  UpdateChapterRequest,
} from '../../../../types/audiobook';
import Button from '../../../../components/common/Button';
import AppImage from '../../../../components/common/AppImage';
import { showApiError } from '../../../../utils/toast';
import {
  chapterResponseToFormData,
  createEmptyChapterFormData,
} from '../../../../utils/chapterWizard';
import '../../../../styles/pages/chapters/components/forms/ChapterForm.css';

interface ChapterFormProps {
  audiobookId: string;
  nextChapterNumber: number;
  chapterId?: string;
  initialData?: ChapterApiResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({
  audiobookId,
  nextChapterNumber,
  chapterId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const { loading: isCreating } = useAppSelector(state => state.chapters);
  const isEditMode = !!chapterId && !!initialData;

  const [formData, setFormData] = useState<ChapterFormData>(() =>
    initialData
      ? chapterResponseToFormData(initialData, nextChapterNumber)
      : createEmptyChapterFormData(nextChapterNumber)
  );

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(chapterResponseToFormData(initialData, nextChapterNumber));
    }
  }, [initialData, nextChapterNumber]);

  const [errors, setErrors] = useState<
    Partial<Record<keyof ChapterFormData, string>>
  >({});
  const [isLoadingAudioMetadata, setIsLoadingAudioMetadata] =
    useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setFormData({
        ...formData,
        file: null,
        duration: undefined,
        startPosition: undefined,
        endPosition: undefined,
      });
      return;
    }

    setIsLoadingAudioMetadata(true);
    try {
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);

      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve();
        });
        audio.addEventListener('error', err => {
          reject(err);
        });
        setTimeout(
          () => reject(new Error('Timeout loading audio metadata')),
          10000
        );
      });

      const duration = audio.duration;
      const startPosition = 0;
      const endPosition = duration;

      URL.revokeObjectURL(audioUrl);

      setFormData({
        ...formData,
        file,
        duration: Math.round(duration),
        startPosition: Math.round(startPosition),
        endPosition: Math.round(endPosition),
      });
    } catch (error) {
      console.error('Error loading audio metadata:', error);
      setFormData({
        ...formData,
        file,
        duration: undefined,
        startPosition: undefined,
        endPosition: undefined,
      });
    } finally {
      setIsLoadingAudioMetadata(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Partial<Record<keyof ChapterFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // File is required only in create mode
    if (!isEditMode && !formData.file) {
      newErrors.file = 'Audio file is required';
    }

    // Cover Image is required
    // In create mode: must have a file
    // In edit mode: must have either a new file or existing coverImage
    if (!isEditMode && !formData.coverImage) {
      newErrors.coverImage = 'Cover image is required';
    } else if (isEditMode && !formData.coverImage && !initialData?.coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditMode && chapterId) {
        // Update mode
        const updateRequest: UpdateChapterRequest = {
          chapterId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          chapterNumber: formData.chapterNumber,
          duration: formData.duration,
          startPosition: formData.startPosition,
          endPosition: formData.endPosition,
          scheduledAt: formData.scheduledAt,
        };

        // Only include file if a new one is provided
        if (formData.file) {
          updateRequest.file = formData.file;
        }

        // Only include coverImage if a new one is provided
        if (formData.coverImage) {
          updateRequest.coverImage = formData.coverImage;
        }

        await dispatch(updateChapterThunk(updateRequest)).unwrap();
      } else {
        // Create mode
        if (!formData.file) {
          return;
        }

        const createRequest = {
          audiobookId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          chapterNumber: formData.chapterNumber,
          file: formData.file!,
          duration: formData.duration,
          startPosition: formData.startPosition,
          endPosition: formData.endPosition,
          coverImage: formData.coverImage!,
        };

        await dispatch(createChapterThunk(createRequest)).unwrap();
      }

      // Reset form only in create mode
      if (!isEditMode) {
        setFormData(createEmptyChapterFormData(nextChapterNumber + 1));
      }

      // Call onSuccess which will trigger chapter refresh
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

    const newErrors: Partial<Record<keyof ChapterFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.file) {
      newErrors.file = 'Audio file is required';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Schedule date and time is required';
    }

    // Cover Image is required
    if (!isEditMode && !formData.coverImage) {
      newErrors.coverImage = 'Cover image is required';
    } else if (isEditMode && !formData.coverImage && !initialData?.coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!formData.file || !formData.scheduledAt) {
      return;
    }

    try {
      if (isEditMode && chapterId) {
        // Update mode with schedule
        const updateRequest: UpdateChapterRequest = {
          chapterId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          chapterNumber: formData.chapterNumber,
          duration: formData.duration,
          startPosition: formData.startPosition,
          endPosition: formData.endPosition,
          scheduledAt: formData.scheduledAt,
        };

        if (formData.file) {
          updateRequest.file = formData.file;
        }

        if (formData.coverImage) {
          updateRequest.coverImage = formData.coverImage;
        }

        await dispatch(updateChapterThunk(updateRequest)).unwrap();
      } else {
        // Create mode with schedule
        const createRequest = {
          audiobookId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          chapterNumber: formData.chapterNumber,
          file: formData.file,
          duration: formData.duration,
          startPosition: formData.startPosition,
          endPosition: formData.endPosition,
          scheduledAt: formData.scheduledAt,
          coverImage: formData.coverImage!,
        };

        await dispatch(createChapterThunk(createRequest)).unwrap();

        // Reset form only in create mode
        setFormData(createEmptyChapterFormData(nextChapterNumber + 1));
      }

      // Call onSuccess which will trigger chapter refresh
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chapter-form">
      <div className="form-group">
        <label htmlFor="chapter-title">
          Title <span className="required">*</span>
        </label>
        <input
          id="chapter-title"
          type="text"
          value={formData.title}
          onChange={e => {
            setFormData({ ...formData, title: e.target.value });
            setErrors({ ...errors, title: '' });
          }}
          placeholder="Enter chapter title"
          className={errors.title ? 'input-error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="chapter-description">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="chapter-description"
          value={formData.description}
          onChange={e => {
            setFormData({ ...formData, description: e.target.value });
            setErrors({ ...errors, description: '' });
          }}
          placeholder="Enter chapter description"
          rows={3}
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="chapter-number">Chapter Number</label>
        <input
          id="chapter-number"
          type="number"
          value={formData.chapterNumber}
          readOnly
          className="readonly-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="chapter-file">
          Audio File {!isEditMode && <span className="required">*</span>}
          {isEditMode && (
            <span className="optional-text">
              (optional - leave empty to keep current file)
            </span>
          )}
        </label>
        <input
          id="chapter-file"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={isLoadingAudioMetadata || isCreating}
          className={errors.file ? 'input-error' : ''}
        />
        {isLoadingAudioMetadata && (
          <span className="loading-message">Loading audio metadata...</span>
        )}
        {errors.file && <span className="error-message">{errors.file}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="chapter-cover-image">
          Cover Image <span className="required">*</span>
          {isEditMode && initialData?.coverImage && (
            <span className="optional-text">
              {' '}
              (leave empty to keep current image)
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
          id="chapter-cover-image"
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
        {errors.coverImage && (
          <span className="error-message">{errors.coverImage}</span>
        )}
      </div>

      {formData.file && (
        <>
          <div className="form-group">
            <label>Duration</label>
            <input
              type="text"
              value={formatDurationDetailed(formData.duration)}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="chapter-start-position">
              Start Position (seconds)
            </label>
            <input
              id="chapter-start-position"
              type="number"
              value={formData.startPosition ?? 0}
              onChange={e => {
                const value = parseInt(e.target.value, 10) || 0;
                setFormData({
                  ...formData,
                  startPosition: value,
                });
              }}
              min={0}
              max={formData.duration}
            />
          </div>

          <div className="form-group">
            <label htmlFor="chapter-end-position">End Position (seconds)</label>
            <input
              id="chapter-end-position"
              type="number"
              value={formData.endPosition ?? formData.duration ?? 0}
              onChange={e => {
                const value = parseInt(e.target.value, 10) || 0;
                setFormData({
                  ...formData,
                  endPosition: value,
                });
              }}
              min={formData.startPosition ?? 0}
              max={formData.duration}
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label htmlFor="chapter-schedule-at">Schedule at</label>
        <DatePicker
          id="chapter-schedule-at"
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
          {isEditMode ? 'Update Chapter' : 'Create Chapter'}
        </Button>
      </div>
    </form>
  );
};

export default ChapterForm;
