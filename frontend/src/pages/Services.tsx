import { Link } from "react-router-dom";
import {
  UserPlus,
  Baby,
  Heart,
  UserCheck,
  Syringe,
  Shield,
  CalendarClock,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: UserPlus,
    title: "Patient Registration",
    description:
      "Create comprehensive digital profiles for individuals and families, capturing demographics, medical history, and socio-economic context for holistic care.",
    color: "bg-mint-light",
    iconColor: "text-emerald-600",
    link: "/how-it-works",
  },
  {
    icon: Baby,
    title: "Child Healthcare",
    description:
      "Track growth milestones, developmental assessments, nutritional status, and immunization schedules from birth through adolescence.",
    color: "bg-softblue",
    iconColor: "text-blue-600",
    link: "/how-it-works",
  },
  {
    icon: Heart,
    title: "Maternal Healthcare",
    description:
      "Monitor antenatal visits, delivery planning, postnatal check-ups, and high-risk pregnancy indicators to ensure safe motherhood.",
    color: "bg-blush",
    iconColor: "text-pink-600",
    link: "/how-it-works",
  },
  {
    icon: UserCheck,
    title: "Elderly Healthcare",
    description:
      "Manage chronic disease tracking, medication adherence, mobility assessments, and regular wellness check-ups for senior community members.",
    color: "bg-lavender",
    iconColor: "text-purple-600",
    link: "/how-it-works",
  },
  {
    icon: Syringe,
    title: "Vaccination Management",
    description:
      "Maintain end-to-end immunization records, schedule upcoming vaccines, send reminders, and track community coverage rates.",
    color: "bg-mint-light",
    iconColor: "text-teal-600",
    link: "/how-it-works",
  },
  {
    icon: Shield,
    title: "Disease Management",
    description:
      "Record and track communicable and non-communicable diseases, coordinate outbreak responses, and manage case follow-ups.",
    color: "bg-softblue",
    iconColor: "text-indigo-600",
    link: "/how-it-works",
  },
  {
    icon: CalendarClock,
    title: "Follow-up Scheduling",
    description:
      "Automate appointment reminders and follow-up schedules to reduce missed visits and improve continuity of care across healthcare workers.",
    color: "bg-blush",
    iconColor: "text-orange-600",
    link: "/how-it-works",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Generate real-time dashboards, coverage summaries, and trend reports to support data-driven healthcare planning and resource allocation.",
    color: "bg-lavender",
    iconColor: "text-violet-600",
    link: "/how-it-works",
  },
];

export default function Services() {
  return (
    <div className="bg-ivory">
      {/* ── Header ── */}
      <section className="bg-gradient-to-br from-sage/15 via-mint-light/40 to-ivory py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block rounded-full bg-sage/20 px-4 py-1.5 text-sm font-medium text-sage-dark">
              What We Offer
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-primary-text sm:text-5xl">
              Healthcare Services
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-secondary-text">
              A comprehensive suite of healthcare management modules designed
              for community health workers, nurses, and medical officers
              operating in rural settings.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group flex flex-col rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`inline-flex self-start rounded-lg ${service.color} p-3`}
                >
                  <Icon className={`h-6 w-6 ${service.iconColor}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary-text">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary-text">
                  {service.description}
                </p>
                <Link
                  to={service.link}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark transition hover:underline"
                >
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-xl bg-sage-dark/5 border border-sage/20 p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold text-primary-text sm:text-3xl">
            Ready to explore the platform?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-secondary-text">
            See how all these services work together in a streamlined workflow
            built for rural healthcare teams.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-lg bg-sage-dark px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sage-dark/90"
            >
              See How It Works
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-6 py-3 text-base font-semibold text-primary-text shadow-sm transition hover:bg-mint-light"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
