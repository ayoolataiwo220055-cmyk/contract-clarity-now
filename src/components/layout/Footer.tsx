import { Shield, Lock, Trash2 } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="section-container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-heading text-lg font-medium text-foreground">
              Employ Know
            </span>
          </div>

          {/* Privacy Indicators */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>No accounts required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Files never stored</span>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} Employ Know. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
