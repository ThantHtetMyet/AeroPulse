import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { DroneSwarm, Ground, Station, AmbientParticles } from './components/DroneSwarm/DroneSwarm'
import './App.css'

function App() {
  return (
    <div className="app">
      <Canvas
        camera={{
          position: [25, 15, 25],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Dark sky background */}
        <color attach="background" args={['#020208']} />

        {/* Stars in the sky */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 20, 10]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-10, 15, -10]} intensity={0.3} color="#0088ff" />

        {/* Scene elements */}
        <Ground />
        <Station />
        <AmbientParticles />

        {/* The drone swarm */}
        <DroneSwarm />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={80}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.1}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="overlay">
        <h1 className="title">AeroPulse</h1>
        <p className="subtitle">Drone Swarm Animation</p>
        <div className="info">
          <span>10,000 Drones</span>
          <span className="separator">|</span>
          <span>Black Myth: Wukong</span>
        </div>
        <p className="hint">Drag to rotate | Scroll to zoom</p>
      </div>
    </div>
  )
}

export default App
