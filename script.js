// Garden of Eden - 3D Interactive Experience
class GardenOfEden {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.flowers = [];
        this.particles = [];
        this.butterflies = [];
        this.isMusicPlaying = false;
        this.particlesEnabled = true;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Hide loading screen after 3 seconds
        setTimeout(() => {
            document.querySelector('.loading-screen').classList.add('hidden');
            
            // Show bloom indicator after loading
            setTimeout(() => {
                const bloomIndicator = document.getElementById('bloom-indicator');
                if (bloomIndicator) {
                    bloomIndicator.classList.add('show');
                    
                    // Hide after 5 seconds
                    setTimeout(() => {
                        bloomIndicator.classList.remove('show');
                    }, 5000);
                }
            }, 1000);
        }, 3000);

        this.setupScene();
        this.createGarden();
        this.createParticles();
        this.createButterflies();
        this.createLighting();
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0xffe6e6, 10, 100);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // Create renderer
        const canvas = document.getElementById('garden-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createGarden() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf0f8ff,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create flowers
        this.createFlowers();

        // Create trees
        this.createTrees();

        // Create grass patches
        this.createGrass();
    }

    createFlowers() {
        const flowerColors = [0xff69b4, 0xffb6c1, 0xffc0cb, 0xdc143c, 0xff1493];
        const flowerPositions = [
            { x: -8, z: -8 }, { x: 8, z: -8 }, { x: -8, z: 8 }, { x: 8, z: 8 },
            { x: 0, z: -12 }, { x: 0, z: 12 }, { x: -12, z: 0 }, { x: 12, z: 0 },
            { x: -5, z: -5 }, { x: 5, z: -5 }, { x: -5, z: 5 }, { x: 5, z: 5 }
        ];

        flowerPositions.forEach((pos, index) => {
            const flower = this.createFlower(
                pos.x,
                0,
                pos.z,
                flowerColors[index % flowerColors.length]
            );
            this.flowers.push(flower);
            this.scene.add(flower);
        });
    }

    createFlower(x, y, z, color) {
        const flowerGroup = new THREE.Group();

        // Flower stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 1;
        stem.castShadow = true;
        flowerGroup.add(stem);

        // Flower petals
        const petalGeometry = new THREE.SphereGeometry(0.8, 8, 6);
        const petalMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const petals = new THREE.Mesh(petalGeometry, petalMaterial);
        petals.position.y = 2.5;
        petals.castShadow = true;
        flowerGroup.add(petals);

        // Flower center
        const centerGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 2.5;
        center.castShadow = true;
        flowerGroup.add(center);

        flowerGroup.position.set(x, y, z);
        return flowerGroup;
    }

    createTrees() {
        const treePositions = [
            { x: -15, z: -15 }, { x: 15, z: -15 }, { x: -15, z: 15 }, { x: 15, z: 15 }
        ];

        treePositions.forEach(pos => {
            const tree = this.createTree(pos.x, 0, pos.z);
            this.scene.add(tree);
        });
    }

    createTree(x, y, z) {
        const treeGroup = new THREE.Group();

        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Tree leaves
        const leavesGeometry = new THREE.SphereGeometry(3, 8, 6);
        const leavesMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228b22,
            transparent: true,
            opacity: 0.8
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 6;
        leaves.castShadow = true;
        treeGroup.add(leaves);

        treeGroup.position.set(x, y, z);
        return treeGroup;
    }

    createGrass() {
        for (let i = 0; i < 100; i++) {
            const grassGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
            const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            
            grass.position.x = (Math.random() - 0.5) * 40;
            grass.position.z = (Math.random() - 0.5) * 40;
            grass.position.y = 0.25;
            grass.rotation.x = Math.random() * 0.2;
            grass.rotation.z = Math.random() * 0.2;
            
            this.scene.add(grass);
        }
    }

    createParticles() {
        const particleCount = 200;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.1 + 0.95, 0.8, 0.6);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    createButterflies() {
        for (let i = 0; i < 10; i++) {
            const butterfly = this.createButterfly();
            this.butterflies.push(butterfly);
            this.scene.add(butterfly);
        }
    }

    createButterfly() {
        const butterflyGroup = new THREE.Group();

        // Butterfly body
        const bodyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2f4f4f });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        butterflyGroup.add(body);

        // Butterfly wings
        const wingGeometry = new THREE.PlaneGeometry(0.4, 0.3);
        const wingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff69b4,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.x = -0.2;
        leftWing.rotation.y = Math.PI / 4;
        butterflyGroup.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.x = 0.2;
        rightWing.rotation.y = -Math.PI / 4;
        butterflyGroup.add(rightWing);

        // Random position
        butterflyGroup.position.set(
            (Math.random() - 0.5) * 30,
            Math.random() * 10 + 5,
            (Math.random() - 0.5) * 30
        );

        return butterflyGroup;
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xfff0f5, 0.4);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xfff8dc, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        this.scene.add(directionalLight);

        // Point lights for romantic atmosphere
        const colors = [0xff69b4, 0xffb6c1, 0xffc0cb, 0xdc143c];
        colors.forEach((color, index) => {
            const pointLight = new THREE.PointLight(color, 0.5, 20);
            pointLight.position.set(
                Math.cos(index * Math.PI / 2) * 15,
                3,
                Math.sin(index * Math.PI / 2) * 15
            );
                    this.scene.add(pointLight);
    });
}

