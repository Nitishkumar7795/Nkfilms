import { useState, useEffect, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_KEY = "31e3ff33645f9f28130c8085304d8b9c"; // 🔑 Replace with your TMDB API key
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

const api = (path, params = {}) => {
  const q = new URLSearchParams({ api_key: API_KEY, ...params }).toString();
  return fetch(`${BASE_URL}${path}?${q}`).then((r) => r.json());
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red: #E50914;
    --dark: #0a0a0a;
    --card-bg: #141414;
    --text: #e5e5e5;
    --muted: #777;
    --gold: #f5c518;
  }

  body { background: var(--dark); color: var(--text); font-family: 'Inter', sans-serif; overflow-x: hidden; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 4%; height: 68px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
    transition: background 0.3s;
  }
  .nav.scrolled { background: rgba(10,10,10,0.98); }
  .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; color: var(--red); letter-spacing: 2px; cursor: pointer; }
  .nav-links { display: flex; gap: 24px; }
  .nav-link {
    background: none; border: none; color: var(--text); font-size: 0.85rem;
    cursor: pointer; opacity: 0.75; transition: opacity 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .nav-link:hover, .nav-link.active { opacity: 1; }
  .nav-right { display: flex; align-items: center; gap: 16px; }
  .search-box {
    display: flex; align-items: center; gap: 8px;
    background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.3);
    border-radius: 4px; padding: 6px 12px;
    transition: border-color 0.2s;
  }
  .search-box:focus-within { border-color: white; }
  .search-box input {
    background: none; border: none; outline: none; color: white;
    font-size: 0.85rem; width: 180px; font-family: 'Inter', sans-serif;
  }
  .search-icon { color: white; font-size: 0.9rem; }

  /* HERO */
  .hero {
    position: relative; height: 90vh; min-height: 500px;
    display: flex; align-items: flex-end; padding: 0 4% 8%;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background-size: cover; background-position: center top;
    transition: background-image 0.8s ease;
  }
  .hero-bg::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(
      to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.6) 40%, rgba(10,10,10,0.1) 80%
    ), linear-gradient(
      to right, rgba(10,10,10,0.9) 0%, transparent 60%
    );
  }
  .hero-content { position: relative; z-index: 2; max-width: 550px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
    color: var(--red); margin-bottom: 12px;
  }
  .hero-title {
    font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem, 6vw, 5rem);
    line-height: 1; letter-spacing: 1px; margin-bottom: 16px;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
  }
  .hero-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
  .hero-rating { color: var(--gold); font-weight: 600; font-size: 0.9rem; }
  .hero-year, .hero-runtime { color: var(--muted); font-size: 0.85rem; }
  .hero-overview {
    font-size: 0.9rem; line-height: 1.6; color: rgba(229,229,229,0.85);
    margin-bottom: 24px; max-width: 480px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .hero-genres { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .genre-tag {
    font-size: 0.72rem; padding: 4px 12px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7);
    font-weight: 500; letter-spacing: 0.5px;
  }
  .hero-buttons { display: flex; gap: 12px; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 4px; font-size: 0.9rem;
    font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
    font-family: 'Inter', sans-serif; letter-spacing: 0.5px;
  }
  .btn-primary { background: white; color: black; }
  .btn-primary:hover { background: rgba(255,255,255,0.85); }
  .btn-secondary { background: rgba(109,109,110,0.7); color: white; }
  .btn-secondary:hover { background: rgba(109,109,110,0.5); }

  /* ROWS */
  .rows { padding: 0 4% 60px; }
  .row { margin-bottom: 40px; }
  .row-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .row-title {
    font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 8px;
  }
  .row-title span { color: var(--red); font-size: 0.9rem; }
  .see-all { font-size: 0.78rem; color: var(--red); cursor: pointer; font-weight: 500; }

  .cards-track-wrapper { position: relative; }
  .cards-track {
    display: flex; gap: 8px; overflow-x: auto;
    scroll-behavior: smooth; padding-bottom: 8px;
    scrollbar-width: none;
  }
  .cards-track::-webkit-scrollbar { display: none; }
  .scroll-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(20,20,20,0.9); border: 1px solid rgba(255,255,255,0.15);
    color: white; font-size: 1.1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 10; transition: background 0.2s; opacity: 0;
    transition: opacity 0.2s;
  }
  .cards-track-wrapper:hover .scroll-btn { opacity: 1; }
  .scroll-btn:hover { background: rgba(50,50,50,0.95); }
  .scroll-btn.left { left: -16px; }
  .scroll-btn.right { right: -16px; }

  /* CARD */
  .card {
    flex: 0 0 180px; border-radius: 6px; overflow: hidden;
    cursor: pointer; transition: transform 0.25s, box-shadow 0.25s;
    position: relative; background: var(--card-bg);
  }
  .card:hover { transform: scale(1.08); z-index: 5; box-shadow: 0 12px 40px rgba(0,0,0,0.7); }
  .card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
  .card-info {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
    padding: 24px 10px 10px; opacity: 0; transition: opacity 0.25s;
  }
  .card:hover .card-info { opacity: 1; }
  .card-title { font-size: 0.78rem; font-weight: 600; line-height: 1.3; margin-bottom: 4px; }
  .card-rating { color: var(--gold); font-size: 0.72rem; font-weight: 600; }
  .card-placeholder { width: 100%; aspect-ratio: 2/3; background: #1a1a1a; display: flex; align-items: center; justify-content: center; color: #333; font-size: 2rem; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: #181818; border-radius: 12px; width: 100%; max-width: 860px;
    max-height: 90vh; overflow-y: auto; scrollbar-width: none;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal::-webkit-scrollbar { display: none; }
  .modal-hero {
    position: relative; height: 400px;
    background-size: cover; background-position: center;
    border-radius: 12px 12px 0 0;
  }
  .modal-hero::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to top, #181818 0%, rgba(24,24,24,0.3) 60%, transparent);
    border-radius: 12px 12px 0 0;
  }
  .modal-close {
    position: absolute; top: 16px; right: 16px; z-index: 10;
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(20,20,20,0.9); border: none; color: white;
    font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .modal-body { padding: 0 32px 32px; }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; letter-spacing: 1px; margin-bottom: 10px; }
  .modal-meta { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
  .modal-overview { font-size: 0.9rem; line-height: 1.7; color: rgba(229,229,229,0.85); margin-bottom: 20px; }
  .modal-section-title { font-size: 0.75rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .cast-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .cast-pill {
    font-size: 0.78rem; padding: 4px 12px; border-radius: 20px;
    background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75);
  }
  .match-badge {
    background: #46d369; color: #000; font-size: 0.72rem;
    font-weight: 700; padding: 3px 8px; border-radius: 3px; letter-spacing: 0.5px;
  }

  /* TABS */
  .tabs { display: flex; gap: 4px; margin-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .tab {
    padding: 10px 20px; background: none; border: none; color: var(--muted);
    font-size: 0.9rem; cursor: pointer; font-family: 'Inter', sans-serif;
    border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s;
  }
  .tab.active { color: white; border-bottom-color: var(--red); }

  /* LOADING */
  .spinner { display: flex; justify-content: center; padding: 40px; }
  .spinner div {
    width: 40px; height: 40px; border: 3px solid rgba(229,229,229,0.1);
    border-top-color: var(--red); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* SEARCH RESULTS */
  .search-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px; padding: 80px 4% 60px;
  }
  .search-title { padding: 80px 4% 0; font-size: 1.3rem; font-weight: 600; margin-bottom: 20px; }
  .search-title span { color: var(--muted); font-weight: 400; }

  /* FOOTER */
  .footer { padding: 40px 4%; border-top: 1px solid rgba(255,255,255,0.06); }
  .footer-text { color: var(--muted); font-size: 0.78rem; line-height: 1.8; }
  .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: var(--red); margin-bottom: 12px; }

  .no-results { text-align: center; padding: 80px 20px; color: var(--muted); }
  .no-results h2 { font-size: 1.5rem; margin-bottom: 8px; color: white; }

  @media (max-width: 600px) {
    .nav-links { display: none; }
    .hero { height: 75vh; padding-bottom: 10%; }
    .search-box input { width: 120px; }
    .card { flex: 0 0 130px; }
    .modal { border-radius: 8px; }
    .modal-hero { height: 260px; }
    .modal-body { padding: 0 20px 24px; }
  }
`;

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return scrolled;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Spinner() {
  return <div className="spinner"><div /></div>;
}

function MovieCard({ movie, onClick }) {
  const poster = movie.poster_path
    ? `${IMG_BASE}/w342${movie.poster_path}`
    : null;
  return (
    <div className="card" onClick={() => onClick(movie)}>
      {poster
        ? <img src={poster} alt={movie.title || movie.name} loading="lazy" />
        : <div className="card-placeholder">🎬</div>}
      <div className="card-info">
        <div className="card-title">{movie.title || movie.name}</div>
        <div className="card-rating">★ {movie.vote_average?.toFixed(1)}</div>
      </div>
    </div>
  );
}

function Row({ title, movies, onCardClick, emoji }) {
  const trackRef = useRef(null);
  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };
  if (!movies?.length) return null;
  return (
    <div className="row">
      <div className="row-header">
        <div className="row-title">{emoji} {title}</div>
      </div>
      <div className="cards-track-wrapper">
        <button className="scroll-btn left" onClick={() => scroll(-1)}>‹</button>
        <div className="cards-track" ref={trackRef}>
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} onClick={onCardClick} />
          ))}
        </div>
        <button className="scroll-btn right" onClick={() => scroll(1)}>›</button>
      </div>
    </div>
  );
}

function Modal({ movie, onClose }) {
  const [details, setDetails] = useState(null);
  useEffect(() => {
    if (!movie) return;
    const type = movie.media_type === "tv" || movie.name ? "tv" : "movie";
    api(`/${type}/${movie.id}`, { append_to_response: "credits" }).then(setDetails);
  }, [movie]);

  if (!movie) return null;
  const backdrop = details?.backdrop_path
    ? `${IMG_BASE}/w1280${details.backdrop_path}`
    : null;
  const cast = details?.credits?.cast?.slice(0, 10) || [];
  const match = Math.floor(60 + Math.random() * 35);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div
          className="modal-hero"
          style={{ backgroundImage: backdrop ? `url(${backdrop})` : "none", background: backdrop ? undefined : "#1a1a1a" }}
        >
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-title">{details?.title || details?.name || movie.title || movie.name}</div>
          <div className="modal-meta">
            <span className="match-badge">{match}% Match</span>
            <span className="hero-year">{(details?.release_date || details?.first_air_date || "").slice(0, 4)}</span>
            {details?.runtime && <span className="hero-year">{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>}
            <span className="hero-rating">★ {details?.vote_average?.toFixed(1)}</span>
            {details?.genres?.map((g) => (
              <span key={g.id} className="genre-tag">{g.name}</span>
            ))}
          </div>
          {details?.overview && <p className="modal-overview">{details.overview}</p>}
          {cast.length > 0 && (
            <>
              <div className="modal-section-title">Cast</div>
              <div className="cast-list">
                {cast.map((c) => <span key={c.id} className="cast-pill">{c.name}</span>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Hero({ movie, onInfoClick }) {
  if (!movie) return <div style={{ height: "90vh" }} />;
  const backdrop = movie.backdrop_path
    ? `${IMG_BASE}/original${movie.backdrop_path}`
    : null;
  return (
    <div className="hero">
      <div className="hero-bg" style={{ backgroundImage: backdrop ? `url(${backdrop})` : "none" }} />
      <div className="hero-content">
        <div className="hero-badge">🔥 Trending Now</div>
        <div className="hero-title">{movie.title || movie.name}</div>
        <div className="hero-meta">
          <span className="hero-rating">★ {movie.vote_average?.toFixed(1)}</span>
          <span className="hero-year">{(movie.release_date || movie.first_air_date || "").slice(0, 4)}</span>
        </div>
        <p className="hero-overview">{movie.overview}</p>
        <div className="hero-buttons">
          <button className="btn btn-primary">▶ Play</button>
          <button className="btn btn-secondary" onClick={() => onInfoClick(movie)}>ℹ More Info</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NkfilmsApp() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const scrolled = useScroll();

  // Fetch all home data
  useEffect(() => {
    if (tab !== "home" && tab !== "movies" && tab !== "series") return;
    setLoading(true);
    const endpoints =
      tab === "movies"
        ? [
            api("/movie/popular"),
            api("/movie/top_rated"),
            api("/movie/upcoming"),
            api("/movie/now_playing"),
          ]
        : tab === "series"
        ? [
            api("/tv/popular"),
            api("/tv/top_rated"),
            api("/tv/on_the_air"),
            api("/tv/airing_today"),
          ]
        : [
            api("/trending/all/day"),
            api("/movie/popular"),
            api("/tv/popular"),
            api("/movie/top_rated"),
            api("/tv/top_rated"),
          ];
    Promise.all(endpoints)
      .then((results) => {
        setData({ tab, results: results.map((r) => r.results || []) });
      })
      .finally(() => setLoading(false));
  }, [tab]);

  // Search
  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      setSearching(true);
      api("/search/multi", { query }).then((r) => {
        setSearchResults(r.results?.filter((m) => m.media_type !== "person") || []);
      }).finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const rows = {
    home: [
      { title: "Trending Today", emoji: "🔥" },
      { title: "Popular Movies", emoji: "🎬" },
      { title: "Popular Series", emoji: "📺" },
      { title: "Top Rated Movies", emoji: "🏆" },
      { title: "Top Rated Series", emoji: "⭐" },
    ],
    movies: [
      { title: "Popular Movies", emoji: "🎬" },
      { title: "Top Rated", emoji: "🏆" },
      { title: "Upcoming", emoji: "🗓" },
      { title: "Now Playing", emoji: "▶" },
    ],
    series: [
      { title: "Popular Series", emoji: "📺" },
      { title: "Top Rated Series", emoji: "⭐" },
      { title: "On The Air", emoji: "📡" },
      { title: "Airing Today", emoji: "🔴" },
    ],
  };

  const heroMovie = data.results?.[0]?.[Math.floor(Math.random() * 5)] || null;

  const showSearch = query.trim().length > 0;

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div className="nav-logo" onClick={() => setTab("home")}>NKFILMS</div>
          <div className="nav-links">
            {["home", "movies", "series"].map((t) => (
              <button
                key={t}
                className={`nav-link ${tab === t ? "active" : ""}`}
                onClick={() => { setTab(t); setQuery(""); }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search movies, shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </nav>

      {/* SEARCH */}
      {showSearch ? (
        <>
          <div className="search-title">
            Results for <span>"{query}"</span>
          </div>
          {searching ? <Spinner /> : (
            searchResults.length > 0 ? (
              <div className="search-grid">
                {searchResults.map((m) => (
                  <MovieCard key={m.id} movie={m} onClick={setSelected} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h2>No results found</h2>
                <p>Try a different search term.</p>
              </div>
            )
          )}
        </>
      ) : (
        <>
          {/* HERO */}
          {(tab === "home" || tab === "movies" || tab === "series") && (
            <Hero movie={heroMovie} onInfoClick={setSelected} />
          )}

          {/* ROWS */}
          {loading ? <Spinner /> : (
            <div className="rows">
              {(rows[tab] || []).map((row, i) => (
                <Row
                  key={row.title}
                  title={row.title}
                  emoji={row.emoji}
                  movies={data.results?.[i] || []}
                  onCardClick={setSelected}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-logo">NKFILMS</div>
        <div className="footer-text">
          Powered by TMDB API · Built by Nitish Kumar<br />
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </div>

      {/* MODAL */}
      {selected && <Modal movie={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
