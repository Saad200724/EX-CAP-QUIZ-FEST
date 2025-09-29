import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "./ContactForm";
import chCyberHubLogo from "@/assets/logos/ch-cyber-hub-logo.png";
import chFooterLogo from "@assets/CH-LOGO-FOOTER_1758813481664.png";

export default function Footer() {
  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "01780184038",
      href: "tel:01780184038"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "01711988862",
      href: "tel:01711988862"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Savar Cantonment Public School & College",
      href: "#"
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/excap.scpsc", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/ex_cap_scpsc/", label: "Instagram" }
  ];

  const handleContactClick = (href: string, label: string) => {
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      window.location.href = href;
    }
  };

  const handleSocialClick = (href: string, label: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6" data-testid="text-footer-brand">
              Ex-CAP Quiz Fest 2025
            </h3>
            <p className="text-primary-foreground/80 mb-3 sm:mb-6 leading-relaxed text-sm sm:text-base hidden sm:block">
              Empowering the next generation of leaders through educational excellence and competitive learning experiences.
            </p>
            <p className="text-primary-foreground/80 mb-3 leading-relaxed text-sm sm:hidden">
              Quiz competition for students of all levels.
            </p>
          </div>

          {/* Contact Info */}
          <div className="hidden sm:block">
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6" data-testid="text-footer-contact-title">
              Contact Information
            </h4>
            <div className="space-y-3 sm:space-y-4">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleContactClick(contact.href, contact.label)}
                    className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors hover-elevate p-2 rounded-md text-left w-full text-sm sm:text-base"
                    data-testid={`link-contact-${contact.label.toLowerCase()}`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="break-words">{contact.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Mobile Contact - Simplified */}
          <div className="sm:hidden">
            <h4 className="text-base font-semibold mb-3" data-testid="text-footer-contact-title-mobile">
              Contact
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => handleContactClick('tel:01780184038', 'Phone')}
                className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                data-testid="link-contact-phone-mobile"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>01780184038</span>
              </button>
            </div>
          </div>

          {/* Social Media */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6" data-testid="text-footer-social-title">
              Follow Us
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex gap-3 sm:gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSocialClick(social.href, social.label)}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover-elevate"
                      data-testid={`link-social-${social.label.toLowerCase()}`}
                      aria-label={social.label}
                    >
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  );
                })}
              </div>
              <ContactForm 
                triggerButton={
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary text-sm sm:text-base px-3 sm:px-4" 
                    data-testid="button-footer-contact"
                  >
                    Get in Touch
                  </Button>
                }
              />
            </div>
            
            {/* Club Partners below Follow Us */}
            <div className="mt-6 sm:mt-8">
              <div className="flex items-center gap-3">
                <h5 className="text-sm sm:text-base font-semibold" data-testid="text-footer-club-partners">
                  Club Partner
                </h5>
                <div className="flex-shrink-0" data-testid="logo-ch-footer">
                  <img 
                    src={chFooterLogo}
                    alt="CH Logo"
                    className="h-12 sm:h-20 w-auto object-contain opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-primary-foreground/20 mt-6 sm:mt-8 pt-4 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-primary-foreground/60 text-xs sm:text-sm text-center sm:text-left" data-testid="text-footer-copyright">
              <span>© 2025 Ex-CAP Quiz. All rights reserved.</span>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start">
                <span className="hidden sm:inline">Developed by</span>
                <span className="sm:hidden">by</span>
                <img 
                  src={chCyberHubLogo} 
                  alt="SCPSC Cyber Hub Logo" 
                  className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain"
                />
                <span className="text-xs sm:text-sm">(SCPSC Cyber Hub)</span>
              </div>
            </div>
            <div className="hidden sm:flex gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap justify-center">
              <button 
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors hover-elevate px-2 py-1 rounded whitespace-nowrap"
                onClick={() => {}}
                data-testid="link-privacy"
              >
                Privacy Policy
              </button>
              <button 
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors hover-elevate px-2 py-1 rounded whitespace-nowrap"
                onClick={() => {}}
                data-testid="link-terms"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}