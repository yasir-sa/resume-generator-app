import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"

function Model() {
  const { scene } = useGLTF("/models/female.glb")

  return (
    <primitive
      object={scene}
      scale={7.5}
      position={[0, -10.5, 0]}
    />
  )
}

function Robot(){
    return(
<>
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 2, 2]} />
      <Model />
      <OrbitControls enableZoom={false} />
    </Canvas>
</>
    )
}
export default Robot;