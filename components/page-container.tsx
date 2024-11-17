interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`container px-4 py-6 md:py-8 mx-auto max-w-7xl ${className}`}>
      {children}
    </div>
  );
}
