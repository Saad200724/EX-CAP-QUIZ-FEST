import RegistrationForm from "./RegistrationForm";
import CountdownTimer from "./CountdownTimer";
import quizLogo from "@/assets/logos/quiz-fest-logo.png";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-diagonal overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-4 sm:top-20 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-4 sm:bottom-32 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-chart-2/20 rounded-full blur-lg" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col justify-center min-h-screen py-4">
          {/* Quiz Logo - positioned at top with spacing from header */}
          <div className="relative mt-16 sm:mt-20 mb-6 sm:mb-8">
            <img 
              src={quizLogo} 
              alt="Ex-CAP Quiz Fest 2025" 
              className="mx-auto max-w-[280px] sm:max-w-sm md:max-w-md w-full h-auto flicker-animation"
              data-testid="img-quiz-logo"
            />
          </div>

          {/* Spacer to push content down */}
          <div className="flex-1 min-h-[2rem]"></div>

          {/* Memorial text */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 font-bold" data-testid="text-hero-subtitle">
            In remembrance of the martyred students of SCPSC
          </p>

          {/* Registration and Timer at bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16 sm:mb-24 md:mb-32 relative z-20 px-4">
            <div className="w-full sm:w-auto">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white border-0 text-lg px-8 py-4 h-auto font-semibold"
                  data-testid="button-register-hero"
                >
                  <UserPlus className="w-6 h-6 mr-3" />
                  Register Now
                </Button>
              </Link>
            </div>
            <div className="w-full sm:w-auto max-w-sm">
              <CountdownTimer />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}