class TweakPane {
    constructor() {
        this.init()
    }

    init() {
        const tweakPane = new Tweakpane({
            title: 'Effect Type',
        })

        // Parameter object
        const PARAMS = {
            shader: 'morphShader',
        }

        tweakPane
            .addInput(PARAMS, 'shader', {
                options: {
                    fade: 'fadeShader',
                    morph: 'morphShader',
                    glitchPhase: 'glitchPhaseShader',
                    flyeye: 'flyeyeShader',
                    displacement: 'displacementShader',
                    bars: 'barsShader',
                    fall: 'fallShader',
                    perlin: 'perlinShader',
                    wipe: 'wipeShader',
                    glitch: 'glitchShader',
                    dither: 'ditherShader',
                    morphDither: 'morphDitherShader',
                },
            })
            .on('change', shaderString => {
                // remove the existing canvas
                document.getElementById('curtains-canvas').outerHTML = ''

                // turn string into object reference
                var newShader = eval(shaderString)

                // create a new canvas with updated shaders
                var curtainsShell = new CurtainsShell(
                    newShader.uniforms,
                    newShader.vertexShader,
                    newShader.fragmentShader
                )
            })
    }
}
