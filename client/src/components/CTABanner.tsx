import RegistrationForm from "./RegistrationForm";
import { Button } from "@/components/ui/button";

export default function CTABanner() {
  return (
    <section id="register" className="py-24 bg-gradient-diagonal relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8" data-testid="text-cta-title">
          Ready to test your knowledge?
        </h2>
        
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
          Don't miss this opportunity to compete with the best and showcase your intellectual abilities.
        </p>

        <RegistrationForm 
          triggerButton={
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 border-white/20 text-white hover:from-purple-500 hover:via-pink-400 hover:to-purple-600 hover:scale-105 transition-all duration-300 backdrop-blur-sm px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl" 
              data-testid="button-register-cta"
            >
              Register Now
            </Button>
          }
        />
      </div>
    </section>
  );
}