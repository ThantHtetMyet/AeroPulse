import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSwarmAnimation } from './useSwarmAnimation'
import { DRONE_COUNT } from './formations'
import { FLAGS, loadFlagImage, getFlagColorFromImage } from './flagData'

export function DroneSwarm({ country = 'usa' }) {
  const meshRef = useRef()
  const { update, reset } = useSwarmAnimation()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const imageDataRef = useRef(null)

  // Load flag image when country changes
  useEffect(() => {
    let active = true
    const flagDef = FLAGS[country]
    if (flagDef && flagDef.image) {
      loadFlagImage(flagDef.image).then((data) => {
        if (active) {
          imageDataRef.current = data
          reset() // Reset animation when new flag is loaded
        }
      }).catch(err => console.error("Failed to load flag:", err))
    }
    return () => { active = false }
  }, [country, reset])

  const colorArray = useMemo(() => {
    const colors = new Float32Array(DRONE_COUNT * 3)
    return colors
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const { positions, phase } = update(Math.min(delta, 0.05))
    const time = state.clock.elapsedTime

    const imageData = imageDataRef.current
    const hasImage = !!imageData

    for (let i = 0; i < DRONE_COUNT; i++) {
      const pos = positions[i]

      // Drone movement noise
      const noiseX = Math.sin(time * 0.4 + i * 111.1) * 0.015
      const noiseY = Math.cos(time * 0.25 + i * 333.3) * 0.015
      const noiseZ = Math.sin(time * 0.35 + i * 222.2) * 0.015

      dummy.position.set(pos.x + noiseX, pos.y + noiseY, pos.z + noiseZ)

      const twinkle = 0.92 + Math.sin(time * 4 + i * 0.06) * 0.08
      dummy.scale.setScalar(twinkle)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      // Color logic
      const u = pos.u !== undefined ? pos.u : 0.5
      const v = pos.v !== undefined ? pos.v : 0.5

      let r, g, b

      if (phase === 'station' || !hasImage) {
        // Default blue/cyan for station or loading
        r = 0; g = 0.9; b = 1
      } else {
        // Sample from image
        const [imgR, imgG, imgB] = getFlagColorFromImage(imageData, u, v)
        r = imgR; g = imgG; b = imgB
      }

      // Intensity and sparkle
      const intensity = 1.8
      const sparkle = 0.9 + Math.random() * 0.2

      colorArray[i * 3] = r * intensity * sparkle
      colorArray[i * 3 + 1] = g * intensity * sparkle
      colorArray[i * 3 + 2] = b * intensity * sparkle
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.geometry.attributes.color) {
      meshRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, DRONE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.045, 8, 8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  )
}

export function FlagPole() {
  return (
    <group position={[-13, 0, 0]}>
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 18, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 17.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.4, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function Ground({ bgColor = '#000510' }) {
  // Make ground slightly lighter than background
  const groundColor = useMemo(() => {
    const c = new THREE.Color(bgColor)
    c.offsetHSL(0, 0, 0.02)
    return c
  }, [bgColor])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={groundColor} />
      </mesh>
      <gridHelper args={[150, 75, '#1a1a2a', '#0a0a15']} position={[0, -0.99, 0]} />
    </group>
  )
}

export function AmbientParticles() {
  const count = 400
  const ref = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 150
      pos[i * 3 + 1] = Math.random() * 80
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150
    }
    return pos
  }, [])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.002
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.18} sizeAttenuation />
    </points>
  )
}
