import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { gsap } from 'gsap'
// import * as dat from 'dat.gui'

const parameter = {

}

//  Debug
// const gui = new dat.GUI({
//     closed: true,
//     width: 400
// })

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
dracoLoader.setDecoderPath('draco/')
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
const bakedTexture1 = textureLoader.load('textures/night_bake.jpg')
const bakedTexture2 = textureLoader.load('textures/Van_bake.jpg')
const social = textureLoader.load('textures/social.jpg')

bakedTexture1.flipY = false
bakedTexture1.encoding = THREE.sRGBEncoding
bakedTexture2.flipY = false
bakedTexture2.encoding = THREE.sRGBEncoding
social.flipY = false
social.encoding = THREE.sRGBEncoding

// baked material
const bakedMaterial1 = new THREE.MeshBasicMaterial({ map: bakedTexture1 });
const bakedMaterial2 = new THREE.MeshBasicMaterial({ map: bakedTexture2 });
const strings = new THREE.MeshBasicMaterial({ color: '#767676'}) 
const earphoneWire = new THREE.MeshBasicMaterial({ color: '#3E979A'})
const red = new THREE.MeshBasicMaterial({ color: '#ff5349'})
const yellow = new THREE.MeshBasicMaterial({ color: '#f6db16'})
const socialMaterial = new THREE.MeshBasicMaterial({ map: social})

// Groups
const mainGroup = new THREE.Group()
const coverGroup = new THREE.Group()


// Room
let bakedRoom, breakingBad, vanTouched = false
gltfLoader.load(
    'model/Room.glb',
    (gltf)=>
    {
        // console.log(gltf.scene);
        bakedRoom = gltf.scene.children.find(child => child.name === 'Room')
        bakedRoom.material = bakedMaterial1

        breakingBad = gltf.scene.children.find(child => child.name === 'Breaking_Bad')
        breakingBad.material = bakedMaterial2
        

        const tyre = gltf.scene.children.find(child => child.name === 'Tyres')
        tyre.material = bakedMaterial2

        const laptopKeys = gltf.scene.children.find(child => child.name === 'Laptop_Keys')
        laptopKeys.material = bakedMaterial2
        
        const mobile = gltf.scene.children.find(child => child.name === 'Mobile')
        mobile.material = bakedMaterial2

        const string = gltf.scene.children.find(child => child.name === 'Strings')
        string.material = strings

        const earphone = gltf.scene.children.find(child => child.name === 'Earphone_Wire')
        earphone.material = earphoneWire

        const Pen_1 = gltf.scene.children.find(child => child.name === 'Pen_1')
        Pen_1.material = earphoneWire
        
        const Pen_2 = gltf.scene.children.find(child => child.name === 'Pen_2')
        Pen_2.material = red

        const Pen_3 = gltf.scene.children.find(child => child.name === 'Pen_3')
        Pen_3.material = earphoneWire

        const Pen_4 = gltf.scene.children.find(child => child.name === 'Pen_4')
        Pen_4.material = yellow

        const num0 = gltf.scene.children.find(child => child.name === 'Num_0')
        num0.material = bakedMaterial1


        const num1 = gltf.scene.children.find(child => child.name === 'Num_1')
        num1.material = bakedMaterial1

        const num2 = gltf.scene.children.find(child => child.name === 'Num_2')
        num2.material = bakedMaterial1

        const num3 = gltf.scene.children.find(child => child.name === 'Num_3')
        num3.material = bakedMaterial1

        const github = gltf.scene.children.find(child => child.name === 'Github')
        github.material = socialMaterial

        const linkedIn = gltf.scene.children.find(child => child.name === 'LinkedIn')
        linkedIn.material = socialMaterial

        const gmail = gltf.scene.children.find(child => child.name === 'Email')
        gmail.material = socialMaterial

        mainGroup.add(gltf.scene)
        // console.log(mainGroup);
    }
)

// Cover
let cover
gltfLoader.load('model/Blade_Covers.glb',
    (gltf) => {
        cover = gltf.scene.children.find(child => child.name === 'Blade_Cover') 
        cover.material = bakedMaterial1
        cover.position.set(0,0,0)
        coverGroup.position.set(
            3.090775489807129,
            3.0487728118896484,
            -2.730968713760376
        )
        coverGroup.add(cover)
    }
)

