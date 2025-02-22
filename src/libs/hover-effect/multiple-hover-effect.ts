// createMultiImageEffect.ts
import * as THREE from "three";
import gsap from "gsap";

export interface MultiImageEffectOptions {
    parent: HTMLElement;          // Container element
    displacementImage: string;    // Path to displacement map
    images: string[];             // Array of image URLs
    imagesRatio?: number;         // Default: 1.0
    speedIn?: number;             // Default: 1.2
    speedOut?: number;            // Default: 1.0
    intensity1?: number;          // Distortion intensity for the "current" image
    intensity2?: number;          // Distortion intensity for the "next" image
    angle1?: number;              // Angle for the current image
    angle2?: number;              // Angle for the next image
    hover?: boolean;              // If true, we do transitions on hover
    easing?: string;              // GSAP easing (default: 'expo.out')
}

export interface MultiImageEffectController {
    next: () => void;      // Advance to the next image (cycling)
    previous: () => void;  // Go to the previous image (cycling)
}

export function createMultiImageEffect(
    opts: MultiImageEffectOptions
): MultiImageEffectController | undefined {
    console.log(
        "%c Hover effect (Multi) by Robin Delaporte (modified) ",
        "color: #bada55; font-size: 0.8rem"
    );

    const {
        parent,
        displacementImage,
        images,
        imagesRatio = 1.0,
        speedIn = 1.2,
        speedOut = 1.0,
        intensity1 = 1,
        intensity2 = 1,
        angle1 = Math.PI / 4,
        angle2 = - (Math.PI / 4) * 3,
        hover = false,
        easing = "expo.out",
    } = opts;

    if (!parent) {
        console.warn("MultiImageEffect: no parent element provided.");
        return;
    }
    if (!displacementImage || !images || images.length < 2) {
        console.warn(
            "MultiImageEffect: displacementImage is required and images[] must have at least 2 items."
        );
        return;
    }

    // Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
        parent.offsetWidth / -2,
        parent.offsetWidth / 2,
        parent.offsetHeight / 2,
        parent.offsetHeight / -2,
        1,
        1000
    );
    camera.position.z = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 0.0);
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
    parent.appendChild(renderer.domElement);

    function render() {
        renderer.render(scene, camera);
    }

    // Load textures
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";

    const dispTex = loader.load(displacementImage, render);
    dispTex.magFilter = dispTex.minFilter = THREE.LinearFilter;

    const textures = images.map((url) => {
        const t = loader.load(url, render);
        t.magFilter = t.minFilter = THREE.LinearFilter;
        return t;
    });

    // Keep track of current + previous index
    let currentIndex = 0;
    let isTransitioning = false;

    // Shaders
    const vertexShader = `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `;

    const fragmentShader = `
    varying vec2 vUv;

    uniform float dispFactor;
    uniform sampler2D disp;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform float angle1;
    uniform float angle2;
    uniform float intensity1;
    uniform float intensity2;

    void main(){
      vec4 dispTex = texture2D(disp, vUv);
      vec2 dispVec = dispTex.rg;

      vec2 uv = vUv;
      vec2 distortedPos1 = uv + mat2(cos(angle1), -sin(angle1), sin(angle1), cos(angle1)) 
                              * dispVec * intensity1 * dispFactor;

      vec2 distortedPos2 = uv + mat2(cos(angle2), -sin(angle2), sin(angle2), cos(angle2))
                              * dispVec * intensity2 * (1.0 - dispFactor);

      vec4 _texture1 = texture2D(texture1, distortedPos1);
      vec4 _texture2 = texture2D(texture2, distortedPos2);

      gl_FragColor = mix(_texture1, _texture2, dispFactor);
    }
  `;

    // Calculate aspect
    let a1: number = 1;
    let a2: number = 1;
    function computeAspect() {
        if (parent.offsetHeight / parent.offsetWidth < imagesRatio) {
            a1 = 1;
            a2 = (parent.offsetHeight / parent.offsetWidth) / imagesRatio;
        } else {
            a1 = (parent.offsetWidth / parent.offsetHeight) * imagesRatio;
            a2 = 1;
        }
    }
    computeAspect();

    // ShaderMaterial
    const material = new THREE.ShaderMaterial({
        uniforms: {
            dispFactor: { value: 0.0 },
            disp: { value: dispTex },
            texture1: { value: textures[0] }, // start with the first image
            texture2: { value: textures[1] }, // second image
            angle1: { value: angle1 },
            angle2: { value: angle2 },
            intensity1: { value: intensity1 },
            intensity2: { value: intensity2 },
            res: {
                value: new THREE.Vector4(
                    parent.offsetWidth,
                    parent.offsetHeight,
                    a1,
                    a2
                ),
            },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        opacity: 1.0,
    });

    // Plane geometry
    const geometry = new THREE.PlaneGeometry(parent.offsetWidth, parent.offsetHeight, 1);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    render();

    // Resize handling
    window.addEventListener("resize", () => {
        renderer.setSize(parent.offsetWidth, parent.offsetHeight);
        computeAspect();
        // TODO: implement aspect ratio
        // material.uniforms.res.value.set(
        //     offsetWidth, offsetHeight, a1, a2
        // );
        mesh.geometry = new THREE.PlaneGeometry(parent.offsetWidth, parent.offsetHeight, 1);
        render();
    });

    // Transition logic
    function transitionTo(index: number, duration: number) {
        if (isTransitioning) return;
        if (index < 0 || index >= textures.length) return;
        if (index === currentIndex) return;

        isTransitioning = true;

        // set "texture2" to the next texture
        material.uniforms.texture2.value = textures[index];

        gsap.to(material.uniforms.dispFactor, {
            duration,
            value: 1,
            ease: easing,
            onUpdate: render,
            onComplete: () => {
                // finalize
                material.uniforms.texture1.value = textures[index];
                material.uniforms.dispFactor.value = 0.0;
                currentIndex = index;
                isTransitioning = false;
                render();
            },
        });
    }

    function next() {
        const nextIndex = (currentIndex + 1) % textures.length;
        transitionTo(nextIndex, speedIn);
    }

    function previous() {
        // Go backward in a cycling manner
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = textures.length - 1;
        }
        transitionTo(prevIndex, speedOut);
    }

    // If hover is true, do something (e.g., next on enter, prev on leave)
    if (hover) {
        parent.addEventListener("mouseenter", next);
        parent.addEventListener("mouseleave", previous);
        // optional for mobile
        parent.addEventListener("touchstart", next);
        parent.addEventListener("touchend", previous);
    }

    return {
        next,
        previous,
    };
}
