interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  return <span className={`spinner${size === 'lg' ? ' spinner-lg' : ''}`} />;
}
