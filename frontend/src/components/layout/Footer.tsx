import { Link } from "react-router-dom";
import { Paintbrush, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Paint Catalog", href: "/products" },
    { name: "AI Visualizer", href: "/visualizer" },
    { name: "Color Matching", href: "/colors" },
    { name: "Find a Painter", href: "/painters" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Contact", href: "/contact" },
  ],
  partners: [
    { name: "Become a Dealer", href: "/dealer/register" },
    { name: "Painter Signup", href: "/painter/register" },
    { name: "API Access", href: "/api" },
    { name: "Affiliate Program", href: "/affiliate" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Returns", href: "/returns" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Linkedin, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Paintbrush className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                PaintVerse
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-6 max-w-xs">
              Transform your spaces with AI-powered paint visualization. 
              Connect with trusted dealers and professional painters.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@paintverse.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>DHA Phase 5, Karachi</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Partners</h4>
            <ul className="space-y-2">
              {footerLinks.partners.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2026 PaintVerse. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
