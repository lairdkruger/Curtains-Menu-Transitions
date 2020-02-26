var glitchPhaseShader = {
    uniforms: {
        progress: {
            name: 'uProgress',
            type: '1f',
            value: 0,
        },
        intensity: {
            name: 'uIntensity',
            type: '1f',
            value: 2.0,
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

        // our texture matrix that will handle image cover
        uniform mat4 textureActiveMatrix;
        uniform mat4 nextTextureMatrix;

        // pass your vertex and texture coords to the fragment shader
        varying vec3 vVertexPosition;
        varying vec2 vTextureActiveCoord;
        varying vec2 vNextTextureCoord;

        void main() {
            vec3 vertexPosition = aVertexPosition;
            
            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
            
            // set the varyings
            // here we use our texture matrix to calculate the accurate texture coords
            vTextureActiveCoord = (textureActiveMatrix * vec4(aTextureCoord, 0., 1.)).xy;
            vNextTextureCoord = (nextTextureMatrix * vec4(aTextureCoord, 0., 1.)).xy;
            vVertexPosition = vertexPosition;
        }
    `,

    fragmentShader: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        // get our varyings
        varying vec3 vVertexPosition;
        varying vec2 vTextureActiveCoord;
        varying vec2 vNextTextureCoord;

        uniform sampler2D textureActive;
        uniform sampler2D nextTexture;
        uniform float uProgress;

        uniform float uIntensity;

        varying vec2 vUv;

        void main() {
            vec4 d1 = texture2D(textureActive, vTextureActiveCoord);
            vec4 d2 = texture2D(nextTexture, vNextTextureCoord);

            float displace1 = (d1.r + d1.g + d1.b)*0.33;
            float displace2 = (d2.r + d2.g + d2.b)*0.33;
            
            vec4 t1 = texture2D(textureActive, vec2(vTextureActiveCoord.x, vTextureActiveCoord.y + uProgress * (displace2 * uIntensity)));
            vec4 t2 = texture2D(nextTexture, vec2(vNextTextureCoord.x, vNextTextureCoord.y + (1.0 - uProgress) * (displace1 * uIntensity)));

            gl_FragColor = mix(t1, t2, uProgress);
        }
    `,
}
