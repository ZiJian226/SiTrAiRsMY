import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <div className="hero min-h-[400px] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
          <div className="hero-content text-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                About StarMyriad
              </h1>
              <p className="text-xl">
                Building Malaysia's most vibrant VTuber and artist community, one connection at a time.
              </p>
            </div>
          </div>
        </div>

        <Container className="py-16 flex-grow">
          {/* Mission Section */}
          <div className="card bg-base-200 shadow-xl mb-12">
            <div className="card-body">
              <h2 className="text-4xl font-bold mb-6 text-primary">Our Mission</h2>
              <p className="text-lg opacity-80 leading-relaxed">
                StarMy was created with a singular vision: to empower Malaysia's VTuber and artist community by
                providing a platform where creativity thrives, connections flourish, and dreams become reality.
                We believe in the power of community, the importance of visibility, and the magic that happens
                when talented creators and passionate fans come together.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-center mb-10 text-secondary">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">🎨</div>
                  <h3 className="card-title text-primary">Creativity</h3>
                  <p className="opacity-80">
                    We celebrate unique voices, diverse art styles, and innovative content that pushes boundaries.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">🤝</div>
                  <h3 className="card-title text-secondary">Community</h3>
                  <p className="opacity-80">
                    Building meaningful connections between creators and fans is at the heart of everything we do.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="card-title text-accent">Excellence</h3>
                  <p className="opacity-80">
                    We strive for the highest quality in our platform, support, and the experiences we create.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="card bg-base-200 shadow-xl mb-12">
            <div className="card-body">
              <h2 className="text-4xl font-bold mb-6 text-primary">Our Story</h2>
              <div className="space-y-4 text-lg opacity-80 leading-relaxed">
                <p>
                  Founded in 2025, StarMy emerged from a simple observation: Malaysia has an incredibly talented
                  pool of VTubers and digital artists, but they lacked a dedicated platform to showcase their work
                  and connect with their audience.
                </p>
                <p>
                  What started as a passion project has grown into a thriving community hub. We've witnessed countless
                  success stories where artists finding their dream clients, VTubers building dedicated fanbases, and
                  collaborations that have created amazing content.
                </p>
                <p>
                  Today, StarMy stands as Malaysia's premier destination for virtual entertainment and digital art.
                  But we're just getting started. Our roadmap includes exciting features like live streaming integration,
                  community events, collaborative projects, and much more.
                </p>
              </div>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  );
}
