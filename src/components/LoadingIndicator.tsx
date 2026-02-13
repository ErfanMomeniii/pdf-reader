interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="loading-indicator">
      <div className="loading-content">
        <div className="loading-spinner" />
        <span className="loading-message">{message}</span>
      </div>
    </div>
  );
}
