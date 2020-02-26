var barsShader = {
    uniforms: {
        progress: {
            name: 'uProgress',
            type: '1f',
            value: 0,
        },
        bars: {
            name: 'uBars',
            type: '1f',
            value: 50.0,
        },
        depth: {
            name: 'uDepth',
            type: '1f',
            value: 0.5,
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

        uniform float uBars;
        uniform float uDepth;

        varying vec2 vUv;

        mat2 rotate(float a) {
			float s = sin(a);
			float c = cos(a);
			return mat2(c, -s, s, c);
        }
        
		const float PI = 3.1415;
		const float angle1 = PI * 0.25;
		const float angle2 = -PI * 0.75;

        void main() {
			vec2 uvDivided = fract(vNextTextureCoord*vec2(uBars, 1.0));

			vec2 uvDisplaced1 = vTextureActiveCoord + rotate(3.1415926/4.)*uvDivided*uProgress * uDepth;
			vec2 uvDisplaced2 = vNextTextureCoord + rotate(3.1415926/4.)*uvDivided*(1. - uProgress) * uDepth;

			vec4 t1 = texture2D(textureActive, uvDisplaced1);
			vec4 t2 = texture2D(nextTexture, uvDisplaced2);

			gl_FragColor = mix(t1, t2, uProgress);
        }
    `,
}
