import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/settings", label: "Settings" },
];

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="section-container" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-foreground hover:text-accent transition-colors duration-200"
            aria-label="Employ Know Home"
          >
            <Shield className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="font-heading text-xl font-semibold tracking-tight">
              Employ Know
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Button
                  key={link.href}
                  variant={isActive ? "nav-active" : "nav"}
                  size="sm"
                  asChild
                >
                  <Link to={link.href}>{link.label}</Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm transition-colors duration-200",
                    isActive ? "text-accent font-medium" : "text-muted-foreground hover:text-accent"
                  )}
                >
                  {link.label === "Contact Us" ? "Contact" : link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