createFloatingPetals() {
    const petalColors = [0xff69b4, 0xffb6c1, 0xffc0cb, 0xdc143c, 0xff1493, 0xffd700];
    
    for (let i = 0; i < 50; i++) {
        const petal = this.createPetal(petalColors[Math.floor(Math.random() * petalColors.length)]);
        this.scene.add(petal);
    }
}

createPetal(color) {
    const petalGeometry = new THREE.PlaneGeometry(0.3, 0.4);
    const petalMaterial = new THREE.MeshLambertMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    
    // Random position
    petal.position.set(
        (Math.random() - 0.5) * 40,
        Math.random() * 15 + 5,
        (Math.random() - 0.5) * 40
    );
    
    // Random rotation
    petal.rotation.x = Math.random() * Math.PI;
    petal.rotation.y = Math.random() * Math.PI;
    petal.rotation.z = Math.random() * Math.PI;
    
    // Store original position for animation
    petal.userData = {
        originalY: petal.position.y,
        originalX: petal.position.x,
        originalZ: petal.position.z,
        speed: Math.random() * 0.02 + 0.01,
        rotationSpeed: Math.random() * 0.02 + 0.01
    };
    
    return petal;
}

createFloatingFlowers() {
    const flowerColors = [0xff69b4, 0xffb6c1, 0xffc0cb, 0xdc143c, 0xff1493, 0xffd700, 0xff6347];
    this.floatingFlowers = [];
    
    for (let i = 0; i < 15; i++) {
        const flower = this.createFloatingFlower(flowerColors[Math.floor(Math.random() * flowerColors.length)]);
        this.floatingFlowers.push(flower);
        this.scene.add(flower);
    }
}

