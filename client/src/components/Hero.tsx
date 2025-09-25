import { Button } from "@/components/ui/button";

export default function Hero() {
  const handleRegisterClick = () => {
    console.log("Register button clicked");
    // Scroll to register section or open registration form
    const element = document.querySelector("#register");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span data-testid="text-hero-title">Ex-Cap Quiz Fest:</span>
            <br />
            <span className="text-white/90">The Next Chapter</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            Join the ultimate student competition and celebrate knowledge.
          </p>

          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-white px-8 py-6 text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            onClick={handleRegisterClick}
            data-testid="button-register-hero"
          >
            Register Now
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}