// Blade
let blade, num = 1
gltfLoader.load('model/Blades.glb',
    (gltf) => {
        blade = gltf.scene.children.find(child => child.name === 'Blade') 
        blade.material = bakedMaterial1
        blade.position.set(
            -0.574481725692749,
            0.0009832382202148438,
            0
        )
        coverGroup.add(blade)
        mainGroup.add(coverGroup)
    }
)

mainGroup.position.set(0, -4, 0)
scene.add(mainGroup)
// gui.add(mainGroup.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('Rotate')

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Gsap
const aboutTimeLine = gsap.timeline()
const projectTimeLine = gsap.timeline()
const duration = 3
// const ease = 'none'
let animationFinished = false

// Functions
const monitorImage = textureLoader.load('textures/About_me.jpg')
monitorImage.flipY = false
monitorImage.encoding = THREE.sRGBEncoding
const displayMon = new THREE.MeshBasicMaterial({ map: monitorImage });

let previous_use = null
let roomInteracted = false

const monitorAnimation = (xPos, yPos, zPos, xCon, yCon, zCon) => {
    animationFinished = false
    controls.enabled = false
    if(!animationFinished)
    {
        // console.log(controls);
        animationFinished = true
        if(aboutTimeLine.reversed())
        {
            aboutTimeLine.reversed(!aboutTimeLine.reversed())
        }
        aboutTimeLine.to(camera.position, {
            duration:2,
            z: zPos,
            ease: 'power2.inOut',
        })
        .to(controls.target, {
            duration:3,
            x: xCon,
            y: yCon,
            z: zCon,
            ease: "power3.inOut",
        }, '<')
        .to(camera.position, {
            duration:2,
            x: xPos,
            y: yPos,
            ease: "power3.inOut",
        }, '<')
    }
}

const portfolioImage = textureLoader.load('textures/portfolio_website.jpg')
portfolioImage.flipY = false
portfolioImage.encoding = THREE.sRGBEncoding

const goanCartImage = textureLoader.load('textures/GoanCart.jpg')
goanCartImage.flipY = false
goanCartImage.encoding = THREE.sRGBEncoding

const displaylapportfolio = new THREE.MeshBasicMaterial({ map: portfolioImage})
const displaylapgoancart = new THREE.MeshBasicMaterial({ map: goanCartImage });

const projectMaterial = [displaylapportfolio, displaylapgoancart]

let currentProject = 0

const laptopAnimation = (xPos, yPos, zPos, xCon, yCon, zCon) => {
    animationFinished = false
    controls.enabled = false
    if(!animationFinished)
        {
            animationFinished = true
            if(projectTimeLine.reversed())
            {
                projectTimeLine.reversed(!projectTimeLine.reversed())
            }
            projectTimeLine.to(camera.position, {
                duration: 2,
                z: zPos,
                ease: "power3.inOut",
            })
            .to(controls.target, {
                duration:2,
                x: xCon,
                y: yCon,
                z: zCon,
                ease: "power3.inOut",
            },'<')
              .to(camera.position, {
                duration:2,
                x: xPos,
                y: yPos,
                ease: "power3.inOut",
            },'<');
        }
}

const displayMonitor = (xPos, yPos, zPos, xCon, yCon, zCon) => {
    animationFinished = false

    monitorAnimation(xPos, yPos, zPos, xCon, yCon, zCon)
    
    currentIntersect.object.material = displayMon
    roomInteracted = true
}

const displayLaptop = (xPos, yPos, zPos, xCon, yCon, zCon) => {
    animationFinished = false

    laptopAnimation(xPos, yPos, zPos, xCon, yCon, zCon)

    if(currentProject == projectMaterial.length)
    {
        currentProject = 0
    }
    else
    {
        currentIntersect.object.material = projectMaterial[currentProject]
        currentIntersect.object.material.needsUpdate = true
        currentProject += 1
    }
    roomInteracted = true
}

