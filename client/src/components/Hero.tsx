import RegistrationForm from "./RegistrationForm";
import CountdownTimer from "./CountdownTimer";
import quizLogo from "@/assets/logos/quiz-fest-logo.png";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-0 sm:min-h-screen flex items-start justify-start sm:items-center sm:justify-center bg-gradient-diagonal overflow-hidden py-6 sm:py-0">
      {/* Background decorative elements - hidden on mobile */}
      <div className="absolute inset-0 hidden sm:block">
        <div className="absolute top-16 left-4 sm:top-20 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-4 sm:bottom-32 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-chart-2/20 rounded-full blur-lg" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col justify-start sm:justify-center min-h-0 sm:min-h-screen py-0 sm:py-4">
          {/* Quiz Logo - compact on mobile */}
          <div className="relative mt-4 sm:mt-16 md:mt-20 mb-2 sm:mb-4 md:mb-6">
            <img 
              src={quizLogo} 
              alt="Ex-CAP Quiz Fest 2025" 
              className="mx-auto max-w-[220px] sm:max-w-sm md:max-w-md w-full h-auto flicker-animation"
              data-testid="img-quiz-logo"
            />
          </div>

          {/* Memorial text - compact on mobile */}
          <p className="text-base leading-snug tracking-tight mb-3 sm:text-xl sm:leading-relaxed sm:mb-6 md:text-2xl md:mb-8 text-white/80 max-w-2xl mx-auto px-4 font-bold" data-testid="text-hero-subtitle">
            In remembrance of the martyred students of SCPSC
          </p>

          {/* Spacer - hidden on mobile, only shows on desktop */}
          <div className="hidden sm:block sm:flex-1 sm:min-h-[2rem]"></div>

          {/* Registration and Timer - compact mobile layout */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-4 sm:mb-16 md:mb-24 relative z-20 px-4">
            <div className="w-full sm:w-auto">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white border-0 text-sm sm:text-lg px-6 py-2 sm:px-8 sm:py-3 h-auto font-semibold min-h-9 sm:min-h-11"
                  data-testid="button-register-hero"
                >
                  <UserPlus className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Register Now
                </Button>
              </Link>
            </div>
            <div className="w-full sm:w-auto max-w-sm scale-90 sm:scale-100">
              <CountdownTimer />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade - hidden on mobile */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent hidden sm:block" />
    </section>
  );
}