import { Link } from "react-router-dom";
import {
  Users,
  Code2,
  Heart,
  Globe,
  Server,
  Layout,
  Database,
  Palette,
} from "lucide-react";

const teamMembers = [
  {
    name: "Project Lead",
    role: "Healthcare Systems Architect",
    description:
      "Coordinates the overall vision and ensures the platform meets rural healthcare requirements.",
    icon: Users,
    color: "bg-mint-light",
  },
  {
    name: "Frontend Developer",
    role: "UI/UX & Accessibility",
    description:
      "Designs intuitive, accessible interfaces for healthcare workers with varying technical literacy.",
    icon: Palette,
    color: "bg-lavender",
  },
  {
    name: "Backend Developer",
    role: "API & Data Engineering",
    description:
      "Builds reliable, secure APIs and data pipelines that work under low-connectivity conditions.",
    icon: Code2,
    color: "bg-softblue",
  },
  {
    name: "Health Informatics",
    role: "Domain Expert",
    description:
      "Ensures workflows align with real-world healthcare protocols and community health standards.",
    icon: Heart,
    color: "bg-blush",
  },
];

const technologies = [
  {
    name: "React & TypeScript",
    description: "Modern, type-safe frontend for a responsive user experience.",
    icon: Layout,
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first styling for rapid, consistent UI development.",
    icon: Palette,
  },
  {
    name: "Node.js / Express",
    description: "Lightweight, performant backend API server.",
    icon: Server,
  },
  {
    name: "PostgreSQL",
    description: "Robust relational database for structured health records.",
    icon: Database,
  },
];

export default function About() {
  return (
    <div className="bg-ivory">
      {/* ── Header ── */}
      <section className="bg-gradient-to-br from-sage/15 via-mint-light/40 to-ivory py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block rounded-full bg-sage/20 px-4 py-1.5 text-sm font-medium text-sage-dark">
              About the Platform
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-primary-text sm:text-5xl">
              About Aarogya Seva
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-secondary-text">
              Aarogya Seva is a demonstration platform designed to showcase how
              coordinated digital systems can transform rural healthcare record
              management — making patient data accessible, follow-ups reliable,
              and community health programs more effective.
            </p>
          </div>
        </div>
      </section>

      {/* ── Purpose ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-primary-text">
              Why Aarogya Seva?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-secondary-text">
              In many rural regions, healthcare information is fragmented across
              paper registers, disconnected clinics, and individual health
              workers' notebooks. This fragmentation leads to missed
              vaccinations, duplicated records, and poor continuity of care.
            </p>
            <p className="mt-4 text-base leading-relaxed text-secondary-text">
              Aarogya Seva demonstrates how a centralized, role-based digital
              platform can address these challenges — giving healthcare workers
              a single source of truth for patient records, scheduling, and
              community health analytics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-lg bg-sage-dark px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sage-dark/90"
              >
                View Services
              </Link>
              <Link
                to="/mission"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-5 py-2.5 text-sm font-semibold text-primary-text shadow-sm transition hover:bg-mint-light"
              >
                Our Mission
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Unified Records", value: "1 Platform", color: "bg-mint-light" },
              { label: "Healthcare Areas", value: "5+ Modules", color: "bg-lavender" },
              { label: "Target Users", value: "Health Workers", color: "bg-softblue" },
              { label: "Design Focus", value: "Rural-First", color: "bg-blush" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl ${stat.color} p-6 text-center`}
              >
                <p className="text-2xl font-bold text-primary-text">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-secondary-text">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-mint-light/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-primary-text">
              Meet the Team
            </h2>
            <p className="mt-4 text-lg text-secondary-text">
              A multidisciplinary team bringing together healthcare knowledge
              and modern technology.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => {
              const Icon = member.icon;
              return (
                <div
                  key={member.name}
                  className="rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm transition hover:shadow-md"
                >
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${member.color}`}
                  >
                    <Icon className="h-7 w-7 text-sage-dark" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-primary-text">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-sage-dark">
                    {member.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-secondary-text">
                    {member.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-primary-text">
            Technology Overview
          </h2>
          <p className="mt-4 text-lg text-secondary-text">
            Built with a modern, reliable stack designed for scalability and
            ease of deployment.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="inline-flex rounded-lg bg-sage/15 p-3">
                  <Icon className="h-6 w-6 text-sage-dark" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-primary-text">
                  {tech.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary-text">
                  {tech.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Globe icon as a visual accent */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-3 rounded-full bg-mint-light px-6 py-3">
            <Globe className="h-5 w-5 text-sage-dark" />
            <span className="text-sm font-medium text-primary-text">
              Designed for low-bandwidth, rural-first environments
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
