var fallShader = {
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

        varying vec2 vUv;

        void main() {
			float x = uProgress;
			x = smoothstep(.0,1.0,(x*2.0+vNextTextureCoord.y-1.0));
			vec4 f = mix(
				texture2D(textureActive, (vTextureActiveCoord-.5)*(1.-uProgress)+.5), 
				texture2D(nextTexture, (vNextTextureCoord-.5)*uProgress+.5), 
				uProgress);
			gl_FragColor = f;
        }
    `,
}
