import { useRef, useMemo, useCallback } from 'react'
import {
  generateStationFormation,
  generateFlagFormation,
  getWaveOffset,
  DRONE_COUNT
} from './formations'

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

const PHASES = [
  { name: 'station', duration: 1.5, formation: 'station' },
  { name: 'launch', duration: 3, from: 'station', to: 'flag' },
  { name: 'wave', duration: 999, formation: 'flag' },
]

export function useSwarmAnimation() {
  const timeRef = useRef(0)
  const phaseIndexRef = useRef(0)
  const phaseTimeRef = useRef(0)

  const formations = useMemo(() => ({
    station: generateStationFormation(DRONE_COUNT),
    flag: generateFlagFormation(DRONE_COUNT)
  }), [])

  const currentPositions = useRef(
    formations.station.map(p => ({ ...p }))
  )

  const update = useCallback((delta, waveAmplitude = 1.5) => {
    timeRef.current += delta
    phaseTimeRef.current += delta

    let phase = PHASES[phaseIndexRef.current]

    while (phaseTimeRef.current >= phase.duration && phaseIndexRef.current < PHASES.length - 1) {
      phaseTimeRef.current -= phase.duration
      phaseIndexRef.current++
      phase = PHASES[phaseIndexRef.current]
    }

    const progress = Math.min(phaseTimeRef.current / phase.duration, 1)

    if (phase.from && phase.to) {
      // Transitioning to flag
      const fromFormation = formations[phase.from]
      const toFormation = formations[phase.to]

      for (let i = 0; i < DRONE_COUNT; i++) {
        const stagger = (toFormation[i].v || 0) * 0.3
        const adjustedProgress = Math.max(0, Math.min(1, (progress - stagger) / (1 - stagger)))
        const easedProgress = easeOutQuart(adjustedProgress)

        currentPositions.current[i].x = lerp(fromFormation[i].x, toFormation[i].x, easedProgress)
        currentPositions.current[i].y = lerp(fromFormation[i].y, toFormation[i].y, easedProgress)
        currentPositions.current[i].z = lerp(fromFormation[i].z, toFormation[i].z, easedProgress)
        currentPositions.current[i].u = toFormation[i].u
        currentPositions.current[i].v = toFormation[i].v
      }
    } else if (phase.formation === 'flag') {
      // Waving flag animation
      const flagFormation = formations.flag
      const time = timeRef.current

      for (let i = 0; i < DRONE_COUNT; i++) {
        const baseX = flagFormation[i].x
        const baseY = flagFormation[i].y
        const baseZ = flagFormation[i].z

        // Get wave offset (Z displacement based on position and time)
        const waveZ = getWaveOffset(baseX, baseY, time, waveAmplitude)

        // Slight Y movement for more natural cloth feel
        const waveY = Math.sin(baseX * 0.2 + time * 1.5) * 0.1 * waveAmplitude

        currentPositions.current[i].x = baseX
        currentPositions.current[i].y = baseY + waveY
        currentPositions.current[i].z = baseZ + waveZ
        currentPositions.current[i].u = flagFormation[i].u
        currentPositions.current[i].v = flagFormation[i].v
      }
    } else {
      // Station - slight hover
      const formation = formations[phase.formation]
      for (let i = 0; i < DRONE_COUNT; i++) {
        const hover = Math.sin(timeRef.current * 2 + i * 0.01) * 0.02
        currentPositions.current[i].x = formation[i].x
        currentPositions.current[i].y = formation[i].y + hover
        currentPositions.current[i].z = formation[i].z
        currentPositions.current[i].u = formation[i].u || 0
        currentPositions.current[i].v = formation[i].v || 0
      }
    }

    return {
      positions: currentPositions.current,
      phase: phase.name,
      progress
    }
  }, [formations])

  // Reset animation when country changes
  const reset = useCallback(() => {
    timeRef.current = 0
    phaseIndexRef.current = 0
    phaseTimeRef.current = 0

    const station = formations.station
    for (let i = 0; i < DRONE_COUNT; i++) {
      currentPositions.current[i].x = station[i].x
      currentPositions.current[i].y = station[i].y
      currentPositions.current[i].z = station[i].z
    }
  }, [formations])

  return { update, reset }
}
