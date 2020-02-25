var displacementShader = {
    uniforms: {
        progress: {
            name: 'uProgress',
            type: '1f',
            value: 0,
        },
    },

    vertexShader: `
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

    fragmentShader: `
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
