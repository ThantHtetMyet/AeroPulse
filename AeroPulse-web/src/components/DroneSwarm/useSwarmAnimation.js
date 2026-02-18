import { useRef, useMemo, useCallback } from 'react'
import {
  generateStationFormation,
  generateWukongFormation,
  generateStaffFormation,
  DRONE_COUNT,
  FORMATION_COLORS
} from './formations'

// Easing function for smooth transitions
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t
}

// Color interpolation
function lerpColor(color1, color2, t) {
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)

  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)

  const r = Math.round(lerp(r1, r2, t))
  const g = Math.round(lerp(g1, g2, t))
  const b = Math.round(lerp(b1, b2, t))

  return { r: r / 255, g: g / 255, b: b / 255 }
}

// Animation phases
const PHASES = [
  { name: 'station', duration: 2, formation: 'station' },
  { name: 'launch', duration: 3, from: 'station', to: 'wukong' },
  { name: 'holdWukong', duration: 4, formation: 'wukong' },
  { name: 'toStaff', duration: 3, from: 'wukong', to: 'staff' },
  { name: 'holdStaff', duration: 4, formation: 'staff' },
  { name: 'toWukong', duration: 3, from: 'staff', to: 'wukong' },
]

export function useSwarmAnimation() {
  const timeRef = useRef(0)
  const phaseIndexRef = useRef(0)
  const phaseTimeRef = useRef(0)

  // Pre-generate all formations
  const formations = useMemo(() => ({
    station: generateStationFormation(DRONE_COUNT),
    wukong: generateWukongFormation(DRONE_COUNT),
    staff: generateStaffFormation(DRONE_COUNT)
  }), [])

  // Current interpolated positions
  const currentPositions = useRef(
    formations.station.map(p => ({ ...p }))
  )

  // Current color
  const currentColor = useRef({ r: 0, g: 1, b: 1 }) // Cyan

  // Get total cycle duration
  const totalDuration = useMemo(() =>
    PHASES.reduce((sum, phase) => sum + phase.duration, 0),
    []
  )

  // Update animation
  const update = useCallback((delta) => {
    timeRef.current += delta
    phaseTimeRef.current += delta

    // Get current phase
    let phase = PHASES[phaseIndexRef.current]

    // Check if we need to advance to next phase
    while (phaseTimeRef.current >= phase.duration) {
      phaseTimeRef.current -= phase.duration
      phaseIndexRef.current = (phaseIndexRef.current + 1) % PHASES.length

      // Loop back to holdWukong after completing cycle (skip initial station)
      if (phaseIndexRef.current === 0) {
        phaseIndexRef.current = 2 // Skip to holdWukong
      }

      phase = PHASES[phaseIndexRef.current]
    }

    const progress = phaseTimeRef.current / phase.duration
    const easedProgress = easeInOutCubic(progress)

    if (phase.from && phase.to) {
      // Transitioning between formations
      const fromFormation = formations[phase.from]
      const toFormation = formations[phase.to]
      const fromColor = FORMATION_COLORS[phase.from]
      const toColor = FORMATION_COLORS[phase.to]

      for (let i = 0; i < DRONE_COUNT; i++) {
        currentPositions.current[i].x = lerp(fromFormation[i].x, toFormation[i].x, easedProgress)
        currentPositions.current[i].y = lerp(fromFormation[i].y, toFormation[i].y, easedProgress)
        currentPositions.current[i].z = lerp(fromFormation[i].z, toFormation[i].z, easedProgress)
      }

      // Interpolate color
      currentColor.current = lerpColor(fromColor.primary, toColor.primary, easedProgress)
    } else {
      // Holding formation with subtle floating animation
      const formation = formations[phase.formation]
      const colors = FORMATION_COLORS[phase.formation]
      const floatAmount = 0.1
      const floatSpeed = 2

      for (let i = 0; i < DRONE_COUNT; i++) {
        const offset = Math.sin(timeRef.current * floatSpeed + i * 0.01) * floatAmount
        currentPositions.current[i].x = formation[i].x
        currentPositions.current[i].y = formation[i].y + offset
        currentPositions.current[i].z = formation[i].z
      }

      // Pulse color slightly
      const pulse = Math.sin(timeRef.current * 3) * 0.1 + 0.9
      const baseColor = lerpColor(colors.primary, colors.secondary, 0)
      currentColor.current = {
        r: baseColor.r * pulse,
        g: baseColor.g * pulse,
        b: baseColor.b * pulse
      }
    }

    return {
      positions: currentPositions.current,
      color: currentColor.current,
      phase: phase.name,
      progress: easedProgress
    }
  }, [formations])

  return {
    update,
    positions: currentPositions.current,
    droneCount: DRONE_COUNT
  }
}
