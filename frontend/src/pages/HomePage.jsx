import { Link } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../utils/auth';

const features = [
  {
    number: '01',
    title: 'Farm Record Management',
    description: 'Keep crop, field, irrigation and activity records organized in one structured workspace.',
  },
  {
    number: '02',
    title: 'AI Disease Detection',
    description: 'Upload a crop image and review AI-supported signals before consulting an agricultural expert.',
  },
  {
    number: '03',
    title: 'Weather-aware Planning',
    description: 'Make informed seasonal decisions with weather and farm intelligence built into your workflow.',
  },
  {
    number: '04',
    title: 'Verified Expert Access',
    description: 'Find and contact agricultural experts by specialization, state and district.',
  },
  {
    number: '05',
    title: 'Consultation & Chat',
    description: 'Send crop problems, receive recommendations and continue the conversation securely.',
  },
  {
    number: '06',
    title: 'Agriculture Marketplace',
    description: 'Discover farm products and connect buyers with sellers through a trusted local marketplace.',
  },
];

const workflow = [
  ['01', 'Create your farm profile', 'Add crop, location and farm details.'],
  ['02', 'Record field observations', 'Upload records, photos and current symptoms.'],
  ['03', 'Get AI-supported insights', 'Review crop health signals and suggested next steps.'],
  ['04', 'Connect with an expert', 'Choose a verified specialist near your farm.'],
  ['05', 'Send a consultation', 'Share the problem, crop stage and supporting images.'],
  ['06', 'Act and follow up', 'Receive expert guidance and continue in chat.'],
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomePage() {
  const authenticated = isAuthenticated();
  const role = getUserRole();
  const dashboardPath = role ? `/${role}/dashboard` : '/login';

  return (
    <div className="overflow-hidden pb-16">
      <section className="relative isolate min-h-[620px] overflow-hidden rounded-[2rem] border border-emerald-100 bg-[#f7faf4] px-5 py-12 shadow-[0_24px_70px_rgba(16,185,129,0.08)] sm:px-8 lg:px-12 lg:py-14">
        <div className="absolute inset-0 -z-10 opacity-70" aria-hidden="true">
          <div className="absolute right-[-170px] top-[-220px] h-[520px] w-[520px] rounded-full border-[90px] border-emerald-100/70" />
          <div className="absolute bottom-[-220px] left-[-130px] h-[420px] w-[420px] rounded-full border-[70px] border-amber-100/60" />
          <div className="absolute right-[18%] top-[18%] h-32 w-32 rounded-full bg-emerald-200/25 blur-3xl" />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Smart agriculture platform
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-[4.8rem]">
              Grow smarter.<br />
              <span className="text-emerald-700">Farm with confidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              AgriVerse AI brings crop intelligence, verified expert guidance and digital farm management into one clear workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {authenticated ? (
                <Link to={dashboardPath} className="group inline-flex items-center gap-3 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(4,120,87,0.20)] transition hover:-translate-y-0.5 hover:bg-emerald-800">
                  Go to Dashboard
                  <ArrowIcon />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="group inline-flex items-center gap-3 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(4,120,87,0.20)] transition hover:-translate-y-0.5 hover:bg-emerald-800">
                    Get Started
                    <ArrowIcon />
                  </Link>
                  <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
                    Login
                  </Link>
                </>
              )}
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['AI', 'Crop insight'],
                ['Expert', 'Verified support'],
                ['1 View', 'Farm operations'],
              ].map(([value, label]) => (
                <div key={label} className="border-l border-slate-200 pl-3">
                  <p className="text-lg font-black text-slate-900">{value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-amber-200/50 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-[0_30px_90px_rgba(15,118,110,0.16)] backdrop-blur">
              <div className="overflow-hidden rounded-[1.55rem] border border-emerald-100 bg-[#eff8ed]">
                <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Field overview</p>
                    <p className="mt-1 text-lg font-black text-slate-900">North Farm</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-[1fr_132px] gap-3">
                    <div className="rounded-2xl bg-slate-900 p-5 text-white">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-slate-300">Crop health</p>
                        <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300">Healthy</span>
                      </div>
                      <p className="mt-5 text-4xl font-black">92%</p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[92%] rounded-full bg-emerald-400" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500">AI risk</p>
                      <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-full border-[7px] border-amber-300 border-r-slate-100">
                        <span className="text-xs font-black text-slate-800">24</span>
                      </div>
                      <p className="mt-3 text-xs font-bold text-amber-700">Low risk</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500">Active crop</p>
                      <p className="mt-2 text-base font-black text-slate-900">Tomato</p>
                      <p className="mt-1 text-xs text-slate-500">Flowering stage</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500">Experts nearby</p>
                      <p className="mt-2 text-base font-black text-slate-900">3 verified</p>
                      <p className="mt-1 text-xs text-slate-500">Within 25 km</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500">Next action</p>
                      <p className="mt-1 text-sm font-black text-slate-900">Review weekly field activity</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-24">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Platform capabilities</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Everything your farm needs.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-600">
            One connected workspace for crop monitoring, expert guidance and practical farm operations.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.035)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_50px_rgba(16,185,129,0.10)]">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">
                  {feature.number}
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                  <ArrowIcon />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-black text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="mt-24 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">How it works</p>
          <h2 className="mt-3 max-w-md text-4xl font-black leading-tight">
            From field observation to expert guidance.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
            Follow a clear, practical workflow from the first crop signal to a verified expert response.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex flex-wrap gap-2">
              {['State', 'District', 'Specialization'].map((filter) => (
                <span key={filter} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200">{filter}</span>
              ))}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">Example workflow</p>
            <p className="mt-2 text-sm font-bold leading-6 text-white">Find expert → Send consultation → Receive response → Continue chat</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-7">
          <div className="grid gap-2">
            {workflow.map(([number, title, description], index) => (
              <div key={title} className="group grid grid-cols-[44px_1fr] gap-3 rounded-2xl px-3 py-3 transition hover:bg-emerald-50/70">
                <div className="relative">
                  {index < workflow.length - 1 ? <div className="absolute bottom-[-18px] left-[21px] top-10 w-px bg-slate-200 group-hover:bg-emerald-200" /> : null}
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-black text-slate-600 group-hover:border-emerald-200 group-hover:text-emerald-700">
                    {number}
                  </span>
                </div>
                <div className="py-1">
                  <h3 className="font-black text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-24">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Field intelligence</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Make informed decisions before action.</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8">
            <span className="inline-flex rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">AI Crop Support</span>
            <h3 className="mt-5 text-3xl font-black text-slate-900">Crop disease detection</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Capture and review affected leaves to support faster problem identification before you consult an expert.
            </p>
            <div className="mt-7 rounded-2xl border border-emerald-100 bg-white p-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Image analysis workflow</span>
                <span className="text-emerald-700">3 steps</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['Upload', 'Analyze', 'Consult'].map((step, index) => (
                  <div key={step} className="rounded-xl bg-slate-50 px-2 py-3 text-center">
                    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">{index + 1}</span>
                    <p className="mt-2 text-xs font-bold text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8">
            <span className="inline-flex rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">Planning Support</span>
            <h3 className="mt-5 text-3xl font-black text-slate-900">Weather-aware agronomy</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Combine farm records and field conditions to plan irrigation, activities and seasonal responses more effectively.
            </p>
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                ['Today', 'Planning', 'AMBER'],
                ['Field', 'Records', 'GREEN'],
                ['Expert', 'Advice', 'BLUE'],
              ].map(([label, value, tint]) => (
                <div key={label} className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                  <p className="mt-3 text-sm font-black text-slate-900">{value}</p>
                  <p className="mt-2 text-[10px] font-bold text-slate-400">{tint}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-24 overflow-hidden rounded-[2rem] bg-emerald-800 px-6 py-10 text-white sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Start with your field</p>
            <h2 className="mt-2 max-w-xl text-3xl font-black">Build a smarter farm workflow today.</h2>
          </div>
          <Link to={authenticated ? dashboardPath : '/register'} className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-emerald-800 shadow-lg transition hover:-translate-y-0.5">
            {authenticated ? 'Open Dashboard' : 'Create Account'}
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
