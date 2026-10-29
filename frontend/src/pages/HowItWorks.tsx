import { Link } from "react-router-dom";
import {
  UserPlus,
  FileText,
  CalendarClock,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ArrowDown,
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Register Patient",
    description:
      "Create a unified digital health record for each patient or family. Capture demographics, medical history, and contact details in a standardized format accessible across all care modules.",
    highlights: [
      "Individual and family registration",
      "Unique health ID generation",
      "Demographics & medical history",
      "Linked family records",
    ],
    color: "bg-mint-light",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
  },
  {
    number: 2,
    icon: FileText,
    title: "Record Health Data",
    description:
      "Log clinical visits, diagnostics, vaccinations, prescriptions, and health assessments. All data flows into the patient's unified record, ensuring nothing is lost across providers.",
    highlights: [
      "Visit notes & diagnostics",
      "Vaccination records",
      "Growth & nutrition tracking",
      "Prescription management",
    ],
    color: "bg-softblue",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    number: 3,
    icon: CalendarClock,
    title: "Schedule Follow-ups",
    description:
      "Set automated follow-up reminders for upcoming vaccinations, antenatal visits, chronic disease check-ups, and more. Reduce missed appointments and improve continuity of care.",
    highlights: [
      "Automated reminders",
      "Priority-based scheduling",
      "Multi-worker coordination",
      "Overdue visit alerts",
    ],
    color: "bg-lavender",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    number: 4,
    icon: BarChart3,
    title: "Generate Reports",
    description:
      "Produce actionable insights — vaccination coverage rates, disease trends, follow-up completion, and community health summaries — to guide resource allocation and policy decisions.",
    highlights: [
      "Coverage dashboards",
      "Trend analysis",
      "Exportable reports",
      "Community health summaries",
    ],
    color: "bg-blush",
    iconColor: "text-rose-600",
    borderColor: "border-rose-200",
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-ivory">
      {/* ── Header ── */}
      <section className="bg-gradient-to-br from-sage/15 via-mint-light/40 to-ivory py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block rounded-full bg-sage/20 px-4 py-1.5 text-sm font-medium text-sage-dark">
              Platform Workflow
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-primary-text sm:text-5xl">
              How It Works
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-secondary-text">
              Aarogya Seva follows a simple, four-step workflow that mirrors
              real-world healthcare delivery — from patient registration through
              actionable reporting.
            </p>
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-sage/40 via-sage/20 to-sage/5 md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 -bottom-6 z-10 hidden -translate-x-1/2 md:block">
                      <ArrowDown className="h-5 w-5 text-sage/50" />
                    </div>
                  )}

                  <div className="flex gap-6 md:gap-8">
                    {/* Step number circle */}
                    <div className="relative z-20 hidden shrink-0 md:block">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full ${step.color} border-4 border-ivory shadow-sm`}
                      >
                        <span className="text-lg font-bold text-primary-text">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Card */}
                    <div
                      className={`flex-1 rounded-xl border ${step.borderColor} bg-white p-6 shadow-sm transition hover:shadow-md md:p-8`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Mobile step number */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${step.color} md:hidden`}
                        >
                          <span className="text-sm font-bold text-primary-text">
                            {step.number}
                          </span>
                        </div>
                        <div className={`rounded-lg ${step.color} p-2.5`}>
                          <Icon className={`h-5 w-5 ${step.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-primary-text">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-4 text-base leading-relaxed text-secondary-text">
                        {step.description}
                      </p>
                      <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {step.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-center gap-2 text-sm text-secondary-text"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-dark" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="rounded-xl bg-sage-dark/5 border border-sage/20 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-primary-text">
              See the platform in action
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-secondary-text">
              Log in to explore the full workflow with sample data — patient
              records, vaccination schedules, and community reports.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-sage-dark px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sage-dark/90"
              >
                Healthcare Staff Login
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-6 py-3 text-base font-semibold text-primary-text shadow-sm transition hover:bg-mint-light"
              >
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
