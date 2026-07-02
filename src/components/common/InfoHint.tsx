import '../../styles/components/common/InfoHint.css';

interface InfoHintProps {
  message: string;
  variant?: 'info' | 'error';
}

function InfoHint({ message, variant = 'info' }: InfoHintProps) {
  return (
    <span
      className={`info-hint${variant === 'error' ? ' info-hint--error' : ''}`}
      tabIndex={0}
      aria-label={message}
    >
      <span className="info-hint-icon" aria-hidden="true">
        i
      </span>
      <span className="info-hint-tooltip" role="tooltip">
        {message}
      </span>
    </span>
  );
}

export default InfoHint;
