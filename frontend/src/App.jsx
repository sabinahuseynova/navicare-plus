import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Siren,
  Hotel,
  Map,
  Users,
  Type,
  Contrast,
  ChevronLeft,
  Phone,
  Navigation2,
  Star,
  Send,
  Mic,
  Volume2,
  VolumeX,
  LogIn,
  Eye,
  EyeOff,
  Settings,
  Upload,
  Menu,
  FileText,
  X,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import pandaImg from "./assets/panda.jpg";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_BASE = "https://navicare-plus.onrender.com";

const FEATURES = [
  {
    id: "ai",
    title: "Ask a question",
    desc: "Ask the AI assistant anything about your trip",
    icon: MessageCircle,
    accent: "teal",
  },
  {
    id: "navigation",
    title: "Accessible routes",
    desc: "Step-free, ramp-friendly navigation",
    icon: Map,
    accent: "gold",
  },
  {
    id: "places",
    title: "Hotels & restaurants",
    desc: "Recommendations rated by accessibility",
    icon: Hotel,
    accent: "teal",
  },
  {
    id: "buddy",
    title: "Travel Buddy",
    desc: "Get help from a nearby volunteer",
    icon: Users,
    accent: "gold",
  },
];

// ---------------------------------------------------------------------
// SMALL SHARED COMPONENTS
// ---------------------------------------------------------------------

function StarRating({ value, count, size = 16, color }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} color={color} fill={n <= rounded ? color : "none"} />
        ))}
      </div>
      <span style={{ fontSize: size * 0.7, color }}>
        {Number(value || 0).toFixed(1)} {count ? `(${count})` : ""}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------

