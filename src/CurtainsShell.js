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

class CurtainsShell {
    // basic setup for curtains.js
    constructor(uniforms, vertexShader, fragmentShader) {
        this.init(uniforms, vertexShader, fragmentShader)
    }

    init(uniforms, vertexShader, fragmentShader) {
        this.navMain = [...document.querySelectorAll('.nav-main li')]
        this.currentIndex = 0
        this.textureActive = ''
        this.lastIndex = 0
        this.nextTexture = ''
        this.start = performance.now()
        this.progress = false

        // transition duration in ms
        this.duration = 1000

        this.curtains = new Curtains({
            container: document.getElementById('curtains-canvas'),
        })

        // move curtains canvas to top of head
        document.body.insertBefore(
            document.getElementById('curtains-canvas'),
            document.body.firstChild
        )

        // create planes
        this.planes = []
        this.planeElements = document.getElementsByClassName('curtain')

        this.params = {
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms,
        }

        // add planes and handle them
        for (var i = 0; i < this.planeElements.length; i++) {
            this.planes.push(this.curtains.addPlane(this.planeElements[i], this.params))

            this.handlePlanes(i)
        }
    }

    // handle all the planes
    handlePlanes(index) {
        var _this = this
        var plane = this.planes[index]
        this.curtains.needRender()

        this.textureActive = plane.createTexture('textureActive')
        this.nextTexture = plane.createTexture('nextTexture')

        this.textureActive.setSource(plane.images[this.currentIndex])

        this.initListeners(plane)

        // check if our plane is defined and use it
        plane &&
            plane.onRender(function() {
                // update the uniforms
                _this.update(plane)
            })
    }

    lastIndex = 0

    update(plane) {
        var _this = this

        if (this.progress) {
            const now = performance.now()
            const time = Math.min(1, (now - this.start) / this.duration)

            plane.uniforms.progress.value = mathUtils.easeOutCubic(time)

            if (time >= 1) {
                this.curtains.disableDrawing()
                this.textureActive.setSource(plane.images[this.currentIndex])
                this.progress = false
            }
        }
    }

    onMouseOver(plane, index) {
        if (index === this.currentIndex) return

        if (this.progress) {
            this.textureActive.setSource(plane.images[this.currentIndex])
        }

        this.curtains.enableDrawing()
        this.currentIndex = index
        this.nextTexture.setSource(plane.images[this.currentIndex])
        this.progress = true
        this.start = performance.now()
    }

    initListeners(plane) {
        this.navMain.forEach((li, i) => {
            li.addEventListener('mouseenter', () => {
                this.onMouseOver(plane, i)
            })
        })
    }

    animateNav() {
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
}
