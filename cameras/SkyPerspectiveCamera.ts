import Three from '@pkgs/three'

export interface SkyPerspectiveCameraOptions {
    fov?: () => number
    aspect: () => number
    near: () => number
    far: () => number
}
export default class SkyPerspectiveCamera extends Three.PerspectiveCamera {
    constructor(deps: EffectDeps, fov?: number, aspect?: number, near?: number, far?: number) {
        super(fov, aspect, near, far)

        this.up.set(0, 0, 1)

        new WindowEventListener(
            'resize',
            () => {
                this.aspect = window.innerWidth / window.innerHeight
                this.updateProjectionMatrix()
            },
            deps
        )
    }
}