const controlSpeed = (speed) => {
    // console.log(`This is my speed. ${speed}`);
    num = speed
    if(num > 0)
    {
        blade.rotation.needsUpdate = true;
    }
    else
    {
        coverGroup.rotation.needsUpdate = true
        blade.rotation.needsUpdate = true;
    }

}


const displayMobile = () => {
    // console.log("This is my mobile.");
    // roomInteracted = true
}

// Load Sound
const playGuitarSounds = []

const strum = new Audio('sounds/Guitar_Strum.mp3')
const fretboard = new Audio('sounds/Slide_Fretboard.mp3')

playGuitarSounds.push(strum, fretboard)

const guitar = () => {

    let currentPlay = Math.floor(Math.random(0, playGuitarSounds.length) * 2)
    playGuitarSounds[currentPlay].volume = Math.random()
    playGuitarSounds[currentPlay].currentTime = 0
    playGuitarSounds[currentPlay].play()

}

// Laod Sounds
const playBreakBadSounds = []

const jesse = new Audio('sounds/Jesse_Jesse.mp3')
const sayMyName = new Audio('sounds/Say_My_Name.mp3')
const yeahScience = new Audio('sounds/Yeah_Science.mp3')
const damnRight = new Audio('sounds/Youre_God_Damn_Right.mp3')
const whatUpBiatch = new Audio('sounds/What_Up_Biatch.mp3')

playBreakBadSounds.push(jesse, sayMyName, damnRight, whatUpBiatch, yeahScience)
// console.log(playSounds,'yoyo', playSounds.length);

const breakingBadVan = () => {
    // vanTouched = true
    // setTimeout = (() => {
    //     console.log('ched');
    //     vanTouched = false
    //     // return vanTouched
    // }, 1000)
    let currentPlay = Math.floor(Math.random(0, playBreakBadSounds.length) * 5)
    playBreakBadSounds[currentPlay].volume = Math.random()
    playBreakBadSounds[currentPlay].currentTime = 0
    playBreakBadSounds[currentPlay].play()


}

const linkedIn = () => {
    window.open('https://www.linkedin.com/in/jeslif-fernandes-b19330200/', '_blank')
}

const github = () => {
    window.open('https://github.com/jeslifs', '_blank')
}

const email = () => {
    window.open('mailto:jeslif2020@gmail.com', '_blank')
}
const room = () => {
    
    if(roomInteracted === true)
    {
        if(previous_use === 'Laptop_Screen')
        {
            projectTimeLine.reverse(true)
        }
        else if(previous_use === 'Monitor_Screen')
        {
            aboutTimeLine.reverse(true)
        }
        controls.enabled = true
        roomInteracted = false
    }

}


// Move Event
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
})


// Click Event
window.addEventListener('click', () =>{
    if(currentIntersect)
    {
        // console.log(currentIntersect.object.name, 'clicked')
        switch(currentIntersect.object.name)
        {
            case 'Breaking_Bad':
                breakingBadVan()
                break
            
            case 'Tyres':
                breakingBadVan()
                break
            
            case 'Num_0':
                controlSpeed(0)
                break

            case 'Num_1':
                controlSpeed(1)
                break

            case 'Num_2':
                controlSpeed(2)
                break

            case 'Num_3':
                controlSpeed(3)
                break

            case 'Mobile_Screen':
                displayMobile()
                break

            case 'Laptop_Screen':
                previous_use = currentIntersect.object.name
                displayLaptop(-2.25, -0.5, -0.75, -9.25, 0.25, 4.25)
                break

            case 'Monitor_Screen':
                previous_use = currentIntersect.object.name
                displayMonitor(-2, -0.25, -1.85, -34, -1.5, -2)
                break

            case 'Strings':
                guitar()
                break

            case 'Room':
                room()
                break

            case 'LinkedIn':
                linkedIn()
                break

            case 'Github':
                github()
                break

            case 'Email':
                email()
                break

            case 'Mobile':
                displayMobile()
                break
        }
    }
})

window.addEventListener("touchstart", (event) => {
    mouse.x = (event.targetTouches[0].clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.targetTouches[0].clientY / window.innerHeight) * 2 + 1
})

