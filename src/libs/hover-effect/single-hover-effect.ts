// createSingleHoverEffect.ts
import * as THREE from "three";
import gsap from "gsap";

export interface SingleHoverEffectOptions {
    parent: HTMLElement;          // The container element
    displacementImage: string;    // Path to the displacement map
    image1: string;               // Path (or video src) for the first image
    image2: string;               // Path (or video src) for the second image

    imagesRatio?: number;         // Default: 1.0
    intensity?: number;           // Overall intensity fallback
    intensity1?: number;          // Distortion intensity on the first image
    intensity2?: number;          // Distortion intensity on the second image
    angle?: number;               // Common angle fallback (default: Math.PI/4)
    angle1?: number;              // Angle for the first image
    angle2?: number;              // Angle for the second image
    speed?: number;               // Fallback speed if speedIn/out are not provided
    speedIn?: number;             // Default: 1.6
    speedOut?: number;            // Default: 1.2
    hover?: boolean;              // If true, transitions on mouseenter/out
    easing?: string;              // GSAP easing (default: 'expo.out')
    video?: boolean;              // If true, image1/image2 are used as <video> sources
}

export interface SingleHoverEffectController {
    next: () => void;     // Go from image1 → image2
    previous: () => void; // Go from image2 → image1
}

/**
 * A typed version of Robin Delaporte’s original two-image hover effect.
 */
