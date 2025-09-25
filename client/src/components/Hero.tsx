import RegistrationForm from "./RegistrationForm";

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
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-6">
            <span className="absolute top-0 left-0 text-white/70 text-xl md:text-2xl font-normal" data-testid="text-hero-presenter">EduTune presents</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight pt-12">
              <span className="flicker-animation whitespace-nowrap" data-testid="text-hero-title">Ex-CAP Quiz Fest 2025</span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            In remembrance of the martyred Students of SCPSC
          </p>

          <RegistrationForm />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}