createFloatingFlower(color) {
    const flowerGroup = new THREE.Group();
    
    // Create closed bud initially
    const budGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const budMaterial = new THREE.MeshLambertMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8
    });
    
    const bud = new THREE.Mesh(budGeometry, budMaterial);
    bud.castShadow = true;
    flowerGroup.add(bud);
    
    // Create individual petals (initially hidden/closed)
    const petalCount = 8;
    const petals = [];
    
    for (let i = 0; i < petalCount; i++) {
        const petalGeometry = new THREE.PlaneGeometry(0.4, 0.6);
        const petalMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        
        // Position petals in a circle around the bud
        const angle = (i / petalCount) * Math.PI * 2;
        petal.position.x = Math.cos(angle) * 0.2;
        petal.position.z = Math.sin(angle) * 0.2;
        petal.position.y = 0.1;
        
        // Rotate petals to face outward
        petal.rotation.y = angle;
        petal.rotation.x = Math.PI / 2;
        
        // Store petal reference
        petals.push(petal);
        flowerGroup.add(petal);
    }
    
    // Random position in 3D space
    flowerGroup.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 10 + 8,
        (Math.random() - 0.5) * 30
    );
    
    // Store animation data
    flowerGroup.userData = {
        originalY: flowerGroup.position.y,
        speed: Math.random() * 0.01 + 0.005,
        rotationSpeed: Math.random() * 0.01 + 0.005,
        petals: petals,
        bud: bud,
        isBloomed: false,
        bloomProgress: 0,
        targetBloomProgress: 0
    };
    
    return flowerGroup;
}

    setupEventListeners() {
        // Mouse movement for camera control
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update custom cursor
            this.updateCustomCursor(event);
            
            // Check for flower hover
            this.checkFlowerHover(event);
        });

        // Touch events for mobile
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            this.mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
        });



        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'ArrowUp':
                    this.camera.position.y += 0.5;
                    break;
                case 'ArrowDown':
                    this.camera.position.y -= 0.5;
                    break;
                case 'ArrowLeft':
                    this.camera.position.x -= 0.5;
                    break;
                case 'ArrowRight':
                    this.camera.position.x += 0.5;
                    break;
                case ' ':
                    this.resetCamera();
                    break;
            }
        });
    }





    resetCamera() {
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    updateCustomCursor(event) {
        const cursor = document.getElementById('flower-cursor');
        if (cursor) {
            cursor.style.left = event.clientX + 'px';
            cursor.style.top = event.clientY + 'px';
        }
    }

    checkFlowerHover(event) {
        if (!this.floatingFlowers) return;
        
        // Convert mouse position to normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Create raycaster for mouse interaction
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Check intersection with floating flowers
        let flowerHovered = false;
        
        this.floatingFlowers.forEach((flower) => {
            const intersects = raycaster.intersectObject(flower, true);
            
            if (intersects.length > 0) {
                // Mouse is hovering over this flower
                flowerHovered = true;
                if (!flower.userData.isBloomed) {
                    flower.userData.targetBloomProgress = 1;
                    flower.userData.isBloomed = true;
                    
                    // Add bloom effect
                    this.addBloomEffect(flower);
                }
            } else {
                // Mouse is not hovering over this flower
                if (flower.userData.isBloomed) {
                    flower.userData.targetBloomProgress = 0;
                    flower.userData.isBloomed = false;
                }
            }
        });
        
        // Update cursor appearance
        this.updateCursorBloom(flowerHovered);
    }

    updateCursorBloom(isBlooming) {
        const cursor = document.getElementById('flower-cursor');
        if (cursor) {
            if (isBlooming) {
                cursor.classList.add('blooming');
            } else {
                cursor.classList.remove('blooming');
            }
        }
    }

    addBloomEffect(flower) {
        // Create sparkle effect around the flower
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const sparkle = this.createSparkle(flower.position);
                this.scene.add(sparkle);
                
                // Remove sparkle after animation
                setTimeout(() => {
                    this.scene.remove(sparkle);
                }, 2000);
            }, i * 100);
        }
    }

    createSparkle(position) {
        const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 6);
        const sparkleMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffd700,
            transparent: true,
            opacity: 1
        });
        
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        
        // Position sparkle around the flower
        const angle = Math.random() * Math.PI * 2;
        const distance = 1 + Math.random() * 0.5;
        sparkle.position.set(
            position.x + Math.cos(angle) * distance,
            position.y + Math.random() * 0.5,
            position.z + Math.sin(angle) * distance
        );
        
        // Store animation data
        sparkle.userData = {
            originalY: sparkle.position.y,
            speed: Math.random() * 0.02 + 0.01
        };
        
        return sparkle;
    }

    onWindowResize() {
        const canvas = document.getElementById('garden-canvas');
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;

        // Animate flowers with more romantic movement
        this.flowers.forEach((flower, index) => {
            flower.rotation.y += 0.003;
            flower.children[1].scale.y = 1 + Math.sin(this.time + index) * 0.15;
            flower.children[1].scale.x = 1 + Math.cos(this.time + index) * 0.1;
            flower.children[1].scale.z = 1 + Math.sin(this.time * 1.5 + index) * 0.1;
            
            // Add gentle swaying
            flower.rotation.z = Math.sin(this.time * 0.5 + index) * 0.1;
        });

        // Animate particles
        if (this.particlesEnabled && this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.x += 0.0005;
        }

        // Animate floating petals
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.speed) {
                // Gentle floating motion
                child.position.y += Math.sin(this.time * child.userData.speed) * 0.01;
                child.position.x += Math.cos(child.userData.speed * 0.7) * 0.005;
                child.position.z += Math.sin(child.userData.speed * 1.3) * 0.005;
                
                // Gentle rotation
                child.rotation.y += child.userData.rotationSpeed;
                child.rotation.z += child.userData.rotationSpeed * 0.5;
            }
        });

        // Animate floating flowers
        if (this.floatingFlowers) {
            this.floatingFlowers.forEach((flower, index) => {
                const data = flower.userData;
                
                // Gentle floating motion
                flower.position.y = data.originalY + Math.sin(this.time * data.speed + index) * 0.5;
                flower.rotation.y += data.rotationSpeed;
                
                // Smooth blooming animation
                if (data.bloomProgress !== data.targetBloomProgress) {
                    data.bloomProgress += (data.targetBloomProgress - data.bloomProgress) * 0.1;
                    
                    // Animate petals based on bloom progress
                    data.petals.forEach((petal, petalIndex) => {
                        // Fade in petals
                        petal.material.opacity = data.bloomProgress;
                        
                        // Spread petals outward
                        const angle = (petalIndex / data.petals.length) * Math.PI * 2;
                        const spreadDistance = 0.2 + (data.bloomProgress * 0.3);
                        petal.position.x = Math.cos(angle) * spreadDistance;
                        petal.position.z = Math.sin(angle) * spreadDistance;
                        
                        // Rotate petals outward
                        petal.rotation.x = Math.PI / 2 + (data.bloomProgress * 0.3);
                    });
                    
                    // Scale bud based on bloom progress
                    data.bud.scale.setScalar(1 - (data.bloomProgress * 0.3));
                }
            });
        }

        // Animate sparkles
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.speed && child.material.color.getHex() === 0xffd700) {
                // This is a sparkle
                child.position.y += Math.sin(this.time * child.userData.speed) * 0.02;
                child.rotation.y += 0.1;
                child.rotation.z += 0.05;
                
                // Fade out over time
                if (child.material.opacity > 0) {
                    child.material.opacity -= 0.01;
                }
            }
        });

        // Animate butterflies with more graceful movement
        this.butterflies.forEach((butterfly, index) => {
            // Gentle floating motion
            butterfly.position.y += Math.sin(this.time * 1.5 + index) * 0.015;
            butterfly.position.x += Math.cos(this.time * 0.8 + index) * 0.01;
            butterfly.position.z += Math.sin(this.time * 1.2 + index) * 0.01;
            
            // Smooth rotation
            butterfly.rotation.y += 0.015;
            butterfly.rotation.z = Math.sin(this.time * 0.5 + index) * 0.05;
            
            // Realistic wing flapping
            butterfly.children[1].rotation.y = Math.sin(this.time * 6 + index) * 0.4;
            butterfly.children[2].rotation.y = -Math.sin(this.time * 6 + index) * 0.4;
        });

        // Camera movement based on mouse
        this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouseY * 2 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the garden when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GardenOfEden();
});