export function createSingleHoverEffect(
    opts: SingleHoverEffectOptions
): SingleHoverEffectController | undefined {
    console.log(
        "%c Hover effect (Single) by Robin Delaporte – https://github.com/robin-dela/hover-effect",
        "color: #bada55; font-size: 0.8rem"
    );

    // Helper to pick the first defined argument
    function firstDefined<T>(...args: (T | undefined)[]): T | undefined {
        return args.find((arg) => arg !== undefined);
    }

    const parent = opts.parent;
    const dispImage = opts.displacementImage;
    const image1 = opts.image1;
    const image2 = opts.image2;

    if (!parent) {
        console.warn("SingleHoverEffect: no parent element provided.");
        return;
    }
    if (!dispImage || !image1 || !image2) {
        console.warn("SingleHoverEffect: displacementImage/image1/image2 missing.");
        return;
    }

    // Fallback logic
    const imagesRatio = firstDefined<number>(opts.imagesRatio, 1.0) as number;
    const intensity1 = firstDefined<number>(opts.intensity1, opts.intensity, 1) as number;
    const intensity2 = firstDefined<number>(opts.intensity2, opts.intensity, 1) as number;
    const commonAngle = firstDefined<number>(opts.angle, Math.PI / 4) as number;
    const angle1 = firstDefined<number>(opts.angle1, commonAngle) as number;
    const angle2 = firstDefined<number>(opts.angle2, -commonAngle * 3) as number;
    const speedIn = firstDefined<number>(opts.speedIn, opts.speed, 1.6) as number;
    const speedOut = firstDefined<number>(opts.speedOut, opts.speed, 1.2) as number;
    const userHover = firstDefined<boolean>(opts.hover, true) as boolean;
    const easing = firstDefined<string>(opts.easing, "expo.out") as string;
    const useVideo = firstDefined<boolean>(opts.video, false) as boolean;

    // Scene + Camera
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

    // Render function
    function render() {
        renderer.render(scene, camera);
    }

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
    uniform vec4 res;

    mat2 getRotM(float angle){
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }

    void main(){
      // displacement
      vec4 dispTex = texture2D(disp, vUv);
      vec2 dispVec = dispTex.rg;

      // Simple approach
      vec2 uv = vUv;

      vec2 distortedPos1 = uv + getRotM(angle1) * dispVec * intensity1 * dispFactor;
      vec2 distortedPos2 = uv + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);

      vec4 _texture1 = texture2D(texture1, distortedPos1);
      vec4 _texture2 = texture2D(texture2, distortedPos2);

      gl_FragColor = mix(_texture1, _texture2, dispFactor);
    }
  `;

    // Load displacement
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    const disp = loader.load(dispImage, render);
    disp.magFilter = disp.minFilter = THREE.LinearFilter;

    // We will store texture1/texture2 in local variables
    let tex1: THREE.Texture;
    let tex2: THREE.Texture;

    if (useVideo) {
        // Video-based approach
        const videoEl1 = document.createElement("video");
        videoEl1.autoplay = true;
        videoEl1.loop = true;
        videoEl1.muted = true;
        videoEl1.src = image1;
        videoEl1.load();

        const videoEl2 = document.createElement("video");
        videoEl2.autoplay = true;
        videoEl2.loop = true;
        videoEl2.muted = true;
        videoEl2.src = image2;
        videoEl2.load();

        tex1 = new THREE.VideoTexture(videoEl1);
        tex2 = new THREE.VideoTexture(videoEl2);
        tex1.magFilter = tex1.minFilter = THREE.LinearFilter;
        tex2.magFilter = tex2.minFilter = THREE.LinearFilter;

        // Update textures on loadeddata
        videoEl1.addEventListener("loadeddata", () => {
            videoEl1.play();
            tex1 = new THREE.VideoTexture(videoEl1);
            tex1.magFilter = tex1.minFilter = THREE.LinearFilter;
            material.uniforms.texture1.value = tex1;
        });
        videoEl2.addEventListener("loadeddata", () => {
            videoEl2.play();
            tex2 = new THREE.VideoTexture(videoEl2);
            tex2.magFilter = tex2.minFilter = THREE.LinearFilter;
            material.uniforms.texture2.value = tex2;
        });

        // Continuously render if video is used
        requestAnimationFrame(function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        });
    } else {
        // Static images
        tex1 = loader.load(image1, render);
        tex2 = loader.load(image2, render);
        tex1.magFilter = tex1.minFilter = THREE.LinearFilter;
        tex2.magFilter = tex2.minFilter = THREE.LinearFilter;
    }

    // Aspect calculation
    let a1: number = 1;
    let a2: number = 1;

    function calcAspect() {
        if (parent.offsetHeight / parent.offsetWidth < imagesRatio) {
            a1 = 1;
            a2 = (parent.offsetHeight / parent.offsetWidth) / imagesRatio;
        } else {
            a1 = (parent.offsetWidth / parent.offsetHeight) * imagesRatio;
            a2 = 1;
        }
    }
    calcAspect();

    // Shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            dispFactor: { value: 0.0 },
            disp: { value: disp },
            texture1: { value: tex1 },
            texture2: { value: tex2 },
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

    // Transitions
    function transitionIn() {
        gsap.to(material.uniforms.dispFactor, {
            duration: speedIn,
            value: 1,
            ease: easing,
            onUpdate: render,
            onComplete: render,
        });
    }

    function transitionOut() {
        gsap.to(material.uniforms.dispFactor, {
            duration: speedOut,
            value: 0,
            ease: easing,
            onUpdate: render,
            onComplete: render,
        });
    }

    // Hover events
    if (userHover) {
        parent.addEventListener("mouseenter", transitionIn);
        parent.addEventListener("mouseleave", transitionOut);
        parent.addEventListener("touchstart", transitionIn);
        parent.addEventListener("touchend", transitionOut);
    }

    // Resize handling
    window.addEventListener("resize", () => {
        renderer.setSize(parent.offsetWidth, parent.offsetHeight);
        calcAspect();
        material.uniforms.res.value.set(
            parent.offsetWidth,
            parent.offsetHeight,
            a1,
            a2
        );
        mesh.geometry = new THREE.PlaneGeometry(parent.offsetWidth, parent.offsetHeight, 1);
        render();
    });

    // Return control methods
    return {
        next: transitionIn,     // image1 → image2
        previous: transitionOut // image2 → image1
    };
}
