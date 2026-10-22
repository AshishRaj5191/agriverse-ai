import { Link } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../utils/auth';

const features = [
  {
    title: 'Farm & Crop Record Management',
    description:
      'Keep detailed field records, crop activities, disease history, and seasonal updates in one structured workspace.',
  },
  {
    title: 'AI Crop Disease Detection',
    description:
      'Upload crop images and use the integrated disease prediction flow to support faster diagnosis and action.',
  },
  {
    title: 'Weather-Informed Planning',
    description:
      'Support farm planning with field-level insights and weather-aware crop decision making for smarter cultivation.',
  },
  {
    title: 'Verified Expert Consultation',
    description:
      'Connect with agricultural experts filtered by state, district, and specialization for timely guidance.',
  },
  {
    title: 'Farmer & Expert Communication',
    description:
      'Send consultations, receive expert responses, and continue conversation threads for better advisory support.',
  },
  {
    title: 'Buyer & Marketplace Access',
    description:
      'Provide a connected agricultural ecosystem where buyers and farmers can operate within the same platform.',
  },
];

const workflow = [
  'Farmer enters crop and farm information',
  'Upload crop or problem image for review',
  'Receive AI and field insights',
  'Find a verified agricultural expert',
  'Send consultation request',
  'Expert responds and continues the conversation',
];

function HomePage() {
  const authenticated = isAuthenticated();
  const role = getUserRole();

  const dashboardPath = role ? `/${role}/dashboard` : '/login';
  const profilePath = role ? `/${role}/profile` : '/login';

  return (
    <div className="space-y-16 pb-16">
      <section className="rounded-[2rem] border border-green-100 bg-gradient-to-br from-white via-green-50 to-emerald-50 px-5 py-8 shadow-[0_25px_80px_rgba(21,128,61,0.08)] sm:px-8 lg:px-10 lg:py-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-green-800">
              AgriVerse AI MCA Project
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Smart agriculture for every field.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              AgriVerse AI connects farmers with crop intelligence, expert guidance, and digital farm management tools designed to improve productivity and decision-making.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {authenticated ? (
                <>
                  <Link to={dashboardPath} className="rounded-xl bg-leaf px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-700">
                    Go to Dashboard
                  </Link>
                  <Link to={profilePath} className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="rounded-xl bg-leaf px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-700">
                    Get Started
                  </Link>
                  <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                    Login
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <div>
                <span className="block text-2xl font-bold text-slate-900">AI</span>
                <span>Crop insight</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">Expert</span>
                <span>Consultation</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">Farm</span>
                <span>Records</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-10 h-28 w-28 rounded-full bg-green-200/70 blur-3xl" />
            <div className="absolute -right-6 bottom-10 h-24 w-24 rounded-full bg-amber-200/80 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-green-100 bg-white p-5 shadow-xl shadow-green-100">
              <div className="rounded-2xl bg-gradient-to-br from-green-700 to-emerald-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-green-100">Field overview</p>
                    <h2 className="mt-2 text-2xl font-bold">Healthy harvest tracking</h2>
                  </div>
                  <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">Live</div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-sm text-green-50">
                      <span>Crop health score</span>
                      <span className="font-semibold text-white">92%</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-[92%] rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-green-100">AI check</p>
                      <p className="mt-2 text-lg font-semibold">Leaf blight risk</p>
                      <p className="mt-1 text-xs text-green-100">Low to medium</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-green-100">Expert</p>
                      <p className="mt-2 text-lg font-semibold">3 verified</p>
                      <p className="mt-1 text-xs text-green-100">Near your district</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Records</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">120+</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Sessions</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">48</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Alerts</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Features</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Everything the modern agri ecosystem needs</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-sm font-bold text-leaf">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_1fr] lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">From field observation to expert guidance</h2>

          <div className="mt-6 space-y-4">
            {workflow.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                  {index + 1}
                </div>
                <p className="text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-300">Expert discovery</p>
          <h3 className="mt-3 text-2xl font-bold">Find the right specialist by location and expertise</h3>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Farmers can search verified agricultural experts using targeted filters for state, district, and specialization. This makes the consultation process more relevant, faster, and grounded in local context.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {['State', 'District', 'Specialization'].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">
                  {item}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-200">Example workflow</p>
              <p className="mt-2 text-lg font-semibold text-white">Farmer → Search expert → Send consultation request → Get response</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">AI section</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Crop disease detection support</h3>
          <p className="mt-3 text-slate-600">
            The platform includes an AI-powered crop disease prediction workflow that allows farmers to upload crop images for analysis and support faster problem identification.
          </p>
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">Prediction workflow</p>
            <p className="mt-2 text-sm text-slate-700">Upload image → analyze crop condition → review AI result → consult expert when needed</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Field intelligence</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Weather-aware agronomy planning</h3>
          <p className="mt-3 text-slate-600">
            The project supports crop planning and monitoring decisions through agricultural intelligence, helping farmers evaluate field conditions and align management actions with agricultural needs.
          </p>
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Planning support</p>
            <p className="mt-2 text-sm text-slate-700">Use farm records, crop activity tracking, and advisory patterns to improve seasonal planning and response timing.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;