import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSwarmAnimation } from './useSwarmAnimation'
import { DRONE_COUNT } from './formations'

export function DroneSwarm() {
  const meshRef = useRef()
  const { update, positions } = useSwarmAnimation()

  // Create a dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Create color attribute for per-instance colors
  const colorArray = useMemo(() => {
    const colors = new Float32Array(DRONE_COUNT * 3)
    for (let i = 0; i < DRONE_COUNT; i++) {
      colors[i * 3] = 0     // R
      colors[i * 3 + 1] = 1 // G
      colors[i * 3 + 2] = 1 // B
    }
    return colors
  }, [])

  // Update positions and colors every frame
  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Cap delta to prevent huge jumps
    const cappedDelta = Math.min(delta, 0.1)
    const { positions: newPositions, color } = update(cappedDelta)

    // Update instance matrices
    for (let i = 0; i < DRONE_COUNT; i++) {
      const pos = newPositions[i]

      dummy.position.set(pos.x, pos.y, pos.z)

      // Add slight random scale variation for sparkle effect
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 5 + i * 0.1) * 0.2
      dummy.scale.setScalar(scale)

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      // Update colors with slight variation per drone
      const variation = 0.1 + Math.random() * 0.1
      colorArray[i * 3] = color.r * (1 + variation)
      colorArray[i * 3 + 1] = color.g * (1 + variation)
      colorArray[i * 3 + 2] = color.b * (1 + variation)
    }

    meshRef.current.instanceMatrix.needsUpdate = true

    // Update color attribute
    if (meshRef.current.geometry.attributes.color) {
      meshRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, DRONE_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.05, 6, 6]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorArray, 3]}
        />
      </sphereGeometry>
      <meshBasicMaterial
        vertexColors
        toneMapped={false}
      />
    </instancedMesh>
  )
}

// Ground reference plane
export function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#0a0a1a"
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

// Station platform where drones launch from
export function Station() {
  return (
    <group position={[0, -0.3, 0]}>
      {/* Main platform */}
      <mesh>
        <cylinderGeometry args={[8, 10, 0.5, 32]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Glowing ring */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[9, 0.1, 16, 64]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      {/* Inner ring */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[6, 0.05, 16, 64]} />
        <meshBasicMaterial color="#0088ff" />
      </mesh>
    </group>
  )
}

// Ambient particles for atmosphere
export function AmbientParticles() {
  const particleCount = 500
  const particlesRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = Math.random() * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!particlesRef.current) return
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  )
}