window.addEventListener("touchend", () => {
    if(currentIntersect)
    {
        switch(currentIntersect.object.name)
        {
            case 'Breaking_Bad':
                breakingBadVan()
                break
            
            case 'Tyres':
                breakingBadVan()
                break
            
            case 'Num_0':
                controlSpeed(0)
                break

            case 'Num_1':
                    controlSpeed(1)
                break

            case 'Num_2':
                controlSpeed(2)
                    break

            case 'Num_3':
                controlSpeed(3)
                    break

            case 'Mobile':
                    displayMobile()
                break

                case 'Mobile_Screen':
                displayMobile()
                break

            case 'Laptop_Screen':
                previous_use = currentIntersect.object.name
                displayLaptop(-2.25, -0.5, -0.75, -9.25, 0.25, 4.25)
                break

            case 'Monitor_Screen':
                previous_use = currentIntersect.object.name
                displayMonitor(-1.45, -0.5, -1.85, -34, -1.5, -2)
                break

            case 'Strings':
                guitar()
                break

            case 'Room':
                room()
                break

            case 'LinkedIn':
                linkedIn()
                break
    
            case 'Github':
                github()
                break
    
            case 'Email':
                email()
                break
        }
    }
});

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// Resize
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

    // Update effectComposer
    effectComposer.setSize(sizes.width, sizes.height)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(12.5, 5, 12.5) 
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.autoRotate = true
controls.enablePan = false
// controls.minAzimuthAngle = Math.PI / 0.52
// controls.maxAzimuthAngle = Math.PI / 1.77; //end
// controls.minPolarAngle = Math.PI / 10;
controls.maxPolarAngle = Math.PI / 1.83;
controls.maxDistance = 35;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
parameter.clearColor = '#0b0b0b'
renderer.setClearColor(parameter.clearColor)

// Post processing

// Render Target 
const renderTarget = new THREE.WebGLRenderTarget(sizes.width,
    sizes.height,
    { 
        samples: renderer.getPixelRatio() === 1 ? 2 : 0,
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        encoding: THREE.sRGBEncoding
     
    })

const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// GUI
// gui.addColor(parameter, 'clearColor').onChange(()=>
// {
//     renderer.setClearColor(parameter.clearColor)
// })


// gui.add(camera.position, 'x').min(-100).max(900).step(0.25).name('CameraX')
// gui.add(camera.position, 'y').min(-100).max(900).step(0.25).name('CameraY')
// gui.add(camera.position, 'z').min(-100).max(900).step(0.25).name('CameraZ')
// gui.add(controls.target, 'x').min(-100).max(900).step(0.25).name('controlsX')
// gui.add(controls.target, 'y').min(-100).max(900).step(0.25).name('controlsY')
// gui.add(controls.target, 'z').min(-100).max(900).step(0.25).name('controlsZ')
// gui.add(camera.rotation, 'x').min(-100).max(900).step(0.25).name('CamerarotationX')
// gui.add(camera.rotation, 'y').min(-100).max(900).step(0.25).name('CamerarotationY')
// gui.add(camera.rotation, 'z').min(-100).max(900).step(0.25).name('CamerarotationZ')

//Animate
const clock = new THREE.Clock()

let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    if(cover && blade)
    {

        if(num == 0)
        {
            coverGroup.rotation.y = 0
        }
        else
        {
            coverGroup.rotation.y = Math.sin(elapsedTime * 0.5) * Math.PI / 4
            blade.rotation.x = elapsedTime * 10 * num
        }
        // mainGroup.rotation.y = Math.sin(elapsedTime * 0.05) * Math.PI / 3.5

    }

    if(bakedRoom)
    {
        raycaster.setFromCamera(mouse, camera)
        const intersectionPoint = raycaster.intersectObjects(scene.children, true)

        if(intersectionPoint.length)
        {
            currentIntersect = intersectionPoint[0]
        }
        else
        {
            currentIntersect = null
        }
    }

    // if(breakingBad && vanTouched)
    // {
    //     breakingBad.rotation.x = Math.sin(elapsedTime * 10) * Math.PI /  90
    //     breakingBad.rotation.y = Math.cos(elapsedTime * 10) * Math.PI / 90 
    // }
    
    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()