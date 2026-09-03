import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          MCA Major Project - Day 1 Foundation
        </p>
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          AgriVerse AI
        </h1>
        <p className="mt-4 text-lg text-slate-700">
          Intelligent Agriculture Ecosystem for Farmers. Today we established a clean,
          secure project foundation for frontend, backend, and AI service expansion.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-md bg-leaf px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Login
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Foundation Completed</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>- Monorepo structure ready</li>
          <li>- React + Tailwind responsive UI base</li>
          <li>- Express + MongoDB configuration</li>
          <li>- Auth API with JWT and hashed passwords</li>
          <li>- Role-aware middleware for future modules</li>
        </ul>
      </div>
    </section>
  );
}

export default HomePage;
