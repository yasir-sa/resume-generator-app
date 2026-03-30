import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let modelDiv;
let scene, camera, renderer, mixer; 
let animatedMeshes = []; 
let speakingStatus = false; 

// 🔴 அனிமேஷன்களைச் சேமிக்க
let actions = {}; 
let currentActionName = "idle"; 

export const setSpeaking = (status) => {
    speakingStatus = status;
};

// 🔴 React-ல் இருந்து வரும் பெயரைப் பொறுத்து அனிமேஷனை மாற்றும் பங்க்ஷன்
export const setAnimation = (name) => {
    // ஒருவேளை பெயர் காலியாக (empty string) வந்தால், அதை இயக்க வேண்டாம்
    if (!name) return;

    // நாம் அனுப்பும் பெயர் (talk, hi அல்லது idle) நம்மிடம் இருக்கிறதா என்று பார்க்கிறோம்
    if (actions[name] && currentActionName !== name) {
        const nextAction = actions[name];
        const prevAction = actions[currentActionName];

        if (prevAction) {
            prevAction.fadeOut(0.5); // பழைய அனிமேஷன் மெதுவாக மறையும்
        }

        nextAction.reset().fadeIn(0.5).play(); // புதிய அனிமேஷன் மெதுவாகத் தொடங்கும்
        currentActionName = name;
    }
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
    // 🔴 கன்சோலில் செக் செய்ய
    window.camera = camera;

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
        model.position.x = -0.1;

        model.scale.set(2.5, 2.5, 2.5);
        scene.add(model);

        mixer = new THREE.AnimationMixer(model);

        // 1. Idle Animation லோட்
        fbxLoader.load('/models/standingidle.fbx', (fbx) => {
            const anim = fbx.animations[0];
            if (anim) {
                actions['idle'] = mixer.clipAction(anim);
                actions['idle'].play(); 
            }
        });

        // 2. Talking Animation லோட்
        fbxLoader.load('/models/Talking (4).fbx', (fbx) => {
            const anim = fbx.animations[0];
            if (anim) {
                actions['talk'] = mixer.clipAction(anim);
            }
        });

        // 🔴 3. Hi Animation லோட் (புதிதாக சேர்க்கப்பட்டது)
        fbxLoader.load('/models/hi.fbx', (fbx) => {
            const anim = fbx.animations[0];
            if (anim) {
                actions['hi'] = mixer.clipAction(anim);
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

                const mouthIndex = dict["mouthOpen"] || dict["jawOpen"]; 
                if (mouthIndex !== undefined) {
                    const mouthValue = speakingStatus ? (Math.sin(time * 18) + 1) / 2 * 0.45 : 0;
                    mesh.morphTargetInfluences[mouthIndex] = THREE.MathUtils.lerp(
                        mesh.morphTargetInfluences[mouthIndex], mouthValue, 0.15 
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