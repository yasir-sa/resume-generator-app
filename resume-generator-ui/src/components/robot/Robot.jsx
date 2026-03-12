
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// 1. Model Component - இது 3D மாடலை அனிமேட் செய்யும்
function Model({ isSpeaking }) {
  const { scene } = useGLTF("/models/female2.glb");
  const headMeshRef = useRef(null);
  const [mouthIndices, setMouthIndices] = useState([]);

useEffect(() => {
  console.log("%c [Model] Loading Phase Started ", "background:#333;color:#4fc3f7");

  scene.traverse((obj) => {

    if (!obj.isMesh) return;

    console.log(`[Mesh Found]: ${obj.name}`);

    // ⭐ Only head mesh select
    if (obj.name === "Wolf3D_Head" && obj.morphTargetDictionary) {

      console.log("🎯 Morph Targets found on HEAD:", obj.name);

      const indices = [];

      Object.keys(obj.morphTargetDictionary).forEach((key) => {

        const lower = key.toLowerCase();

        if (
          lower.includes("viseme") ||
          lower.includes("mouth") ||
          lower.includes("jaw")
        ) {
          indices.push(obj.morphTargetDictionary[key]);
        }

      });

      if (indices.length > 0) {

        headMeshRef.current = obj;
        setMouthIndices(indices);

        console.log(
          "✅ Mouth animation linked ONLY to HEAD:",
          obj.name,
          indices
        );

      } else {

        console.warn("⚠️ Head found but no mouth morph targets");

      }

    }

  });

  if (!headMeshRef.current) {
    console.error("❌ Could not find Wolf3D_Head mesh");
  }

}, [scene]);

  useFrame((state) => {
    if (!headMeshRef.current || mouthIndices.length === 0) return;

    if (isSpeaking) {
      const time = state.clock.getElapsedTime();
      // இது வாயை 0 முதல் 0.8 வரை திறந்து மூடும்
      const targetValue = (Math.sin(time * 25) + 1) / 2 * 0.8;

      // ஒவ்வொரு 2 வினாடிக்கும் ஒருமுறை வேல்யூவை காட்டும் (கன்சோல் குப்பை ஆகாமல் இருக்க)
      if (Math.floor(time) % 2 === 0 && Math.floor(time * 60) % 60 === 0) {
        console.log(`🎤 %c AI Speaking... Mouth Value: ${targetValue.toFixed(2)}`, "color: #ba68c8");
      }

      mouthIndices.forEach(index => {
        headMeshRef.current.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          headMeshRef.current.morphTargetInfluences[index],
          targetValue,
          0.25
        );
      });
    } else {
      // AI பேசாத போது வாயை மெதுவாக மூடும்
      mouthIndices.forEach(index => {
        headMeshRef.current.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          headMeshRef.current.morphTargetInfluences[index],
          0,
          0.2
        );
      });
    }
  });

  return <primitive object={scene} scale={10.5} position={[0, -15.5, 0]} />;
}

// 2. Main Robot Component
function Robot({ isSpeaking }) {
  // Screeninterview-லிருந்து Prop வருகிறதா என செக் செய்கிறோம்
  useEffect(() => {
    console.log("%c [Robot Prop Change] ", "background: #1a1a1a; color: #a5d6a7", "isSpeaking =", isSpeaking);
  }, [isSpeaking]);
return (
  <Canvas camera={{ position: [0, 0, 5] }}>
    <ambientLight intensity={1.5} />
    <directionalLight position={[2, 2, 2]} />

    <Model isSpeaking={isSpeaking} />

    <OrbitControls 
      enableZoom={false}
      target={[0, 0, 0]}
    />
  </Canvas>
);
}

// 3. ⚠️ IMPORTANT: இதுதான் அந்த Build Error-ஐ சரி செய்யும்
export default Robot;
//     <Canvas camera={{ position: [0, 0, 5] }}>
//       <ambientLight intensity={1.5} />
//       <directionalLight position={[2, 2, 2]} />
//       <Model />
//       <OrbitControls enableZoom={false} />
//     </Canvas>
// </>
//     )