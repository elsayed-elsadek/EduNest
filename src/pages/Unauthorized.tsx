import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <section className="max-w-lg text-center" aria-labelledby="unauthorized-title">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">403</p>
      <h1 id="unauthorized-title" className="mt-2 text-3xl font-bold text-gray-900">
        Access unavailable
      </h1>
      <p className="mt-3 text-gray-600">
        Your account does not have a matching dashboard or permission to view this page.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl px-5 py-3 font-medium text-white transition hover:opacity-90"
        style={{ backgroundColor: 'var(--primary-500)' }}
      >
        Go home
      </Link>
    </section>
  </main>
);

export default Unauthorized;
