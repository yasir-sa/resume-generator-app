// import React, { useRef, useEffect, useMemo } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, useGLTF, useAnimations, useFBX } from "@react-three/drei";
// import * as THREE from "three";

// function Model({ isSpeaking, animationMessage }) {
//   // 1. மாடல் மற்றும் அனிமேஷன் ஃபைல்களை லோட் செய்கிறோம்
//   const { scene } = useGLTF("/models/female6.glb"); 
//   const idleFbx = useFBX("/models/Standing Idle (2).fbx"); 
//   const wavingFbx = useFBX("/models/Waving (3).fbx"); 

//   const animatedMeshesRef = useRef([]);
//   const mouthRef = useRef([]);
  
//   // 2. அனிமேஷன்களை அனிமேஷன் மிக்ஸருடன் இணைக்கிறோம்
//   const { actions, mixer } = useAnimations(
//     [idleFbx.animations[0], wavingFbx.animations[0]], 
//     scene
//   );

//   // அனிமேஷன் பெயர்களை எளிமையாக மாற்றுதல்
//   useEffect(() => {
//     if (idleFbx.animations[0]) idleFbx.animations[0].name = "idle";
//     if (wavingFbx.animations[0]) wavingFbx.animations[0].name = "hi_animation";
//   }, [idleFbx, wavingFbx]);

//   // 3. Bone Mapping & Mixamo Prefix Removal
// // 3. Bone Mapping & Jump Fix
//   useMemo(() => {
//     [idleFbx, wavingFbx].forEach(fbx => {
//       if (fbx.animations) {
//         fbx.animations.forEach((clip) => {
//           // ⭐ தீர்வு 1: அனைத்து பொசிஷன் மாற்றங்களையும் நீக்குகிறோம்
//           // இது மாடல் ஓரிடத்திலிருந்து இன்னோர் இடத்திற்கு குதிப்பதைத் தடுக்கும்
//           clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
          
//           clip.tracks.forEach((track) => {
//             // ⭐ தீர்வு 2: எலும்பு பெயர்களைச் சரியாக மாற்றுதல்
//             // சில சமயம் "mixamorig" அல்லது "Armature|" என்று பெயர்கள் வரும், அவற்றை நீக்குகிறோம்
//             track.name = track.name.replace("mixamorig", "");
//             track.name = track.name.replace("Armature|", ""); 
//           });
//         });
//       }
//     });
//   }, [idleFbx, wavingFbx]);

//   // 4. ஸ்மூத் அனிமேஷன் மாற்றம் (Jump-ஐத் தவிர்க்க)
//   // 4. ஸ்மூத் அனிமேஷன் மாற்றம் (Jump-ஐத் தவிர்க்க)
//   useEffect(() => {
//     if (animationMessage === "hi_animation" && actions["hi_animation"]) {
//       const hiAction = actions["hi_animation"];
//       const idleAction = actions["idle"];

//       idleAction?.fadeOut(0.5);

//       // அனிமேஷன் வேகம் (மெதுவாக)
//       hiAction.timeScale = 0.6; 

//       hiAction.reset().fadeIn(0.5).setLoop(THREE.LoopOnce).play();
//       hiAction.clampWhenFinished = true;

//       // 💡 இங்கிருந்து தான் மாற்றம் தொடங்குகிறது
//       const restoreIdle = () => {
//         hiAction.fadeOut(0.5);
        
//         // Idle அனிமேஷனைத் திரும்பக் கொண்டு வரும்போது வேகத்தை 1.0 என உறுதி செய்கிறோம்
//         if (idleAction) {
//           idleAction.timeScale = 1.0; 
//           idleAction.reset().fadeIn(0.5).play();
//         }

//         mixer.removeEventListener('finished', restoreIdle);
//       };
      
//       mixer.addEventListener('finished', restoreIdle);
//     }
//   }, [animationMessage, actions, mixer]);
//   // 5. Morph Targets (Mouth & Eyes) சேகரித்தல்
//   useEffect(() => {
//     const meshes = [];
//     const mouths = [];
//     scene.traverse((obj) => {
//       if (obj.isMesh && obj.morphTargetDictionary) {
//         meshes.push(obj);
//         const dict = obj.morphTargetDictionary;
//         if (dict["jawOpen"] !== undefined) {
//           mouths.push({ mesh: obj, index: dict["jawOpen"] });
//         } else if (dict["mouthOpen"] !== undefined) {
//           mouths.push({ mesh: obj, index: dict["mouthOpen"] });
//         }
//       }
//     });
//     animatedMeshesRef.current = meshes;
//     mouthRef.current = mouths;

