import { useMemo } from 'react'
import * as THREE from 'three'
import { createSparkTexture } from '../textures/sparkTexture'
import { SPARK_COUNT, SPARK_SIZE, SPARK_COLOR, spawnSpark, sparkAt } from '../domain/names'

// The sparks off the names: a fixed pool of SPARK_COUNT points, each slot
// holding one spark until it dies, then the next one born. emit() lights a
// new one in the oldest slot; advance() ages them all, writing where each is
// and how bright into the points' attributes; clear() puts them all out.
// Light, not paint: added over
// the scene and kept out of the tone mapping, like the heart's halo.
export function useSparks() {
  const pool = useMemo(
    () => ({
      sparks: new Array(SPARK_COUNT).fill(null),
      ages: new Float32Array(SPARK_COUNT),
      next: 0,
    }),
    []
  )

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARK_COUNT * 3), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SPARK_COUNT * 3), 3))
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: SPARK_SIZE,
        map: createSparkTexture(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    []
  )

  return useMemo(() => {
    const emit = (x, y, z) => {
      pool.sparks[pool.next] = spawnSpark(x, y, z)
      pool.ages[pool.next] = 0
      pool.next = (pool.next + 1) % SPARK_COUNT
    }

    // Puts out whatever was still burning, so a new visit starts clean.
    const clear = () => {
      pool.sparks.fill(null)
      geometry.attributes.color.array.fill(0)
      geometry.attributes.color.needsUpdate = true
    }

    // `presence` dims them all with the names when the visitor leaves.
    const advance = (delta, presence) => {
      const { position, color } = geometry.attributes
      for (let i = 0; i < SPARK_COUNT; i++) {
        const spark = pool.sparks[i]
        if (!spark) continue
        pool.ages[i] += delta
        if (pool.ages[i] > spark.life) {
          pool.sparks[i] = null
          color.setXYZ(i, 0, 0, 0)
          continue
        }
        const { x, y, z, light } = sparkAt(spark, pool.ages[i])
        const lit = light * presence
        position.setXYZ(i, x, y, z)
        color.setXYZ(i, SPARK_COLOR[0] * lit, SPARK_COLOR[1] * lit, SPARK_COLOR[2] * lit)
      }
      position.needsUpdate = true
      color.needsUpdate = true
    }

    return { geometry, material, emit, clear, advance }
  }, [pool, geometry, material])
}
