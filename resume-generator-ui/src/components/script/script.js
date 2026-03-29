import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let modelDiv;
let scene, camera, renderer, mixer; 
let animatedMeshes = []; 
let speakingStatus = false; // 🔴 வாய் அசைவைக் கட்டுப்படுத்த

// 🔴 React-லிருந்து isSpeaking நிலையைப் பெற இந்த பங்க்ஷன் உதவும்
export const setSpeaking = (status) => {
    speakingStatus = status;
};

export const init = (containerElement) => {
    if (!containerElement) return;

    modelDiv = document.createElement('div');
    modelDiv.id = "model-3d-container";
    modelDiv.style.display = "none"; 
    modelDiv.style.width = "100%";
    modelDiv.style.height = "100%";
    modelDiv.style.position = "relative";
    containerElement.appendChild(modelDiv);

    scene = new THREE.Scene();
    const width = containerElement.clientWidth || 150;
    const height = containerElement.clientHeight || 150;
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 2.5); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    modelDiv.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(2, 2, 5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    const fbxLoader = new FBXLoader(); 

    loader.load('/models/female7.glb', (gltf) => {
        const model = gltf.scene;
        window.yasir = model; 

        model.traverse((obj) => {
            if (obj.isMesh) {
                obj.frustumCulled = false;
                if (obj.morphTargetDictionary) {
                    animatedMeshes.push(obj);
                }
            }
        });

        model.position.y = -2.5; 
        model.scale.set(2.5, 2.5, 2.5);
        scene.add(model);

        fbxLoader.load('/models/standingidle.fbx', (fbx) => {
            mixer = new THREE.AnimationMixer(model); 
            const idleAnim = fbx.animations[0];
            if (idleAnim) {
                const action = mixer.clipAction(idleAnim);
                action.play(); 
            }
        });
    });

    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime(); 

        if (mixer) mixer.update(delta); 

        if (animatedMeshes.length > 0) {
            animatedMeshes.forEach((mesh) => {
                const dict = mesh.morphTargetDictionary;

                // 👀 1. கண் சிமிட்டும் லாஜிக் (ஏற்கனவே உள்ளது)
                const blinkCycle = time % 5; 
                const isBlinking = blinkCycle > 4.8; 
                const targetBlink = isBlinking ? 1 : 0;

                const leftEye = dict["eyeBlinkLeft"];
                const rightEye = dict["eyeBlinkRight"];

                if (leftEye !== undefined) {
                    mesh.morphTargetInfluences[leftEye] = THREE.MathUtils.lerp(
                        mesh.morphTargetInfluences[leftEye], targetBlink, 0.5
                    );
                }
                if (rightEye !== undefined) {
                    mesh.morphTargetInfluences[rightEye] = THREE.MathUtils.lerp(
                        mesh.morphTargetInfluences[rightEye], targetBlink, 0.5
                    );
                }

                // 👄 2. வாய் அசைவு லாஜிக் (Mouth Action)
                // speakingStatus உண்மையாக இருந்தால் மட்டும் வாய் அசையும்
                const mouthIndex = dict["mouthOpen"] || dict["jawOpen"]; 
                if (mouthIndex !== undefined) {
                    // Math.sin பயன்படுத்தி வாய் ஏறி இறங்குவது போன்ற அசைவு தருகிறோம்
                    const mouthValue = speakingStatus ? (Math.sin(time * 18) + 1) / 2 * 0.45 : 0;
                    
                    mesh.morphTargetInfluences[mouthIndex] = THREE.MathUtils.lerp(
                        mesh.morphTargetInfluences[mouthIndex],
                        mouthValue,
                        0.15 
                    );
                }
            });
        }
        
        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        const newWidth = containerElement.clientWidth;
        const newHeight = containerElement.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
};

export const showModel = () => { if (modelDiv) modelDiv.style.display = "block"; };
export const hideModel = () => { if (modelDiv) modelDiv.style.display = "none"; };