var perlinShader = {
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

        float scale = 12.0;
        float blurryEdges = 0.01;
        float seed = 12.9898;

        varying vec2 vUv;

        // http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
        float random(vec2 co) {
            highp float a = seed;
            highp float b = 78.233;
            highp float c = 43758.5453;
            highp float dt= dot(co.xy ,vec2(a,b));
            highp float sn= mod(dt,3.14);
            return fract(sin(sn) * c);
        }


        // 2D Noise based on Morgan McGuire @morgan3d
        // https://www.shadertoy.com/view/4dS3Wd
        float noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            // Four corners in 2D of a tile
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            // Smooth Interpolation

            // Cubic Hermine Curve.  Same as SmoothStep()
            vec2 u = f*f*(3.0-2.0*f);
            // u = smoothstep(0.,1.,f);

            // Mix 4 coorners porcentages
            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        vec3 transition(vec2 uv) {
            // basically:  https://github.com/gl-transitions/gl-transitions/blob/master/transitions/perlin.glsl

            vec4 fromColor = texture2D(textureActive, uv);
            vec4 toColor = texture2D(nextTexture, uv);
            float n = noise(uv * scale);

            float p = mix(-blurryEdges, 1.0 + blurryEdges, uProgress);
            float lower = p - blurryEdges;
            float higher = p + blurryEdges;

            float q = smoothstep(lower, higher, n);

            return mix(
                fromColor.rgb,
                toColor.rgb,
                1.0 - q
            );
        }

        void main() {
            gl_FragColor = vec4(transition(vNextTextureCoord), 1.0);
        }
    `,
}

/*
            fragmentShader: `
            uniform sampler2D uTexture;
            uniform sampler2D uPreviousTexture;
            uniform float uAlpha;
            uniform float uMixValue;

            varying vec2 vUv;
            
            float scale = 8.0;
            float blurryEdges = 0.01;
            float seed = 12.9898;
            

            // http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
            float random(vec2 co) {
                highp float a = seed;
                highp float b = 78.233;
                highp float c = 43758.5453;
                highp float dt= dot(co.xy ,vec2(a,b));
                highp float sn= mod(dt,3.14);
                return fract(sin(sn) * c);
            }


            // 2D Noise based on Morgan McGuire @morgan3d
            // https://www.shadertoy.com/view/4dS3Wd
            float noise (in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);

                // Four corners in 2D of a tile
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));

                // Smooth Interpolation

                // Cubic Hermine Curve.  Same as SmoothStep()
                vec2 u = f*f*(3.0-2.0*f);
                // u = smoothstep(0.,1.,f);

                // Mix 4 coorners porcentages
                return mix(a, b, u.x) +
                        (c - a)* u.y * (1.0 - u.x) +
                        (d - b) * u.x * u.y;
            }

            vec3 transition(vec2 uv) {
                // basically:  https://github.com/gl-transitions/gl-transitions/blob/master/transitions/perlin.glsl

                vec4 fromColor = texture2D(uPreviousTexture, uv);
                vec4 toColor = texture2D(uTexture, uv);
                float n = noise(uv * scale);

                float p = mix(-blurryEdges, 1.0 + blurryEdges, uMixValue);
                float lower = p - blurryEdges;
                float higher = p + blurryEdges;

                float q = smoothstep(lower, higher, n);

                return mix(
                    fromColor.rgb,
                    toColor.rgb,
                    1.0 - q
                );
            }
    
            void main() {
                gl_FragColor = vec4(transition(vUv), uAlpha);
            }
        `,
        */
