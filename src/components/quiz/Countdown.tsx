import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface CountdownProps {
  totalSeconds: number;
  onComplete: () => void;
}

const Countdown = ({ totalSeconds, onComplete }: CountdownProps) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  const progress = (secondsLeft / totalSeconds) * 100;
  const isLowTime = secondsLeft <= 5;

  return (
    <div className="w-full space-y-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Time Remaining</span>
        <span className={`text-2xl font-bold ${isLowTime ? 'text-destructive animate-pulse' : 'text-primary'}`}>
          {secondsLeft}s
        </span>
      </div>
      <Progress 
        value={progress} 
        className={`h-3 ${isLowTime ? 'bg-destructive/20' : ''}`}
      />
    </div>
  );
};

export default Countdown;