//     // ஆரம்பத்தில் Idle அனிமேஷனை இயக்குகிறோம்
//     if (actions["idle"]) {
//       actions["idle"].reset().play();
//     }
//   }, [scene, actions]);

//   // 6. ஒவ்வொரு பிரேமிலும் நடக்கும் மாற்றங்கள் (Mouth & Eyes)
//   useFrame((state, delta) => {
//     if (mixer) mixer.update(delta);
    
//     const time = state.clock.getElapsedTime();

//     // 🎤 Mouth Sync (அனிமேஷன் ஓடும்போதும் பேசும்)
//     const mouthValue = isSpeaking ? (Math.sin(time * 18) + 1) / 2 * 0.45 : 0;
//     mouthRef.current.forEach(({ mesh, index }) => {
//       mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
//         mesh.morphTargetInfluences[index],
//         mouthValue,
//         0.15 
//       );
//     });

//     // 👀 Eye Blink
//     const blinkCycle = time % 5;
//     const targetBlink = blinkCycle > 4.8 ? 1 : 0;
//     animatedMeshesRef.current.forEach((mesh) => {
//       const dict = mesh.morphTargetDictionary;
//       const eyeIndex = dict["eyeBlinkLeft"] || dict["eyeClosed"] || dict["blink"];
//       if (eyeIndex !== undefined) {
//         mesh.morphTargetInfluences[eyeIndex] = THREE.MathUtils.lerp(
//           mesh.morphTargetInfluences[eyeIndex], 
//           targetBlink, 
//           0.5
//         );
//       }
//     });
//   });

//   return <primitive object={scene} scale={60.5} position={[0, -35.5, 0]} />;
// }

// // ---------------------------------------------------------
// // 7. மெயின் ரோபோட் காம்போனென்ட்
// // ---------------------------------------------------------
// function Robot({ isSpeaking, animationMessage }) {
//   return (
//    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
//     <ambientLight intensity={1.5} />
//     <directionalLight position={[2, 2, 2]} />

//     {/* Model-க்கு ப்ராப்ஸ்களை அனுப்புகிறோம் */}
//     <Model isSpeaking={isSpeaking} animationMessage={animationMessage} />

//     <OrbitControls 
//       enableZoom={false}
//       target={[0, 0, 0]}
//       enableRotate={false}
//       enablePan={false}
//     />
//   </Canvas>
//   );
// }

// export default Robot;

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, useFBX } from "@react-three/drei";
import * as THREE from "three";

