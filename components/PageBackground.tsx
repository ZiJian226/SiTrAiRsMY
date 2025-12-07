import Image from "next/image";

interface PageBackgroundProps {
  rotate?: boolean;
  blur?: boolean;
  opacity?: number;
}

export default function PageBackground({ 
  rotate = true, 
  blur = true,
  opacity = 30 
}: PageBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0">
        <Image
          src="/assets/images/background/starmy-background.png"
          alt="StarMy Background"
          fill
          className={`object-cover ${rotate ? 'rotate-90' : ''} ${blur ? 'blur-[50%]' : ''}`}
          style={{
            filter: blur ? 'blur(8px)' : 'none',
            transform: rotate ? 'rotate(90deg) scale(1.5)' : 'none',
          }}
          priority
          quality={90}
        />
      </div>
      {/* Overlay for opacity control */}
      <div 
        className="absolute inset-0 bg-base-100"
        style={{ opacity: opacity / 100 }}
      ></div>
    </div>
  );
}
