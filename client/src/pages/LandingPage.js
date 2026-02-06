import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Zap,
  Users,
  MessageCircle,
  CreditCard,
  Shield,
  CalendarDays,
  ArrowRight,
  Award,
  Target,
  Sparkles,
  TrendingUp,
} from "lucide-react";

/* ================= FEATURES ================= */

const features = [
  {
    icon: <Zap size={24} />,
    title: "Instant Event Joining",
    desc: "Participants can join events instantly using a unique event code. No manual approvals, no delays, and no confusion.",
  },
  {
    icon: <Users size={24} />,
    title: "Structured Role Hierarchy",
    desc: "Clearly defined roles including Event Heads, Sub-heads, and Volunteers ensure smooth coordination and responsibility management.",
  },
  {
    icon: <MessageCircle size={24} />,
    title: "Real-Time Communication",
    desc: "Built-in chat and announcements keep every team member informed, connected, and updated throughout the event lifecycle.",
  },
  {
    icon: <CreditCard size={24} />,
    title: "Contribution Tracking",
    desc: "Track volunteer contributions and event payments in one place with clear visibility and organized records.",
  },
  {
    icon: <Shield size={24} />,
    title: "Role-Based Access Control",
    desc: "Every participant only sees tools and information relevant to their responsibilities, ensuring security and clarity.",
  },
  {
    icon: <CalendarDays size={24} />,
    title: "Flexible Event Management",
    desc: "Manage small gatherings or large multi-committee festivals with a scalable and customizable event structure.",
  },
];

/* ================= USE CASES ================= */

const useCases = [
  {
    icon: <Award size={20} />,
    title: "College Events & Tech Fests",
    desc: "Handle multiple committees, hundreds of volunteers, and complex event structures effortlessly.",
  },
  {
    icon: <Target size={20} />,
    title: "NGO & Social Campaigns",
    desc: "Coordinate volunteers, manage responsibilities, and track contributions transparently.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Corporate & Professional Events",
    desc: "Maintain structured workflows and professional communication across teams.",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Community Meetups",
    desc: "Quickly organize local events with simple onboarding and easy coordination.",
  },
];

/* ================= HOW IT WORKS ================= */

const howItWorks = [
  {
    step: "1",
    title: "Create Your Event",
    desc: "Set up your event and receive a unique event join code instantly.",
    icon: <CalendarDays size={24} />,
  },
  {
    step: "2",
    title: "Invite Participants",
    desc: "Share the event code so volunteers and participants can join immediately.",
    icon: <Users size={24} />,
  },
  {
    step: "3",
    title: "Organize Teams",
    desc: "Create committees, assign sub-heads, and send announcements to manage teams effectively.",
    icon: <MessageCircle size={24} />,
  },
  {
    step: "4",
    title: "Coordinate & Execute",
    desc: "Track volunteers, communicate in real time, and manage contributions smoothly.",
    icon: <Zap size={24} />,
  },
];

/* ================= STATS ================= */

const stats = [
  { number: "0", label: "Approval Steps", sublabel: "Instant joining" },
  { number: "3", label: "User Roles", sublabel: "Clear hierarchy" },
  { number: "∞", label: "Volunteers", sublabel: "Scalable system" },
  { number: "100%", label: "Coordination", sublabel: "Real-time updates" },
];

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "100px 24px 60px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
          }}
        >
          Smart Event Coordination
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Made Simple
          </span>
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: 620,
            marginTop: 20,
            lineHeight: 1.7,
          }}
        >
          EventManager is a centralized platform that helps organizers create,
          manage, and coordinate events effortlessly. From volunteer onboarding
          to team communication and contribution tracking — everything happens
          in one organized system.
        </p>

        <div style={{ marginTop: 36 }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: 50 }}>
            Powerful Features Built for Events
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {features.map((f) => (
              <div key={f.title} className="glass-card" style={{ padding: 28 }}>
                {f.icon}
                <h3 style={{ marginTop: 14 }}>{f.title}</h3>
                <p style={{ marginTop: 6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: 50 }}>
            Perfect for Every Event Type
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="glass-card"
                style={{ padding: 26 }}
              >
                {uc.icon}
                <h4 style={{ marginTop: 10 }}>{uc.title}</h4>
                <p>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2>Ready to Organize Events Smarter?</h2>
          <p style={{ marginTop: 12 }}>
            Start managing volunteers, communication, and coordination from one
            powerful dashboard.
          </p>

          {!user && (
            <Link to="/register" className="btn btn-primary">
              Get Started Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
