import { useState, Suspense, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { QRCodeSVG } from 'qrcode.react'
import { DroneSwarm, Ground, AmbientParticles } from './components/DroneSwarm/DroneSwarm'
import { FLAGS, getAssetPath } from './components/DroneSwarm/flagData'
import './App.css'

const BACKGROUNDS = [
  { name: 'Slate', color: '#2d3a4d', showStars: true, isLight: false },
  { name: 'Night Sky', color: '#000510', showStars: true, isLight: false },
  { name: 'Dark Blue', color: '#0a1628', showStars: true, isLight: false },
  { name: 'Deep Purple', color: '#150520', showStars: true, isLight: false },
  { name: 'Charcoal', color: '#1a1a1a', showStars: false, isLight: false },
  { name: 'Navy', color: '#001133', showStars: true, isLight: false },
  { name: 'Black', color: '#000000', showStars: false, isLight: false },
  { name: 'Deep Space', color: '#0b1026', showStars: true, isLight: false },
]

function App() {
  const [selectedCountry, setSelectedCountry] = useState('argentina')
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
        controlsRef.current.object.position.set(0, 10, 85)
        controlsRef.current.target.set(0, 18, 0)
      } else {
        controlsRef.current.object.position.set(0, 8, 40)
        controlsRef.current.target.set(0, 6, 0)
      }
      controlsRef.current.update()
      if (controlsRef.current.saveState) controlsRef.current.saveState()
    }
  }, [selectedCountry, isMobile])

  return (
    <div className={`app ${currentBg.isLight ? 'light-mode' : ''}`} style={{ background: currentBg.color, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
      <Canvas
        className="main-canvas"
        camera={{
          position: isMobile ? [0, 10, 85] : [0, 8, 40],
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

        <group position={isMobile ? [0, 36, 0] : [-14, 0, 0]} scale={isMobile ? 0.8 : 1}>
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
          target={isMobile ? [0, 18, 0] : [0, 6, 0]}
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
        </div>

        <div className="footer-center">
          <CustomDropdown
            selected={selectedCountry}
            options={countryOptions}
            onChange={setSelectedCountry}
          />
        </div>

        <div className="footer-right">
          <button className={`audio-toggle ${isAudioEnabled ? 'active' : ''}`} onClick={toggleAudio} title="Toggle Anthem">
            <span className="audio-icon">{isAudioEnabled ? '🔊' : '🔇'}</span>
          </button>
        </div>
      </div>

      <audio ref={audioRef} />
    </div>
  )
}

const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Icy Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy Drizzle', icon: '🌧️' },
  61: { label: 'Light Rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Light Snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  77: { label: 'Snow Grains', icon: '🌨️' },
  80: { label: 'Light Showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Heavy Showers', icon: '⛈️' },
  85: { label: 'Snow Showers', icon: '🌨️' },
  86: { label: 'Heavy Snow Showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm w/ Hail', icon: '⛈️' },
  99: { label: 'Thunderstorm w/ Hail', icon: '⛈️' },
}

function InfoPanel({ selectedCountry }) {
  const data = FLAGS[selectedCountry]
  const [showQRModal, setShowQRModal] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState(false)

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

  const [currentTime, setCurrentTime] = useState(() => getCountryTime(data?.timezone))

  useEffect(() => {
    if (!data?.timezone) return
    const timer = setInterval(() => {
      setCurrentTime(getCountryTime(data.timezone))
    }, 1000)
    return () => clearInterval(timer)
  }, [data?.timezone])

  // Reset flip when country changes
  useEffect(() => {
    setIsFlipped(false)
    setWeather(null)
    setWeatherError(false)
  }, [selectedCountry])

  // Fetch weather when flipped
  useEffect(() => {
    if (!isFlipped || weather || !data?.capital) return
    setWeatherLoading(true)
    setWeatherError(false)

    const fetchWeather = async () => {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.capital)}&count=1&language=en&format=json`
        )
        const geoData = await geoRes.json()
        if (!geoData.results?.length) throw new Error('City not found')
        const { latitude, longitude } = geoData.results[0]

        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&wind_speed_unit=kmh&timezone=auto`
        )
        const wxData = await wxRes.json()
        setWeather(wxData.current)
      } catch {
        setWeatherError(true)
      } finally {
        setWeatherLoading(false)
      }
    }
    fetchWeather()
  }, [isFlipped, selectedCountry, data?.capital, weather])

  if (!data) return null

  const wmo = weather ? (WMO_CODES[weather.weather_code] ?? { label: 'Unknown', icon: '🌡️' }) : null

  return (
    <div className="info-card-wrapper">
      <div className={`info-card ${isFlipped ? 'is-flipped' : ''}`}>

        {/* ── FRONT ── */}
        <div className="info-card-front">
          <button className="flip-btn" onClick={() => setIsFlipped(true)} title="Show Weather">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10"/>
              <path d="M12 6v6l4 2"/>
              <path d="M22 2l-3 3m0 0l-3-3m3 3V2"/>
            </svg>
          </button>

          <div className="info-header">
            <div className="info-title">
              <h1 className="big-country-name">{data.name}</h1>
            </div>
            <div className="info-divider"></div>
          </div>

          <div className="info-stats">
            <div className="info-stat">
              <span className="info-stat-label">Capital</span>
              <span className="info-stat-value">{data.capital || 'N/A'}</span>
            </div>
            <div className="info-stat">
              <span className="info-stat-label">Population</span>
              <span className="info-stat-value">{data.population || 'N/A'}</span>
            </div>
            <div className="info-stat">
              <span className="info-stat-label">GDP</span>
              <span className="info-stat-value">{data.gdp || 'N/A'}</span>
            </div>
            <div className="info-stat">
              <span className="info-stat-label">Date & Time</span>
              <span className="info-stat-value info-stat-value-time">{currentTime}</span>
            </div>
          </div>

          <div className="info-footer">
            <div className="info-footer-left">
              <span className="info-footer-label">Arrival Card</span>
              {data.dacUrl ? (
                <a href={data.dacUrl} target="_blank" rel="noopener noreferrer" className="info-footer-link">
                  {data.dacLabel || 'Official Site'} <span className="info-footer-arrow">↗</span>
                </a>
              ) : (
                <span className="info-footer-muted">Not Required</span>
              )}
            </div>
            {data.dacUrl && (
              <button className="qr-icon-btn" onClick={() => setShowQRModal(true)} title="Show QR Code">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="3" height="3"/>
                  <rect x="18" y="14" width="3" height="3"/>
                  <rect x="14" y="18" width="3" height="3"/>
                  <rect x="18" y="18" width="3" height="3"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── BACK (Weather) ── */}
        <div className="info-card-back">
          <button className="flip-btn" onClick={() => setIsFlipped(false)} title="Back to Info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="weather-back-header">
            <span className="weather-back-title">Live Weather</span>
            <h1 className="weather-back-country">{data.name}</h1>
            <span className="weather-back-title">{data.capital}</span>
          </div>

          {weatherLoading && (
            <div className="weather-loading">
              <span>⏳</span> Fetching weather…
            </div>
          )}

          {weatherError && !weatherLoading && (
            <div className="weather-error">
              <span>⚠️</span> Unable to load weather data
            </div>
          )}

          {weather && !weatherLoading && (
            <>
              <div className="weather-main">
                <span className="weather-icon">{wmo.icon}</span>
                <div className="weather-temp-block">
                  <span className="weather-temp">{Math.round(weather.temperature_2m)}°C</span>
                  <span className="weather-condition">{wmo.label}</span>
                  <span className="weather-feels">Feels like {Math.round(weather.apparent_temperature)}°C</span>
                </div>
              </div>

              <div className="weather-grid">
                <div className="weather-item">
                  <span className="weather-item-label">Humidity</span>
                  <span className="weather-item-value">{weather.relative_humidity_2m}%</span>
                </div>
                <div className="weather-item">
                  <span className="weather-item-label">Wind Speed</span>
                  <span className="weather-item-value">{Math.round(weather.wind_speed_10m)} km/h</span>
                </div>
                <div className="weather-item">
                  <span className="weather-item-label">Precipitation</span>
                  <span className="weather-item-value">{weather.precipitation} mm</span>
                </div>
                <div className="weather-item">
                  <span className="weather-item-label">Weather Code</span>
                  <span className="weather-item-value">WMO {weather.weather_code}</span>
                </div>
              </div>

              <p className="weather-updated">Updated just now · Open-Meteo</p>
            </>
          )}
        </div>

      </div>

      {showQRModal && data.dacUrl && createPortal(
        <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
          <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div className="qr-modal-qr" onClick={(e) => e.stopPropagation()}>
            <QRCodeSVG value={data.dacUrl} size={1024} bgColor="#ffffff" fgColor="#000000" level="H" marginSize={2} />
          </div>
        </div>,
        document.body
      )}
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
