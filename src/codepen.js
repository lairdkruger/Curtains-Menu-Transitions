const mathUtils = {
    lerp: (a, b, n) => n * (a - b) + b,
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: t => t * t * t,
    easeOutCubic: t => --t * t * t + 1,
    easeInOutCubic: t =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - --t * t * t * t,
    easeInOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + --t * t * t * t * t,
    easeInOutQuint: t =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
}

window.onload = () => {
    const navMain = [...document.querySelectorAll('.nav-main li')]
    let currentIndex = 0
    let lastIndex = 0
    let textureActive = ''
    let nextTexture = ''
    let start = performance.now()
    let progress = false

    const createCanvas = () => {
        const shader = {
            vertex: `    
    #ifdef GL_ES
    precision mediump float;
    #endif
    
    // those are the mandatory attributes that the lib sets
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    // those are mandatory uniforms that the lib sets and that contain our model view and projection matrix
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    uniform mat4 textureActiveMatrix;
    uniform mat4 nextTextureMatrix;

    // if you want to pass your vertex and texture coords to the fragment shader
    varying vec3 vVertexPosition;
    varying vec2 vTextureActiveCoord;
    varying vec2 vNextTextureCoord;

    void main() {
        vec3 vertexPosition = aVertexPosition;
        gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

        // set the varyings
        vTextureActiveCoord = (textureActiveMatrix * vec4(aTextureCoord, 0., 1.)).xy;
        vNextTextureCoord = (nextTextureMatrix * vec4(aTextureCoord, 0., 1.)).xy;
        vVertexPosition = vertexPosition;
    }`,
            fragment: `
    #ifdef GL_ES
    precision mediump float;
    #endif

    #define PI2 6.28318530718
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718 
    #define S(a,b,n) smoothstep(a,b,n)
    
    // get our varyings
    varying vec3 vVertexPosition;
    varying vec2 vTextureActiveCoord;
    varying vec2 vNextTextureCoord;

    // the uniform we declared inside our javascript
    uniform float uProgress;

    // our texture sampler (default name, to use a different name please refer to the documentation)
    uniform sampler2D textureActive;
    uniform sampler2D nextTexture;
    uniform sampler2D displacementMap;

    void main(){
        vec2 uv0 = vTextureActiveCoord;
        vec2 uv1 = vNextTextureCoord;

        float progress0 = uProgress;
        float progress1 = 1. - uProgress;
       
        vec4 disp0 = texture2D(textureActive, uv0);
        vec4 disp1 = texture2D(nextTexture, uv1);
                
        float t0 = progress0 * (disp0.r * .3) * 2.;
        float t1 = progress1 * (disp1.r * .3) * 2.;

        vec4 color0 = texture2D(textureActive, vec2(uv0.x, uv0.y + t1)) * progress1;
        vec4 color1 = texture2D(nextTexture, vec2(uv1.x, uv1.y - t1)) * progress0;

        gl_FragColor = color0 + color1;         
    }
    `,
        }

        // set up our WebGL context and append the canvas to our wrapper
        const webGLCurtain = new Curtains('canvas')

        // get our plane element
        const planeElement = document.getElementsByClassName('plane')[0]

        // set our initial parameters (basic uniforms)
        const params = {
            vertexShader: shader.vertex, // our vertex shader ID
            fragmentShader: shader.fragment, // our framgent shader ID
            widthSegments: 40,
            heightSegments: 40, // we now have 40*40*6 = 9600 vertices !
            uniforms: {
                progress: {
                    name: 'uProgress', // uniform name that will be passed to our shaders
                    type: '1f', // this means our uniform is a float
                    value: 0,
                },
            },
        }

        webGLCurtain.disableDrawing()
        // create our plane mesh
        const plane = webGLCurtain.addPlane(planeElement, params)

        // use the onRender method of our plane fired at each requestAnimationFrame call
        plane
            .onReady(() => {
                webGLCurtain.needRender()

                textureActive = plane.createTexture('textureActive')
                nextTexture = plane.createTexture('nextTexture')

                textureActive.setSource(plane.images[currentIndex])

                initEvents(webGLCurtain, plane)
            })
            .onRender(() => {
                update(webGLCurtain, plane)
            })
    }

    lastIndex = 0
    const update = (webGLCurtain, plane) => {
        if (progress) {
            const now = performance.now()
            const time = Math.min(1, (now - start) / 800)

            plane.uniforms.progress.value = mathUtils.easeOutCubic(time)

            if (time >= 1) {
                webGLCurtain.disableDrawing()
                textureActive.setSource(plane.images[currentIndex])
                progress = false
            }
        }
    }

    const onMouseOver = (webGLCurtain, plane, index) => {
        if (index === currentIndex) return

        webGLCurtain.enableDrawing()

        currentIndex = index

        nextTexture.setSource(plane.images[currentIndex])

        progress = true
        start = performance.now()
    }

    const initEvents = (webGLCurtain, plane) => {
        navMain.forEach((li, i) => {
            li.addEventListener('mouseenter', () => {
                onMouseOver(webGLCurtain, plane, i)
            })
        })
    }

    const animateNav = () => {
        TweenMax.staggerFrom(
            navMain,
            0.8,
            {
                opacity: 0,
                y: 200,
                ease: Power2.easeOut,
            },
            0.2
        )
    }

    animateNav()
    createCanvas()
}
