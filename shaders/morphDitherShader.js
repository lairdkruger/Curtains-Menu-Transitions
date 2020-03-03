var morphDitherShader = {
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

        float strength = 0.1;

        vec3 gray(vec3 color) {
            return vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114)));
        }

        float luma(vec3 color) {
            return dot(color, vec3(0.299, 0.587, 0.114));
            
        }
            
        float luma(vec4 color) {
            return dot(color.rgb, vec3(0.299, 0.587, 0.114));
        }

        float dither8x8(vec2 position, float brightness) {
            int x = int(mod(position.x, 8.0));
            int y = int(mod(position.y, 8.0));
            int index = x + y * 8;
            float limit = 0.0;
            
            if (x < 8) {
                if (index == 0) limit = 0.015625;
                if (index == 1) limit = 0.515625;
                if (index == 2) limit = 0.140625;
                if (index == 3) limit = 0.640625;
                if (index == 4) limit = 0.046875;
                if (index == 5) limit = 0.546875;
                if (index == 6) limit = 0.171875;
                if (index == 7) limit = 0.671875;
                if (index == 8) limit = 0.765625;
                if (index == 9) limit = 0.265625;
                if (index == 10) limit = 0.890625;
                if (index == 11) limit = 0.390625;
                if (index == 12) limit = 0.796875;
                if (index == 13) limit = 0.296875;
                if (index == 14) limit = 0.921875;
                if (index == 15) limit = 0.421875;
                if (index == 16) limit = 0.203125;
                if (index == 17) limit = 0.703125;
                if (index == 18) limit = 0.078125;
                if (index == 19) limit = 0.578125;
                if (index == 20) limit = 0.234375;
                if (index == 21) limit = 0.734375;
                if (index == 22) limit = 0.109375;
                if (index == 23) limit = 0.609375;
                if (index == 24) limit = 0.953125;
                if (index == 25) limit = 0.453125;
                if (index == 26) limit = 0.828125;
                if (index == 27) limit = 0.328125;
                if (index == 28) limit = 0.984375;
                if (index == 29) limit = 0.484375;
                if (index == 30) limit = 0.859375;
                if (index == 31) limit = 0.359375;
                if (index == 32) limit = 0.0625;
                if (index == 33) limit = 0.5625;
                if (index == 34) limit = 0.1875;
                if (index == 35) limit = 0.6875;
                if (index == 36) limit = 0.03125;
                if (index == 37) limit = 0.53125;
                if (index == 38) limit = 0.15625;
                if (index == 39) limit = 0.65625;
                if (index == 40) limit = 0.8125;
                if (index == 41) limit = 0.3125;
                if (index == 42) limit = 0.9375;
                if (index == 43) limit = 0.4375;
                if (index == 44) limit = 0.78125;
                if (index == 45) limit = 0.28125;
                if (index == 46) limit = 0.90625;
                if (index == 47) limit = 0.40625;
                if (index == 48) limit = 0.25;
                if (index == 49) limit = 0.75;
                if (index == 50) limit = 0.125;
                if (index == 51) limit = 0.625;
                if (index == 52) limit = 0.21875;
                if (index == 53) limit = 0.71875;
                if (index == 54) limit = 0.09375;
                if (index == 55) limit = 0.59375;
                if (index == 56) limit = 1.0;
                if (index == 57) limit = 0.5;
                if (index == 58) limit = 0.875;
                if (index == 59) limit = 0.375;
                if (index == 60) limit = 0.96875;
                if (index == 61) limit = 0.46875;
                if (index == 62) limit = 0.84375;
                if (index == 63) limit = 0.34375;
            }
            
            return brightness < limit ? 0.0 : 1.0;
        }
            
        vec3 dither8x8(vec2 position, vec3 color) {
            //return vec3(color.rgb) * dither8x8(position, luma(color));
            return vec3(1.0, 1.0, 1.0) * dither8x8(position, luma(color));
        }

        vec3 transition(vec2 uv) {
            float inv = 1.0 - uProgress;

            vec4 oldColor = texture2D(textureActive, vTextureActiveCoord);
            vec4 newColor = texture2D(nextTexture, vNextTextureCoord);

            vec3 oldDither = dither8x8(gl_FragCoord.xy, vec3(gray(oldColor.rgb)));
            vec3 newDither = dither8x8(gl_FragCoord.xy, vec3(gray(newColor.rgb)));

            vec2 fromOffset = (((oldColor.rg + oldColor.b) * 0.5) * 2.0 - 1.0);
            vec2 toOffset = (((newColor.rg + newColor.b) * 0.5) * 2.0 - 1.0);
            vec2 offset = mix(fromOffset, toOffset, 0.5) * strength;
            
            return mix(
                texture2D(textureActive, vTextureActiveCoord + offset * uProgress).rgb, 
                texture2D(nextTexture, vNextTextureCoord - offset * inv).rgb, 
                uProgress
                );
        }

        void main() {
            vec3 outputColor = transition(vNextTextureCoord);

            gl_FragColor = vec4((dither8x8(gl_FragCoord.xy, vec3(gray(outputColor.rgb)))).rgb, 1.0);
        }
    `,
}
