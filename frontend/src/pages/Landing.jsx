import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#0D1117'}}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-1">
          <img src={logo} alt="Finspect" className="h-10 md:h-14 w-auto" />
          <div className="flex flex-col -ml-6 md:-ml-8">
            <span className="font-bold text-lg md:text-xl leading-tight" style={{color: '#4ECDC4'}}>
              Fin<span style={{color: '#6C63FF'}}>spect</span>
            </span>
            <span className="text-xs tracking-widest font-semibold pb-1 border-b border-purple-400" style={{color: '#7B6FD4'}}>
              INSPECT YOUR FINANCES
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <Link to="/login" className="text-sm text-white hover:text-gray-400">
            Sign in
          </Link>
          <Link to="/register" className="text-sm bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#94fff8] text-[#0a5752] text-xs md:text-sm px-4 py-1.5 rounded-full mb-6">
          🤖 AI-powered expense intelligence
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Your personal<br />
          <span style={{color: '#4ECDC4'}}>expense detective</span>
        </h1>
        <p className="text-base md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Finspect analyzes your spending patterns, detects anomalies, and
          delivers AI-powered insights that tell you not just where your money
          went — but why.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-base font-medium text-center">
            Start for free →
          </Link>
          <Link to="/login" className="w-full sm:w-auto text-white hover:text-gray-400 px-8 py-3 rounded-xl text-base border border-gray-700 hover:border-gray-500 text-center">
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔍",
              title: "Anomaly Detection",
              desc: "Automatically flags unusual spending patterns before they become problems.",
            },
            {
              icon: "🤖",
              title: "AI Detective Report",
              desc: "Get plain-English insights powered by AI — not just charts and numbers.",
            },
            {
              icon: "📊",
              title: "Visual Analytics",
              desc: "Beautiful charts showing category breakdowns and daily spending trends.",
            },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-6 border border-gray-700" style={{backgroundColor: '#161B22'}}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-4 md:px-8 py-6 text-center">
        <p className="text-sm text-gray-600">© 2026 Finspect. Built with ❤️ for smart spenders.</p>
      </div>
    </div>
  );
}