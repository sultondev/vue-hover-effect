import { Scene,
    OrthographicCamera,
    WebGLRenderer,
    TextureLoader,
    LinearFilter,
    VideoTexture,
    ShaderMaterial,
    Vector4,
    PlaneGeometry,
    Mesh } from "three";

import type { HoverEffectFnOptions } from "src/types";
import gsap from "gsap"

const HoverEffect = async function(opts: HoverEffectFnOptions) {
    const vertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
    let texture1 = null;
    let texture2 = null;
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

    // please respect authorship and do not remove
    console.log(
        "%c Hover effect by Robin Delaporte: https://github.com/robin-dela/hover-effect ",
        "color: #bada55; font-size: 0.8rem"
    );

    function firstDefined(...args: any) {
        return args.find((arg: any) => arg !== undefined);
    }


    const parent = opts.parent;
    const dispImage = opts.displacementImage;
    const image1 = opts.image1;
    const image2 = opts.image2;
    const imagesRatio = firstDefined(opts.imagesRatio, 1.0);
    const intensity1 = firstDefined(opts.intensity1, opts.intensity, 1);
    const intensity2 = firstDefined(opts.intensity2, opts.intensity, 1);
    const commonAngle = firstDefined(opts.angle, Math.PI / 4); // 45 degrees by default, so grayscale images work correctly
    const angle1 = firstDefined(opts.angle1, commonAngle);
    const angle2 = firstDefined(opts.angle2, -commonAngle * 3);
    const speedIn = firstDefined(opts.speedIn, opts.speed, 1.6);
    const speedOut = firstDefined(opts.speedOut, opts.speed, 1.2);
    const userHover = firstDefined(opts.hover, true);
    const easing = firstDefined(opts.easing, "expo.out");
    let video = firstDefined(opts.video, false);

    if (!parent) {
        console.warn("Parent missing");
        return;
    }

    if (!(image1 && image2 && dispImage)) {
        console.warn("One or more images are missing");
        return;
    }

    const scene = new Scene();
    const camera = new OrthographicCamera(
        parent.offsetWidth / -2,
        parent.offsetWidth / 2,
        parent.offsetHeight / 2,
        parent.offsetHeight / -2,
        1,
        1000
    );

    camera.position.z = 1;

    const renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
    });

    renderer.setPixelRatio(2.0);
    renderer.setClearColor(0xffffff, 0.0);
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
    parent.appendChild(renderer.domElement);

    const render = function() {
        // This will be called by the TextureLoader as well as Gsap.
        renderer.render(scene, camera);
    };

    const loader = new TextureLoader();
    loader.crossOrigin = "";

    const disp = loader.load(dispImage, render);
    disp.magFilter = disp.minFilter = LinearFilter;

    if (video) {
        const animate = function() {
            requestAnimationFrame(animate);

            renderer.render(scene, camera);
        };
        animate();

        video = document.createElement("video");
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.src = image1;
        video.load();

        let video2 = document.createElement("video");
        video2.autoplay = true;
        video2.loop = true;
        video2.muted = true;
        video2.src = image2;
        video2.load();

        texture1 = new VideoTexture(video);
        texture2 = new VideoTexture(video2);
        texture1.magFilter = texture2.magFilter = LinearFilter;
        texture1.minFilter = texture2.minFilter = LinearFilter;

        video2.addEventListener(
            "loadeddata",
            function() {
                video2.play();

                texture2 = new VideoTexture(video2);
                texture2.magFilter = LinearFilter;
                texture2.minFilter = LinearFilter;

                mat.uniforms.texture2.value = texture2;
            },
            false
        );

        video.addEventListener(
            "loadeddata",
            function() {
                video.play();

                texture1 = new VideoTexture(video);

                texture1.magFilter = LinearFilter;
                texture1.minFilter = LinearFilter;

                mat.uniforms.texture1.value = texture1;
            },
            false
        );
    } else {
        texture1 = loader.load(image1, render);
        texture2 = loader.load(image2, render);
        texture1.magFilter = texture2.magFilter = LinearFilter;
        texture1.minFilter = texture2.minFilter = LinearFilter;
    }

    let a1, a2;
    const imageAspect = imagesRatio;
    if (parent.offsetHeight / parent.offsetWidth < imageAspect) {
        a1 = 1;
        a2 = parent.offsetHeight / parent.offsetWidth / imageAspect;
    } else {
        a1 = (parent.offsetWidth / parent.offsetHeight) * imageAspect;
        a2 = 1;
    }

    // @ts-ignore
    const mat = new ShaderMaterial({
        uniforms: {
            intensity1: {
                value: intensity1
            },
            intensity2: {
                value: intensity2
            },
            dispFactor: {
                value: 0.0
            },
            angle1: {
                value: angle1
            },
            angle2: {
                value: angle2
            },
            texture1: {
                value: texture1
            },
            texture2: {
                value: texture2
            },
            disp: {
                value: disp
            },
            res: {
                value: new Vector4(
                    parent.offsetWidth,
                    parent.offsetHeight,
                    a1,
                    a2
                )
            },
            dpr: {
                value: window.devicePixelRatio
            }
        },

        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        opacity: 1.0
    });

    const geometry = new PlaneGeometry(
        parent.offsetWidth,
        parent.offsetHeight,
        1
    );
    const object = new Mesh(geometry, mat);
    scene.add(object);

    function transitionIn() {
        gsap.to(mat.uniforms.dispFactor, {
            duration: speedIn,
            value: 1,
            ease: easing,
            onUpdate: render,
            onComplete: render
        });
    }

    function transitionOut() {
        gsap.to(mat.uniforms.dispFactor, {
            duration: speedOut,
            value: 0,
            ease: easing,
            onUpdate: render,
            onComplete: render
        });
    }

    if (userHover) {
        parent.addEventListener("mouseenter", transitionIn);
        parent.addEventListener("touchstart", transitionIn);
        parent.addEventListener("mouseleave", transitionOut);
        parent.addEventListener("touchend", transitionOut);
    }

    window.addEventListener("resize", function() {
        if (parent.offsetHeight / parent.offsetWidth < imageAspect) {
            a1 = 1;
            a2 = parent.offsetHeight / parent.offsetWidth / imageAspect;
        } else {
            a1 = (parent.offsetWidth / parent.offsetHeight) * imageAspect;
            a2 = 1;
        }
        object.material.uniforms.res.value = new Vector4(
            parent.offsetWidth,
            parent.offsetHeight,
            a1,
            a2
        );
        renderer.setSize(parent.offsetWidth, parent.offsetHeight);

        render();
    });

    // this.next = transitionIn;
    // this.previous = transitionOut;
}

export default HoverEffect