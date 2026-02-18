import { useState, Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { DroneSwarm, Ground, AmbientParticles } from './components/DroneSwarm/DroneSwarm'
import { FLAGS, getAssetPath } from './components/DroneSwarm/flagData'
import './App.css'

const BACKGROUNDS = [
  { name: 'Night Sky', color: '#000510', showStars: true, isLight: false },
  { name: 'Dark Blue', color: '#0a1628', showStars: true, isLight: false },
  { name: 'Deep Purple', color: '#150520', showStars: true, isLight: false },
  { name: 'Charcoal', color: '#1a1a1a', showStars: false, isLight: false },
  { name: 'Navy', color: '#001133', showStars: true, isLight: false },
  { name: 'Black', color: '#000000', showStars: false, isLight: false },
  { name: 'Deep Space', color: '#0b1026', showStars: true, isLight: false },
]

function App() {
  const [selectedCountry, setSelectedCountry] = useState('usa')
  const [bgIndex, setBgIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const audioRef = useRef(null)

  const currentBg = BACKGROUNDS[bgIndex]

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const countryOptions = Object.entries(FLAGS).map(([code, data]) => ({
    code,
    name: data.name
  })).sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    if (audioRef.current && FLAGS[selectedCountry].anthem) {
      const resolvedPath = getAssetPath(FLAGS[selectedCountry].anthem);
      audioRef.current.src = resolvedPath
      audioRef.current.volume = 0.5

      if (isAudioEnabled) {
        audioRef.current.play().catch(console.warn)
      } else {
        audioRef.current.pause()
      }
    }
  }, [selectedCountry, isAudioEnabled])

  const toggleBackground = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length)
  }

  const toggleAudio = () => {
    const newEnabled = !isAudioEnabled
    setIsAudioEnabled(newEnabled)
    if (newEnabled && audioRef.current) {
      audioRef.current.play().catch(console.warn)
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
  }


  const controlsRef = useRef()

  useEffect(() => {
    if (controlsRef.current) {
      // Force camera position and target reset
      if (isMobile) {
        controlsRef.current.object.position.set(0, 6, 70)
        controlsRef.current.target.set(0, 10, 0)
      } else {
        controlsRef.current.object.position.set(0, 8, 40)
        controlsRef.current.target.set(0, 6, 0)
      }
      controlsRef.current.update()
    }
  }, [selectedCountry, isMobile])

  return (
    <div className={`app ${currentBg.isLight ? 'light-mode' : ''}`} style={{ background: currentBg.color, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
      <Canvas
        className="main-canvas"
        camera={{
          position: isMobile ? [0, 6, 70] : [0, 8, 40],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={[currentBg.color]} />

        {currentBg.showStars && (
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.3} />
        )}

        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 10]} intensity={2} color="#ffffff" />
        <pointLight position={[-15, 10, 10]} intensity={1.5} color="#ffcc00" />
        <pointLight position={[15, 5, -10]} intensity={1} color="#00aaff" />

        <group position={isMobile ? [0, 18, 0] : [-14, 0, 0]}>
          <Suspense fallback={null}>
            {!isMobile && <Ground bgColor={currentBg.color} />}
            <AmbientParticles />
            <DroneSwarm country={selectedCountry} />

            <EffectComposer>
              <Bloom
                luminanceThreshold={0.4}
                mipmapBlur
                intensity={0.8}
                radius={0.3}
              />
            </EffectComposer>
          </Suspense>
        </group>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={120}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.15}
          target={[0, 6, 0]}
        />
      </Canvas>

      <div className="split-layout">
        <div className="left-panel">
          {/* Spacer for 3D content */}
        </div>

        <div className="right-panel">
          <InfoPanel selectedCountry={selectedCountry} />
        </div>
      </div>

      <div className="footer-controls">
        <div className="footer-left">
          <button className="bg-toggle" onClick={toggleBackground}>
            <span className="bg-icon">
              <span className="bg-preview" style={{ background: currentBg.color }}></span>
            </span>
            <span className="bg-text">{currentBg.name}</span>
          </button>

          <button className={`audio-toggle ${isAudioEnabled ? 'active' : ''}`} onClick={toggleAudio} title="Toggle Anthem">
            <span className="audio-icon">{isAudioEnabled ? '🔊' : '🔇'}</span>
            <span className="audio-text">{isAudioEnabled ? 'Mute' : 'Play Anthem'}</span>
          </button>
        </div>

        <div className="footer-center">
          <CustomDropdown
            selected={selectedCountry}
            options={countryOptions}
            onChange={setSelectedCountry}
          />
        </div>

        <div className="footer-right">
          <p className="hint">Drag to rotate | Scroll to zoom</p>
        </div>
      </div>

      <audio ref={audioRef} />
    </div>
  )
}

function InfoPanel({ selectedCountry }) {
  const data = FLAGS[selectedCountry]

  const getCountryTime = (timezone) => {
    if (!timezone) return 'N/A'
    return new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const [currentTime, setCurrentTime] = useState(getCountryTime(data?.timezone))

  useEffect(() => {
    if (!data?.timezone) return

    // Update immediately on country change
    setCurrentTime(getCountryTime(data.timezone))

    const timer = setInterval(() => {
      setCurrentTime(getCountryTime(data.timezone))
    }, 1000)
    return () => clearInterval(timer)
  }, [selectedCountry, data])

  if (!data) return null

  return (
    <div className="info-content">
      <h1 className="big-country-name">{data.name}</h1>
      <div className="info-separator-large"></div>

      <div className="big-info-grid">
        <div className="big-info-item">
          <span className="big-info-label">Capital</span>
          <span className="big-info-value">{data.capital || 'N/A'}</span>
        </div>
        <div className="big-info-item">
          <span className="big-info-label">Population</span>
          <span className="big-info-value">{data.population || 'N/A'}</span>
        </div>
        <div className="big-info-item">
          <span className="big-info-label">GDP</span>
          <span className="big-info-value">{data.gdp || 'N/A'}</span>
        </div>
        <div className="big-info-item">
          <span className="big-info-label">Date & Time</span>
          <span className="big-info-value" style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{currentTime}</span>
        </div>
        <div className="big-info-item">
          <span className="big-info-label">Arrival Card</span>
          {data.dacUrl ? (
            <a href={data.dacUrl} target="_blank" rel="noopener noreferrer" className="big-info-value" style={{ fontSize: '1rem', color: '#64c8ff', textDecoration: 'underline', cursor: 'pointer', display: 'inline-block' }}>
              Official Site <span style={{ fontSize: '0.8em' }}>↗</span>
            </a>
          ) : (
            <span className="big-info-value" style={{ fontSize: '1rem', opacity: 0.7 }}>Not Required</span>
          )}
        </div>
      </div>

    </div>
  )
}

function CustomDropdown({ selected, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selectedData = FLAGS[selected]

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="trigger-content">
          <span className="country-name">{selectedData ? selectedData.name : 'Select Country'}</span>
        </div>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li
              key={option.code}
              className={`dropdown-item ${selected === option.code ? 'active' : ''}`}
              onClick={() => {
                onChange(option.code)
                setIsOpen(false)
              }}
            >
              <span>{option.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
