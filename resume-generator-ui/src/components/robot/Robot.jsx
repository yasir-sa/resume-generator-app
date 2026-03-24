import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, useFBX } from "@react-three/drei";
import * as THREE from "three";

function Model({ isSpeaking }) {
  // 1. மெயின் GLB மாடல்
  const { scene } = useGLTF("/models/female5.glb"); 
  
  // 2. FBX அனிமேஷன் ஃபைல் (பெயர் மாற்றப்பட்டுள்ளது)
  const idleFbx = useFBX("/models/Standing Idle (2).fbx"); 

  const animatedMeshesRef = useRef([]);
  const mouthRef = useRef([]);
  
  // FBX-ல் உள்ள அனிமேஷன்களை scene-உடன் இணைக்கிறோம்
  const { actions, mixer } = useAnimations(idleFbx.animations, scene);

  // 3. Bone Mapping & Position Filtering
  useMemo(() => {
    if (idleFbx.animations) {
      idleFbx.animations.forEach((clip) => {
        // மாடல் மறைவதைத் தடுக்க position டிராக்குகளை நீக்குகிறோம்
        clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
        
        clip.tracks.forEach((track) => {
          // Mixamo எலும்புப் பெயர்களை மாற்றுதல்
          track.name = track.name.replace("mixamorig", "");
        });
      });
    }
  }, [idleFbx]);

  useEffect(() => {
    // அனிமேஷனை பிளே செய்தல்
    if (actions) {
      const firstAction = Object.keys(actions)[0];
      if (actions[firstAction]) {
        actions[firstAction].reset().fadeIn(0.5).play();
      }
    }

    const meshes = [];
    const mouths = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.morphTargetDictionary) {
        meshes.push(obj);
        const dict = obj.morphTargetDictionary;
        if (dict["jawOpen"] !== undefined) {
          mouths.push({ mesh: obj, index: dict["jawOpen"] });
        } else if (dict["mouthOpen"] !== undefined) {
          mouths.push({ mesh: obj, index: dict["mouthOpen"] });
        }
      }
    });
    animatedMeshesRef.current = meshes;
    mouthRef.current = mouths;
  }, [scene, actions]);

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    
    const time = state.clock.getElapsedTime();

    // 🎤 Mouth Sync (பேசும்போது வாய் அசைவு)
    const mouthValue = isSpeaking ? (Math.sin(time * 18) + 1) / 2 * 0.45 : 0;
    mouthRef.current.forEach(({ mesh, index }) => {
      mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
        mesh.morphTargetInfluences[index],
        mouthValue,
        0.15 
      );
    });

    // 👀 Eye Blink
    const blinkCycle = time % 5;
    const targetBlink = blinkCycle > 4.8 ? 1 : 0;
    animatedMeshesRef.current.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const eyeIndex = dict["eyeBlinkLeft"] || dict["eyeClosed"] || dict["blink"];
      if (eyeIndex !== undefined) {
        mesh.morphTargetInfluences[eyeIndex] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[eyeIndex], targetBlink, 0.5);
      }
    });
  });

    

  return <primitive object={scene} scale={60.5} position={[0, -35.5, 0]} />;
}
// ... (Model component அப்படியே இருக்கட்டும்)

function Robot({ isSpeaking }) {
  return (
    // Camera-வை இன்னும் கொஞ்சம் பின்னால் நகர்த்தியுள்ளேன் [0, 0, 15] 
    // ஏனெனில் உங்கள் scale 50.5 என்பது மிக அதிகம்.
   <Canvas camera={{ position: [0, 0, 10],fov: 30 }}>
    <ambientLight intensity={1.5} />
    <directionalLight position={[2, 2, 2]} />

    <Model isSpeaking={isSpeaking} />

    <OrbitControls 
      enableZoom={false}
      target={[0, 0, 0]}
      enableRotate={false}
      enablePan={false}
    />
  </Canvas>
  );
}
export default Robot;