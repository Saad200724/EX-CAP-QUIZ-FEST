import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import scpscLogo from "@/assets/logos/scpsc-college-logo.png";
import excapLogo from "@/assets/logos/excap-logo.png";
import edutuneLogo from "@/assets/logos/edutune-logo.jpg";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Details", href: "#details" },
    { name: "Register", href: "#register" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    console.log(`Navigation clicked: ${href}`);
    setIsMenuOpen(false);
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 border-b shadow-sm ${
      isScrolled 
        ? "bg-transparent backdrop-blur-md supports-[backdrop-filter]:bg-white/10" 
        : "bg-[#73349c]"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            <img 
              src={scpscLogo} 
              alt="SCPSC College Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
              data-testid="img-scpsc-logo"
            />
            <img 
              src={excapLogo} 
              alt="Ex-CAP Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
              data-testid="img-excap-logo"
            />
            <img 
              src={edutuneLogo} 
              alt="EduTune Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
              data-testid="img-edutune-logo"
            />
            <h1 className={`text-sm sm:text-lg lg:text-xl font-bold transition-colors max-w-[120px] sm:max-w-none ${
              isScrolled ? "text-gray-800" : "text-white"
            }`} data-testid="text-logo">
              <span className="hidden sm:inline">Ex-CAP Quiz Fest 2025</span>
              <span className="sm:hidden leading-tight">Ex-CAP<br />Quiz</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline gap-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                    isScrolled 
                      ? "text-gray-600 hover:text-gray-800" 
                      : "text-white/90 hover:text-white"
                  }`}
                  data-testid={`link-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 ${isScrolled ? "text-gray-800" : "text-white"}`}
              data-testid="button-menu-toggle"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-4 pt-4 pb-6 space-y-2 border-t ${
              isScrolled ? "bg-white/95 backdrop-blur-md" : "bg-[#73349c]"
            }`}>
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium w-full text-left transition-all duration-200 hover-elevate hover:scale-[1.02] ${
                    isScrolled 
                      ? "text-gray-600 hover:text-gray-800 hover:bg-gray-50" 
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                  data-testid={`link-mobile-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}