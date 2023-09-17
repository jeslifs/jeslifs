import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// import gsap from 'gsap';
import night from '../assets/night_bake.png';
import day from '../assets/day_bake.png';
const roomUrl = new URL('../assets/jeslif.glb',import.meta.url);


export default function Scripts() {

    const mount = useRef(null);

    useLayoutEffect(() => {

        // setup: Scene, camera, orbit
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );

        const renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.setClearColor(0xffffff);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        mount.current && mount.current.appendChild(renderer.domElement);

        const orbit = new OrbitControls(camera, renderer.domElement);
        camera.position.set(10, 17, 10);
        camera.lookAt(scene.position);
        orbit.enableDamping = true;
        orbit.dampingFactor = 0.12;
        orbit.enableZoom = false;
        orbit.enablePan = false;
        // orbit.autoRotate = true; 
        // orbit.autoRotateSpeed =  10* Math.abs(Math.sin(1));
        orbit.minAzimuthAngle = Math.PI / 0.5; // start
        orbit.maxAzimuthAngle = Math.PI / 1.8; //end
        orbit.minPolarAngle = Math.PI / 10;
        orbit.maxPolarAngle = Math.PI / 1.83;
        orbit.maxDistance = 15;


        // zoom effect
        const track = new TrackballControls(camera, renderer.domElement);
        track.noRotate = true;
        track.noPan = true;
        track.noZoom = false;
        track.zoomSpeed = 1.5;

        //  gsap
        // const TL = gsap.timeline();
        // window.addEventListener('mousedown', function () {
        //     TL.to(camera.position, {
        //         z:14,
        //         duration: 1.5,
        //         onUpdate: function () {
        //             camera.lookAt(scene.position)
        //         }
        //     })

        //     .to(camera.position, {
        //         y:14,
        //         duration: 1.5,
        //         onUpdate: function() { 
        //             camera.lookAt(0, 0, 0)
        //         }
        //     })
        
        //     .to(camera.position, {
        //         x:10,
        //         y:5,
        //         z:3,
        //         duration: 1.5,
        //         onUpdate: function() { 
        //             camera.lookAt(0, 0, 0)
        //         }
        //     })
            
        // });

        // lights
        const ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(1,1,-3);
        scene.add(directionalLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(2,1,-3);
        scene.add(directionalLight1);

        // loading
        const loadingManager = new THREE.LoadingManager();
        const progressBarContainer = document.querySelector('.loader');
        const textureLoader = new THREE.TextureLoader();
        const texture_day =  textureLoader.load(day);
        texture_day.colorSpace = THREE.SRGBColorSpace;
        texture_day.flipY = false;
        const texture_night = textureLoader.load(night);
        texture_night.colorSpace = THREE.SRGBColorSpace;
        texture_night.flipY = false;

        const material = new THREE.MeshStandardMaterial({map:texture_day})
        let isDayTexture = true; 

        //toggle between day and night textures
        function toggleTextures() 
        {
            if(isDayTexture)
            {
                material.map = texture_day;
            } 
            else 
            {
                material.map = texture_night;
            }

            isDayTexture = !isDayTexture;
            material.needsUpdate = true; 
        }
        setInterval(toggleTextures, 30000);


        // model
        const assetLoader = new GLTFLoader(loadingManager);

        // draco
        const dLoader = new DRACOLoader();
        dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        dLoader.setDecoderConfig({type:'js'});
        assetLoader.setDRACOLoader(dLoader);

        assetLoader.load(roomUrl.href, function (gltf) {
            const model = gltf.scene;
            model.traverse((child) => {
                if(child instanceof THREE.Mesh)
                {
                    child.material = material;
                }    
            });
            scene.add(model);
            model.position.set(0, -3, 0);  
        }, undefined, function (error) {
            console.log(error);
        });

        dLoader.dispose();

        loadingManager.onLoad = function () {
            progressBarContainer.style.display = 'none';        
        }

        // raycaster
        const mousePosition = new THREE.Vector2();
        const rayCaster = new THREE.Raycaster();

        window.addEventListener('mousemove', function (e) {
            mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
            mousePosition.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
            rayCaster.setFromCamera(mousePosition, camera);
            const intersect = rayCaster.intersectObjects(scene.children);
           
            console.log(intersect);

        });

        //  animate
        function animate() {
            const target = orbit.target;
            orbit.update();
            track.target.set(target.x, target.y, target.z);
            track.update();
            // toggleTextures();
            renderer.render(scene, camera);

        }
        renderer.setAnimationLoop(animate);

        // responsive 
        window.addEventListener('resize', function () {
            camera.aspect = this.window.innerWidth / this.window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(this.window.innerWidth, this.window.innerHeight);
            
        });     

    }, []);

  return (
    <div ref={mount} />
  )
}
