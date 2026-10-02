import { useEmbers } from '../hooks/useEmbers'

// The orbs rising off the brew, in the cauldron's own space. Never culled:
// they move every frame, and the bounds three would cull them by are the
// ones they had on the first.
export default function Embers() {
  const { geometry, material } = useEmbers()
  return <points geometry={geometry} material={material} frustumCulled={false} />
}
