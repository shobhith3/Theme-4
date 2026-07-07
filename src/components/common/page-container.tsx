"use client";

import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[1480px] mx-auto animate-fade-in",
        "px-4 md:px-6 lg:px-7 xl:px-8 pt-6 pb-12",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
