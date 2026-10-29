import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  FileCheck2,
  CalendarCheck,
  Syringe,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const goals = [
  {
    icon: FileCheck2,
    title: "Reduce Duplicate Records",
    description:
      "Eliminate redundant patient entries by maintaining a single, unified health profile per individual across all care modules.",
    color: "bg-mint-light",
    iconColor: "text-emerald-600",
  },
  {
    icon: CalendarCheck,
    title: "Coordinate Follow-ups",
    description:
      "Ensure no appointment is missed with automated reminders, priority scheduling, and cross-worker coordination for continuity of care.",
    color: "bg-softblue",
    iconColor: "text-blue-600",
  },
  {
    icon: Syringe,
    title: "Improve Vaccination Coverage",
    description:
      "Track immunization schedules community-wide, identify gaps in coverage, and drive timely administration of vaccines.",
    color: "bg-lavender",
    iconColor: "text-purple-600",
  },
  {
    icon: UserCheck,
    title: "Support Elderly Care",
    description:
      "Provide structured management of chronic conditions, medication adherence, and regular wellness assessments for senior community members.",
    color: "bg-blush",
    iconColor: "text-rose-600",
  },
  {
    icon: TrendingUp,
    title: "Enable Data-Driven Decisions",
    description:
      "Empower health administrators with real-time dashboards, trend analyses, and coverage reports to allocate resources effectively.",
    color: "bg-softblue",
    iconColor: "text-indigo-600",
  },
];

export default function Mission() {
  return (
    <div className="bg-ivory">
      {/* ── Header ── */}
      <section className="bg-gradient-to-br from-sage/15 via-mint-light/40 to-ivory py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block rounded-full bg-sage/20 px-4 py-1.5 text-sm font-medium text-sage-dark">
              Our Purpose
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-primary-text sm:text-5xl">
              Our Mission
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-secondary-text">
              To demonstrate how thoughtful technology can bridge gaps in rural
              healthcare delivery — connecting workers, patients, and data in
              service of healthier communities.
            </p>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission Statements ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Vision */}
          <div className="rounded-xl border border-border-subtle bg-white p-8 shadow-sm md:p-10">
            <div className="inline-flex rounded-lg bg-lavender p-3">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-primary-text">
              Our Vision
            </h2>
            <p className="mt-4 text-base leading-relaxed text-secondary-text">
              A world where every rural community has access to well-coordinated
              healthcare — where no vaccination is missed, no maternal
              check-up is forgotten, and no elderly patient falls through the
              cracks of a fragmented system.
            </p>
            <p className="mt-4 text-base leading-relaxed text-secondary-text">
              We envision digital tools that amplify the dedication of
              frontline health workers, giving them the data and workflows they
              need to deliver consistent, compassionate care.
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-xl border border-border-subtle bg-white p-8 shadow-sm md:p-10">
            <div className="inline-flex rounded-lg bg-mint-light p-3">
              <Target className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-primary-text">
              Our Mission
            </h2>
            <p className="mt-4 text-base leading-relaxed text-secondary-text">
              To build a demonstration platform that showcases how centralized
              health record management, automated scheduling, and actionable
              analytics can transform rural healthcare delivery.
            </p>
            <p className="mt-4 text-base leading-relaxed text-secondary-text">
              Aarogya Seva serves as a proof-of-concept — illustrating best
              practices in healthcare digitization while remaining accessible,
              privacy-respecting, and designed for low-resource environments.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="bg-mint-light/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 inline-flex rounded-lg bg-sage/15 p-3">
              <Heart className="h-6 w-6 text-sage-dark" />
            </div>
            <h2 className="text-3xl font-bold text-primary-text">
              What Drives Us
            </h2>
            <p className="mt-4 text-lg text-secondary-text">
              The core principles that guide every design decision and feature
              we build.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Community First",
                description:
                  "Every feature is designed around the needs of rural communities and the health workers who serve them.",
              },
              {
                title: "Privacy by Design",
                description:
                  "Role-based access, data minimization, and transparent handling — patient privacy is foundational.",
              },
              {
                title: "Simplicity & Clarity",
                description:
                  "Clean interfaces, intuitive workflows, and minimal training requirements for real-world adoption.",
              },
              {
                title: "Interoperability",
                description:
                  "Standards-based design that can integrate with existing health information systems and registries.",
              },
              {
                title: "Evidence-Driven",
                description:
                  "Data collection and reporting that supports evidence-based healthcare planning and resource allocation.",
              },
              {
                title: "Accessibility",
                description:
                  "Built for varying technical literacy levels and designed to work reliably in low-bandwidth settings.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm"
              >
                <Sparkles className="h-5 w-5 text-sage-dark" />
                <h3 className="mt-3 text-base font-semibold text-primary-text">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary-text">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Goals ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-primary-text">Key Goals</h2>
          <p className="mt-4 text-lg text-secondary-text">
            The measurable objectives that define our success.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const Icon = goal.icon;
            return (
              <div
                key={goal.title}
                className="group rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`inline-flex rounded-lg ${goal.color} p-3`}
                >
                  <Icon className={`h-6 w-6 ${goal.iconColor}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary-text">
                  {goal.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary-text">
                  {goal.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-lg bg-sage-dark px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sage-dark/90"
          >
            Explore Our Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
