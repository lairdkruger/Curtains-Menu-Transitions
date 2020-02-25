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
                    displacement: 'displacementShader',
                    flyeye: 'flyeyeShader',
                    morph: 'morphShader',
                    glitch: 'glitchShader',
                    perlin: 'perlinShader',
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
