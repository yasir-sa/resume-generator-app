import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const SuccessInterview = () => {
  const navigate = useNavigate();
  const sparkleRef = useRef(null);

  useEffect(() => {
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#ffffff', '#3b82f6']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#ffffff', '#3b82f6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #050a10 60%, #000000 100%)',
      }}
    >
      {/* Animated grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          animation: 'gridFade 3s ease-in-out infinite alternate',
        }}
      />

      {/* Top glow beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.18) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '15%', left: '10%', color: 'rgba(34,197,94,0.12)', size: 220, delay: '0s' },
          { top: '70%', right: '8%', color: 'rgba(59,130,246,0.10)', size: 180, delay: '1.5s' },
          { top: '50%', left: '5%', color: 'rgba(34,197,94,0.06)', size: 100, delay: '0.8s' },
          { bottom: '20%', left: '20%', color: 'rgba(59,130,246,0.07)', size: 150, delay: '2s' },
        ].map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              filter: 'blur(40px)',
              animation: `float 6s ease-in-out infinite`,
              animationDelay: orb.delay,
            }}
          />
        ))}
      </div>

      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 90 + 5}%`,
              left: `${Math.random() * 90 + 5}%`,
              width: Math.random() > 0.5 ? '3px' : '2px',
              height: Math.random() > 0.5 ? '3px' : '2px',
              borderRadius: '50%',
              background: Math.random() > 0.5 ? '#22c55e' : '#3b82f6',
              animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div
        className="relative z-10 flex flex-col items-center max-w-2xl w-full mx-auto"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '56px 40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 80px rgba(34,197,94,0.06), 0 0 160px rgba(59,130,246,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: '60%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.6), rgba(59,130,246,0.6), transparent)',
            borderRadius: '1px',
          }}
        />

        {/* Success Icon */}
        <div className="mb-8 relative" style={{ animation: 'iconEntry 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)',
              animation: 'pulseGlow 2s ease-in-out infinite',
              transform: 'scale(2)',
            }}
          />
          {/* Ring 1 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid rgba(34,197,94,0.2)',
              animation: 'ringExpand 2s ease-out infinite',
              borderRadius: '50%',
            }}
          />
          {/* Ring 2 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid rgba(34,197,94,0.15)',
              animation: 'ringExpand 2s ease-out infinite 0.5s',
              borderRadius: '50%',
            }}
          />
          {/* Icon circle */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
              boxShadow: '0 0 0 1px rgba(34,197,94,0.3), 0 0 30px rgba(34,197,94,0.5), 0 0 60px rgba(34,197,94,0.2)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="font-extrabold mb-4 tracking-tight"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            background: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 40%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            animation: 'fadeUp 0.7s ease both 0.2s',
          }}
        >
          Congratulations, Yasir! 🎊
        </h1>

        {/* Divider */}
        <div
          className="mb-6"
          style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, #22c55e, #3b82f6)',
            borderRadius: '2px',
            animation: 'fadeUp 0.7s ease both 0.3s',
          }}
        />

        {/* Paragraph */}
        <p
          className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
          style={{
            color: 'rgba(148,163,184,1)',
            animation: 'fadeUp 0.7s ease both 0.4s',
          }}
        >
          Interview submitted successfully! Your performance data and video recording are
          now stored in your profile. You're doing great! 🌟
        </p>

        {/* Button */}
        <div style={{ animation: 'fadeUp 0.7s ease both 0.5s' }}>
          <button
            onClick={() => navigate('/product')}
            className="relative group px-8 py-4 font-bold rounded-full transition-all"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              letterSpacing: '0.02em',
              border: 'none',
              boxShadow: '0 0 0 1px rgba(34,197,94,0.4), 0 4px 24px rgba(34,197,94,0.35)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(34,197,94,0.6), 0 4px 40px rgba(34,197,94,0.55), 0 0 80px rgba(34,197,94,0.2)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(34,197,94,0.4), 0 4px 24px rgba(34,197,94,0.35)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            View Dashboard
          </button>
        </div>

        {/* Bottom corner accents */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: '80px',
            height: '80px',
            borderRight: '1px solid rgba(59,130,246,0.2)',
            borderBottom: '1px solid rgba(59,130,246,0.2)',
            borderBottomRightRadius: '28px',
          }}
        />
        <div
          className="absolute bottom-0 left-0 pointer-events-none"
          style={{
            width: '80px',
            height: '80px',
            borderLeft: '1px solid rgba(34,197,94,0.2)',
            borderBottom: '1px solid rgba(34,197,94,0.2)',
            borderBottomLeftRadius: '28px',
          }}
        />
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(2); }
          50% { opacity: 1; transform: scale(2.3); }
        }
        @keyframes ringExpand {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes iconEntry {
          from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes gridFade {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SuccessInterview;