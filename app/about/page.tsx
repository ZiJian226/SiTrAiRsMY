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
                About StarMy
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
                  success stories—artists finding their dream clients, VTubers building dedicated fanbases, and
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

          {/* Team Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-center mb-10 text-secondary">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card bg-base-200 shadow-xl">
                <figure className="px-10 pt-10">
                  <div className="avatar">
                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src="https://placehold.co/200x200/a855f7/ffffff?text=Founder" alt="Founder" />
                    </div>
                  </div>
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title">Alex Chen</h3>
                  <p className="text-sm opacity-70">Founder & CEO</p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <figure className="px-10 pt-10">
                  <div className="avatar">
                    <div className="w-32 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                      <img src="https://placehold.co/200x200/facc15/000000?text=CTO" alt="CTO" />
                    </div>
                  </div>
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title">Sarah Lim</h3>
                  <p className="text-sm opacity-70">CTO</p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <figure className="px-10 pt-10">
                  <div className="avatar">
                    <div className="w-32 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2">
                      <img src="https://placehold.co/200x200/8b5cf6/ffffff?text=Design" alt="Design Lead" />
                    </div>
                  </div>
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title">Maya Tan</h3>
                  <p className="text-sm opacity-70">Design Lead</p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <figure className="px-10 pt-10">
                  <div className="avatar">
                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src="https://placehold.co/200x200/a855f7/ffffff?text=Community" alt="Community Manager" />
                    </div>
                  </div>
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title">Ryan Wong</h3>
                  <p className="text-sm opacity-70">Community Manager</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="stats stats-vertical lg:stats-horizontal shadow-xl w-full mb-12">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div className="stat-title">VTubers</div>
              <div className="stat-value text-primary">50+</div>
              <div className="stat-desc">And growing!</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                </svg>
              </div>
              <div className="stat-title">Artists</div>
              <div className="stat-value text-secondary">100+</div>
              <div className="stat-desc">Talented creators</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <div className="stat-title">Commissions</div>
              <div className="stat-value text-accent">500+</div>
              <div className="stat-desc">Successfully completed</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-xl">
            <div className="card-body text-center">
              <h2 className="text-4xl font-bold mb-4">Join Our Journey</h2>
              <p className="text-lg mb-6 opacity-80">
                Whether you're a creator looking to showcase your talent or a fan seeking amazing content,
                we'd love to have you as part of the StarMy community.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/career" className="btn btn-primary btn-lg">
                  Join as Creator
                </Link>
                <Link href="/vtubers" className="btn btn-secondary btn-lg">
                  Explore VTubers
                </Link>
                <Link href="/artists" className="btn btn-accent btn-lg">
                  Find Artists
                </Link>
              </div>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  );
}
