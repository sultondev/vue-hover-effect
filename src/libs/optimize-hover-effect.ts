import * as THREE from "three";
import gsap from "gsap";

/**
 * Interface defining all supported configuration options for the hover effect.
 */
export interface HoverEffectOptions {
    parent: HTMLElement;           // The container <div>
    displacementImage: string;     // Path/URL to the displacement map
    image1: string;                // Path/URL to the first image (or video if video=true)
    image2: string;                // Path/URL to the second image (or video if video=true)

    /**
     * Layout / Distortion parameters (all optional).
     */
    imagesRatio?: number;   // Default: 1.0
    intensity?: number;     // Convenience property if you want a single intensity
    intensity1?: number;    // Default: uses 'intensity' if provided
    intensity2?: number;    // Default: uses 'intensity' if provided
    angle?: number;         // Common default angle if angle1/angle2 are not set
    angle1?: number;
    angle2?: number;

    /**
     * Transition parameters (all optional).
     */
    speed?: number;   // If speedIn/speedOut are not set, use this
    speedIn?: number; // Default: 1.6
    speedOut?: number; // Default: 1.2
    hover?: boolean;   // Default: true
    easing?: string;   // gsap easing, default: 'expo.out'
    video?: boolean;   // If true, image1 and image2 are used as <video> src
}

export interface HoverEffectController {
    /**
     * Manually trigger the 'in' transition (e.g., on hover).
     */
    next: () => void;
    /**
     * Manually trigger the 'out' transition (e.g., on mouseleave).
     */
    previous: () => void;
}

/**
 * Type-safe, dynamic hover-effect wrapper based on Robin Delaporte’s original code.
 */