function Model({ isSpeaking, animationMessage }) {
  // 1. மாடல் மற்றும் அனிமேஷன் லோடிங்
  const { scene } = useGLTF("/models/female6.glb"); 
  const idleFbx = useFBX("/models/Standing Idle (2).fbx"); 
  const wavingFbx = useFBX("/models/Waving (3).fbx"); 

  const animatedMeshesRef = useRef([]);
  const mouthRef = useRef([]);
  const rightArmRef = useRef(null); // கையைத் தூக்க இதைப் பயன்படுத்துகிறோம்

  const { actions, mixer } = useAnimations(
    [idleFbx.animations[0], wavingFbx.animations[0]], 
    scene
  );

  // அனிமேஷன் பெயர்கள்
  useEffect(() => {
    if (idleFbx.animations[0]) idleFbx.animations[0].name = "idle";
    if (wavingFbx.animations[0]) wavingFbx.animations[0].name = "hi_animation";
  }, [idleFbx, wavingFbx]);

  // 2. கையின் எலும்பைத் தேடி Ref-ல் சேமித்தல்
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isBone && (obj.name.includes("RightArm") || obj.name.includes("RightUpperArm"))) {
        rightArmRef.current = obj;
      }
    });
  }, [scene]);

  // 3. Bone Mapping & Jump Fix
  useMemo(() => {
    [idleFbx, wavingFbx].forEach(fbx => {
      if (fbx.animations) {
        fbx.animations.forEach((clip) => {
          clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
          clip.tracks.forEach((track) => {
            track.name = track.name.replace("mixamorig", "");
            track.name = track.name.replace("Armature|", ""); 
          });
        });
      }
    });
  }, [idleFbx, wavingFbx]);

  // 4. அனிமேஷன் மாற்றம்
  useEffect(() => {
    if (animationMessage === "hi_animation" && actions["hi_animation"]) {
      const hiAction = actions["hi_animation"];
      const idleAction = actions["idle"];

      idleAction?.fadeOut(0.5);
      hiAction.timeScale = 0.6; 
      hiAction.reset().fadeIn(0.5).setLoop(THREE.LoopOnce).play();
      hiAction.clampWhenFinished = true;

      const restoreIdle = () => {
        hiAction.fadeOut(0.5);
        if (idleAction) {
          idleAction.reset().fadeIn(0.5).play();
        }
        mixer.removeEventListener('finished', restoreIdle);
      };
      mixer.addEventListener('finished', restoreIdle);
    }
  }, [animationMessage, actions, mixer]);

  // 5. Morph Targets (Mouth & Eyes)
  useEffect(() => {
    const meshes = [];
    const mouths = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.morphTargetDictionary) {
        meshes.push(obj);
        const dict = obj.morphTargetDictionary;
        if (dict["jawOpen"] !== undefined) mouths.push({ mesh: obj, index: dict["jawOpen"] });
        else if (dict["mouthOpen"] !== undefined) mouths.push({ mesh: obj, index: dict["mouthOpen"] });
      }
    });
    animatedMeshesRef.current = meshes;
    mouthRef.current = mouths;

    if (actions["idle"]) actions["idle"].reset().play();
  }, [scene, actions]);

  // 6. ஒவ்வொரு பிரேமிலும் அனிமேஷன் அட்ஜஸ்ட்மென்ட்
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    const time = state.clock.getElapsedTime();

    // ⭐ கை அனிமேஷன் அட்ஜஸ்ட்மென்ட் (தூக்குதல்)
    if (rightArmRef.current && animationMessage === "hi_animation") {
      // 💡 கையை இன்னும் மேலே தூக்க rotation.z-ஐ மாற்றியுள்ளேன்
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.z,
        -1.10, // -1.2 லிருந்து -1.8 ஆக மாற்றியுள்ளேன்
        0.1
      );
    }

    // 🎤 Mouth Sync
    const mouthValue = isSpeaking ? (Math.sin(time * 18) + 1) / 2 * 0.45 : 0;
    mouthRef.current.forEach(({ mesh, index }) => {
      mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
        mesh.morphTargetInfluences[index], mouthValue, 0.15 
      );
    });

    // 👀 Eye Blink
    const blinkCycle = time % 5;
    const targetBlink = blinkCycle > 4.8 ? 1 : 0;
    animatedMeshesRef.current.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const eyeIndex = dict["eyeBlinkLeft"] || dict["eyeClosed"] || dict["blink"];
      if (eyeIndex !== undefined) {
        mesh.morphTargetInfluences[eyeIndex] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[eyeIndex], targetBlink, 0.5
        );
      }
    });
  });

  return <primitive object={scene} scale={70.5} position={[0, -40.5, 0]} />;
}

// 7. மெயின் காம்போனென்ட்
function Robot({ isSpeaking, animationMessage }) {
  return (
    // 💡 கேமரா ஜூம் பிரச்சனையைச் சரிசெய்ய பொசிஷனை உயர்த்தியுள்ளேன்
    <Canvas camera={{ position: [0, 0, 25], fov: 50 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, 2, 4]} intensity={1} />

      <Model isSpeaking={isSpeaking} animationMessage={animationMessage} />

      <OrbitControls 
        enableZoom={false}
        target={[0, -5, 0]} // கேமராவை சற்றே கீழே திருப்ப கேமரா டார்கெட்டை மாற்றியுள்ளேன்
        enableRotate={false}
        enablePan={false}
      />
    </Canvas>
  );
}

export default Robot;