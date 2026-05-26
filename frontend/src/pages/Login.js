import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { motion } from 'framer-motion';

const LoginDrone = ({ onAngryChange }) => {
  const [dronePos, setDronePos] = useState({ x: 0, y: 0, rotate: 0 });
  const [isRunningOff, setIsRunningOff] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });
  const returnTimer = useRef(null);
  const warningTimer = useRef(null);
  const isRunningOffRef = useRef(false);
  const orbitAngleRef = useRef(0);
  const orbitIntervalRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const stageElement = stageRef.current;
    if (!stageElement) return undefined;

    const updateStageSize = () => {
      const rect = stageElement.getBoundingClientRect();
      setStageSize({ width: rect.width || 1, height: rect.height || 1 });
    };

    updateStageSize();
    const observer = new ResizeObserver(updateStageSize);
    observer.observe(stageElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getRandomDronePos = useCallback(() => {
    const maxX = Math.max(0, stageSize.width - 110);
    const maxY = Math.max(0, stageSize.height - 70);
    return {
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      rotate: Math.floor(Math.random() * 24) - 12,
    };
  }, [stageSize.height, stageSize.width]);

  useEffect(() => {
    const moveDrone = () => {
      if (isRunningOffRef.current) return;
      setDronePos(getRandomDronePos());
    };

    moveDrone();
    const interval = window.setInterval(moveDrone, 2800);
    return () => {
      window.clearInterval(interval);
      if (orbitIntervalRef.current) window.clearInterval(orbitIntervalRef.current);
      if (returnTimer.current) window.clearTimeout(returnTimer.current);
    };
  }, [getRandomDronePos]);

  useEffect(() => {
    if (!isRunningOff) return undefined;

    if (orbitIntervalRef.current) {
      window.clearInterval(orbitIntervalRef.current);
    }

    const orbitCenter = { x: Math.max(55, stageSize.width / 2 - 46), y: Math.max(35, stageSize.height / 2 - 29) };
    const orbitRadius = Math.max(26, Math.min(stageSize.width, stageSize.height) / 2 - 58);

    orbitIntervalRef.current = window.setInterval(() => {
      orbitAngleRef.current += 0.7;
      setDronePos({
        x: orbitCenter.x + Math.cos(orbitAngleRef.current) * orbitRadius,
        y: orbitCenter.y + Math.sin(orbitAngleRef.current) * orbitRadius,
        rotate: (orbitAngleRef.current * 42) % 360,
      });
    }, 16);

    const stopOrbitTimer = window.setTimeout(() => {
      if (orbitIntervalRef.current) {
        window.clearInterval(orbitIntervalRef.current);
        orbitIntervalRef.current = null;
      }
    }, 1000);

    return () => {
      window.clearTimeout(stopOrbitTimer);
      if (orbitIntervalRef.current) window.clearInterval(orbitIntervalRef.current);
    };
  }, [isRunningOff, stageSize.height, stageSize.width]);

  const handleDroneClick = () => {
    if (returnTimer.current) {
      window.clearTimeout(returnTimer.current);
    }

    setIsRunningOff(true);
    isRunningOffRef.current = true;
    onAngryChange(true);
    setShowWarning(true);
    if (warningTimer.current) {
      window.clearTimeout(warningTimer.current);
    }
    orbitAngleRef.current = 0;
    setDronePos({
      x: Math.max(0, stageSize.width / 2 - 46),
      y: Math.max(0, stageSize.height / 2 - 29),
      rotate: 0,
    });

    warningTimer.current = window.setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    returnTimer.current = window.setTimeout(() => {
      setIsRunningOff(false);
      isRunningOffRef.current = false;
      setDronePos(getRandomDronePos());
      onAngryChange(false);
    }, 3000);
  };

  return (
    <div ref={stageRef} style={styles.droneStage} aria-hidden="true">
      <motion.div
        style={styles.droneHitArea}
        type="button"
        animate={{ x: dronePos.x, y: dronePos.y, rotate: dronePos.rotate, scale: isRunningOff ? 1.12 : 1 }}
        transition={isRunningOff ? { type: 'tween', ease: 'linear', duration: 0.016 } : { type: 'spring', stiffness: 70, damping: 16 }}
        onClick={handleDroneClick}
        onPointerDown={handleDroneClick}
        onTouchStart={handleDroneClick}
      >
        <div style={styles.drone}>
          <div style={styles.droneTop}>
            <span style={styles.droneLens} />
            <span style={styles.droneLens} />
            <span style={styles.droneLens} />
          </div>
          <div style={styles.droneBody}>
            <span style={styles.droneLabel}>dont touch</span>
          </div>
          <div style={styles.droneBottom}>
            <span style={styles.droneLeg} />
            <span style={styles.droneLeg} />
          </div>
          {showWarning && (
            <motion.div
              style={styles.droneSpeechCloud}
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span style={styles.droneSpeechText}>i said dont touch me</span>
            </motion.div>
          )}
          <motion.div
            style={styles.dronePulse}
            animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

const LoginRobotScene = ({ hideEyes, cursorPos, isAngry, robotSpeech, onRobotTouch }) => {
  const aimPupil = (anchorX, anchorY) => {
    if (hideEyes) return { transform: 'translate(0px, 0px)', opacity: 0 };

    const dx = cursorPos.x - anchorX;
    const dy = cursorPos.y - anchorY;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const offsetX = Math.max(-5, Math.min(5, (dx / distance) * 5));
    const offsetY = Math.max(-5, Math.min(5, (dy / distance) * 5));
    return { transform: `translate(${offsetX}px, ${offsetY}px)` };
  };

  const angryBigMotion = {
    x: [0, -8, 10, -6, 8, 0],
    y: [0, -12, 6, -10, 8, 0],
    rotate: [0, -8, 10, -6, 8, 0],
  };

  const angrySmallMotion = {
    x: [0, 10, -12, 8, -6, 0],
    y: [0, -10, 8, -6, 10, 0],
    rotate: [0, 10, -12, 8, -6, 0],
  };

  return (
    <div style={styles.robotStage} aria-hidden="true">
      <motion.div
        style={{ ...styles.robotGlow, ...(isAngry ? styles.robotGlowAngry : null) }}
        animate={isAngry ? { opacity: [0.7, 1, 0.7], scale: [1, 1.15, 1] } : { opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.08, 0.95] }}
        transition={isAngry ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut' } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.button
        type="button"
        style={styles.botTouchLarge}
        aria-label="Touch the large robot"
        onClick={onRobotTouch}
        onPointerDown={onRobotTouch}
        onTouchStart={onRobotTouch}
      >
        <motion.div
          style={styles.botLarge}
          animate={isAngry ? angryBigMotion : { y: [0, -12, 0], rotate: [0, -2, 0] }}
          transition={isAngry ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{ ...styles.botAntenna, ...(isAngry ? styles.botAntennaAngry : null) }} />
          <div style={{ ...styles.botHead, ...(isAngry ? styles.botHeadAngry : null) }}>
            <span style={{ ...styles.botEye, ...(isAngry ? styles.botEyeAngry : null), ...(hideEyes ? styles.botEyeHidden : null) }}>
              <span style={{ ...styles.botPupil, ...(isAngry ? styles.botPupilAngry : null), ...aimPupil(176, 104) }} />
            </span>
            <span style={{ ...styles.botEye, ...(isAngry ? styles.botEyeAngry : null), ...(hideEyes ? styles.botEyeHidden : null) }}>
              <span style={{ ...styles.botPupil, ...(isAngry ? styles.botPupilAngry : null), ...aimPupil(193, 104) }} />
            </span>
          </div>
          <div style={{ ...styles.botBody, ...(isAngry ? styles.botBodyAngry : null) }}>
            <span style={{ ...styles.botArm, ...(isAngry ? styles.botArmAngry : null) }} />
            <span style={{ ...styles.botCore, ...(isAngry ? styles.botCoreAngry : null) }} />
            <span style={{ ...styles.botArm, ...(isAngry ? styles.botArmAngry : null) }} />
          </div>
        </motion.div>
      </motion.button>

      <motion.button
        type="button"
        style={styles.botTouchSmall}
        aria-label="Touch the small robot"
        onClick={onRobotTouch}
        onPointerDown={onRobotTouch}
        onTouchStart={onRobotTouch}
      >
        <motion.div
          style={styles.botSmall}
          animate={isAngry ? angrySmallMotion : { x: [0, 14, 0, -10, 0], y: [0, -8, 0, -4, 0], rotate: [0, 6, 0, -4, 0] }}
          transition={isAngry ? { duration: 0.38, repeat: Infinity, ease: 'easeInOut' } : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{ ...styles.botSmallHead, ...(isAngry ? styles.botSmallHeadAngry : null) }}>
            <span style={{ ...styles.botSmallEye, ...(isAngry ? styles.botSmallEyeAngry : null), ...(hideEyes ? styles.botEyeHidden : null) }}>
              <span style={{ ...styles.botSmallPupil, ...(isAngry ? styles.botPupilAngry : null), ...aimPupil(122, 147) }} />
            </span>
            <span style={{ ...styles.botSmallEye, ...(isAngry ? styles.botSmallEyeAngry : null), ...(hideEyes ? styles.botEyeHidden : null) }}>
              <span style={{ ...styles.botSmallPupil, ...(isAngry ? styles.botPupilAngry : null), ...aimPupil(134, 147) }} />
            </span>
          </div>
          <div style={{ ...styles.botSmallTail, ...(isAngry ? styles.botSmallTailAngry : null) }} />
        </motion.div>
      </motion.button>

      {robotSpeech && (
        <motion.div
          style={styles.robotSpeechCloud}
          initial={{ opacity: 0, scale: 0.88, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span style={styles.robotSpeechText}>{robotSpeech}</span>
        </motion.div>
      )}

      <motion.div
        style={{ ...styles.botPebble1, ...(isAngry ? styles.botPebbleAngry : null) }}
        animate={isAngry ? { y: [0, -10, 0], x: [0, 4, -4, 0], opacity: [0.75, 1, 0.75] } : { y: [0, -16, 0], opacity: [0.55, 1, 0.55] }}
        transition={isAngry ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut' } : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{ ...styles.botPebble2, ...(isAngry ? styles.botPebbleAngry : null) }}
        animate={isAngry ? { y: [0, 10, 0], x: [0, -4, 4, 0], opacity: [0.75, 1, 0.75] } : { y: [0, 14, 0], opacity: [0.45, 0.95, 0.45] }}
        transition={isAngry ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut', delay: 0.08 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
    </div>
  );
};

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Button run away logic
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [isTrolling, setIsTrolling] = useState(false);
  const [activeField, setActiveField] = useState('email');
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isAngry, setIsAngry] = useState(false);
  const [robotSpeech, setRobotSpeech] = useState('');
  const robotSpeechTimer = useRef(null);
  
  const isFormValid = form.email.length > 5 && form.password.length > 3;
  const hideRobotEyes = activeField === 'password';

  const handleRobotTouch = useCallback(() => {
    if (robotSpeechTimer.current) {
      window.clearTimeout(robotSpeechTimer.current);
    }

    setRobotSpeech('poi work aha paru !');
    robotSpeechTimer.current = window.setTimeout(() => {
      setRobotSpeech('');
    }, 2400);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setCursorPos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => () => {
    if (robotSpeechTimer.current) {
      window.clearTimeout(robotSpeechTimer.current);
    }
  }, []);

  const handleButtonHover = (e) => {
    // If invalid, ALWAYS dodge. If valid, force them to chase it 5 times!
    if (!isFormValid || dodgeCount < 5) {
      
      // Calculate a safe jump that keeps the button on-screen
      // The button is in the right pane, we can jump it far to the left (into the green area)
      // Or jump it up/down safely.
      const minX = -(window.innerWidth - 600); // Don't go past left edge of screen
      const maxX = 50; // Don't go too far right off screen
      const minY = -250; // Don't go too far up
      const maxY = 250; // Don't go too far down
      
      let jumpX = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 200) + 150);
      let jumpY = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 150) + 100);
      
      let targetX = btnPos.x + jumpX;
      let targetY = btnPos.y + jumpY;
      
      // Clamp values to keep it on-screen
      if (targetX > maxX) targetX = Math.random() * minX / 2; // Throw it far left
      if (targetX < minX) targetX = Math.random() * maxX;     // Throw it back right
      if (targetY > maxY) targetY = minY + Math.random() * 100;
      if (targetY < minY) targetY = maxY - Math.random() * 100;

      setBtnPos({ x: targetX, y: targetY });
      
      if (isFormValid) {
        setDodgeCount(prev => prev + 1);
      } else {
        setDodgeCount(0); // Reset chase count if they make it invalid again
      }
    } else {
      setBtnPos({ x: 0, y: 0 });
    }
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setActiveField(e.target.name);
    // Removed the auto-reset so the button doesn't magically come back easily.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill in the fields correctly!");
      return; 
    }
    
    // Troll intercept!
    setIsTrolling(true);
    
    // Wait 2 seconds showing the troll message on the button
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsTrolling(false);
    setLoading(true);

    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      sessionStorage.setItem('innovatex-show-dashboard-robot', '1');
      sessionStorage.setItem('innovatex-dashboard-robot-enabled', '1');
      toast.success('vanakkam');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div
        style={styles.left}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setCursorPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }}
      >
        <div style={styles.brand}>
          <div style={styles.logo}>IX</div>
          <h1 style={styles.brandName}>InnovateX</h1>
          <p style={styles.brandTagline}>
            Unified Student Collaboration & Performance Platform
          </p>
        </div>
        <div style={styles.features}>
          {['Task Management', 'AP & RP Tracking', 'Team Leaderboard',
            'Real-time Chat', 'Project Tracking'].map(f => (
            <div key={f} style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>{f}</span>
            </div>
          ))}
        </div>
        <LoginRobotScene hideEyes={hideRobotEyes} cursorPos={cursorPos} isAngry={isAngry} robotSpeech={robotSpeech} onRobotTouch={handleRobotTouch} />
        <LoginDrone onAngryChange={setIsAngry} />
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Access your InnovateX account</p>
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="name@innovatex.ac.in"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Enter your phone number"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div style={{ position: 'relative', height: '54px', marginTop: '32px' }}>
               <motion.button
                type="button" 
                onClick={handleSubmit} // Using onClick instead of type="submit" so it doesn't try to submit if it moves away
                disabled={loading}
                onMouseEnter={handleButtonHover}
                animate={{ x: btnPos.x, y: btnPos.y }}
                whileTap={isFormValid ? { scale: 0.85, rotate: -2 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  ...styles.button,
                  background: isFormValid ? 'var(--primary)' : '#94a3b8',
                  cursor: isFormValid ? 'pointer' : 'default',
                  position: 'absolute',
                  width: '100%'
                }}
              >
                {isTrolling ? 'sorry la solla mudiathu' : (loading ? 'Signing in...' : 'Sign In')}
              </motion.button>
            </div>
          </form>
          <p style={styles.hint}>
            Use your InnovateX email and phone number as password
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
    overflow: 'hidden' // Prevent scrollbars when button runs away
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #ecfdf3 0%, #d9fbe4 100%)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '60px', color: '#fff',
    position: 'relative', overflow: 'hidden'
  },
  brand: { marginBottom: '50px', zIndex: 1, pointerEvents: 'none' },
  logo: {
    width: '64px', height: '64px',
    background: 'rgba(255,255,255,0.65)', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '700', color: 'var(--primary-dark)',
    marginBottom: '20px', border: '2px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)'
  },
  brandName: {
    fontSize: '42px', fontWeight: '800',
    margin: '0 0 10px', color: '#0f5132',
    letterSpacing: '-1px'
  },
  brandTagline: {
    fontSize: '16px', color: '#14532d',
    margin: 0, lineHeight: '1.6', maxWidth: '340px'
  },
  features: { display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1, pointerEvents: 'none' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  featureDot: {
    width: '10px', height: '10px',
    background: '#0f5132', borderRadius: '50%',
    boxShadow: '0 0 10px rgba(15,81,50,0.2)'
  },
  featureText: { fontSize: '16px', color: '#14532d', fontWeight: '600' },
  robotStage: {
    position: 'absolute',
    right: '-8px',
    bottom: '20px',
    width: '280px',
    height: '240px',
    pointerEvents: 'auto',
    zIndex: 8
  },
  robotSpeechCloud: {
    position: 'absolute',
    right: '24px',
    top: '26px',
    minWidth: '140px',
    maxWidth: '180px',
    padding: '10px 14px',
    borderRadius: '18px',
    background: '#fff',
    border: '2px solid rgba(15,81,50,0.22)',
    boxShadow: '0 12px 18px rgba(15,81,50,0.09)',
    zIndex: 4,
    pointerEvents: 'none'
  },
  robotSpeechText: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '800',
    lineHeight: '1.3',
    textAlign: 'center',
    color: '#0f5132'
  },
  droneStage: {
    position: 'absolute',
    inset: '0',
    overflow: 'hidden',
    pointerEvents: 'auto',
    zIndex: 6
  },
  droneHitArea: {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '182px',
    height: '132px',
    border: 'none',
    background: 'transparent',
    padding: '26px 24px',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'pointer',
    touchAction: 'manipulation'
  },
  drone: {
    position: 'relative',
    width: '92px',
    height: '58px',
    filter: 'drop-shadow(0 16px 18px rgba(15,81,50,0.12))'
  },
  droneTop: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '2px'
  },
  droneLens: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#0f5132',
    boxShadow: '0 0 12px rgba(16,185,129,0.35)'
  },
  droneBody: {
    width: '92px',
    height: '28px',
    borderRadius: '16px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(220,252,231,0.9) 100%)',
    border: '1.5px solid rgba(15,81,50,0.18)'
  },
  droneLabel: {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.4px',
    color: '#0f5132',
    textTransform: 'lowercase',
    pointerEvents: 'none'
  },
  droneSpeechCloud: {
    position: 'absolute',
    left: '-6px',
    top: '-34px',
    minWidth: '132px',
    maxWidth: '160px',
    padding: '10px 14px',
    background: '#fff',
    border: '2px solid rgba(15,81,50,0.22)',
    borderRadius: '18px',
    boxShadow: '0 10px 18px rgba(15,81,50,0.08)',
    zIndex: 3,
    pointerEvents: 'none'
  },
  droneSpeechText: {
    display: 'block',
    fontSize: '11px',
    lineHeight: '1.3',
    fontWeight: '800',
    color: '#0f5132',
    textAlign: 'center',
    textTransform: 'none'
  },
  droneBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 10px',
    marginTop: '3px'
  },
  droneLeg: {
    width: '10px',
    height: '14px',
    borderRadius: '999px',
    background: 'rgba(15,81,50,0.9)'
  },
  dronePulse: {
    position: 'absolute',
    right: '-10px',
    top: '-8px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid rgba(15,81,50,0.18)',
    boxShadow: '0 0 0 8px rgba(16,185,129,0.08)'
  },
  robotGlow: {
    position: 'absolute',
    right: '12px',
    bottom: '0',
    width: '170px',
    height: '170px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.08) 40%, rgba(16,185,129,0) 72%)',
    filter: 'blur(2px)'
  },
  robotGlowAngry: {
    background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0.12) 40%, rgba(239,68,68,0) 72%)',
  },
  botLarge: {
    position: 'absolute',
    right: '34px',
    bottom: '26px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '14px 16px 14px 16px',
    borderRadius: '26px',
    pointerEvents: 'auto',
    cursor: 'pointer',
    filter: 'drop-shadow(0 18px 24px rgba(15, 81, 50, 0.12))'
  },
  botTouchLarge: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    width: '172px',
    height: '198px',
    border: 'none',
    background: 'transparent',
    padding: '0',
    margin: '0',
    pointerEvents: 'auto',
    cursor: 'pointer',
    touchAction: 'manipulation'
  },
  botAntenna: {
    width: '6px',
    height: '18px',
    borderRadius: '999px',
    background: '#0f5132',
    marginBottom: '-3px'
  },
  botAntennaAngry: {
    background: '#b91c1c'
  },
  botHead: {
    width: '72px',
    height: '58px',
    borderRadius: '18px 18px 14px 14px',
    background: '#ffffff',
    border: '2px solid rgba(15,81,50,0.28)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  botHeadAngry: {
    background: 'linear-gradient(180deg, #fee2e2 0%, #fecaca 100%)',
    border: '2px solid #ef4444'
  },
  botEye: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#0f5132',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 0 0 4px rgba(16,185,129,0.08)'
  },
  botEyeAngry: {
    background: '#7f1d1d',
    boxShadow: '0 0 0 4px rgba(239,68,68,0.15)'
  },
  botPupil: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#fff'
  },
  botPupilAngry: {
    background: '#dc2626'
  },
  botEyeHidden: {
    opacity: 0,
    transform: 'scale(0.2)'
  },
  botBody: {
    width: '92px',
    height: '74px',
    marginTop: '8px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.9)',
    border: '2px solid rgba(15,81,50,0.24)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 8px 12px'
  },
  botBodyAngry: {
    background: 'linear-gradient(180deg, #fff1f2 0%, #fee2e2 100%)',
    border: '2px solid #ef4444'
  },
  botArm: {
    width: '10px',
    height: '34px',
    borderRadius: '999px',
    background: '#0f5132'
  },
  botArmAngry: {
    background: '#b91c1c'
  },
  botCore: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%)',
    border: '2px solid rgba(15,81,50,0.15)'
  },
  botCoreAngry: {
    background: 'linear-gradient(180deg, #fecaca 0%, #fca5a5 100%)',
    border: '2px solid #dc2626'
  },
  botSmall: {
    position: 'absolute',
    right: '180px',
    bottom: '92px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 14px 10px',
    borderRadius: '22px',
    pointerEvents: 'auto',
    cursor: 'pointer'
  },
  botTouchSmall: {
    position: 'absolute',
    right: '146px',
    bottom: '64px',
    width: '118px',
    height: '118px',
    border: 'none',
    background: 'transparent',
    padding: '0',
    margin: '0',
    pointerEvents: 'auto',
    cursor: 'pointer',
    touchAction: 'manipulation'
  },
  botSmallHead: {
    width: '44px',
    height: '36px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.82)',
    border: '1.5px solid rgba(15,81,50,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  botSmallHeadAngry: {
    background: 'linear-gradient(180deg, #fee2e2 0%, #fecaca 100%)',
    border: '1.5px solid #ef4444'
  },
  botSmallEye: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#0f5132'
  },
  botSmallEyeAngry: {
    background: '#7f1d1d'
  },
  botSmallPupil: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#fff'
  },
  botSmallTail: {
    width: '18px',
    height: '12px',
    marginTop: '4px',
    borderRadius: '999px',
    background: 'rgba(15,81,50,0.14)'
  },
  botSmallTailAngry: {
    background: 'rgba(239,68,68,0.25)'
  },
  botPebble1: {
    position: 'absolute',
    right: '116px',
    bottom: '150px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'rgba(15,81,50,0.32)'
  },
  botPebble2: {
    position: 'absolute',
    right: '78px',
    bottom: '184px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(16,185,129,0.44)'
  },
  botPebbleAngry: {
    background: '#f87171'
  },
  right: {
    width: '500px', background: 'var(--muted-2)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '40px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)', 
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '48px 40px', width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.5)'
  },
  title: {
    fontSize: '32px', fontWeight: '800',
    color: 'var(--text)', margin: '0 0 8px'
  },
  subtitle: { fontSize: '15px', color: 'var(--muted-text)', margin: '0 0 32px' },
  field: { marginBottom: '24px' },
  label: {
    display: 'block', fontSize: '14px',
    fontWeight: '600', color: 'var(--text)', marginBottom: '8px'
  },
  input: {
    width: '100%', padding: '14px 16px',
    borderRadius: '12px', border: '2px solid var(--card-border)',
    fontSize: '15px', color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
    transition: 'all 0.2s ease',
  },
  button: {
    padding: '14px',
    color: '#fff',
    border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
    outline: 'none',
    height: '100%',
  },
  hint: {
    fontSize: '13px', color: 'var(--muted-text)',
    textAlign: 'center', marginTop: '24px'
  }
};

export default Login;