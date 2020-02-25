var glitchShader = {
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

        highp float random(vec2 co) {
            highp float a = 12.9898;
            highp float b = 78.233;
            highp float c = 43758.5453;
            highp float dt= dot(co.xy ,vec2(a,b));
            highp float sn= mod(dt,3.14);
            return fract(sin(sn) * c);
        }

        float voronoi( in vec2 x ) {
            vec2 p = floor( x );
            vec2 f = fract( x );
            float res = 8.0;
            for( float j=-1.; j<=1.; j++ )
            for( float i=-1.; i<=1.; i++ ) {
                vec2  b = vec2( i, j );
                vec2  r = b - f + random( p + b );
                float d = dot( r, r );
                res = min( res, d );
            }
            return sqrt( res );
        }

        vec2 displace(vec4 tex, vec2 texCoord, float dotDepth, float textureDepth, float strength) {
            float b = voronoi(.003 * texCoord + 2.0);
            float g = voronoi(0.2 * texCoord);
            float r = voronoi(texCoord - 1.0);
            vec4 dt = tex * 1.0;
            vec4 dis = dt * dotDepth + 1.0 - tex * textureDepth;

            dis.x = dis.x - 1.0 + textureDepth*dotDepth;
            dis.y = dis.y - 1.0 + textureDepth*dotDepth;
            dis.x *= strength;
            dis.y *= strength;
            vec2 res_uv = texCoord ;
            res_uv.x = res_uv.x + dis.x - 0.0;
            res_uv.y = res_uv.y + dis.y;
            return res_uv;
        }

        float ease1(float t) {
            return t == 0.0 || t == 1.0
                ? t
                : t < 0.5
                ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
                : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
        }

        float ease2(float t) {
            return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
        }


        vec3 transition(vec2 uv) {
            float strength = 1.0;
            vec2 p = uv.xy / vec2(strength).xy;

            vec4 color1 = texture2D(textureActive, uv);
            vec4 color2 = texture2D(nextTexture, uv);

            vec2 disp = displace(color1, p, 0.33, 0.7, 1.0-ease1(uProgress));
            vec2 disp2 = displace(color2, p, 0.33, 0.5, ease2(uProgress));

            vec4 dColor1 = texture2D(textureActive, disp);
            vec4 dColor2 = texture2D(nextTexture, disp2);

            float val = ease1(uProgress);

            vec3 gray = vec3(dot(min(dColor2, dColor1).rgb, vec3(0.299, 0.587, 0.114)));

            dColor2 = vec4(gray, 1.0);
            dColor2 *= 2.0;

            color1 = mix(color1, dColor2, smoothstep(0.0, 0.5, uProgress));
            color2 = mix(color2, dColor1, smoothstep(1.0, 0.5, uProgress));

            return mix(color1.rgb, color2.rgb, val);
        }

        void main() {
            gl_FragColor = vec4(transition(vNextTextureCoord), 1.0);
        }
    `,
}

/*
        `,
            fragmentShader: `
            uniform sampler2D uTexture;
            uniform sampler2D uPreviousTexture;
            uniform float uAlpha;
            uniform float uMixValue;

            varying vec2 vUv;

            // based on Matt DesLauriers Glitch Displace
            // https://github.com/gl-transitions/gl-transitions/blob/master/transitions/GlitchDisplace.glsl
            
            highp float random(vec2 co) {
                highp float a = 12.9898;
                highp float b = 78.233;
                highp float c = 43758.5453;
                highp float dt= dot(co.xy ,vec2(a,b));
                highp float sn= mod(dt,3.14);
                return fract(sin(sn) * c);
            }

            float voronoi( in vec2 x ) {
                vec2 p = floor( x );
                vec2 f = fract( x );
                float res = 8.0;
                for( float j=-1.; j<=1.; j++ )
                for( float i=-1.; i<=1.; i++ ) {
                    vec2  b = vec2( i, j );
                    vec2  r = b - f + random( p + b );
                    float d = dot( r, r );
                    res = min( res, d );
                }
                return sqrt( res );
            }

            vec2 displace(vec4 tex, vec2 texCoord, float dotDepth, float textureDepth, float strength) {
                float b = voronoi(.003 * texCoord + 2.0);
                float g = voronoi(0.2 * texCoord);
                float r = voronoi(texCoord - 1.0);
                vec4 dt = tex * 1.0;
                vec4 dis = dt * dotDepth + 1.0 - tex * textureDepth;

                dis.x = dis.x - 1.0 + textureDepth*dotDepth;
                dis.y = dis.y - 1.0 + textureDepth*dotDepth;
                dis.x *= strength;
                dis.y *= strength;
                vec2 res_uv = texCoord ;
                res_uv.x = res_uv.x + dis.x - 0.0;
                res_uv.y = res_uv.y + dis.y;
                return res_uv;
            }

            float ease1(float t) {
            return t == 0.0 || t == 1.0
                ? t
                : t < 0.5
                ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
                : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
            }

            float ease2(float t) {
            return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
            }

            vec3 transition(vec2 uv) {
                float strength = 4.0;
                vec2 p = uv.xy / vec2(strength).xy;

                vec4 color1 = texture2D(uPreviousTexture, uv);
                vec4 color2 = texture2D(uTexture, uv);

                vec2 disp = displace(color1, p, 0.33, 0.7, 1.0-ease1(uMixValue));
                vec2 disp2 = displace(color2, p, 0.33, 0.5, ease2(uMixValue));

                vec4 dColor1 = texture2D(uPreviousTexture, disp);
                vec4 dColor2 = texture2D(uTexture, disp2);

                float val = ease1(uMixValue);

                vec3 gray = vec3(dot(min(dColor2, dColor1).rgb, vec3(0.299, 0.587, 0.114)));

                dColor2 = vec4(gray, 1.0);
                dColor2 *= 2.0;

                color1 = mix(color1, dColor2, smoothstep(0.0, 0.5, uMixValue));
                color2 = mix(color2, dColor1, smoothstep(1.0, 0.5, uMixValue));

                return mix(color1.rgb, color2.rgb, val);
            }
    
            void main() {
                gl_FragColor = vec4(transition(vUv), uAlpha);
            }
        `

        */
