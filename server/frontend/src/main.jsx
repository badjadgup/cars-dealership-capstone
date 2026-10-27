import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useSearchParams,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Register from "./components/Register/Register";
import { api } from "./api";
const states = [
  "Alabama",
  "Arizona",
  "California",
  "Colorado",
  "Connecticut",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Illinois",
  "Iowa",
  "Kansas",
  "Louisiana",
  "Maryland",
  "Michigan",
  "Minnesota",
  "New Jersey",
  "New York",
  "Pennsylvania",
  "Texas",
  "Virginia",
  "Washington",
];
const photos = [
  "photo-1492144534655-ae79c964c9d7",
  "photo-1503376780353-7e6692767b70",
  "photo-1494976388531-d1058494cdd8",
  "photo-1502877338535-766e1452684a",
];
const photo = (id) =>
  `https://images.unsplash.com/${photos[(id - 1) % photos.length]}?auto=format&fit=crop&w=1000&q=80`;
function Feedback({ error, loading }) {
  return error ? (
    <p className="notice error" role="alert">
      {error}
    </p>
  ) : loading ? (
    <p className="loading" role="status">
      Finding your next great drive…
    </p>
  ) : null;
}
function App() {
  const [user, setUser] = useState(null),
    [authLoading, setAuthLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    api("/me/")
      .then((d) => setUser(d.user))
      .catch((e) => setError(e.message))
      .finally(() => setAuthLoading(false));
  }, []);
  async function signOut() {
    try {
      await api("/logout/", { method: "POST" });
      setUser(null);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <header className="site-header">
        <div className="nav-inner">
          <Link className="brand" to="/">
            <span className="brand-mark">
              C<span>↗</span>
            </span>
            cars<span className="brand-light">dealership</span>
          </Link>
          <nav aria-label="Main navigation">
            <NavLink to="/dealers">Dealerships</NavLink>
            <a href="/static/About.html">About us</a>
            <a href="/static/Contact.html">Contact us</a>
          </nav>
          <div className="account">
            {authLoading ? (
              <span className="muted">Loading…</span>
            ) : user ? (
              <>
                <span className="user-name">● {user.username}</span>
                <button className="text-button" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Sign in</Link>
                <Link className="button small" to="/register">
                  Create account ↗
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {error && (
        <div className="container">
          <p className="notice error" role="alert">
            {error}
          </p>
        </div>
      )}
      <main id="main">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/dealers" element={<Home user={user} />} />
          <Route path="/dealers/:id" element={<Dealer user={user} />} />
          <Route
            path="/dealers/:id/review"
            element={<Review user={user} authLoading={authLoading} />}
          />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onLogin={setUser} />} />
          <Route
            path="*"
            element={
              <div className="container empty">
                <h1>That road ends here.</h1>
                <Link className="button" to="/dealers">
                  Explore dealerships
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <div>
          <strong>cars dealership</strong>
          <p>A better drive starts with a better experience.</p>
        </div>
        <span>
          Full Stack Capstone · Demonstration application
          <br />
          Fictional branches and sample reviews.
        </span>
      </footer>
    </>
  );
}
function Home({ user }) {
  const [params, setParams] = useSearchParams(),
    state = params.get("state") || "";
  const [dealers, setDealers] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api("/dealers/?state=" + encodeURIComponent(state))
      .then((d) => {
        if (active) setDealers(d.dealers);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [state]);
  const filtered = dealers.filter((d) =>
    (d.full_name + " " + d.city).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <i /> GOOD PEOPLE. GREAT DRIVES.
          </span>
          <h1>
            Find a dealership.
            <br />
            Feel <em>right at home.</em>
          </h1>
          <p>
            Explore local branches, hear from fellow drivers, and take the next
            step with confidence.
          </p>
          <a className="button" href="#locations">
            Explore dealerships <span>↗</span>
          </a>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span>JM</span>
              <span>TR</span>
              <span>SP</span>
            </div>
            <div>
              <strong>Built around your experience</strong>
              <small>Read reviews. Share your story.</small>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img src={photo(2)} alt="Car parked on a scenic open road" />
          <div className="image-shade" />
          <span className="photo-label">
            YOUR NEXT CHAPTER, ON FOUR WHEELS.
          </span>
          <div className="floating-card">
            <span className="round-icon">↗</span>
            <div>
              <strong>The journey starts here</strong>
              <small>A local team. A personal touch.</small>
            </div>
          </div>
        </div>
      </section>
      <div className="benefits container">
        <span>
          ◎ <strong>Local expertise</strong> in every branch
        </span>
        <span>
          ☆ <strong>Honest reviews</strong> from fellow drivers
        </span>
        <span>
          ↗ <strong>Your next drive</strong> made simpler
        </span>
      </div>
      <section className="container locations" id="locations">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR NETWORK</span>
            <h2>Good experiences start nearby.</h2>
            <p className="muted">
              Find your local team and see what drivers are saying.
            </p>
          </div>
          <span className="count-pill">
            {loading ? "…" : dealers.length} locations
            {state ? " in " + state : ""}
          </span>
        </div>
        <div className="filter-bar">
          <label className="search-label">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by dealership or city"
              aria-label="Search dealerships"
            />
          </label>
          <label className="state-filter">
            State
            <select
              aria-label="Filter by state"
              value={state}
              onChange={(e) =>
                setParams(e.target.value ? { state: e.target.value } : {})
              }
            >
              <option value="">All states</option>
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <Feedback error={error} loading={loading} />
        {!loading && !error && (
          <>
            <div className="result-label">
              {filtered.length}{" "}
              {filtered.length === 1 ? "dealership" : "dealerships"} to explore{" "}
              <span>Find your kind of car people.</span>
            </div>
            <div className="dealer-table-wrap">
              <table className="dealer-table" aria-label="Dealership directory">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dealer Name</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>ZIP</th>
                    <th>State</th>
                    {user && <th>Review Dealer</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>
                        <Link to={"/dealers/" + d.id}>{d.full_name}</Link>
                      </td>
                      <td>{d.city}</td>
                      <td>{d.address}</td>
                      <td>{d.zip}</td>
                      <td>{d.state}</td>
                      {user && (
                        <td>
                          <Link
                            className="review-link"
                            to={"/dealers/" + d.id + "/review"}
                          >
                            Review Dealer
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <div className="empty">
                <h3>No dealerships found.</h3>
                <p>Try another city or state.</p>
                <button
                  className="button"
                  onClick={() => {
                    setQuery("");
                    setParams({});
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <section className="community container">
        <div>
          <span className="eyebrow">YOUR EXPERIENCE MATTERS</span>
          <h2>A few words can go a long way.</h2>
          <p>Help the next driver make a confident choice.</p>
        </div>
        <Link className="button light" to={user ? "/dealers" : "/register"}>
          {user ? "Choose a dealership" : "Join the community"} ↗
        </Link>
      </section>
    </>
  );
}
function Login({ onLogin }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await api("/login/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onLogin(result.user);
      navigate("/dealers");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-layout">
      <div className="auth-story">
        <span className="eyebrow">WELCOME BACK</span>
        <h1>
          Good to see
          <br />
          you again.
        </h1>
        <p>
          Your next great drive is waiting. Sign in to share a review and help
          your community.
        </p>
        <div className="story-line">Real experiences. Better decisions.</div>
      </div>
      <div className="form-card">
        <span className="eyebrow">YOUR COMMUNITY</span>
        <h2>Sign in</h2>
        <p className="muted">Pick up where you left off.</p>
        <form onSubmit={submit}>
          <label>
            Username
            <input required name="username" autoComplete="username" />
          </label>
          <label>
            Password
            <input
              required
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in ↗"}
          </button>
        </form>
        <p className="form-foot">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
function Dealer({ user }) {
  const { id } = useParams(),
    location = useLocation();
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    Promise.all([
      api("/dealers/" + id + "/"),
      api("/dealers/" + id + "/reviews/"),
    ])
      .then(([d, r]) => {
        if (active) setData({ ...d, reviews: r.reviews });
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id, location.key]);
  if (!data)
    return (
      <div className="container">
        <Feedback error={error} loading={!error} />
      </div>
    );
  const { dealer: d, reviews } = data,
    ratedReviews = reviews.filter((r) => Number.isInteger(r.rating)),
    average = ratedReviews.length
      ? (
          ratedReviews.reduce((s, r) => s + r.rating, 0) / ratedReviews.length
        ).toFixed(1)
      : "—";
  return (
    <div className="container detail">
      <Link className="back-link" to="/dealers">
        ← All dealerships
      </Link>
      {location.state?.posted && (
        <p className="notice success" role="status">
          Your review is published. Thanks for sharing your experience!
        </p>
      )}
      <section className="detail-hero">
        <div>
          <span className="eyebrow">
            {d.city.toUpperCase()}, {d.state.toUpperCase()}
          </span>
          <h1>{d.full_name}</h1>
          <p>
            Local expertise. A warm welcome. A team that knows the road ahead.
          </p>
          <div className="dealer-facts">
            <span>
              ⌖ {d.address}
              <br />
              {d.city}, {d.st} {d.zip}
            </span>
            <span>
              ☎ {d.phone}
              <br />
              Mon–Sat · 9 am–6 pm
            </span>
          </div>
          <p className="brands">{d.brands}</p>
          <Link
            className="button"
            to={user ? "/dealers/" + id + "/review" : "/login"}
          >
            {user ? "Review Dealer" : "Sign in to write a review"} ↗
          </Link>
        </div>
        <img src={photo(d.id)} alt={"Vehicle representing " + d.full_name} />
      </section>
      <section className="reviews-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FROM THE DRIVER’S SEAT</span>
            <h2>Every experience tells a story.</h2>
          </div>
          <div className="rating-summary">
            <strong>{average}</strong>
            <div>
              <span className="stars">★★★★★</span>
              <small>
                {reviews.length} customer{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </small>
            </div>
          </div>
        </div>
        <div className="reviews-grid">
          {reviews.map((r) => (
            <article className="review-card" key={r.id}>
              <div className="review-top">
                <div className="review-avatar">
                  {r.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <strong>{r.name}</strong>
                  <small>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Course sample review"}
                  </small>
                </div>
                <span className={"sentiment " + r.sentiment}>
                  {r.sentiment}
                </span>
              </div>
              <div
                className="stars"
                aria-label={
                  Number.isInteger(r.rating)
                    ? r.rating + " out of 5 stars"
                    : "Not rated"
                }
              >
                {Number.isInteger(r.rating)
                  ? "★".repeat(r.rating) + "☆".repeat(5 - r.rating)
                  : "Not rated"}
              </div>
              <p className="review-text">{r.review}</p>
              <div className="review-car">
                {r.car_year} {r.car_make} {r.car_model}
                <span>Purchased {r.purchase_date}</span>
              </div>
            </article>
          ))}
        </div>
        {!reviews.length && (
          <div className="empty">
            <h3>Be the first to share your experience.</h3>
            <p>Your story could help the next driver.</p>
          </div>
        )}
      </section>
    </div>
  );
}
function Review({ user, authLoading }) {
  const { id } = useParams(),
    navigate = useNavigate();
  const [dealer, setDealer] = useState(null),
    [makes, setMakes] = useState([]),
    [make, setMake] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([api("/dealers/" + id + "/"), api("/cars/")])
      .then(([d, c]) => {
        if (active) {
          setDealer(d.dealer);
          setMakes(c.car_makes);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (authLoading)
    return <div className="container loading">Loading your account…</div>;
  if (!user)
    return (
      <div className="container empty">
        <h1>Your story starts with a sign in.</h1>
        <p>Please sign in before writing a review.</p>
        <Link className="button" to="/login">
          Sign in
        </Link>
      </div>
    );
  const models = makes.find((m) => String(m.id) === make)?.models || [];
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    for (const k of ["rating", "car_model_id", "car_year"])
      data[k] = Number(data[k]);
    delete data.make;
    try {
      await api("/dealers/" + id + "/reviews/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      navigate("/dealers/" + id, { state: { posted: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container review-page">
      <Link className="back-link" to={"/dealers/" + id}>
        ← Back to dealership
      </Link>
      <div className="review-layout">
        <aside>
          <span className="eyebrow">SHARE YOUR EXPERIENCE</span>
          <h1>
            Your story.
            <br />
            Their next step.
          </h1>
          <p>
            Tell us about your visit to{" "}
            <strong>{dealer?.full_name || "this dealership"}</strong>. Your
            honest review helps other drivers find the right fit.
          </p>
          <div className="review-tip">
            <strong>A helpful review goes a long way.</strong>
            <p>What stood out? How was the service? Would you visit again?</p>
          </div>
        </aside>
        <div className="form-card">
          <h2>Post a review</h2>
          <p className="muted">
            Posting as <strong>{user.username}</strong>
          </p>
          <form onSubmit={submit}>
            <label>
              Your rating
              <select required name="rating" defaultValue="5">
                <option value="5">★★★★★ · Excellent</option>
                <option value="4">★★★★☆ · Good</option>
                <option value="3">★★★☆☆ · Average</option>
                <option value="2">★★☆☆☆ · Below expectations</option>
                <option value="1">★☆☆☆☆ · Poor</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                Car make
                <select
                  required
                  name="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                >
                  <option value="">Select make</option>
                  {makes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Car model
                <select
                  key={make}
                  required
                  name="car_model_id"
                  defaultValue=""
                  disabled={!make}
                >
                  <option value="">Select model</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Model year
                <input
                  required
                  name="car_year"
                  type="number"
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  defaultValue={new Date().getFullYear() - 1}
                />
              </label>
              <label>
                Purchase date
                <input
                  required
                  name="purchase_date"
                  type="date"
                  max={new Date(
                    Date.now() - new Date().getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 10)}
                />
              </label>
            </div>
            <label>
              Your review
              <textarea
                required
                name="review"
                rows="6"
                minLength={10}
                maxLength={5000}
                placeholder="What was your experience like?"
              />
            </label>
            <small className="muted">
              10–5,000 characters. Your review will be public.
            </small>
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            <button
              className="button full"
              disabled={busy || !dealer || !makes.length}
            >
              {busy ? "Publishing…" : "Publish review ↗"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
