import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      
      <Container className="flex-grow flex items-center justify-center py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-9xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-5xl font-bold mb-4">Page Not Found</h1>
          <p className="text-xl opacity-70 mb-8">
            Looks like this page wandered off into the virtual void. Let's get you back on track!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/" className="btn btn-primary btn-lg">
              Back to Home
            </Link>
            <Link href="/vtubers" className="btn btn-secondary btn-lg">
              Explore VTubers
            </Link>
            <Link href="/artists" className="btn btn-accent btn-lg">
              Find Artists
            </Link>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
