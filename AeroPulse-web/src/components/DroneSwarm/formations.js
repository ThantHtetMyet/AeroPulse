export const DRONE_COUNT = 25000

// Flag dimensions
const FLAG_WIDTH = 22
const FLAG_HEIGHT = 14
const FLAG_COLS = 200
const FLAG_ROWS = 125

// Generate station formation
export function generateStationFormation(count = DRONE_COUNT) {
  const positions = []
  const gridSize = Math.ceil(Math.sqrt(count))
  const spacing = 0.06

  for (let i = 0; i < count; i++) {
    const x = ((i % gridSize) - gridSize / 2) * spacing
    const z = (Math.floor(i / gridSize) - gridSize / 2) * spacing
    positions.push({
      x,
      y: Math.random() * 0.1,
      z,
      u: (i % FLAG_COLS) / (FLAG_COLS - 1),
      v: Math.floor(i / FLAG_COLS) / (FLAG_ROWS - 1)
    })
  }
  return positions
}

// Generate flag formation
export function generateFlagFormation(count = DRONE_COUNT) {
  const positions = []
  const cols = FLAG_COLS
  const rows = Math.ceil(count / cols)

  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const u = col / (cols - 1)
    const v = row / (rows - 1)

    const x = (u - 0.5) * FLAG_WIDTH
    const y = (0.5 - v) * FLAG_HEIGHT + 8
    const z = 0

    positions.push({ x, y, z, u, v })
  }

  return positions
}

// Wave animation
export function getWaveOffset(x, y, time, amplitude = 1) {
  const waveSpeed = 2.5
  const normalizedX = (x + FLAG_WIDTH / 2) / FLAG_WIDTH

  const wave1 = Math.sin(normalizedX * Math.PI * 2.5 + time * waveSpeed) * amplitude
  const wave2 = Math.sin(normalizedX * Math.PI * 4 + time * waveSpeed * 1.4) * amplitude * 0.4
  const wave3 = Math.sin(y * 0.25 + time * waveSpeed * 0.6) * amplitude * 0.25

  const edgeMultiplier = normalizedX * normalizedX * 1.8

  return (wave1 + wave2 + wave3) * edgeMultiplier
}
