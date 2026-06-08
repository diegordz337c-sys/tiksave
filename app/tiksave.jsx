import { useState, useEffect, useRef } from "react";

const AD_DURATION_SHORT = 5;  // segundos para descarga normal
const AD_DURATION_LONG = 15;  // segundos para HD (sin premium)

async function fetchVideoInfo(url) {
  if (!url.includes("tiktok.com")) throw new Error("URL inválida de TikTok");
  const response = await fetch(`/api/video?url=${encodeURIComponent(url)}`);
  const data = await response.json();
  if (!data || data.code !== 0) throw new Error("No se pudo obtener el video");
  const d = data.data;
  const secs = d.duration || 0;
  return {
    title: d.title || "Video de TikTok",
    thumbnail: d.cover,
    author: d.author?.nickname ? `@${d.author.nickname}` : "@usuario",
    duration: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`,
    videoUrlSD: d.play,
    videoUrlHD: d.hdplay,
  };
}

// ──────────────────────────────────────────────
// Modal de anuncio con cuenta regresiva
// ──────────────────────────────────────────────
function AdModal({ seconds, onComplete, onClose, isHD }) {
  const [remaining, setRemaining] = useState(seconds);
  const [canSkip, setCanSkip] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setCanSkip(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.adModal}>
        {/* Header */}
        <div style={styles.adModalHeader}>
          <span style={styles.adModalTag}>📢 Anuncio</span>
          {canSkip ? (
            <button style={styles.skipBtn} onClick={onClose}>
              Cerrar ✕
            </button>
          ) : (
            <span style={styles.adTimer}>{remaining}s</span>
          )}
        </div>

        {/* Contenido del anuncio (placeholder) */}
        <div style={styles.adContent}>
          <div style={styles.adPlaceholder}>
            <div style={styles.adPlaceholderInner}>
              <div style={styles.adIcon}>📣</div>
              <p style={styles.adPlaceholderTitle}>Espacio publicitario</p>
              <p style={styles.adPlaceholderSub}>
                Aquí irá tu anuncio de Google AdSense
              </p>
              <p style={styles.adPlaceholderCode}>
                {isHD ? "Anuncio 15s · Descarga HD" : "Anuncio 5s · Descarga SD"}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {/* Info */}
        <div style={styles.adInfo}>
          {canSkip ? (
            <div style={styles.adReady}>
              ✅ ¡Listo! Tu descarga comenzará ahora.
              <button style={styles.dlNowBtn} onClick={onComplete}>
                ⬇ Descargar ahora
              </button>
            </div>
          ) : (
            <p style={styles.adWaitText}>
              Espera {remaining} segundo{remaining !== 1 ? "s" : ""} para descargar
              {isHD ? " en HD" : ""}…
            </p>
          )}
        </div>

        {/* Upgrade hint */}
        {!isHD && (
          <div style={styles.adUpgradeHint}>
            ✨ <strong>Premium</strong>: descarga HD sin anuncios
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// App principal
// ──────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [particles, setParticles] = useState([]);

  // Estado del modal de anuncio
  const [adState, setAdState] = useState(null); // null | { type: 'sd'|'hd', seconds }

  useEffect(() => {
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  async function handleFetch() {
    if (!url.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await fetchVideoInfo(url.trim());
      setResult(data);
    } catch (e) {
      setError(e.message || "Error al procesar el video");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadSD() {
    if (isPremium) {
      triggerDownload(result.videoUrlSD, "video_sd.mp4");
      return;
    }
    setAdState({ type: "sd", seconds: AD_DURATION_SHORT });
  }

  function handleDownloadHD() {
    if (isPremium) {
      triggerDownload(result.videoUrlHD, "video_hd.mp4");
      return;
    }
    setAdState({ type: "hd", seconds: AD_DURATION_LONG });
  }

  function handleAdComplete() {
    const isHD = adState?.type === "hd";
    setAdState(null);
    const videoUrl = isHD ? result.videoUrlHD : result.videoUrlSD;
    window.open(videoUrl, "_blank");
  }

  function triggerDownload(videoUrl, filename) {
    alert(`✅ Descarga iniciada: ${filename}`);
  }

  return (
    <div style={styles.root}>
      {/* Partículas */}
      <div style={styles.particleContainer}>
        {particles.map((p) => (
          <div key={p.id} style={{
            ...styles.particle,
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            animationDuration: `${p.speed}s`,
            animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>
      <div style={styles.gradBlob1} />
      <div style={styles.gradBlob2} />

      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>▶</span>
            <span style={styles.logoText}>TikSave</span>
            <span style={styles.logoBadge}>PRO</span>
          </div>
          <nav style={styles.nav}>
            {isPremium && <span style={styles.navBadge}>✨ Premium activo</span>}
<button style={styles.premBtn} onClick={async () => {
  const res = await fetch('/api/checkout', { method: 'POST' });
  const { url } = await res.json();
  window.location.href = url;
}}>              Obtener Premium
            </button>
          </nav>
        </header>

        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroTag}>Sin marca de agua · HD · Gratis</div>
          <h1 style={styles.h1}>
            Descarga TikToks<br />
            <span style={styles.h1Accent}>sin marca de agua</span>
          </h1>
          <p style={styles.subtitle}>
            Pega el enlace y descarga gratis. Sin límites, sin registro.
          </p>

          <div style={styles.inputRow}>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔗</span>
              <input
                style={styles.input}
                type="text"
                placeholder="https://www.tiktok.com/@usuario/video/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
              {url && (
                <button style={styles.clearBtn} onClick={() => { setUrl(""); setResult(null); setError(""); }}>✕</button>
              )}
            </div>
            <button
              style={{ ...styles.fetchBtn, ...(loading ? styles.fetchBtnLoading : {}) }}
              onClick={handleFetch}
              disabled={loading}
            >
              {loading ? <span style={styles.spinner} /> : "Analizar"}
            </button>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        </section>

        {/* Resultado */}
        {result && (
          <div style={styles.resultCard}>
            <div style={styles.resultInner}>
              <img src={result.thumbnail} alt="preview" style={styles.thumb} />
              <div style={styles.resultInfo}>
                <p style={styles.resultAuthor}>{result.author}</p>
                <p style={styles.resultTitle}>{result.title}</p>
                <p style={styles.resultMeta}>⏱ {result.duration}</p>

                {/* Opciones de descarga */}
                <div style={styles.dlOptions}>
                  {/* SD gratis con anuncio corto */}
                  <div style={styles.dlOption}>
                    <div style={styles.dlOptionInfo}>
                      <span style={styles.dlOptionBadge}>GRATIS</span>
                      <p style={styles.dlOptionTitle}>Calidad normal (SD)</p>
                      <p style={styles.dlOptionDesc}>📢 Ver anuncio de 5 seg</p>
                    </div>
                    <button style={styles.dlBtnSD} onClick={handleDownloadSD}>
                      ⬇ Descargar
                    </button>
                  </div>

                  {/* HD con anuncio largo o premium */}
                  <div style={{ ...styles.dlOption, ...styles.dlOptionHD }}>
                    <div style={styles.dlOptionInfo}>
                      <span style={{ ...styles.dlOptionBadge, ...styles.dlOptionBadgeHD }}>
                        {isPremium ? "✨ PREMIUM" : "HD"}
                      </span>
                      <p style={styles.dlOptionTitle}>Alta calidad (HD 1080p)</p>
                      <p style={styles.dlOptionDesc}>
                        {isPremium ? "⚡ Sin anuncios" : "📢 Ver anuncio de 15 seg"}
                      </p>
                    </div>
                    <button style={styles.dlBtnHD} onClick={handleDownloadHD}>
                      ⬇ Descargar HD
                    </button>
                  </div>

                  {/* MP3 */}
                  <div style={styles.dlOption}>
                    <div style={styles.dlOptionInfo}>
                      <span style={styles.dlOptionBadge}>GRATIS</span>
                      <p style={styles.dlOptionTitle}>Solo audio (MP3)</p>
                      <p style={styles.dlOptionDesc}>📢 Ver anuncio de 5 seg</p>
                    </div>
                    <button style={styles.dlBtnSD} onClick={handleDownloadSD}>
                      🎵 MP3
                    </button>
                  </div>
                </div>

                {!isPremium && (
                  <p style={styles.upgradeHint}>
                    ✨ <button style={styles.upgradeLink} onClick={() => setShowPremium(true)}>Consigue Premium</button> — descarga HD sin esperar anuncios
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ad banner */}
        <div style={styles.adBox}>
          <span style={styles.adLabel}>Publicidad</span>
          <p style={styles.adText}>[ Espacio para Google AdSense — 728×90 ]</p>
        </div>

        {/* Features */}
        <section style={styles.features}>
          {[
            { icon: "♾️", title: "Sin límites", desc: "Descarga todos los videos que quieras, gratis" },
            { icon: "🎯", title: "Sin marca de agua", desc: "Videos limpios, directamente de TikTok" },
            { icon: "📱", title: "HD disponible", desc: "1080p con un anuncio corto o con Premium" },
            { icon: "🔒", title: "Sin registro", desc: "Descarga directa, sin crear cuenta" },
          ].map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </section>

        <footer style={styles.footer}>
          <p>© 2026 TikSave · Hecho con ❤️</p>
          <p style={styles.footerLinks}>
            <a href="#" style={styles.footerLink}>Términos</a> ·{" "}
            <a href="#" style={styles.footerLink}>Privacidad</a> ·{" "}
            <a href="#" style={styles.footerLink}>Contacto</a>
          </p>
        </footer>
      </div>

      {/* Modal Anuncio */}
      {adState && (
        <AdModal
          seconds={adState.seconds}
          isHD={adState.type === "hd"}
          onComplete={handleAdComplete}
          onClose={() => setAdState(null)}
        />
      )}

      {/* Modal Premium */}
      {showPremium && (
        <div style={styles.modalOverlay} onClick={() => setShowPremium(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowPremium(false)}>✕</button>
            <div style={styles.modalBadge}>✨ PREMIUM</div>
            <h2 style={styles.modalTitle}>Sin anuncios, sin esperas</h2>
            <p style={styles.modalDesc}>
              Descarga HD al instante, sin ver anuncios, sin límites.
            </p>
            <div style={styles.pricingRow}>
              {[
                { label: "Mensual", price: "$2.99", period: "/mes" },
                { label: "Anual", price: "$19.99", period: "/año", highlight: true },
              ].map((plan) => (
                <div key={plan.label} style={{ ...styles.pricingCard, ...(plan.highlight ? styles.pricingHighlight : {}) }}>
                  {plan.highlight && <div style={styles.pricingTag}>Más popular</div>}
                  <p style={styles.pricingLabel}>{plan.label}</p>
                  <p style={styles.pricingPrice}>{plan.price}<span style={styles.pricingPeriod}>{plan.period}</span></p>
                  <button style={{ ...styles.dlBtnHD, width: "100%", marginTop: 12 }}>Elegir plan</button>
                </div>
              ))}
            </div>
            <p style={styles.modalNote}>Cancela cuando quieras. Sin compromiso.</p>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050510; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-30px); opacity: 0.8; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressAnim {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#050510", fontFamily: "'DM Sans', sans-serif", color: "#f0f0f8", position: "relative", overflow: "hidden" },
  particleContainer: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 },
  particle: { position: "absolute", borderRadius: "50%", background: "#e94560", opacity: 0.3, animation: "float linear infinite" },
  gradBlob1: { position: "fixed", top: "-200px", left: "-200px", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(233,69,96,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  gradBlob2: { position: "fixed", bottom: "-200px", right: "-100px", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(100,60,220,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  wrapper: { maxWidth: 900, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 22, color: "#e94560" },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -0.5 },
  logoBadge: { fontSize: 10, fontWeight: 700, background: "#e94560", color: "#fff", padding: "2px 6px", borderRadius: 4, letterSpacing: 1 },
  nav: { display: "flex", alignItems: "center", gap: 16 },
  navBadge: { fontSize: 13, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: 20 },
  premBtn: { background: "linear-gradient(135deg, #e94560, #c0392b)", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  hero: { textAlign: "center", padding: "72px 0 48px", animation: "fadeUp 0.6s ease both" },
  heroTag: { display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#e94560", background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.3)", padding: "6px 16px", borderRadius: 20, marginBottom: 24, textTransform: "uppercase" },
  h1: { fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 18 },
  h1Accent: { color: "#e94560" },
  subtitle: { fontSize: 17, color: "rgba(255,255,255,0.5)", marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" },
  inputRow: { display: "flex", gap: 12, maxWidth: 680, margin: "0 auto", flexWrap: "wrap" },
  inputWrap: { flex: 1, display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "0 16px", minWidth: 0 },
  inputIcon: { fontSize: 18, marginRight: 10, opacity: 0.5 },
  input: { flex: 1, background: "none", border: "none", outline: "none", color: "#f0f0f8", fontSize: 15, padding: "16px 0", fontFamily: "'DM Sans', sans-serif" },
  clearBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: "4px" },
  fetchBtn: { background: "linear-gradient(135deg, #e94560, #c0392b)", border: "none", color: "#fff", padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" },
  fetchBtnLoading: { opacity: 0.7 },
  spinner: { width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  errorBox: { marginTop: 16, background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.3)", color: "#e94560", padding: "12px 20px", borderRadius: 10, fontSize: 14 },
  resultCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 24, marginBottom: 32, animation: "fadeUp 0.4s ease both" },
  resultInner: { display: "flex", gap: 24, flexWrap: "wrap" },
  thumb: { width: 140, height: 200, objectFit: "cover", borderRadius: 12, flexShrink: 0 },
  resultInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 10 },
  resultAuthor: { color: "#e94560", fontWeight: 600, fontSize: 14 },
  resultTitle: { fontSize: 16, fontWeight: 500 },
  resultMeta: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  dlOptions: { display: "flex", flexDirection: "column", gap: 10, marginTop: 4 },
  dlOption: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", gap: 12 },
  dlOptionHD: { border: "1px solid rgba(233,69,96,0.3)", background: "rgba(233,69,96,0.06)" },
  dlOptionInfo: { display: "flex", flexDirection: "column", gap: 2 },
  dlOptionBadge: { fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.08)", padding: "2px 7px", borderRadius: 4, width: "fit-content" },
  dlOptionBadgeHD: { color: "#e94560", background: "rgba(233,69,96,0.15)" },
  dlOptionTitle: { fontSize: 14, fontWeight: 600 },
  dlOptionDesc: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  dlBtnSD: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
  dlBtnHD: { background: "linear-gradient(135deg, #e94560, #c0392b)", border: "none", color: "#fff", padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
  upgradeHint: { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 },
  upgradeLink: { background: "none", border: "none", color: "#e94560", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0, textDecoration: "underline" },
  adBox: { background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 48 },
  adLabel: { fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase" },
  adText: { fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 4 },
  features: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 64 },
  featureCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 },
  featureIcon: { fontSize: 28, marginBottom: 12 },
  featureTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8 },
  featureDesc: { fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 },
  footer: { borderTop: "1px solid rgba(255,255,255,0.07)", padding: "32px 0", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" },
  footerLinks: { marginTop: 8 },
  footerLink: { color: "rgba(255,255,255,0.3)", textDecoration: "none" },
  // Ad modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  adModal: { background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 32, maxWidth: 460, width: "100%", animation: "fadeUp 0.3s ease both" },
  adModalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  adModalTag: { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1 },
  adTimer: { fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#e94560" },
  skipBtn: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  adContent: { marginBottom: 16 },
  adPlaceholder: { background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 16, padding: 32, textAlign: "center", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" },
  adPlaceholderInner: { display: "flex", flexDirection: "column", gap: 8, alignItems: "center" },
  adIcon: { fontSize: 36, marginBottom: 4 },
  adPlaceholderTitle: { fontSize: 16, fontWeight: 600 },
  adPlaceholderSub: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  adPlaceholderCode: { fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginTop: 4 },
  progressBar: { background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 4, marginBottom: 20, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #e94560, #ff6b35)", borderRadius: 4, transition: "width 1s linear" },
  adInfo: { marginBottom: 16 },
  adWaitText: { fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center" },
  adReady: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#4ade80", fontSize: 14, fontWeight: 600 },
  dlNowBtn: { background: "linear-gradient(135deg, #e94560, #c0392b)", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  adUpgradeHint: { textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "12px 0 0", borderTop: "1px solid rgba(255,255,255,0.07)" },
  // Premium modal
  modal: { background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 40, maxWidth: 460, width: "100%", position: "relative", animation: "fadeUp 0.3s ease both" },
  modalClose: { position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" },
  modalBadge: { color: "#e94560", fontWeight: 700, letterSpacing: 2, fontSize: 12, marginBottom: 12 },
  modalTitle: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 12 },
  modalDesc: { color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 },
  pricingRow: { display: "flex", gap: 16 },
  pricingCard: { flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, position: "relative" },
  pricingHighlight: { border: "1px solid rgba(233,69,96,0.5)", background: "rgba(233,69,96,0.08)" },
  pricingTag: { position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#e94560", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, whiteSpace: "nowrap", letterSpacing: 1 },
  pricingLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 },
  pricingPrice: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800 },
  pricingPeriod: { fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)" },
  modalNote: { textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 20 },
};