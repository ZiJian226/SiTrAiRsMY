import { ReactNode, CSSProperties } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Container({ children, className = "", style }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl ${className}`} style={style}>
      {children}
    </div>
  );
}
