import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CountdownTimerProps {
  targetDate?: string;
}

export default function CountdownTimer({ targetDate = "2025-09-26T22:00:00+06:00" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20" data-testid="countdown-timer">
      <CardContent className="p-4">
        <div className="text-center mb-2">
          <p className="text-white/80 text-sm font-medium">Online Registration Starts In</p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xl font-bold text-white" data-testid="countdown-days">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-xs text-white/70">Days</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xl font-bold text-white" data-testid="countdown-hours">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-xs text-white/70">Hours</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xl font-bold text-white" data-testid="countdown-minutes">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs text-white/70">Mins</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-xl font-bold text-white" data-testid="countdown-seconds">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-white/70">Secs</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}