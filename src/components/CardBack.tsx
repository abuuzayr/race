interface CardBackProps {
  className?: string;
}

export function CardBack({ className = '' }: CardBackProps) {
  return (
    <div className={`card card-back ${className}`}>
      <div className="card-back-pattern">RACE</div>
    </div>
  );
}