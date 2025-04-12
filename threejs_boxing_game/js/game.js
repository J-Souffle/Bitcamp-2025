class BoxingGame {
    constructor() {
        this.score = 0;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('output_canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastPunchTime = 0;
        this.punchCooldown = 1000; // 1 second cooldown between punches

        // Initialize MediaPipe solutions
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        this.init();
    }

    async init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0); // Transparent background
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);

        // Configure MediaPipe solutions
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        // Start video stream
        await this.setupCamera();
        
        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    async setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                'video': {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            
            this.video.srcObject = stream;
            
            // Wait for the video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });

            // Set canvas size to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            // Start MediaPipe solutions
            this.hands.onResults(this.onHandsResults.bind(this));
            this.faceMesh.onResults(this.onFaceResults.bind(this));
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Could not access webcam. Please make sure you have granted camera permissions and that your camera is working.');
            throw error;
        }
    }

    onHandsResults(results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 2
                });
                drawLandmarks(this.ctx, landmarks, {
                    color: '#FF0000',
                    lineWidth: 1
                });

                // Detect punch
                this.detectPunch(landmarks);
            }
        }
        this.ctx.restore();
    }

    onFaceResults(results) {
        if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
                drawConnectors(this.ctx, landmarks, FACEMESH_TESSELATION, {
                    color: '#C0C0C0',
                    lineWidth: 1
                });
            }
        }
    }

    detectPunch(landmarks) {
        const now = Date.now();
        if (now - this.lastPunchTime < this.punchCooldown) return false;

        // Get key points for punch detection
        const wrist = landmarks[0];
        const indexFinger = landmarks[8];
        
        // Calculate distance between wrist and index finger
        const distance = Math.sqrt(
            Math.pow(wrist.x - indexFinger.x, 2) +
            Math.pow(wrist.y - indexFinger.y, 2)
        );

        // If distance is large enough, consider it a punch
        if (distance > 0.2) {
            this.lastPunchTime = now;
            this.updateScore();
            return true;
        }

        return false;
    }

    updateScore() {
        this.score++;
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    async animate() {
        requestAnimationFrame(() => this.animate());

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            await this.hands.send({image: this.video});
            await this.faceMesh.send({image: this.video});
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new BoxingGame();
}); 