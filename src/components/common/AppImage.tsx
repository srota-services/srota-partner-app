/**
 * Image with a consistent placeholder when src is missing or fails to load.
 * Use across the app wherever remote/local images may be unavailable.
 */
import React, { useEffect, useState } from 'react';
import { BookOpen, Building2, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import '../../styles/components/common/AppImage.css';

export type AppImageVariant =
  | 'cover'
  | 'thumbnail'
  | 'organization'
  | 'author';

const VARIANT_ICONS: Record<AppImageVariant, LucideIcon> = {
  cover: BookOpen,
  thumbnail: BookOpen,
  organization: Building2,
  author: UserRound,
};

const VARIANT_ICON_SIZES: Record<AppImageVariant, number> = {
  cover: 36,
  thumbnail: 18,
  organization: 20,
  author: 20,
};

export interface AppImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  variant?: AppImageVariant;
  /** Custom content when src is missing or fails to load (e.g. user initials). */
  fallback?: React.ReactNode;
}

function resolveImageSrc(src?: string | null): string {
  return typeof src === 'string' ? src.trim() : '';
}

const AppImage: React.FC<AppImageProps> = ({
  src,
  alt = '',
  className = '',
  variant = 'cover',
  fallback,
  ...imgProps
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolvedSrc = resolveImageSrc(src);
  const hasSrc = resolvedSrc.length > 0;

  useEffect(() => {
    setLoadFailed(false);
  }, [resolvedSrc]);

  const showPlaceholder = !hasSrc || loadFailed;
  const Icon = VARIANT_ICONS[variant];
  const iconSize = VARIANT_ICON_SIZES[variant];
  const classes = `app-image app-image--${variant} ${className}`.trim();

  if (showPlaceholder) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={`${classes} app-image--placeholder`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={!alt}
      >
        <Icon size={iconSize} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      {...imgProps}
      src={resolvedSrc}
      alt={alt}
      className={`${classes} app-image--loaded`}
      onError={() => setLoadFailed(true)}
    />
  );
};

export default AppImage;
