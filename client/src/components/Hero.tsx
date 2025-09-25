import RegistrationForm from "./RegistrationForm";
import CountdownTimer from "./CountdownTimer";
import quizLogo from "@/assets/logos/quiz-fest-logo.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-diagonal overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-chart-2/20 rounded-full blur-lg" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col justify-center min-h-screen">
          {/* Quiz Logo - positioned at top with spacing from header */}
          <div className="relative mt-20 mb-8">
            <img 
              src={quizLogo} 
              alt="Ex-CAP Quiz Fest 2025" 
              className="mx-auto max-w-md w-full h-auto flicker-animation"
              data-testid="img-quiz-logo"
            />
          </div>

          {/* Spacer to push content down */}
          <div className="flex-1"></div>
          
          {/* Memorial text */}
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            In remembrance of the martyred students of SCPSC
          </p>

          {/* Registration and Timer at bottom */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-32 relative z-20">
            <RegistrationForm />
            <CountdownTimer />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}