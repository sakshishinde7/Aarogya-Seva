import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Baby,
  Heart,
  UserCheck,
  Syringe,
  Shield,
  ClipboardList,
  BarChart3,
  Workflow,
  ArrowRight,
  Lock,
  CheckCircle2,
} from "lucide-react";

/** Feature card data */
const features = [
  {
    icon: AlertTriangle,
    title: "Fragmented Healthcare Data",
    description:
      "Rural communities often rely on paper records scattered across multiple facilities. Aarogya Seva unifies patient information into a single, accessible platform.",
    color: "bg-blush",
    iconColor: "text-rose-600",
  },
  {
    icon: Baby,
    title: "Child Healthcare",
    description:
      "Track growth milestones, immunization schedules, and nutritional assessments for children from birth through adolescence.",
    color: "bg-softblue",
    iconColor: "text-blue-600",
  },
  {
    icon: Heart,
    title: "Maternal Healthcare",
    description:
      "Monitor antenatal and postnatal care, high-risk pregnancies, and delivery records to improve maternal health outcomes.",
    color: "bg-blush",
    iconColor: "text-pink-600",
  },
  {
    icon: UserCheck,
    title: "Elderly Healthcare",
    description:
      "Manage chronic conditions, medication schedules, and regular health check-ups for the aging population in rural areas.",
    color: "bg-lavender",
    iconColor: "text-purple-600",
  },
  {
    icon: Syringe,
    title: "Vaccination Management",
    description:
      "Maintain comprehensive immunization records, send automated reminders, and track coverage across communities.",
    color: "bg-mint-light",
    iconColor: "text-emerald-600",
  },
  {
    icon: Shield,
    title: "Disease Management",
    description:
      "Track disease outbreaks, manage case follow-ups, and coordinate response efforts across healthcare workers.",
    color: "bg-softblue",
    iconColor: "text-indigo-600",
  },
  {
    icon: ClipboardList,
    title: "Centralized Patient Records",
    description:
      "One unified record per patient — demographics, visit history, diagnostics, prescriptions, and referrals in one place.",
    color: "bg-mint-light",
    iconColor: "text-teal-600",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Generate actionable insights with real-time dashboards, coverage reports, and trend analyses for better decision-making.",
    color: "bg-lavender",
    iconColor: "text-violet-600",
  },
  {
    icon: Workflow,
    title: "How the Platform Works",
    description:
      "A streamlined workflow — register patients, record health data, schedule follow-ups, and generate reports seamlessly.",
    color: "bg-blush",
    iconColor: "text-orange-600",
  },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Register Patients",
    description: "Create unified health records for individuals and families.",
  },
  {
    step: "02",
    title: "Record Health Data",
    description: "Log visits, diagnostics, vaccinations, and treatments.",
  },
  {
    step: "03",
    title: "Schedule Follow-ups",
    description: "Automate reminders and coordinate care across workers.",
  },
  {
    step: "04",
    title: "Generate Reports",
    description: "Analyze trends and coverage to drive better outcomes.",
  },
];

export default function Home() {
  return (
    <div className="bg-ivory">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage/20 via-mint-light to-ivory">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-sage/20 px-4 py-1.5 text-sm font-medium text-sage-dark">
              Healthcare Coordination Platform
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-primary-text sm:text-5xl lg:text-6xl">
              Connected Healthcare.{" "}
              <span className="text-sage-dark">Healthier Communities.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-secondary-text sm:text-xl">
              Aarogya Seva brings healthcare records, vaccination information,
              and disease-management workflows together in one coordinated
              platform, helping authorized healthcare workers support rural
              communities more effectively.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/mission"
                className="inline-flex items-center gap-2 rounded-lg bg-sage-dark px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-sage-dark/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sage-dark focus:ring-offset-2"
              >
                Explore Our Mission
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-6 py-3 text-base font-semibold text-primary-text shadow-sm transition-all hover:bg-mint-light hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
              >
                Healthcare Staff Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-primary-text sm:text-4xl">
            Comprehensive Healthcare Management
          </h2>
          <p className="mt-4 text-lg text-secondary-text">
            Everything rural healthcare teams need — from patient registration
            to analytics — in one connected platform.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`inline-flex rounded-lg ${feature.color} p-3`}
                >
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary-text">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary-text">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-mint-light/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-primary-text sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-secondary-text">
              A simple, four-step workflow designed for real-world healthcare
              delivery.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connector line (hidden on last item & mobile) */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-sage/30 lg:block" />
                )}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-dark text-xl font-bold text-white shadow-sm">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary-text">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-secondary-text">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sage-dark font-semibold hover:underline"
            >
              Learn more about the workflow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Privacy & Disclaimer ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border-subtle bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="inline-flex rounded-lg bg-lavender p-3">
              <Lock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary-text">
                Privacy & Prototype Disclaimer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-text">
                Aarogya Seva is a <strong>demonstration prototype</strong>{" "}
                designed to showcase coordinated healthcare record management.
                It does not store real patient data and is not intended for
                clinical use. All sample data shown is fictional. The platform
                follows privacy-first design principles and role-based access
                controls.
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  "No real patient data stored",
                  "Role-based access control",
                  "Demonstration purposes only",
                  "Privacy-first architecture",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-secondary-text"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-dark" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
