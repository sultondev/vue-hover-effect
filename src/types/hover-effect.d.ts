declare module "hover-effect" {
    interface HoverEffectOptions {
        parent: HTMLElement;
        image1: string;
        image2: string;
        displacementImage: string;
        intensity?: number;
        speedIn?: number;
        speedOut?: number;
        angle?: number;
    }

    export default class HoverEffect {
        constructor(options: HoverEffectOptions);
    }
}
