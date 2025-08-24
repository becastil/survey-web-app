'use client';

interface PageTransitionProps {
  children: React.ReactNode;
  pathname?: string;
}

export function PageTransition({ children, pathname }: PageTransitionProps) {
  return <>{children}</>;
}

export default PageTransition;