export function createHoverEffect(opts: HoverEffectOptions): HoverEffectController | undefined {
    // Vertex Shader
    const vertex = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `;

    // Fragment Shader
    const fragment = `
    varying vec2 vUv;

    uniform float dispFactor;
    uniform float dpr;
    uniform sampler2D disp;

    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform float angle1;
    uniform float angle2;
    uniform float intensity1;
    uniform float intensity2;
    uniform vec4 res;
    uniform vec2 parent;

    mat2 getRotM(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }

    void main() {
      vec4 disp = texture2D(disp, vUv);
      vec2 dispVec = vec2(disp.r, disp.g);

      vec2 uv = 0.5 * gl_FragCoord.xy / (res.xy) ;
      vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);

      vec2 distortedPosition1 = myUV + getRotM(angle1) * dispVec * intensity1 * dispFactor;
      vec2 distortedPosition2 = myUV + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);
      vec4 _texture1 = texture2D(texture1, distortedPosition1);
      vec4 _texture2 = texture2D(texture2, distortedPosition2);
      gl_FragColor = mix(_texture1, _texture2, dispFactor);
    }
  `;

    // Respect authorship
    console.log(
        "%c Hover effect by Robin Delaporte: https://github.com/robin-dela/hover-effect ",
        "color: #bada55; font-size: 0.8rem"
    );

    // Helper to pick the first defined argument
    function firstDefined<T>(...args: (T | undefined)[]): T | undefined {
        return args.find((arg) => arg !== undefined);
    }

    /**
     * Pull values from opts with fallback logic.
     */
    const parent = opts.parent;
    const dispImage = opts.displacementImage;
    const image1 = opts.image1;
    const image2 = opts.image2;

    const imagesRatio = firstDefined<number>(opts.imagesRatio, 1.0) as number;
    const intensity1 = firstDefined<number>(opts.intensity1, opts.intensity, 1) as number;
    const intensity2 = firstDefined<number>(opts.intensity2, opts.intensity, 1) as number;
    // 45 degrees by default
    const commonAngle = firstDefined<number>(opts.angle, Math.PI / 4) as number;
    const angle1 = firstDefined<number>(opts.angle1, commonAngle) as number;
    // -3x the angle by default (as in original code)
    const angle2 = firstDefined<number>(opts.angle2, -commonAngle * 3) as number;
    const speedIn = firstDefined<number>(opts.speedIn, opts.speed, 1.6) as number;
    const speedOut = firstDefined<number>(opts.speedOut, opts.speed, 1.2) as number;
    const userHover = firstDefined<boolean>(opts.hover, true) as boolean;
    const easing = firstDefined<string>(opts.easing, "expo.out") as string;
    const useVideo = firstDefined<boolean>(opts.video, false) as boolean;

    // Basic checks
    if (!parent) {
        console.warn("HoverEffect: parent is missing.");
        return;
    }
    if (!(image1 && image2 && dispImage)) {
        console.warn("HoverEffect: one or more of image1, image2, displacementImage is missing.");
        return;
    }

    // Setup Three.js scene
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

    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
    });
    renderer.setPixelRatio(2.0);
    renderer.setClearColor(0xffffff, 0.0);
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
    parent.appendChild(renderer.domElement);

    // Render function
    const render = () => {
        renderer.render(scene, camera);
    };

    // Load displacement texture
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    const disp = loader.load(dispImage, render);
    disp.magFilter = disp.minFilter = THREE.LinearFilter;

    let texture1: THREE.Texture;
    let texture2: THREE.Texture;

    if (useVideo) {
        // We’ll animate the scene continuously if we use video
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Prepare video elements
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

        // Create textures
        texture1 = new THREE.VideoTexture(videoEl1);
        texture2 = new THREE.VideoTexture(videoEl2);
        texture1.magFilter = texture1.minFilter = THREE.LinearFilter;
        texture2.magFilter = texture2.minFilter = THREE.LinearFilter;

        // Update texture2 on loaded data
        videoEl2.addEventListener(
            "loadeddata",
            () => {
                videoEl2.play();
                texture2 = new THREE.VideoTexture(videoEl2);
                texture2.magFilter = THREE.LinearFilter;
                texture2.minFilter = THREE.LinearFilter;
                mat.uniforms.texture2.value = texture2;
            },
            false
        );

        // Update texture1 on loaded data
        videoEl1.addEventListener(
            "loadeddata",
            () => {
                videoEl1.play();
                texture1 = new THREE.VideoTexture(videoEl1);
                texture1.magFilter = THREE.LinearFilter;
                texture1.minFilter = THREE.LinearFilter;
                mat.uniforms.texture1.value = texture1;
            },
            false
        );
    } else {
        // Static images
        texture1 = loader.load(image1, render);
        texture2 = loader.load(image2, render);
        texture1.magFilter = texture2.magFilter = THREE.LinearFilter;
        texture1.minFilter = texture2.minFilter = THREE.LinearFilter;
    }

    // Calculate how to scale the image
    let a1: number, a2: number;
    const parentRatio = parent.offsetHeight / parent.offsetWidth;
    if (parentRatio < imagesRatio) {
        a1 = 1;
        a2 = parentRatio / imagesRatio;
    } else {
        a1 = (parent.offsetWidth / parent.offsetHeight) * imagesRatio;
        a2 = 1;
    }

    // Shader material
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            intensity1: { value: intensity1 },
            intensity2: { value: intensity2 },
            dispFactor: { value: 0.0 },
            angle1: { value: angle1 },
            angle2: { value: angle2 },
            texture1: { value: texture1 },
            texture2: { value: texture2 },
            disp: { value: disp },
            res: {
                value: new THREE.Vector4(parent.offsetWidth, parent.offsetHeight, a1, a2),
            },
            dpr: { value: window.devicePixelRatio },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        opacity: 1.0,
    });

    // Plane geometry covering the parent
    const geometry = new THREE.PlaneGeometry(parent.offsetWidth, parent.offsetHeight, 1);
    const object = new THREE.Mesh(geometry, mat);
    scene.add(object);

    // Transition in / out
    function transitionIn() {
        gsap.to(mat.uniforms.dispFactor, {
            duration: speedIn,
            value: 1,
            ease: easing,
            onUpdate: render,
            onComplete: render,
        });
    }

    function transitionOut() {
        gsap.to(mat.uniforms.dispFactor, {
            duration: speedOut,
            value: 0,
            ease: easing,
            onUpdate: render,
            onComplete: render,
        });
    }

    // Attach event listeners if hover is desired
    if (userHover) {
        parent.addEventListener("mouseenter", transitionIn);
        parent.addEventListener("touchstart", transitionIn);
        parent.addEventListener("mouseleave", transitionOut);
        parent.addEventListener("touchend", transitionOut);
    }

    // On resize, update geometry + uniforms
    window.addEventListener("resize", () => {
        const newParentRatio = parent.offsetHeight / parent.offsetWidth;
        if (newParentRatio < imagesRatio) {
            a1 = 1;
            a2 = newParentRatio / imagesRatio;
        } else {
            a1 = (parent.offsetWidth / parent.offsetHeight) * imagesRatio;
            a2 = 1;
        }
        object.material.uniforms.res.value = new THREE.Vector4(
            parent.offsetWidth,
            parent.offsetHeight,
            a1,
            a2
        );
        renderer.setSize(parent.offsetWidth, parent.offsetHeight);
        render();
    });

    // Return an API to control transitions manually if needed
    return {
        next: transitionIn,
        previous: transitionOut,
    };
}