// Add some romantic interactions
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('heart')) {
        event.target.style.transform = 'scale(1.5) rotate(360deg)';
        event.target.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            event.target.style.transform = 'scale(1) rotate(0deg)';
        }, 500);
    }
});

// Add floating particles effect on mouse move
document.addEventListener('mousemove', (event) => {
    if (Math.random() > 0.95) {
        createFloatingParticle(event.clientX, event.clientY);
    }
});

function createFloatingParticle(x, y) {
    const particle = document.createElement('div');
    particle.innerHTML = '✨';
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.pointerEvents = 'none';
    particle.style.fontSize = '1.5rem';
    particle.style.color = '#dc143c';
    particle.style.zIndex = '1000';
    particle.style.animation = 'particleFloat 3s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        document.body.removeChild(particle);
    }, 3000);
}

// Add CSS animation for floating particles
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
        }
        50% {
            opacity: 0.8;
            transform: translateY(-50px) scale(0.8) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5) rotate(360deg);
        }
    }
    
    @keyframes romanticGlow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(220, 20, 60, 0.3);
        }
        50% {
            box-shadow: 0 0 30px rgba(220, 20, 60, 0.6), 0 0 40px rgba(255, 182, 193, 0.4);
        }
    }
`;
document.head.appendChild(style);
