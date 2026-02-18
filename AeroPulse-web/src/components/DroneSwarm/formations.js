const DRONE_COUNT = 10000

// Generate station formation - clustered grid at ground level
export function generateStationFormation(count = DRONE_COUNT) {
  const positions = []
  const gridSize = Math.ceil(Math.sqrt(count))
  const spacing = 0.15
  const offsetX = (gridSize * spacing) / 2
  const offsetZ = (gridSize * spacing) / 2

  for (let i = 0; i < count; i++) {
    const x = (i % gridSize) * spacing - offsetX
    const z = Math.floor(i / gridSize) * spacing - offsetZ
    const y = Math.random() * 0.5 // Slight height variation
    positions.push({ x, y, z })
  }
  return positions
}

// Generate Wukong silhouette formation
export function generateWukongFormation(count = DRONE_COUNT) {
  const positions = []

  // Wukong silhouette - monkey king in martial pose
  // Body proportions for humanoid figure with monkey features
  const bodyParts = {
    // Head (larger, monkey-like)
    head: { cx: 0, cy: 12, cz: 0, rx: 1.2, ry: 1.4, rz: 1, weight: 0.12 },
    // Crown/headpiece
    crown: { cx: 0, cy: 13.5, cz: 0, rx: 1.5, ry: 0.5, rz: 0.8, weight: 0.05 },
    // Torso
    chest: { cx: 0, cy: 9, cz: 0, rx: 1.5, ry: 1.8, rz: 0.8, weight: 0.15 },
    belly: { cx: 0, cy: 7, cz: 0, rx: 1.2, ry: 1, rz: 0.7, weight: 0.08 },
    // Arms in martial pose (one raised, one extended)
    leftArm: { cx: -2.5, cy: 10, cz: 0, rx: 0.5, ry: 2, rz: 0.5, weight: 0.08 },
    leftHand: { cx: -3.5, cy: 12, cz: 0, rx: 0.6, ry: 0.6, rz: 0.6, weight: 0.03 },
    rightArm: { cx: 2.5, cy: 9, cz: 0, rx: 0.5, ry: 1.8, rz: 0.5, weight: 0.08 },
    rightHand: { cx: 4, cy: 8, cz: 0, rx: 0.5, ry: 0.5, rz: 0.5, weight: 0.03 },
    // Legs in stance
    leftLeg: { cx: -0.8, cy: 4, cz: 0, rx: 0.6, ry: 2.5, rz: 0.6, weight: 0.1 },
    leftFoot: { cx: -1.2, cy: 1, cz: 0.3, rx: 0.8, ry: 0.4, rz: 0.5, weight: 0.03 },
    rightLeg: { cx: 1, cy: 3.5, cz: 1, rx: 0.6, ry: 2.2, rz: 0.6, weight: 0.1 },
    rightFoot: { cx: 1.5, cy: 0.8, cz: 1.5, rx: 0.8, ry: 0.4, rz: 0.5, weight: 0.03 },
    // Tail (monkey characteristic)
    tail1: { cx: 0.5, cy: 5.5, cz: -1, rx: 0.3, ry: 0.3, rz: 1.5, weight: 0.04 },
    tail2: { cx: 1, cy: 5, cz: -2.5, rx: 0.3, ry: 0.3, rz: 1, weight: 0.03 },
    tail3: { cx: 1.5, cy: 5.5, cz: -3.5, rx: 0.4, ry: 0.4, rz: 0.4, weight: 0.02 },
    // Cloud/aura effect around feet
    cloud1: { cx: 0, cy: 0, cz: 0, rx: 3, ry: 0.5, rz: 3, weight: 0.03 },
  }

  // Calculate total weight for distribution
  const totalWeight = Object.values(bodyParts).reduce((sum, part) => sum + part.weight, 0)

  // Distribute drones among body parts
  for (const [partName, part] of Object.entries(bodyParts)) {
    const partCount = Math.floor((part.weight / totalWeight) * count)

    for (let i = 0; i < partCount; i++) {
      // Generate point within ellipsoid
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.cbrt(Math.random()) // Cube root for uniform volume distribution

      const x = part.cx + r * part.rx * Math.sin(phi) * Math.cos(theta)
      const y = part.cy + r * part.ry * Math.sin(phi) * Math.sin(theta)
      const z = part.cz + r * part.rz * Math.cos(phi)

      positions.push({ x, y, z })
    }
  }

  // Fill remaining with random distribution around body
  while (positions.length < count) {
    const x = (Math.random() - 0.5) * 8
    const y = Math.random() * 14
    const z = (Math.random() - 0.5) * 4
    positions.push({ x, y, z })
  }

  return positions
}

// Generate Ruyi Jingu Bang (Golden Cudgel/Staff) formation
export function generateStaffFormation(count = DRONE_COUNT) {
  const positions = []

  // Staff is a long cylinder with decorative ends
  const staffLength = 25
  const staffRadius = 0.8
  const endCapRadius = 1.2
  const endCapLength = 2

  // Main shaft (70% of drones)
  const shaftCount = Math.floor(count * 0.7)
  for (let i = 0; i < shaftCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * staffRadius
    const y = (Math.random() - 0.5) * staffLength

    positions.push({
      x: r * Math.cos(theta),
      y: y + 7, // Center it vertically
      z: r * Math.sin(theta)
    })
  }

  // Top end cap (15% of drones)
  const topCapCount = Math.floor(count * 0.15)
  for (let i = 0; i < topCapCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * endCapRadius
    const y = staffLength / 2 + Math.random() * endCapLength

    positions.push({
      x: r * Math.cos(theta),
      y: y + 7,
      z: r * Math.sin(theta)
    })
  }

  // Bottom end cap (15% of drones)
  const bottomCapCount = count - shaftCount - topCapCount
  for (let i = 0; i < bottomCapCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * endCapRadius
    const y = -staffLength / 2 - Math.random() * endCapLength

    positions.push({
      x: r * Math.cos(theta),
      y: y + 7,
      z: r * Math.sin(theta)
    })
  }

  return positions
}

// Color palettes for each formation
export const FORMATION_COLORS = {
  station: {
    primary: '#00ffff',    // Cyan
    secondary: '#0088ff',  // Blue
  },
  wukong: {
    primary: '#ffaa00',    // Golden
    secondary: '#ff4400',  // Orange-red
  },
  staff: {
    primary: '#ffd700',    // Gold
    secondary: '#ff6600',  // Orange
  }
}

export { DRONE_COUNT }
