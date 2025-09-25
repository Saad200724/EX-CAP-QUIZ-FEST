import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "info@excapnext.com",
      href: "mailto:info@excapnext.com"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 University Ave, Education City",
      href: "#"
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  const handleContactClick = (href: string, label: string) => {
    console.log(`Contact clicked: ${label} - ${href}`);
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      window.location.href = href;
    }
  };

  const handleSocialClick = (href: string, label: string) => {
    console.log(`Social link clicked: ${label}`);
    // In a real app, this would navigate to the actual social media page
  };

  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6" data-testid="text-footer-brand">
              Ex-Cap Next
            </h3>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Empowering the next generation of leaders through educational excellence and competitive learning experiences.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6" data-testid="text-footer-contact-title">
              Contact Information
            </h4>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleContactClick(contact.href, contact.label)}
                    className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors hover-elevate p-2 rounded-md text-left w-full"
                    data-testid={`link-contact-${contact.label.toLowerCase()}`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    <span>{contact.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-6" data-testid="text-footer-social-title">
              Follow Us
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSocialClick(social.href, social.label)}
                    className="w-12 h-12 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover-elevate"
                    data-testid={`link-social-${social.label.toLowerCase()}`}
                    aria-label={social.label}
                  >
                    <IconComponent className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm" data-testid="text-footer-copyright">
              © 2025 Ex-Cap Next. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <button 
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors hover-elevate px-2 py-1 rounded"
                onClick={() => console.log('Privacy Policy clicked')}
                data-testid="link-privacy"
              >
                Privacy Policy
              </button>
              <button 
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors hover-elevate px-2 py-1 rounded"
                onClick={() => console.log('Terms of Service clicked')}
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