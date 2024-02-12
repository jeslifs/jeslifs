import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'
import * as dat from 'dat.gui'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
console.log(firefliesVertexShader, firefliesFragmentShader);


const parameter = {

}

//  Debug

const gui = new dat.GUI({
    // closed: true,
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// loaders
const loadingBarElement = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(

    //loaded
    ()=>
    {
        gsap.delayedCall(0.5, ()=>{
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3, value:0})
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        })

    },

    //progress
    (itemUrl, itemsLoaded, itemsTotal)=>
    {
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }

)

// loaders
const gltfLoader = new GLTFLoader(loadingManager)
const textureLoader = new THREE.TextureLoader(loadingManager)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// Scene
const scene = new THREE.Scene()

//overlay
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: {value: 1}
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader:`
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)
 
// load texture
const bakedTexture = textureLoader.load('/textures/baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding


// baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xF8CE0F })
const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })

gltfLoader.load(
    'model/portal.glb',
    (gltf)=>
    {
        
        // gltf.scene.scale.set(5, 5, 5)
        gltf.scene.position.set(0, 0, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        

        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const poleLightMeshA = gltf.scene.children.find(child=> child.name === 'poleLightA')
        const poleLightMeshB = gltf.scene.children.find(child=> child.name === 'poleLightB')
        const portalLightMesh = gltf.scene.children.find(child=> child.name === 'portalLight')
        
        bakedMesh.material = bakedMaterial
        portalLightMesh.material = portalLightMaterial
        poleLightMeshA.material = poleLightMaterial
        poleLightMeshB.material = poleLightMaterial

        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('Rotate')
    }
)

// fire flies

const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)



for (let i=0; i<firefliesCount; i++)
{
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    // scalArray[i] = Math.random()

}
firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

const firefliesMaterial = new THREE.ShaderMaterial({ 
    uniforms:
    {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2)},
        uSize: { value: 100 }
    },
    vertexShader: firefliesVertexShader, 
    fragmentShader: firefliesFragmentShader,
    // transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
})

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')
// points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // update fireflies 
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-3.5, 4.5, -3.5) 
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
// renderer.toneMapping = THREE.ReinhardToneMapping
// renderer.toneMappingExposure = 3
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
parameter.clearColor = '#201919'
renderer.setClearColor(parameter.clearColor)
gui.addColor(parameter, 'clearColor').onChange(()=>
{
    renderer.setClearColor(parameter.clearColor)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()