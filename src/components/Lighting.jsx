export default function Lighting() {
  return (
    <>
      <ambientLight color={0x8a734e} intensity={4.6} />
      <pointLight color={0x4d5a78} intensity={0.8} distance={8} position={[-1.4, 0.9, -1.2]} />
      <directionalLight color={0xfff0d2} intensity={1.5} position={[-1, 2.4, 1.6]} />
    </>
  )
}
