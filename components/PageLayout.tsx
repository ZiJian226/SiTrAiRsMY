import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PageBackground from './PageBackground';
import Container from './Container';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBackground?: boolean;
  containerClassName?: string;
}

/**
 * Reusable page layout wrapper
 * Reduces layout duplication across pages
 */
export default function PageLayout({ 
  children, 
  title, 
  description,
  showBackground = true,
  containerClassName = 'py-12'
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      {showBackground && <PageBackground rotate blur opacity={50} />}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Container className={`flex-grow ${containerClassName}`}>
          {(title || description) && (
            <div className="text-center mb-12">
              {title && (
                <h1 className="text-5xl font-bold mb-4 text-primary">{title}</h1>
              )}
              {description && (
                <p className="text-lg max-w-2xl mx-auto opacity-70">{description}</p>
              )}
            </div>
          )}
          {children}
        </Container>
        <Footer />
      </div>
    </div>
  );
}
