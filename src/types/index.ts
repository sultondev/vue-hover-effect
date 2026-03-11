export type HoverEffectFnOptions = {
    parent?: HTMLElement | null;
    displacementImage?: string;
    image1?: string;
    image2?: string;
    imagesRatio?: number;
    intensity1?: number;
    intensity2?: number;
    intensity?: number;
    angle?: number;
    angle1?: number;
    angle2?: number;
    speedIn?: number;
    speedOut?: number;
    speed?: number;
    hover?: boolean;
    easing?: string;
    video?: boolean;
}

export interface SingleHoverEffectOptions {
    parent: HTMLElement;          // The container element
    displacementImage?: string;   // Path to the displacement map (defaults to CDN-hosted map)
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
    resize: (parentOffsetWidth?: number, parentOffsetHeight?: number) => void;
}


export interface MultiImageEffectOptions {
    parent: HTMLElement;          // Container element
    displacementImage?: string;   // Path to displacement map (defaults to CDN-hosted map)
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

/**
 * Props for the SingleHoverEffect Vue component.
 * Omits `parent` (set internally by the component).
 */
export type SingleHoverEffectProps = Omit<SingleHoverEffectOptions, 'parent'>

/**
 * Props for the MultipleHoverEffect Vue component.
 * Omits `parent` (set internally by the component).
 */
export type MultiImageEffectProps = Omit<MultiImageEffectOptions, 'parent'>
