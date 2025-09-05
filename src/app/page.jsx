import Link from "next/link";
import MainBtn from "@/components/buttons/MainBtn";
import {
    Package,
    ClipboardList,
    Calendar,
    Shield,
    Wrench,
    BarChart3,
    QrCode,
    Check,
} from "lucide-react";

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Top Nav */}
            <header className="sticky top-0 z-20 border-b border-neutral-800/80 bg-neutral-900/70 backdrop-blur">
                <div className="w-full px-6 md:px-10 xl:px-16 2xl:px-24 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/guardianLogo.png"
                            alt="Guardian"
                            className="h-8 w-8"
                        />
                        <span className="text-neutral-300 font-semibold tracking-wide">
                            Guardian Inventory
                        </span>
                    </div>
                    <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-300">
                        <Link href="#features" className="hover:text-white">
                            Features
                        </Link>
                        <Link href="#preview" className="hover:text-white">
                            Preview
                        </Link>
                        <Link href="#testimonials" className="hover:text-white">
                            Customers
                        </Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/auth/login"
                            className="px-3 py-1.5 text-sm rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                        >
                            Sign in
                        </Link>
                        <MainBtn label="Start free" href="/auth/login" />
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                {/* decorative background */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, #fff 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    />
                </div>

                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 pt-20 pb-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1 text-xs text-neutral-300 mb-5">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        New: Calendar views and QR scanning
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-[18ch]">
                        Track assets. Schedule work. Ship faster.
                    </h1>
                    <p className="mt-5 max-w-2xl text-neutral-300">
                        One place for inventory, inspections, repairs, and
                        tasks. Simple to adopt, powerful at scale.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <MainBtn label="Start free" href="/auth/login" />
                        <Link
                            href="#preview"
                            className="px-4 py-2 text-sm rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition"
                        >
                            See it in action
                        </Link>
                    </div>

                    {/* Hero metrics */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Assets tracked", value: "50k+" },
                            { label: "Average time saved", value: "7 hrs/wk" },
                            { label: "On-time tasks", value: "98%" },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-4"
                            >
                                <div className="text-white text-xl font-bold">
                                    {value}
                                </div>
                                <div className="text-neutral-400 text-xs mt-1">
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Highlights */}
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                title: "Real-time tracking",
                                desc: "Audit history, QR labels, and locations.",
                                points: [
                                    "Unlimited locations",
                                    "Ownership history",
                                ],
                            },
                            {
                                title: "Inspections & tasks",
                                desc: "Recurring schedules with reminders.",
                                points: [
                                    "Templates & checklists",
                                    "Assignees & due dates",
                                ],
                            },
                            {
                                title: "Permissions",
                                desc: "Roles for teams and sites.",
                                points: ["Role-based access", "Site scopes"],
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="rounded-xl border border-neutral-700/70 bg-neutral-800/60 p-5"
                            >
                                <div className="text-white text-lg font-semibold">
                                    {f.title}
                                </div>
                                <p className="text-neutral-400 text-sm mt-1">
                                    {f.desc}
                                </p>
                                <ul className="mt-3 space-y-1">
                                    {f.points.map((p) => (
                                        <li
                                            key={p}
                                            className="flex items-center gap-2 text-neutral-400 text-xs"
                                        >
                                            <Check className="h-3.5 w-3.5 text-orange-400" />
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Features */}
            <section
                id="features"
                className="relative border-t border-neutral-800 bg-neutral-900/60"
            >
                {/* subtle background accents */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, #fff 1px, transparent 1px)",
                            backgroundSize: "22px 22px",
                        }}
                    />
                </div>

                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1 text-xs text-neutral-300 mb-4">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Features
                    </div>
                    <h2 className="text-white text-2xl sm:text-3xl font-bold text-balance">
                        Everything you need to control your inventory
                    </h2>
                    <p className="text-neutral-400 mt-2 max-w-3xl text-balance">
                        Built for speed and clarity. Powerful when you need it,
                        simple when you don’t. Bring your own data via CSV and
                        export reports any time.
                    </p>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Package,
                                title: "Asset management",
                                desc: "Track items by location, condition, owner, and custom fields.",
                            },
                            {
                                icon: ClipboardList,
                                title: "Work & inspections",
                                desc: "Plan recurring inspections and close tasks with clear checklists.",
                            },
                            {
                                icon: Calendar,
                                title: "Calendar & reminders",
                                desc: "See due dates, get reminders, and avoid missed maintenance.",
                            },
                            {
                                icon: QrCode,
                                title: "QR labels",
                                desc: "Scan to view history, update status, or start a work order on-site.",
                            },
                            {
                                icon: Shield,
                                title: "Roles & permissions",
                                desc: "Granular control across sites and teams for safety and compliance.",
                            },
                            {
                                icon: BarChart3,
                                title: "Reporting",
                                desc: "Utilization, uptime, and completion rates at a glance.",
                            },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="group rounded-xl border border-neutral-700 bg-neutral-800/60 p-6 transition-colors hover:bg-neutral-800 hover:border-neutral-600"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative h-10 w-10 shrink-0 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-orange-400 transition-colors group-hover:text-orange-300" />
                                        <span className="pointer-events-none absolute inset-0 rounded-lg ring-0 ring-orange-500/0 group-hover:ring-2 group-hover:ring-orange-500/20 transition" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">
                                            {title}
                                        </div>
                                        <p className="text-neutral-400 text-sm mt-1">
                                            {desc}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {title === "Asset management" &&
                                                ["Locations", "Owners"].map(
                                                    (c) => (
                                                        <span
                                                            key={c}
                                                            className="text-xs text-neutral-300 bg-neutral-900/60 border border-neutral-700 rounded px-2 py-0.5"
                                                        >
                                                            {c}
                                                        </span>
                                                    )
                                                )}
                                            {title === "Work & inspections" &&
                                                [
                                                    "Checklists",
                                                    "Assignments",
                                                ].map((c) => (
                                                    <span
                                                        key={c}
                                                        className="text-xs text-neutral-300 bg-neutral-900/60 border border-neutral-700 rounded px-2 py-0.5"
                                                    >
                                                        {c}
                                                    </span>
                                                ))}
                                            {title === "Calendar & reminders" &&
                                                ["Recurring", "Alerts"].map(
                                                    (c) => (
                                                        <span
                                                            key={c}
                                                            className="text-xs text-neutral-300 bg-neutral-900/60 border border-neutral-700 rounded px-2 py-0.5"
                                                        >
                                                            {c}
                                                        </span>
                                                    )
                                                )}
                                            {title === "QR labels" &&
                                                ["Print-ready", "Mobile"].map(
                                                    (c) => (
                                                        <span
                                                            key={c}
                                                            className="text-xs text-neutral-300 bg-neutral-900/60 border border-neutral-700 rounded px-2 py-0.5"
                                                        >
                                                            {c}
                                                        </span>
                                                    )
                                                )}
                                            {title === "Roles & permissions" &&
                                                ["Sites", "Roles"].map((c) => (
                                                    <span
                                                        key={c}
                                                        className="text-xs text-neutral-300 bg-neutral-900/60 border border-neutral-700 rounded px-2 py-0.5"
                                                    >
                                                        {c}
                                                    </span>
                                                ))}
                                            {title === "Reporting" &&
                                                ["CSV/Export", "Trends"].map(
                                                    (c) => (
                                                        <span
                                                            key={c}
                                                            className="text-xs text-neutral-300 bg-neutral-900/60 border border-neutral-700 rounded px-2 py-0.5"
                                                        >
                                                            {c}
                                                        </span>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product preview */}
            <section
                id="preview"
                className="border-t border-neutral-800 bg-neutral-900"
            >
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-14">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold">
                        A clean workspace your team will actually enjoy
                    </h2>
                    <p className="text-neutral-400 mt-2 max-w-2xl">
                        Familiar navigation on the left, powerful search up top,
                        and focused content in the middle. Everything is a click
                        away.
                    </p>

                    <div className="mt-8 rounded-2xl border border-neutral-700 bg-neutral-800/60 p-4">
                        {/* Mocked app shell preview using public assets */}
                        <div className="flex h-[420px] overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900">
                            {/* Sidebar */}
                            <div className="w-[52px] shrink-0 bg-neutral-900 border-r border-neutral-800 p-2">
                                <div className="h-10 w-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                                    <img
                                        src="/guardianLogo.png"
                                        className="h-6 w-6"
                                        alt=""
                                    />
                                </div>
                                <div className="mt-2 space-y-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 w-10 rounded-lg bg-neutral-800/70 border border-neutral-700/70"
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Secondary sidebar */}
                            <div className="w-[240px] shrink-0 bg-neutral-900 border-r border-neutral-800 p-3">
                                <div className="h-10 rounded-lg bg-neutral-800/70 border border-neutral-700/70" />
                                <div className="mt-3 space-y-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 rounded-lg bg-neutral-800/70 border border-neutral-700/70"
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Content area */}
                            <div className="flex-1 bg-neutral-900">
                                <div className="h-12 border-b border-neutral-800" />
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-24 rounded-xl bg-neutral-800/70 border border-neutral-700/70"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            "Switch accounts instantly from the sidebar.",
                            "Search assets, tasks, and users from one box.",
                            "Focus mode keeps the page clean while you work.",
                        ].map((item) => (
                            <li
                                key={item}
                                className="text-neutral-400 text-sm flex items-start gap-2"
                            >
                                <Check className="h-4 w-4 text-orange-400 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Customer logos strip */}
            <section id="logos" className="border-t border-neutral-800">
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-10">
                    <div className="text-neutral-400 text-xs uppercase tracking-wider mb-1">
                        Trusted by teams
                    </div>
                    <div className="text-neutral-500 text-xs mb-4">
                        Manufacturing, distribution, facilities, field service
                    </div>
                    <div className="flex flex-wrap items-center gap-8 opacity-80">
                        <img
                            src="/weber_white.png"
                            alt="Partner 1"
                            className="h-8 object-contain"
                        />
                        <img
                            src="/vercel.svg"
                            alt="Partner 2"
                            className="h-6 object-contain"
                        />
                        <img
                            src="/next.svg"
                            alt="Partner 3"
                            className="h-6 object-contain"
                        />
                        <img
                            src="/globe.svg"
                            alt="Partner 4"
                            className="h-6 object-contain"
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="border-t border-neutral-800">
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-16">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold">
                        Trusted by operations teams
                    </h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                q: "We consolidated three spreadsheets and a whiteboard into Guardian.",
                                a: "Ops Manager",
                                r: "Single source of truth in 1 week",
                            },
                            {
                                q: "The inspection schedules saved us hours every week.",
                                a: "Field Lead",
                                r: "30% fewer missed inspections",
                            },
                            {
                                q: "Fast, simple, and our techs actually use it.",
                                a: "Maintenance Director",
                                r: "Team adoption in 2 days",
                            },
                        ].map((t) => (
                            <figure
                                key={t.q}
                                className="rounded-xl border border-neutral-700 bg-neutral-800/60 p-5"
                            >
                                <blockquote className="text-neutral-200">
                                    “{t.q}”
                                </blockquote>
                                <figcaption className="mt-3 text-sm text-neutral-400">
                                    — {t.a}
                                </figcaption>
                                <div className="mt-2 text-xs text-neutral-500">
                                    Result: {t.r}
                                </div>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* Image + text use-cases */}
            <section id="use-cases" className="border-t border-neutral-800">
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-16 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="rounded-xl border border-neutral-700 bg-neutral-800 overflow-hidden">
                            <div className="relative w-full pb-[62%]">
                                <img
                                    src="/window.svg"
                                    alt="Maintenance workflow"
                                    className="absolute inset-0 h-full w-full object-contain p-6"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-bold">
                                Maintenance workflow
                            </h3>
                            <p className="text-neutral-400 mt-2">
                                Show a primary workflow or dashboard screenshot.
                                Replace the image with your app view.
                            </p>
                            <ul className="mt-3 space-y-1">
                                {[
                                    "Assign and track work orders",
                                    "See parts availability",
                                    "Capture photos and notes",
                                ].map((i) => (
                                    <li
                                        key={i}
                                        className="text-neutral-400 text-sm flex items-start gap-2"
                                    >
                                        <Check className="h-4 w-4 text-orange-400 mt-0.5" />
                                        <span>{i}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center md:flex-row-reverse">
                        <div className="order-2 md:order-1">
                            <h3 className="text-white text-xl font-bold">
                                Inspections in the field
                            </h3>
                            <p className="text-neutral-400 mt-2">
                                Use a mobile or tablet screenshot with
                                checklists and scan actions.
                            </p>
                            <ul className="mt-3 space-y-1">
                                {[
                                    "Offline-friendly capture",
                                    "QR scan to open items",
                                    "Auto-reminders for due dates",
                                ].map((i) => (
                                    <li
                                        key={i}
                                        className="text-neutral-400 text-sm flex items-start gap-2"
                                    >
                                        <Check className="h-4 w-4 text-orange-400 mt-0.5" />
                                        <span>{i}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 rounded-xl border border-neutral-700 bg-neutral-800 overflow-hidden">
                            <div className="relative w-full pb-[62%]">
                                <img
                                    src="/file.svg"
                                    alt="Inspections mobile"
                                    className="absolute inset-0 h-full w-full object-contain p-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section
                id="how-it-works"
                className="border-t border-neutral-800 bg-neutral-900/60"
            >
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-16">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold">
                        How it works
                    </h2>
                    <p className="text-neutral-400 mt-1">
                        Fast setup, no heavy IT lift.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 max-w-md">
                        <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-3 text-sm text-neutral-300">
                            Avg setup time:{" "}
                            <span className="text-white font-semibold">
                                1 day
                            </span>
                        </div>
                        <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-3 text-sm text-neutral-300">
                            Import via CSV:{" "}
                            <span className="text-white font-semibold">
                                Yes
                            </span>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                step: "1",
                                title: "Import assets",
                                desc: "Start from CSV or add items on the fly. Generate QR labels automatically.",
                            },
                            {
                                step: "2",
                                title: "Set schedules",
                                desc: "Create recurring inspections and work orders with owners and due dates.",
                            },
                            {
                                step: "3",
                                title: "Track & report",
                                desc: "Scan, update, and complete tasks. See history and performance instantly.",
                            },
                        ].map(({ step, title, desc }) => (
                            <div
                                key={step}
                                className="rounded-xl border border-neutral-700 bg-neutral-800/70 p-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center text-sm font-bold">
                                        {step}
                                    </div>
                                    <div className="text-white font-semibold">
                                        {title}
                                    </div>
                                </div>
                                <p className="text-neutral-400 text-sm mt-2">
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="border-t border-neutral-800">
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-10">
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-800">
                        <div className="absolute inset-0 -z-10 opacity-20">
                            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-orange-500 blur-3xl" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-white text-xl font-bold">
                                    Get started in minutes
                                </h3>
                                <p className="text-neutral-400 mt-1">
                                    Import your data and see value on day one—no
                                    lengthy setup. No credit card required for
                                    trial.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <MainBtn
                                    label="Start free"
                                    href="/auth/login"
                                />
                                <Link
                                    href="#features"
                                    className="px-4 py-2 text-sm rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-900"
                                >
                                    Learn more
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section
                id="faq"
                className="border-t border-neutral-800 bg-neutral-900/60"
            >
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-16">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold">
                        Frequently asked
                    </h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                q: "Do you support barcode/QR scanning?",
                                a: "Yes—scan labels to open items, view history, or start tasks instantly.",
                            },
                            {
                                q: "Can I restrict access by role or site?",
                                a: "Granular roles and permissions help you segment teams and locations.",
                            },
                            {
                                q: "How hard is onboarding?",
                                a: "Import via CSV, or add items as you go. Most teams are live in a day.",
                            },
                            {
                                q: "Can I export data?",
                                a: "You can export reports and records anytime for sharing or audits.",
                            },
                            {
                                q: "Do you have support?",
                                a: "Email support during onboarding and business-hours help thereafter.",
                            },
                            {
                                q: "Where is my data stored?",
                                a: "Your data is stored securely in the cloud with regular backups.",
                            },
                        ].map(({ q, a }) => (
                            <div
                                key={q}
                                className="rounded-xl border border-neutral-700 bg-neutral-800/70 p-5"
                            >
                                <div className="text-white font-medium">
                                    {q}
                                </div>
                                <p className="text-neutral-400 text-sm mt-1">
                                    {a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-800">
                <div className="w-full px-8 md:px-12 xl:px-20 2xl:px-28 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                        <img
                            src="/guardianLogo.png"
                            className="h-6 w-6"
                            alt=""
                        />
                        <span>© {new Date().getFullYear()} Guardian</span>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/auth/login"
                            className="hover:text-neutral-200"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/app/dashboard"
                            className="hover:text-neutral-200"
                        >
                            Product
                        </Link>
                        <Link
                            href="#features"
                            className="hover:text-neutral-200"
                        >
                            Features
                        </Link>
                        <Link href="#faq" className="hover:text-neutral-200">
                            FAQ
                        </Link>
                        <Link href="#" className="hover:text-neutral-200">
                            Privacy
                        </Link>
                        <Link href="#" className="hover:text-neutral-200">
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