function AuthScreen({ palette, largeText, setLargeText, highContrast, setHighContrast, onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !password || (mode === "register" && !name)) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";
      const body = mode === "login" ? { email, password } : { name, email, password, role };
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      onAuthSuccess(data.user, data.token);
    } catch (e) {
      setError("Could not connect to the server. Please check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: palette.paper, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: 16 }}>
        <button
          onClick={() => setLargeText(!largeText)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            borderRadius: 12, padding: "8px 12px",
            background: largeText ? palette.teal : palette.card,
            color: largeText ? "#fff" : palette.ink,
            border: `1px solid ${palette.line}`,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: largeText ? "1.3rem" : "1.1rem" }}>A</span>
          <span style={{ fontSize: "0.6rem" }}>Large text</span>
        </button>
        <button
          onClick={() => setHighContrast(!highContrast)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            borderRadius: 12, padding: "8px 12px",
            background: highContrast ? palette.teal : palette.card,
            color: highContrast ? "#fff" : palette.ink,
            border: `1px solid ${palette.line}`,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>◐</span>
          <span style={{ fontSize: "0.6rem" }}>Contrast</span>
        </button>
      </div>

      <div
        style={{
          background: palette.teal,
          padding: "24px 24px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #fff",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
          }}
        >
          <img
            src={pandaImg}
            alt="Panda covering eyes, representing privacy and security"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
          />
        </div>
        <p style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: largeText ? "2rem" : "1.7rem", color: "#fff", marginBottom: 4 }}>
          Navicare+
        </p>
        <p style={{ color: "#DDEFE6", fontSize: largeText ? "1rem" : "0.85rem" }}>
          Your journey. Your independence.
        </p>
      </div>

      <div
        style={{
          background: palette.paper,
          borderRadius: "28px 28px 0 0",
          marginTop: -24,
          padding: "28px 24px",
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <p style={{ fontWeight: 700, fontSize: largeText ? "1.3rem" : "1.1rem", color: palette.ink, marginBottom: 16 }}>
            {mode === "login" ? "Log in" : "Create account"}
          </p>

          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-2xl px-4 py-3 outline-none mb-2"
              style={{ width: "100%", boxSizing: "border-box", background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem" }}
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="rounded-2xl px-4 py-3 outline-none mb-2"
            style={{ width: "100%", boxSizing: "border-box", background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem" }}
          />

          <div style={{ position: "relative", marginBottom: 8 }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="rounded-2xl px-4 py-3 outline-none"
              style={{ width: "100%", boxSizing: "border-box", background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem" }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: palette.sub, background: "transparent", padding: 6, display: "flex" }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === "register" && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["user", "volunteer"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 12,
                    background: role === r ? palette.teal : palette.card,
                    color: role === r ? "#fff" : palette.ink,
                    border: `1px solid ${palette.line}`,
                    fontSize: largeText ? "0.9rem" : "0.78rem",
                  }}
                >
                  {r === "user" ? "I need help" : "I'm a volunteer"}
                </button>
              ))}
            </div>
          )}

          {error && <p style={{ color: palette.alert, fontSize: "0.85rem", marginBottom: 8 }}>{error}</p>}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-2xl py-3 font-bold"
            style={{ background: palette.teal, color: "#fff", fontSize: largeText ? "1.05rem" : "0.92rem", marginBottom: 12 }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>

          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ color: palette.teal, fontSize: largeText ? "0.95rem" : "0.85rem", width: "100%", textAlign: "center" }}
          >
            {mode === "login" ? "No account? Create one" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// HEADER / NAV / SHELL
// ---------------------------------------------------------------------

function Header({ largeText, setLargeText, highContrast, setHighContrast, palette, user, onAccountClick }) {
  return (
    <header
      className="flex items-center justify-between px-5 py-4 sticky top-0 z-20"
      style={{ background: palette.paper, borderBottom: `1px solid ${palette.line}` }}
    >
      <div>
        <p
          className="font-bold tracking-tight"
          style={{ fontFamily: "Fraunces, serif", color: palette.ink, fontSize: largeText ? "1.7rem" : "1.35rem" }}
        >
          Navicare+
        </p>
        <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.8rem" }}>
          Your journey. Your independence.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setLargeText(!largeText)}
          aria-pressed={largeText}
          aria-label="Toggle large text mode"
          className="flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition"
          style={{
            background: largeText ? palette.teal : palette.card,
            color: largeText ? palette.paper : palette.ink,
            border: `1px solid ${palette.line}`,
          }}
        >
          <Type size={largeText ? 26 : 20} />
          <span style={{ fontSize: "0.65rem", marginTop: 2 }}>Large text</span>
        </button>
        <button
          onClick={() => setHighContrast(!highContrast)}
          aria-pressed={highContrast}
          aria-label="Toggle high contrast mode"
          className="flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition"
          style={{
            background: highContrast ? palette.teal : palette.card,
            color: highContrast ? palette.paper : palette.ink,
            border: `1px solid ${palette.line}`,
          }}
        >
          <Contrast size={largeText ? 26 : 20} />
          <span style={{ fontSize: "0.65rem", marginTop: 2 }}>Contrast</span>
        </button>

        <button
          onClick={onAccountClick}
          aria-label={user ? "Settings and activity" : "Log in"}
          style={{
            marginLeft: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 12px",
            borderRadius: 12,
            background: palette.card,
            color: palette.ink,
            border: `1px solid ${palette.line}`,
          }}
        >
          {user ? <Menu size={largeText ? 24 : 20} /> : <LogIn size={18} />}
        </button>
      </div>
    </header>
  );
}

function BottomNav({ page, setPage, palette, largeText }) {
  const items = [
    { id: "home", label: "Home", icon: Navigation2 },
    ...FEATURES.map((f) => ({ id: f.id, label: f.title.split(" ")[0], icon: f.icon })),
    { id: "emergency", label: "SOS", icon: Siren, alert: true },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <nav
  className="fixed bottom-0 left-0 right-0 flex z-20"
  style={{ background: palette.paper, borderTop: `1px solid ${palette.line}`, padding: "6px 2px", justifyContent: "space-between", overflowX: "auto" }}
>
      {items.map((it) => {
  const Icon = it.icon;
  const active = page === it.id;
  const color = it.alert ? "#fff" : active ? palette.teal : palette.sub;
  return (
    <button
      key={it.id}
      onClick={() => setPage(it.id)}
      className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl"
      style={{
        color,
        background: it.alert ? palette.alert : "transparent",
      }}
    >
      <Icon size={largeText ? 24 : 20} />
      <span style={{ fontSize: largeText ? "0.72rem" : "0.62rem", fontWeight: it.alert ? 700 : 400 }}>{it.label}</span>
    </button>
        );
      })}
    </nav>
  );
}

function FeatureCard({ f, palette, largeText, onOpen, user }) {
  const Icon = f.icon;
  const accentColor = f.accent === "teal" ? palette.teal : palette.gold;
  const isVolunteer = user?.role === "volunteer";

  const title = f.id === "buddy" && isVolunteer ? "Help requests" : f.title;
  const desc = f.id === "buddy" && isVolunteer ? "See nearby people who need your help" : f.desc;

  return (
    <button
      onClick={() => onOpen(f.id)}
      style={{
        textAlign: "left",
        borderRadius: 24,
        padding: 20,
        width: "100%",
        boxSizing: "border-box",
        background: palette.card,
        border: `1px solid ${palette.line}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        minHeight: 88,
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ background: accentColor, width: largeText ? 56 : 48, height: largeText ? 56 : 48 }}
      >
        <Icon size={largeText ? 30 : 26} color="#fff" />
      </div>
      <div>
        <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.25rem" : "1.05rem" }}>
          {title}
        </p>
        <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.85rem", marginTop: 2 }}>
          {desc}
        </p>
      </div>
    </button>
  );
}

function PageShell({ title, palette, largeText, onBack, children }) {
  return (
    <div className="px-5 pt-4 pb-28">
      <h1
        style={{
          fontFamily: "Fraunces, serif",
          color: palette.ink,
          fontSize: largeText ? "2rem" : "1.6rem",
          fontWeight: 700,
          marginBottom: 16,
          marginTop: 8,
        }}
      >
        {title}
      </h1>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------
// AI PAGE
// ---------------------------------------------------------------------

function AIPage({ palette, largeText }) {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi! What would you like to know about your trip?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!sending) return;
    const interval = setInterval(() => setDotCount((d) => (d % 3) + 1), 400);
    return () => clearInterval(interval);
  }, [sending]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*(.*?)\*\*/g, "$1");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-GB";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const formatMessage = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { from: "ai", text: reply }]);
      if (voiceEnabled) speak(reply);
    } catch (e) {
      setMessages((prev) => [...prev, { from: "ai", text: "Connection error. Please check the backend is running." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          onClick={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            if (!next && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12,
            background: voiceEnabled ? palette.teal : palette.card,
            color: voiceEnabled ? "#fff" : palette.ink,
            border: `1px solid ${palette.line}`,
            fontSize: largeText ? "0.95rem" : "0.8rem",
          }}
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          Voice replies {voiceEnabled ? "on" : "off"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "ai" ? "flex-start" : "flex-end", width: "100%" }}>
            <div
              style={{
                maxWidth: "80%", borderRadius: 16, padding: "10px 14px",
                background: m.from === "ai" ? palette.card : palette.teal,
                color: m.from === "ai" ? palette.ink : "#fff",
                fontSize: largeText ? "1.05rem" : "0.92rem", textAlign: "left", lineHeight: 1.5,
              }}
            >
              {formatMessage(m.text)}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
            <div style={{ borderRadius: 16, padding: "10px 14px", background: palette.card, color: palette.sub, fontSize: largeText ? "1.05rem" : "0.92rem" }}>
              {".".repeat(dotCount)}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak your question..."
          className="flex-1 rounded-2xl px-4 py-3 outline-none"
          style={{ background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem" }}
        />
        <button
          onClick={startListening}
          aria-label="Speak your question"
          className="rounded-2xl px-4 flex items-center justify-center"
          style={{ background: listening ? palette.alert : palette.card, border: `1px solid ${palette.line}`, color: listening ? "#fff" : palette.ink }}
        >
          <Mic size={largeText ? 22 : 18} />
        </button>
        <button onClick={send} className="rounded-2xl px-4 flex items-center justify-center" style={{ background: palette.teal, color: "#fff" }}>
          <Send size={largeText ? 22 : 18} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// NAVIGATION PAGE
// ---------------------------------------------------------------------

function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [bounds, map]);
  return null;
}

function NavigationPage({ palette, largeText, pendingDestination, onConsumePending }) {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromResults, setFromResults] = useState([]);
  const [toResults, setToResults] = useState([]);
  const [fromCoord, setFromCoord] = useState(null);
  const [toCoord, setToCoord] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fromTimer = useRef(null);
  const toTimer = useRef(null);

  const searchPlace = async (query, setResults) => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=gb`
      );
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setResults([]);
    }
  };

  const onFromChange = (val) => {
    setFromQuery(val);
    setFromCoord(null);
    clearTimeout(fromTimer.current);
    fromTimer.current = setTimeout(() => searchPlace(val, setFromResults), 500);
  };

  const onToChange = (val) => {
    setToQuery(val);
    setToCoord(null);
    clearTimeout(toTimer.current);
    toTimer.current = setTimeout(() => searchPlace(val, setToResults), 500);
  };

  const pickFrom = (place) => {
    setFromQuery(place.display_name);
    setFromCoord([parseFloat(place.lat), parseFloat(place.lon)]);
    setFromResults([]);
  };

  const pickTo = (place) => {
    setToQuery(place.display_name);
    setToCoord([parseFloat(place.lat), parseFloat(place.lon)]);
    setToResults([]);
  };

  useEffect(() => {
    const getRoute = async () => {
      if (!fromCoord || !toCoord) return;
      setLoading(true);
      setError("");
      setRouteCoords(null);
      setRouteInfo(null);
      try {
        const url = `${API_BASE}/api/route?startLat=${fromCoord[0]}&startLon=${fromCoord[1]}&endLat=${toCoord[0]}&endLon=${toCoord[1]}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.coordinates) throw new Error("no route");
        setRouteCoords(data.coordinates);
        setRouteInfo({ distance: data.distanceKm, duration: data.durationMin });
      } catch (e) {
        setError("No wheelchair-accessible route found between these points. Try different locations.");
      } finally {
        setLoading(false);
      }
    };
    getRoute();
  }, [fromCoord, toCoord]);

  useEffect(() => {
    if (!pendingDestination) return;
    setToQuery(pendingDestination.name);
    setToCoord([pendingDestination.lat, pendingDestination.lon]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFromQuery("Your location");
          setFromCoord([pos.coords.latitude, pos.coords.longitude]);
        },
        () => setError("Could not get your location. Please enter a starting point manually.")
      );
    }

    onConsumePending();
  }, [pendingDestination]);

  const bounds = fromCoord && toCoord ? [fromCoord, toCoord] : null;
  const center = fromCoord || [55.8721, -4.2879];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div style={{ position: "relative" }}>
          <input
            value={fromQuery}
            onChange={(e) => onFromChange(e.target.value)}
            placeholder="From (e.g. University of Glasgow)"
            className="w-full rounded-2xl px-4 py-3 outline-none"
            style={{ background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem", width: "100%", boxSizing: "border-box" }}
          />
          {fromResults.length > 0 && (
            <div className="absolute left-0 right-0 rounded-2xl mt-1 overflow-hidden z-10" style={{ background: palette.paper, border: `1px solid ${palette.line}` }}>
              {fromResults.map((r, i) => (
                <button key={i} onClick={() => pickFrom(r)} className="w-full text-left px-4 py-3" style={{ color: palette.ink, fontSize: largeText ? "0.95rem" : "0.85rem", borderBottom: i < fromResults.length - 1 ? `1px solid ${palette.line}` : "none" }}>
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <input
            value={toQuery}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="To (e.g. Buchanan Bus Station)"
            className="w-full rounded-2xl px-4 py-3 outline-none"
            style={{ background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem", width: "100%", boxSizing: "border-box" }}
          />
          {toResults.length > 0 && (
            <div className="absolute left-0 right-0 rounded-2xl mt-1 overflow-hidden z-10" style={{ background: palette.paper, border: `1px solid ${palette.line}` }}>
              {toResults.map((r, i) => (
                <button key={i} onClick={() => pickTo(r)} className="w-full text-left px-4 py-3" style={{ color: palette.ink, fontSize: largeText ? "0.95rem" : "0.85rem", borderBottom: i < toResults.length - 1 ? `1px solid ${palette.line}` : "none" }}>
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${palette.line}`, height: 320 }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          {fromCoord && <Marker position={fromCoord}><Popup>Start</Popup></Marker>}
          {toCoord && <Marker position={toCoord}><Popup>Destination</Popup></Marker>}
          {routeCoords && <Polyline positions={routeCoords} pathOptions={{ color: palette.teal, weight: 5 }} />}
          {bounds && <MapBoundsUpdater bounds={bounds} />}
        </MapContainer>
      </div>

      {loading && <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.85rem" }}>Finding an accessible route…</p>}
      {error && <p style={{ color: palette.alert, fontSize: largeText ? "1rem" : "0.85rem" }}>{error}</p>}
      {routeInfo && (
        <div className="rounded-2xl p-4" style={{ background: palette.card, border: `1px solid ${palette.line}` }}>
          <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.1rem" : "0.95rem" }}>Wheelchair-accessible route</p>
          <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.85rem", marginTop: 4 }}>{routeInfo.distance} km · approx. {routeInfo.duration} min</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// PLACES PAGE
// ---------------------------------------------------------------------

function PlacesPage({ palette, largeText, onNavigateToPlace }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const timer = useRef(null);

  const searchPlace = async (q) => {
    if (!q || q.length < 3) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=gb`
      );
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setResults([]);
    }
  };

  const onChange = (val) => {
    setQuery(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => searchPlace(val), 500);
  };

  const pickLocation = async (place) => {
    setQuery(place.display_name);
    setResults([]);
    setLoading(true);
    setError("");
    setPlaces([]);
    try {
      const res = await fetch(`${API_BASE}/api/places?lat=${place.lat}&lon=${place.lon}`);
      const data = await res.json();
      if (!data.places || data.places.length === 0) {
        setError("No hotels or restaurants found nearby. Try a different location.");
      } else {
        setPlaces(data.places);
      }
    } catch (e) {
      setError("Could not load places. Please check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const wheelchairLabel = (status) => {
    if (status === "yes") return { text: "Wheelchair accessible", color: "#2F7D5D" };
    if (status === "limited") return { text: "Limited accessibility", color: "#C98A2C" };
    if (status === "no") return { text: "Not accessible", color: "#B3372C" };
    return { text: "Accessibility unknown", color: palette.sub };
  };

  return (
    <div className="flex flex-col gap-3">
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search a location (e.g. Glasgow city centre)"
          className="rounded-2xl px-4 py-3 outline-none"
          style={{ width: "100%", boxSizing: "border-box", background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem" }}
        />
        {results.length > 0 && (
          <div className="absolute left-0 right-0 rounded-2xl mt-1 overflow-hidden z-10" style={{ background: palette.paper, border: `1px solid ${palette.line}` }}>
            {results.map((r, i) => (
              <button key={i} onClick={() => pickLocation(r)} className="w-full text-left px-4 py-3" style={{ color: palette.ink, fontSize: largeText ? "0.95rem" : "0.85rem", borderBottom: i < results.length - 1 ? `1px solid ${palette.line}` : "none" }}>
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {places.length > 0 && (
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "hotel", "restaurant"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 12,
                background: filter === f ? palette.teal : palette.card,
                color: filter === f ? "#fff" : palette.ink,
                border: `1px solid ${palette.line}`,
                fontSize: largeText ? "0.95rem" : "0.8rem",
                textTransform: "capitalize",
              }}
            >
              {f === "all" ? "All" : f === "hotel" ? "Hotels" : "Restaurants"}
            </button>
          ))}
        </div>
      )}

      {loading && <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.85rem" }}>Finding nearby places…</p>}
      {error && <p style={{ color: palette.alert, fontSize: largeText ? "1rem" : "0.85rem" }}>{error}</p>}

      {places
        .filter((p) => filter === "all" || p.type.toLowerCase() === filter)
        .map((p) => {
          const label = wheelchairLabel(p.wheelchair);
          return (
            <button
              key={p.id}
              onClick={() => onNavigateToPlace({ name: p.name, lat: p.lat, lon: p.lon })}
              className="rounded-2xl p-4 flex justify-between items-center text-left"
              style={{ background: palette.card, border: `1px solid ${palette.line}`, width: "100%" }}
            >
              <div>
                <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.1rem" : "0.95rem" }}>{p.name}</p>
                <p style={{ color: palette.sub, fontSize: largeText ? "0.95rem" : "0.8rem" }}>{p.type}</p>
                <p style={{ color: palette.teal, fontSize: largeText ? "0.85rem" : "0.72rem", marginTop: 2 }}>Tap for accessible route →</p>
              </div>
              <div style={{ color: label.color, fontSize: largeText ? "0.9rem" : "0.75rem", fontWeight: 600, textAlign: "right", maxWidth: 130 }}>
                {label.text}
              </div>
            </button>
          );
        })}
    </div>
  );
}

// ---------------------------------------------------------------------
// CERTIFICATES MODAL
// ---------------------------------------------------------------------

function CertificatesModal({ palette, largeText, volunteerId, onClose }) {
  const token = localStorage.getItem("wayfare_token");
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState([]);
  const [volunteerName, setVolunteerName] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile/${volunteerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCerts(data.profile.certificates || []);
        setVolunteerName(data.profile.name || "");
      } catch (e) {
        setCerts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [volunteerId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl p-6" style={{ background: palette.paper, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.3rem" : "1.1rem" }}>
            {volunteerName ? `${volunteerName}'s certificates` : "Certificates"}
          </p>
          <button onClick={onClose} aria-label="Close" style={{ color: palette.sub }}>
            <X size={24} />
          </button>
        </div>

        {loading && <p style={{ color: palette.sub }}>Loading…</p>}
        {!loading && certs.length === 0 && (
          <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.9rem" }}>
            This volunteer hasn't added any certificates yet.
          </p>
        )}
        {!loading && certs.map((c) => (
          <div key={c.id} className="rounded-2xl p-4 mb-3" style={{ background: palette.card, border: `1px solid ${palette.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={22} color={palette.teal} />
              <div>
                <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.05rem" : "0.92rem" }}>{c.title}</p>
                {c.issuer && <p style={{ color: palette.sub, fontSize: largeText ? "0.9rem" : "0.78rem" }}>{c.issuer}</p>}
              </div>
            </div>
            {c.file_url && (
              <a
                href={`${API_BASE}${c.file_url}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block", marginTop: 8, color: palette.teal, fontSize: largeText ? "0.9rem" : "0.8rem" }}
              >
                View file →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// RATING WIDGET
// ---------------------------------------------------------------------

function RatingWidget({ palette, largeText, requestId, alreadyRated, onRated, authHeaders }) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (alreadyRated) {
    return <p style={{ color: palette.teal, fontSize: largeText ? "0.95rem" : "0.85rem" }}>Thank you for your feedback!</p>;
  }

  const submit = async () => {
    if (!stars) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/${requestId}/rate`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ rating: stars }),
      });
      if (!res.ok) throw new Error();
      onRated(requestId);
      setOpen(false);
    } catch (e) {
      // sessiz uğursuzluq
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ alignSelf: "flex-start", color: palette.teal, fontWeight: 700, fontSize: largeText ? "0.95rem" : "0.85rem" }}
      >
        Rate this experience
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}>
            <Star size={largeText ? 32 : 26} color={palette.gold} fill={n <= stars ? palette.gold : "none"} />
          </button>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={submitting || !stars}
        style={{ alignSelf: "flex-start", background: palette.teal, color: "#fff", borderRadius: 12, padding: "8px 16px", fontWeight: 700, fontSize: largeText ? "0.95rem" : "0.85rem" }}
      >
        Submit rating
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// BUDDY PAGE
// ---------------------------------------------------------------------

function BuddyPage({ palette, largeText, user }) {
  const isVolunteer = user?.role === "volunteer";
  const token = localStorage.getItem("wayfare_token");

  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [ratedIds, setRatedIds] = useState([]);
  const [certsModalVolunteerId, setCertsModalVolunteerId] = useState(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadMyRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/mine`, { headers: authHeaders });
      const data = await res.json();
      setMyRequests(data.requests || []);
    } catch (e) {
      setError("Could not load your requests.");
    }
  };

  const loadPendingRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/pending`, { headers: authHeaders });
      const data = await res.json();
      setPendingRequests(data.requests || []);
    } catch (e) {
      setError("Could not load pending requests.");
    }
  };

  useEffect(() => {
    if (isVolunteer) loadPendingRequests();
    else loadMyRequests();
  }, [isVolunteer]);

  const requestHelp = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(`${API_BASE}/api/help-requests`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error();
      setMessage("");
      setInfo("Your help request has been sent.");
      setFormOpen(false);
      loadMyRequests();
    } catch (e) {
      setError("Could not send your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const offerToHelp = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/${id}/accept`, {
        method: "POST",
        headers: authHeaders,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not offer to help");
      }
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      setInfo("You offered to help. Waiting for them to confirm.");
    } catch (e) {
      setError(e.message || "Could not offer to help. It may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const confirmVolunteer = async (requestId, volunteerId) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/${requestId}/confirm`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ volunteerId }),
      });
      if (!res.ok) throw new Error();
      loadMyRequests();
    } catch (e) {
      setError("Could not confirm this volunteer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const declineRequest = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/${id}/decline`, {
        method: "POST",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error();
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError("Could not decline the request.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status) => {
    if (status === "pending") return { text: "Waiting for a volunteer", color: palette.gold };
    if (status === "accepted") return { text: "A volunteer is helping you", color: palette.teal };
    return { text: status, color: palette.sub };
  };

  // ---------------- VOLUNTEER VIEW ----------------
  if (isVolunteer) {
    return (
      <div className="flex flex-col gap-3">
        <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.85rem" }}>
          People nearby who need help right now:
        </p>
        {error && <p style={{ color: palette.alert, fontSize: "0.85rem" }}>{error}</p>}
        {pendingRequests.length === 0 && (
          <p style={{ color: palette.sub, fontSize: largeText ? "1rem" : "0.85rem" }}>
            No help requests right now. Check back soon.
          </p>
        )}
        {pendingRequests.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl p-4"
            style={{ background: palette.card, border: `1px solid ${palette.line}`, display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.3rem" : "1.1rem" }}>{r.requester_name}</p>
              {r.message && <p style={{ color: palette.ink, fontSize: largeText ? "1.15rem" : "1rem", lineHeight: 1.4 }}>{r.message}</p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => offerToHelp(r.id)}
                disabled={loading}
                style={{ flex: 1, borderRadius: 12, padding: "8px 0", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: palette.teal, color: "#fff", fontSize: largeText ? "0.9rem" : "0.8rem" }}
              >
                ✓ Offer to help
              </button>
              <button
                onClick={() => declineRequest(r.id)}
                disabled={loading}
                style={{ flex: 1, borderRadius: 12, padding: "8px 0", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: palette.paper, color: palette.ink, border: `1.5px solid ${palette.ink}`, fontSize: largeText ? "0.9rem" : "0.8rem" }}
              >
                ✕ Decline
              </button>
            </div>
          </div>
        ))}

        <VolunteerAcceptedList palette={palette} largeText={largeText} authHeaders={authHeaders} ratedIds={ratedIds} setRatedIds={setRatedIds} />
      </div>
    );
  }

  // ---------------- USER VIEW ----------------
  return (
    <div className="flex flex-col gap-3">
      {!formOpen && (
        <button
          onClick={() => setFormOpen(true)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            borderRadius: 16, padding: "14px 20px",
            background: palette.gold, color: "#fff", fontWeight: 700,
            fontSize: largeText ? "1.05rem" : "0.9rem",
            marginBottom: 16,
            whiteSpace: "nowrap",
          }}
        >
          + New help request
        </button>
      )}

      {formOpen && (
        <div className="flex flex-col gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional: describe what help you need (e.g. 'I need help finding the accessible entrance')"
            className="rounded-2xl px-4 py-3 outline-none"
            style={{ width: "100%", boxSizing: "border-box", minHeight: 80, background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={requestHelp}
              disabled={loading}
              style={{ flex: 1, borderRadius: 16, padding: "12px 0", fontWeight: 700, background: palette.gold, color: "#fff", fontSize: largeText ? "1.05rem" : "0.92rem" }}
            >
              {loading ? "Sending…" : "Send request"}
            </button>
            <button
              onClick={() => setFormOpen(false)}
              style={{ flex: 1, borderRadius: 16, padding: "12px 0", fontWeight: 700, background: palette.card, color: palette.ink, border: `1px solid ${palette.line}`, fontSize: largeText ? "1.05rem" : "0.92rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ color: palette.alert, fontSize: "0.85rem" }}>{error}</p>}
      {info && <p style={{ color: palette.teal, fontSize: "0.85rem" }}>{info}</p>}

      {myRequests.map((r) => {
        const label = statusLabel(r.status);
        const hasVolunteer = !!r.volunteer_id;
        const offers = r.offers || [];

        return (
          <div key={r.id} className="rounded-2xl p-3" style={{ background: palette.card, border: `1px solid ${palette.line}`, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <p style={{ color: palette.sub, fontSize: largeText ? "0.85rem" : "0.75rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.message || "Help request"}
              </p>
              <span style={{ color: label.color, fontSize: largeText ? "0.75rem" : "0.68rem", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                {label.text}
              </span>
            </div>

            {r.status === "pending" && offers.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${palette.line}`, paddingTop: 10 }}>
                <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1rem" : "0.88rem" }}>
                  {offers.length === 1 ? "1 volunteer wants to help" : `${offers.length} volunteers want to help`}
                </p>
                {offers.map((o) => (
                  <div key={o.volunteer_id} style={{ display: "flex", alignItems: "center", gap: 10, background: palette.paper, borderRadius: 14, padding: 10 }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                        background: palette.card, border: `1px solid ${palette.line}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {o.photo_url ? (
                        <img src={`${API_BASE}${o.photo_url}`} alt={o.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Users size={20} color={palette.sub} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "0.98rem" : "0.85rem" }}>
                        {o.name}{o.age ? `, ${o.age}` : ""}
                      </p>
                      <StarRating value={o.rating_avg} count={o.rating_count} size={12} color={palette.gold} />
                    </div>
                    <button
                      onClick={() => confirmVolunteer(r.id, o.volunteer_id)}
                      disabled={loading}
                      style={{ background: palette.teal, color: "#fff", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: largeText ? "0.85rem" : "0.75rem" }}
                    >
                      Choose
                    </button>
                  </div>
                ))}
              </div>
            )}

            {hasVolunteer && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${palette.line}`, paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                      background: palette.paper, border: `1px solid ${palette.line}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {r.volunteer_photo ? (
                      <img src={`${API_BASE}${r.volunteer_photo}`} alt={r.volunteer_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Users size={26} color={palette.sub} />
                    )}
                  </div>
                  <div>
                    <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.15rem" : "1rem" }}>
                      {r.volunteer_name}{r.volunteer_age ? `, ${r.volunteer_age}` : ""}
                    </p>
                    <StarRating value={r.volunteer_rating} count={r.volunteer_rating_count} size={15} color={palette.gold} />
                  </div>
                </div>

                <p style={{ color: palette.ink, fontSize: largeText ? "1rem" : "0.9rem" }}>
                  {r.volunteer_name} wants to help you. {r.status === "accepted" ? "Your request has been accepted." : ""}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {r.volunteer_phone && (
                    <button
                      onClick={() => window.open(`tel:${r.volunteer_phone}`, "_self")}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: palette.teal, color: "#fff", borderRadius: 12, padding: "8px 14px", fontWeight: 700, fontSize: largeText ? "0.9rem" : "0.8rem", border: "none" }}
                    >
                      <Phone size={16} /> Call {r.volunteer_phone}
                    </button>
                  )}
                  <button
                    onClick={() => setCertsModalVolunteerId(r.volunteer_id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: palette.paper, color: palette.ink, border: `1px solid ${palette.line}`, borderRadius: 12, padding: "8px 14px", fontWeight: 700, fontSize: largeText ? "0.9rem" : "0.8rem" }}
                  >
                    <FileText size={16} /> View certificates
                  </button>
                </div>

                {r.status === "accepted" && (
                  <RatingWidget
                    palette={palette}
                    largeText={largeText}
                    requestId={r.id}
                    alreadyRated={ratedIds.includes(r.id)}
                    onRated={(id) => setRatedIds((prev) => [...prev, id])}
                    authHeaders={authHeaders}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {certsModalVolunteerId && (
        <CertificatesModal
          palette={palette}
          largeText={largeText}
          volunteerId={certsModalVolunteerId}
          onClose={() => setCertsModalVolunteerId(null)}
        />
      )}
    </div>
  );
}

function VolunteerAcceptedList({ palette, largeText, authHeaders, ratedIds, setRatedIds }) {
  const [accepted, setAccepted] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/help-requests/accepted-by-me`, { headers: authHeaders });
      const data = await res.json();
      setAccepted(data.requests || []);
    } catch (e) {
      // sessiz keç
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!loaded || accepted.length === 0) return null;

  return (
    <div className="flex flex-col gap-3" style={{ marginTop: 8 }}>
      <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.1rem" : "0.95rem" }}>
        People you're helping
      </p>
      {accepted.map((r) => (
        <div key={r.id} className="rounded-2xl p-4" style={{ background: palette.card, border: `1px solid ${palette.line}`, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                background: palette.paper, border: `1px solid ${palette.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {r.requester_photo ? (
                <img src={`${API_BASE}${r.requester_photo}`} alt={r.requester_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Users size={24} color={palette.sub} />
              )}
            </div>
            <div>
              <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.05rem" : "0.95rem" }}>
                {r.requester_name}{r.requester_age ? `, ${r.requester_age}` : ""}
              </p>
              <StarRating value={r.requester_rating} count={r.requester_rating_count} size={14} color={palette.gold} />
            </div>
          </div>
          {r.message && <p style={{ color: palette.sub, fontSize: largeText ? "0.95rem" : "0.85rem" }}>{r.message}</p>}
          {r.requester_phone && (
            <button
              onClick={() => window.open(`tel:${r.requester_phone}`, "_self")}
              style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: palette.teal, color: "#fff", borderRadius: 12, padding: "8px 14px", fontWeight: 700, fontSize: largeText ? "0.9rem" : "0.8rem", border: "none" }}
            >
              <Phone size={16} /> Call {r.requester_phone}
            </button>
          )}
          <RatingWidget
            palette={palette}
            largeText={largeText}
            requestId={r.id}
            alreadyRated={ratedIds.includes(r.id)}
            onRated={(id) => setRatedIds((prev) => [...prev, id])}
            authHeaders={authHeaders}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// SETTINGS PAGE
// ---------------------------------------------------------------------

function SettingsPage({ palette, largeText, user, setUser }) {
  const token = localStorage.getItem("wayfare_token");
  const isVolunteer = user?.role === "volunteer";

  const [profile, setProfile] = useState(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [bio, setBio] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certFile, setCertFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, { headers: authHeaders });
      const data = await res.json();
      setProfile(data.profile);
      setAge(data.profile.age || "");
      setGender(data.profile.gender || "");
      setPhone(data.profile.phone || "");
      setAddress(data.profile.address || "");
      setEmergencyName(data.profile.emergency_contact_name || "");
      setEmergencyPhone(data.profile.emergency_contact_phone || "");
      setBio(data.profile.bio || "");
    } catch (e) {
      setError("Could not load your profile.");
    }
  };

  const loadCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile/${user.id}`, { headers: authHeaders });
      const data = await res.json();
      setCertificates(data.profile.certificates || []);
    } catch (e) {
      // sessiz keç
    }
  };

  useEffect(() => {
    loadProfile();
    if (isVolunteer) loadCertificates();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ age: age ? parseInt(age) : null, gender, phone, address, bio, emergency_contact_name: emergencyName, emergency_contact_phone: emergencyPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setInfo("Your profile has been updated.");
      setProfile(data.profile);
    } catch (e) {
      setError("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      const res = await fetch(`${API_BASE}/api/upload/photo`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setProfile((p) => ({ ...p, photo_url: data.photo_url }));
      setUser((u) => ({ ...u, photo_url: data.photo_url }));
      setPhotoFile(null);
      setInfo("Photo updated.");
    } catch (e) {
      setError("Could not upload photo.");
    } finally {
      setSaving(false);
    }
  };

  const uploadCertificate = async () => {
    if (!certFile || !certTitle) {
      setError("Please add a title and choose a file for your certificate.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", certFile);
      formData.append("title", certTitle);
      formData.append("issuer", certIssuer);
      const res = await fetch(`${API_BASE}/api/upload/certificate`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setCertificates((c) => [data.certificate, ...c]);
      setCertTitle("");
      setCertIssuer("");
      setCertFile(null);
      setInfo("Certificate added.");
    } catch (e) {
      setError("Could not upload certificate.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: palette.card,
    border: `1px solid ${palette.line}`, color: palette.ink,
    fontSize: largeText ? "1.05rem" : "0.92rem", borderRadius: 16, padding: "10px 14px",
  };
  const labelStyle = { color: palette.sub, fontSize: largeText ? "0.95rem" : "0.8rem", marginBottom: 4, display: "block" };

  if (!profile) return <p style={{ color: palette.sub }}>Loading your profile…</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <div
          style={{
            width: 96, height: 96, borderRadius: "50%", overflow: "hidden",
            background: palette.card, border: `1px solid ${palette.line}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {profile.photo_url ? (
            <img src={`${API_BASE}${profile.photo_url}`} alt="Your profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Users size={40} color={palette.sub} />
          )}
        </div>
        <label
          className="flex items-center gap-2 rounded-2xl px-4 py-2"
          style={{ background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "0.95rem" : "0.85rem", cursor: "pointer" }}
        >
          <Upload size={16} /> Choose photo
          <input type="file" accept="image/*" hidden onChange={(e) => setPhotoFile(e.target.files[0])} />
        </label>
        {photoFile && (
          <button onClick={uploadPhoto} disabled={saving} className="rounded-2xl px-4 py-2 font-bold" style={{ background: palette.teal, color: "#fff", fontSize: largeText ? "0.95rem" : "0.85rem" }}>
            Upload "{photoFile.name}"
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label style={labelStyle}>Age</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} style={inputStyle} placeholder="e.g. 68" />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Phone number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="e.g. +44 7123 456789" />
          <p style={{ color: palette.sub, fontSize: "0.75rem", marginTop: 4 }}>Only shared once a help request is accepted.</p>
        </div>
        <div>
          <label style={labelStyle}>Home address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} placeholder="Never shown to other users" />
          <p style={{ color: palette.sub, fontSize: "0.75rem", marginTop: 4 }}>Private. Only used in an emergency, with authorities.</p>
        </div>
        <div style={{ borderTop: `1px solid ${palette.line}`, paddingTop: 12 }}>
          <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.05rem" : "0.92rem", marginBottom: 8 }}>
            Emergency contact
          </p>
          <label style={labelStyle}>Contact name</label>
          <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} placeholder="e.g. Aynur (daughter)" />
          <label style={labelStyle}>Contact phone</label>
          <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} style={inputStyle} placeholder="e.g. +44 7123 456789" />
          <p style={{ color: palette.sub, fontSize: "0.75rem", marginTop: 4 }}>Used by the SOS button to share your location quickly.</p>
        </div>
        <div>
          <label style={labelStyle}>{isVolunteer ? "About you as a volunteer" : "About your accessibility needs"}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ ...inputStyle, minHeight: 80 }}
            placeholder={isVolunteer ? "e.g. I have experience guiding wheelchair users around the city" : "e.g. I use a wheelchair and need step-free routes"}
          />
        </div>

        {error && <p style={{ color: palette.alert, fontSize: "0.85rem" }}>{error}</p>}
        {info && <p style={{ color: palette.teal, fontSize: "0.85rem" }}>{info}</p>}

        <button onClick={saveProfile} disabled={saving} className="rounded-2xl py-3 font-bold" style={{ background: palette.teal, color: "#fff", fontSize: largeText ? "1.05rem" : "0.92rem" }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {isVolunteer && (
        <div className="flex flex-col gap-3 pt-3" style={{ borderTop: `1px solid ${palette.line}` }}>
          <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.15rem" : "1rem" }}>Certificates</p>
          <p style={{ color: palette.sub, fontSize: largeText ? "0.95rem" : "0.8rem" }}>e.g. First Aid Training, Disability Awareness Training</p>

          {certificates.map((c) => (
            <div key={c.id} className="rounded-2xl p-3" style={{ background: palette.card, border: `1px solid ${palette.line}` }}>
              <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1rem" : "0.88rem" }}>{c.title}</p>
              {c.issuer && <p style={{ color: palette.sub, fontSize: largeText ? "0.9rem" : "0.78rem" }}>{c.issuer}</p>}
            </div>
          ))}

          <input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} style={inputStyle} placeholder="Certificate title (e.g. First Aid)" />
          <input value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} style={inputStyle} placeholder="Issued by (optional)" />
          <label
            className="flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{ background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "0.95rem" : "0.85rem", cursor: "pointer" }}
          >
            <Upload size={16} /> {certFile ? certFile.name : "Choose certificate file"}
            <input type="file" accept="image/*,.pdf" hidden onChange={(e) => setCertFile(e.target.files[0])} />
          </label>
          <button onClick={uploadCertificate} disabled={saving} className="rounded-2xl py-3 font-bold" style={{ background: palette.gold, color: "#fff", fontSize: largeText ? "1rem" : "0.88rem" }}>
            Add certificate
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// ACCOUNT PAGE
// ---------------------------------------------------------------------

function AccountPage({ palette, largeText, user, setPage, onLogoutClick }) {
  return (
    <div className="px-5 pt-4 pb-28">
      
      <h1
        style={{
          fontFamily: "Fraunces, serif", color: palette.ink,
          fontSize: largeText ? "2rem" : "1.6rem", fontWeight: 700, marginBottom: 20,
        }}
      >
        Settings and activity
      </h1>

      <button
        onClick={() => setPage("settings")}
        className="w-full flex items-center gap-3 rounded-2xl p-4 mb-8 text-left"
        style={{ background: palette.card, border: `1px solid ${palette.line}` }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: "50%", overflow: "hidden",
            background: palette.paper, border: `1px solid ${palette.line}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          {user.photo_url ? (
            <img src={`${API_BASE}${user.photo_url}`} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Users size={26} color={palette.sub} />
          )}
        </div>
        <div>
          <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.15rem" : "1rem" }}>{user.name}</p>
          <p style={{ color: palette.sub, fontSize: largeText ? "0.95rem" : "0.8rem" }}>
            {user.role === "volunteer" ? "Volunteer" : "Traveller"} · View profile
          </p>
        </div>
      </button>

      <button
        onClick={() => setPage("settings")}
        className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-4 mb-2"
        style={{ background: palette.card, border: `1px solid ${palette.line}`, color: palette.ink, fontSize: largeText ? "1.05rem" : "0.92rem" }}
      >
        <Settings size={20} /> Edit your credentials
      </button>

      <div style={{ marginTop: 32, paddingTop: 20, borderTop: `2px solid ${palette.alert}22` }}>
        <button
          onClick={onLogoutClick}
          className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-4"
          style={{ background: `${palette.alert}14`, color: palette.alert, fontWeight: 700, fontSize: largeText ? "1.1rem" : "0.95rem" }}
        >
          <LogIn size={20} style={{ transform: "rotate(180deg)" }} /> Log out
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// SOS PAGE (separate full page, not a modal)
// ---------------------------------------------------------------------

function SOSPage({ palette, largeText, setPage, emergencyContact }) {
  const [alarmOn, setAlarmOn] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  const startAlarm = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Emergency. I need help. Please assist me.");
      utterance.lang = "en-GB";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    let goingUp = true;
    let freq = 500;
    const interval = setInterval(() => {
      freq = goingUp ? freq + 40 : freq - 40;
      if (freq >= 900) goingUp = false;
      if (freq <= 500) goingUp = true;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
    }, 60);

    audioCtxRef.current = ctx;
    oscillatorRef.current = osc;
    sirenIntervalRef.current = interval;
    setAlarmOn(true);
  };

  const stopAlarm = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch (e) {}
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
    }
    setAlarmOn(false);
  };

  useEffect(() => {
    return () => stopAlarm();
  }, []);

  return (
    <div className="px-5 pt-4 pb-28">
     
       <h1
        style={{
          fontFamily: "Fraunces, serif", color: palette.ink,
          fontSize: largeText ? "2rem" : "1.6rem", fontWeight: 700, marginBottom: 20,
        }}
      >
        Emergency help
      </h1>

     <div style={{ marginTop: 8 }}>
  {!alarmOn ? (
    <button
      onClick={startAlarm}
      style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: palette.alert, color: "#fff", borderRadius: 16, padding: "18px 0", fontWeight: 700, fontSize: largeText ? "1.15rem" : "1rem", border: "none", marginBottom: 16 }}
    >
      🔊 Sound Alarm
    </button>
  ) : (
    <button
      onClick={stopAlarm}
      style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1B2430", color: "#fff", borderRadius: 16, padding: "18px 0", fontWeight: 700, fontSize: largeText ? "1.15rem" : "1rem", border: "none", marginBottom: 16 }}
    >
      ⏹ Stop Alarm
    </button>
  )}
  <button
    onClick={() => { window.location.href = "tel:999"; }}
    style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: palette.alert, color: "#fff", borderRadius: 16, padding: "18px 0", fontWeight: 700, fontSize: largeText ? "1.2rem" : "1.05rem", border: "none", marginBottom: 16 }}
  >
    <Phone size={22} /> Call 999
  </button>

  <button
    onClick={() => {
      if (!emergencyContact?.phone) {
        alert("No emergency contact set. Please add one in Settings first.");
        return;
      }
      if (!navigator.geolocation) {
        alert("Location sharing is not supported on this device.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
          const text = `I need help. My current location: ${url}`;
          window.location.href = `sms:${emergencyContact.phone}?body=${encodeURIComponent(text)}`;
        },
        () => alert("Could not get your location. Please check location permissions.")
      );
    }}
    style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: palette.card, color: palette.ink, border: `1px solid ${palette.line}`, borderRadius: 16, padding: "18px 0", fontWeight: 700, fontSize: largeText ? "1.1rem" : "0.95rem" }}
  >
    Share location {emergencyContact?.name ? `with ${emergencyContact.name}` : "with contact"}
  </button>

  <button
    onClick={() => window.open("https://www.nhs.uk/conditions/first-aid/", "_blank")}
    style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: palette.card, color: palette.ink, border: `1px solid ${palette.line}`, borderRadius: 16, padding: "18px 0", fontWeight: 700, fontSize: largeText ? "1.1rem" : "0.95rem" }}
  >
    First Aid guidance (NHS)
  </button>
</div>

      {!emergencyContact?.phone && (
        <p style={{ color: palette.sub, fontSize: largeText ? "0.95rem" : "0.85rem", marginTop: 16 }}>
          Tip: add an emergency contact in Settings so location sharing works instantly.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------------------

export default function App() {
  const [page, setPage] = useState("home");
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [pendingDestination, setPendingDestination] = useState(null);
  const [user, setUser] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState(null);

  const palette = highContrast
    ? { paper: "#000000", ink: "#FFFFFF", sub: "#E5E5E5", card: "#111111", line: "#FFD400", teal: "#FFD400", gold: "#FFD400", alert: "#FF3B30" }
    : { paper: "#FBF9F5", ink: "#1B2430", sub: "#5B6672", card: "#EFEAE2", line: "#E2DCD1", teal: "#0F6B5C", gold: "#C98A2C", alert: "#B3372C" };

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem("wayfare_token", token);
  };

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("wayfare_token");
    fetch(`${API_BASE}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setEmergencyContact({
            name: data.profile.emergency_contact_name,
            phone: data.profile.emergency_contact_phone,
          });
        }
      })
      .catch(() => {});
  }, [user?.id]);

  if (!user) {
    return (
      <AuthScreen
        palette={palette}
        largeText={largeText}
        setLargeText={setLargeText}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: palette.paper, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", background: palette.paper, fontFamily: "'Atkinson Hyperlegible', sans-serif", position: "relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap');
          button { font-family: inherit; cursor: pointer; }
          input, textarea, select { font-family: inherit; }
          *:focus-visible { outline: 3px solid ${palette.teal}; outline-offset: 2px; }
        `}</style>

        <Header
          largeText={largeText}
          setLargeText={setLargeText}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          palette={palette}
          user={user}
          onAccountClick={() => setPage("account")}
        />

        {page === "home" && (
  <div className="px-5 pt-2" style={{ paddingBottom: 60}}>
            <p style={{ color: palette.ink, fontSize: largeText ? "1.3rem" : "1.1rem", marginBottom: 16 }}>
              Hi! How can I help you today?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
  {FEATURES.map((f) => (
    <FeatureCard key={f.id} f={f} palette={palette} largeText={largeText} onOpen={setPage} user={user} />
  ))}
</div>
          </div>
        )}

       {page === "ai" && (
  <PageShell title="AI Assistant" palette={palette} largeText={largeText} onBack={() => setPage("home")}>
    <AIPage palette={palette} largeText={largeText} />
  </PageShell>
)}
        {page === "navigation" && (
          <PageShell title="Accessible Navigation" palette={palette} largeText={largeText} onBack={() => setPage("home")}>
            <NavigationPage
              palette={palette}
              largeText={largeText}
              pendingDestination={pendingDestination}
              onConsumePending={() => setPendingDestination(null)}
            />
          </PageShell>
        )}

        {page === "places" && (
          <PageShell title="Hotels & Restaurants" palette={palette} largeText={largeText} onBack={() => setPage("home")}>
            <PlacesPage
              palette={palette}
              largeText={largeText}
              onNavigateToPlace={(place) => {
                setPendingDestination(place);
                setPage("navigation");
              }}
            />
          </PageShell>
        )}

        {page === "buddy" && (
          <PageShell
            title={user?.role === "volunteer" ? "Help Requests" : "Travel Buddy"}
            palette={palette}
            largeText={largeText}
            onBack={() => setPage("home")}
          >
            <BuddyPage palette={palette} largeText={largeText} user={user} />
          </PageShell>
        )}

        {page === "settings" && (
          <PageShell title="Settings" palette={palette} largeText={largeText} onBack={() => setPage("home")}>
            <SettingsPage palette={palette} largeText={largeText} user={user} setUser={setUser} />
          </PageShell>
        )}

        {page === "account" && (
          <AccountPage
            palette={palette}
            largeText={largeText}
            user={user}
            setPage={setPage}
            onLogoutClick={() => setLogoutConfirmOpen(true)}
          />
        )}

        {page === "emergency" && (
          <SOSPage palette={palette} largeText={largeText} setPage={setPage} emergencyContact={emergencyContact} />
        )}

        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: palette.paper }}>
              <p style={{ color: palette.ink, fontWeight: 700, fontSize: largeText ? "1.4rem" : "1.2rem", marginBottom: 12 }}>
                Are you sure you want to log out, {user.name.split(" ")[0]}?
              </p>
              <button
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem("wayfare_token");
                  setLogoutConfirmOpen(false);
                  setPage("home");
                }}
                className="w-full rounded-2xl py-4 font-bold mb-3"
                style={{ background: palette.alert, color: "#fff", fontSize: largeText ? "1.15rem" : "1rem" }}
              >
                Yes, log out
              </button>
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="w-full rounded-2xl py-4 font-bold"
                style={{ background: palette.card, color: palette.ink, fontSize: largeText ? "1.15rem" : "1rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <BottomNav page={page} setPage={setPage} palette={palette} largeText={largeText} />
      </div>
    </div>
  );
}
