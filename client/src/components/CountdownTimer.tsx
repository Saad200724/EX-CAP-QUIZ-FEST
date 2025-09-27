import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

interface CountdownTimerProps {
  targetDate?: string;
}

export default function CountdownTimer({ targetDate = "2025-09-27T22:00:00+06:00" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showLiveCount, setShowLiveCount] = useState(false);

  // Fetch registrations data for live count
  const { data: registrationsResponse } = useQuery<{ success: boolean; data: Registration[] }>({
    queryKey: ["/api/registrations"],
    refetchInterval: 10000, // Refresh every 10 seconds for live updates
    enabled: showLiveCount, // Only fetch when we need to show live count
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
        setShowLiveCount(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setShowLiveCount(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const registrations = registrationsResponse?.data || [];
  
  // Get category counts
  const getCategoryCount = (category: string) => {
    if (category === "03-05") return registrations.filter(r => r.classCategory === "03-05").length;
    if (category === "06-08") return registrations.filter(r => r.classCategory === "06-08").length;
    if (category === "09-10") return registrations.filter(r => r.classCategory === "09-10").length;
    if (category === "11-12") return registrations.filter(r => r.classCategory === "11-12").length;
    return registrations.length;
  };

  if (showLiveCount) {
    return (
      <Card className="bg-white/10 backdrop-blur border-white/20" data-testid="live-registration-count">
        <CardContent className="p-4">
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-white/80" />
              <p className="text-white/80 text-sm font-medium">Live Registration Count</p>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs text-white/60">Updates every 10 seconds</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center mb-3">
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-xl font-bold text-white" data-testid="live-count-03-05">
                {getCategoryCount("03-05")}
              </div>
              <div className="text-xs text-white/70">Class 03-05</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-xl font-bold text-white" data-testid="live-count-06-08">
                {getCategoryCount("06-08")}
              </div>
              <div className="text-xs text-white/70">Class 06-08</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-xl font-bold text-white" data-testid="live-count-09-10">
                {getCategoryCount("09-10")}
              </div>
              <div className="text-xs text-white/70">Class 09-10</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-xl font-bold text-white" data-testid="live-count-11-12">
                {getCategoryCount("11-12")}
              </div>
              <div className="text-xs text-white/70">Class 11-12</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white" data-testid="live-count-total">
              {getCategoryCount("total")}
            </div>
            <div className="text-sm text-white/80 font-medium">Total Registered Students</div>
          </div>
        </CardContent>
      </Card>
    );
  }

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