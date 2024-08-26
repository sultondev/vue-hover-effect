export interface HoverEffectFnOptions {
	parent: HTMLElement;
	displacementImage: string;
	image1: string;
	image2: string;
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