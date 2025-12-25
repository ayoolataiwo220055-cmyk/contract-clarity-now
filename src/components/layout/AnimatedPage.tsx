import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

const AnimatedPage = ({ children, className }: AnimatedPageProps) => {
  return (
    <div className={cn("page-enter", className)}>
      {children}
    </div>
  );
};

export default AnimatedPage;
