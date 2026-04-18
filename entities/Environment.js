import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CONFIG } from '../config.js';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.trees = [];
        this.garbage = [];
        this.npcs = [];
        this.animals = [];
        this.loggers = [];
        this.predators = [];
        this.fish = [];
        this.buildingPositions = [];
        this.fireParticles = [];
        this.rainParticles = [];
        this.ground = null;
        this.time = 0;
        this.weather = 'clear'; // 'clear', 'rain', 'fire'
        this.weatherTimer = 0;
        this.setupWorld();
    }

    setupWorld() {
        const textureLoader = new THREE.TextureLoader();
        this.assets = {
            logger: textureLoader.load('assets/lumberjack-enemy.webp'),
            wolf: textureLoader.load('assets/wolf-predator.webp'),
            fish: textureLoader.load('assets/fish-friend.webp'),
            artifact: textureLoader.load('assets/ancient-artifact.webp'),
            chest: textureLoader.load('assets/treasure-chest.webp'),
            fire: textureLoader.load('assets/fire-texture.webp'),
            purity: textureLoader.load('assets/sparkle-particle-webp.webp')
        };

        // Ground with better material
        const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD.SIZE * 2, CONFIG.WORLD.SIZE * 2);
        const groundMat = new THREE.MeshStandardMaterial({ 
            color: CONFIG.COLORS.GROUND,
            roughness: 0.8,
            metalness: 0.1
        });
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Lights
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
        this.sunLight.position.set(100, 100, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.left = -150;
        this.sunLight.shadow.camera.right = 150;
        this.sunLight.shadow.camera.top = 150;
        this.sunLight.shadow.camera.bottom = -150;
        this.scene.add(this.sunLight);

        // Sky and Fog
        this.scene.background = new THREE.Color(CONFIG.COLORS.SKY_CLEAN);
        this.scene.fog = new THREE.Fog(CONFIG.COLORS.SKY_CLEAN, 10, CONFIG.WORLD.SIZE);

        // Particle Pools
        this.createFirePool();
        this.createRainPool();
        this.createPurityPool();

        // Spawn Objects
        this.spawnMountains();
        this.spawnLake();
        this.spawnBuildings();
        this.spawnFactories();
        this.spawnClouds();
        this.spawnTrees();
        this.spawnGarbage();
        this.spawnNPCs();
        this.spawnAnimals();
        this.spawnLoggers();
        this.spawnPredators();
        this.spawnFish();
        this.spawnArtifact();
        this.spawnTreasure();
    }

    createFirePool() {
        const fireMat = new THREE.SpriteMaterial({ map: this.assets.fire, transparent: true, blending: THREE.AdditiveBlending });
        for (let i = 0; i < 60; i++) {
            const p = new THREE.Sprite(fireMat);
            p.visible = false;
            this.scene.add(p);
            this.fireParticles.push({
                mesh: p,
                velocity: new THREE.Vector3(),
                life: 0
            });
        }
    }

    createPurityPool() {
        this.purityParticles = [];
        const purityMat = new THREE.SpriteMaterial({ 
            map: this.assets.purity, 
            transparent: true, 
            opacity: 0.8,
            blending: THREE.AdditiveBlending 
        });
        for (let i = 0; i < 40; i++) {
            const p = new THREE.Sprite(purityMat);
            p.visible = false;
            this.scene.add(p);
            this.purityParticles.push({
                mesh: p,
                velocity: new THREE.Vector3(),
                life: 0
            });
        }
    }

    createRainPool() {
        const rainGeo = new THREE.BufferGeometry();
        const rainMat = new THREE.LineBasicMaterial({ color: 0xaaaaFF, transparent: true, opacity: 0.6 });
        for (let i = 0; i < 200; i++) {
            const p = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0)]), rainMat);
            p.visible = false;
            this.scene.add(p);
            this.rainParticles.push({
                mesh: p,
                velocity: new THREE.Vector3(0, -20, 0),
                life: 0
            });
        }
    }

    createSprite(texture, scale = 2) {
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(scale, scale, 1);
        sprite.position.y = scale / 2;
        return sprite;
    }

    createTextSprite(text, color = '#00ffff') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Background for readability
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        if (context.roundRect) {
            context.roundRect(0, 0, canvas.width, canvas.height, 20);
        } else {
            context.rect(0, 0, canvas.width, canvas.height);
        }
        context.fill();
        
        context.font = 'bold 64px Orbitron, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Shadow
        context.fillStyle = 'rgba(0,0,0,1)';
        context.fillText(text, canvas.width / 2 + 4, canvas.height / 2 + 4);
        
        // Main text
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(4, 1, 1);
        return sprite;
    }

    createEmojiSprite(emoji, scale = 2) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        context.font = '100px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(emoji, 64, 64);
        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(scale, scale, 1);
        sprite.position.y = scale / 2;
        return sprite;
    }

    spawnLoggers() {
        for (let i = 0; i < CONFIG.WORLD.LOGGERS_COUNT; i++) {
            const logger = this.createSprite(this.assets.logger, 2.5);
            logger.position.set((Math.random() - 0.5) * CONFIG.WORLD.SIZE, 1.25, (Math.random() - 0.5) * CONFIG.WORLD.SIZE);
            logger.userData = { 
                type: 'logger', 
                health: CONFIG.STATS.ENEMY_HEALTH_LOGGER, 
                velocity: new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize(),
                speed: 3,
                moveTimer: 0
            };
            this.scene.add(logger);
            this.loggers.push(logger);
        }
    }

    spawnPredators() {
        for (let i = 0; i < CONFIG.WORLD.PREDATORS_COUNT; i++) {
            const predator = this.createSprite(this.assets.wolf, 2);
            predator.position.set((Math.random() - 0.5) * CONFIG.WORLD.SIZE, 1, (Math.random() - 0.5) * CONFIG.WORLD.SIZE);
            predator.userData = { 
                type: 'predator', 
                health: CONFIG.STATS.ENEMY_HEALTH_PREDATOR, 
                velocity: new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize(),
                speed: 6,
                moveTimer: 0
            };
            this.scene.add(predator);
            this.predators.push(predator);
        }
    }

    spawnFish() {
        for (let i = 0; i < CONFIG.WORLD.FISH_COUNT; i++) {
            const fish = this.createSprite(this.assets.fish, 0.8);
            fish.position.set(40 + (Math.random() - 0.5) * 15, -0.5, -40 + (Math.random() - 0.5) * 15);
            fish.userData = { 
                type: 'fish', 
                velocity: new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize(),
                speed: 2,
                moveTimer: 0
            };
            this.scene.add(fish);
            this.fish.push(fish);
        }
    }

    spawnArtifact() {
        const artifact = this.createSprite(this.assets.artifact, 3);
        artifact.position.set(-60, 2, 60); // Hidden in a specific spot
        artifact.userData = { type: 'artifact' };
        this.scene.add(artifact);
        this.artifact = artifact;
    }

    spawnTreasure() {
        const chest = this.createSprite(this.assets.chest, 1.5);
        chest.position.set(20, 0.75, 20);
        chest.userData = { type: 'treasure', reward: 100 };
        this.scene.add(chest);
    }

    spawnAnimals() {
        const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 1.2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.ANIMAL });
        for (let i = 0; i < CONFIG.WORLD.ANIMAL_COUNT; i++) {
            const animal = new THREE.Group();
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.6;
            animal.add(body);
            let x = (Math.random() - 0.5) * CONFIG.WORLD.SIZE;
            let z = (Math.random() - 0.5) * CONFIG.WORLD.SIZE;
            if (this.isNearLake(x, z, 30)) x += 60;
            animal.position.set(x, 0, z);
            animal.userData = { 
                type: 'animal', 
                id: `animal_${i}`,
                health: 2, 
                velocity: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                speed: 1.5 + Math.random() * 2,
                moveTimer: 0
            };
            this.scene.add(animal);
            this.animals.push(animal);
        }
    }

    isNearLake(x, z, radius = 30) {
        return Math.sqrt(Math.pow(x - 40, 2) + Math.pow(z + 40, 2)) < radius;
    }

    spawnClouds() {
        const cloudGeo = new THREE.SphereGeometry(3, 8, 8);
        const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        for (let i = 0; i < 15; i++) {
            const cloud = new THREE.Group();
            for(let j = 0; j < 3; j++) {
                const part = new THREE.Mesh(cloudGeo, cloudMat);
                part.position.x = j * 2.5;
                part.position.y = Math.random() * 2;
                part.scale.set(1, 0.6, 0.8);
                cloud.add(part);
            }
            cloud.position.set((Math.random() - 0.5) * CONFIG.WORLD.SIZE * 1.5, 30 + Math.random() * 10, (Math.random() - 0.5) * CONFIG.WORLD.SIZE * 1.5);
            this.scene.add(cloud);
        }
    }

    spawnMountains() {
        const mountainGeo = new THREE.ConeGeometry(20, 40, 4);
        const mountainMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.MOUNTAIN });
        for (let i = 0; i < CONFIG.WORLD.MOUNTAIN_COUNT; i++) {
            const mountain = new THREE.Mesh(mountainGeo, mountainMat);
            const angle = (i / CONFIG.WORLD.MOUNTAIN_COUNT) * Math.PI * 2;
            const dist = CONFIG.WORLD.SIZE * 0.95;
            mountain.position.set(Math.cos(angle) * dist, 20, Math.sin(angle) * dist);
            mountain.scale.y = 0.5 + Math.random();
            mountain.rotation.y = Math.random() * Math.PI;
            this.scene.add(mountain);
        }
    }

    spawnLake() {
        const lakeGeo = new THREE.CircleGeometry(25, 64);
        const lakeMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.LAKE, transparent: true, opacity: 0.6, roughness: 0, metalness: 0.8 });
        this.lake = new THREE.Mesh(lakeGeo, lakeMat);
        this.lake.rotation.x = -Math.PI / 2;
        this.lake.position.set(40, 0.05, -40);
        this.scene.add(this.lake);
    }

    spawnBuildings() {
        const stories = CONFIG.STORIES;
        for (let i = 0; i < CONFIG.WORLD.BUILDING_COUNT; i++) {
            const buildingGroup = new THREE.Group();
            const wallMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.BUILDING, side: THREE.DoubleSide });
            const roofMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const size = 6 + Math.random() * 4;
            const height = 8 + Math.random() * 4;
            let x = (Math.random() - 0.5) * CONFIG.WORLD.SIZE * 0.8;
            let z = (Math.random() - 0.5) * CONFIG.WORLD.SIZE * 0.8;
            if (this.isNearLake(x, z, 35)) x -= 60;
            this.buildingPositions.push({ x, z, size });
            
            // Wall creation...
            const backWall = new THREE.Mesh(new THREE.BoxGeometry(size, height, 0.2), wallMat);
            backWall.position.set(0, height / 2, -size / 2);
            buildingGroup.add(backWall);
            const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, height, size), wallMat);
            leftWall.position.set(-size / 2, height / 2, 0);
            buildingGroup.add(leftWall);
            const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, height, size), wallMat);
            rightWall.position.set(size / 2, height / 2, 0);
            buildingGroup.add(rightWall);
            const wallPartSize = (size - 2) / 2;
            const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(wallPartSize, height, 0.2), wallMat);
            frontWallLeft.position.set(-(size / 2 - wallPartSize / 2), height / 2, size / 2);
            buildingGroup.add(frontWallLeft);
            const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(wallPartSize, height, 0.2), wallMat);
            frontWallRight.position.set(size / 2 - wallPartSize / 2, height / 2, size / 2);
            buildingGroup.add(frontWallRight);
            const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(2, height - 3, 0.2), wallMat);
            frontWallTop.position.set(0, height - (height - 3) / 2, size / 2);
            buildingGroup.add(frontWallTop);
            const roof = new THREE.Mesh(new THREE.BoxGeometry(size + 1, 0.5, size + 1), roofMat);
            roof.position.set(0, height, 0);
            buildingGroup.add(roof);

            // NPC stories
            if (i < stories.length) {
                const npcGroup = new THREE.Group();
                const body = new THREE.Mesh(
                    new THREE.CapsuleGeometry(0.4, 1, 4, 8), 
                    new THREE.MeshStandardMaterial({ 
                        color: CONFIG.COLORS.NPC,
                        emissive: CONFIG.COLORS.NPC,
                        emissiveIntensity: 0.2
                    })
                );
                body.position.y = 0.9;
                npcGroup.add(body);
                
                const nameTag = this.createTextSprite(stories[i].name, '#00ffff');
                nameTag.position.y = 2.2;
                nameTag.scale.set(3, 0.75, 1);
                npcGroup.add(nameTag);

                // Quest Indicator (Exclamation mark)
                const questMark = this.createTextSprite('!', '#ffff00');
                questMark.position.y = 3.2;
                questMark.scale.set(1, 1, 1);
                npcGroup.add(questMark);
                npcGroup.userData.questIndicator = questMark;

                // Position NPCs in front of the building
                npcGroup.position.set(0, 0, size / 2 + 1.5);
                Object.assign(npcGroup.userData, { 
                    type: 'npc', 
                    id: `npc_story_${i}`, 
                    name: stories[i].name,
                    story: stories[i].story,
                    questData: stories[i].quest
                });
                buildingGroup.add(npcGroup);
                this.npcs.push(npcGroup);
            }

            buildingGroup.position.set(x, 0, z);
            buildingGroup.rotation.y = Math.random() * Math.PI * 2;
            buildingGroup.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
            this.scene.add(buildingGroup);
        }
    }

    spawnFactories() {
        for (let i = 0; i < CONFIG.WORLD.FACTORY_COUNT; i++) {
            const factoryGroup = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.FACTORY }));
            body.position.y = 3;
            factoryGroup.add(body);
            const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 8), new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.FACTORY }));
            chimney.position.set(3, 7, 3);
            factoryGroup.add(chimney);
            factoryGroup.position.set((Math.random() - 0.5) * CONFIG.WORLD.SIZE * 0.8, 0, (Math.random() - 0.5) * CONFIG.WORLD.SIZE * 0.8);
            if (factoryGroup.position.distanceTo(new THREE.Vector3(40, 0, -40)) < 35) factoryGroup.position.z += 50;
            factoryGroup.castShadow = true;
            this.scene.add(factoryGroup);
        }
    }

    spawnTrees() {
        const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const treeTrunkMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.TREE_TRUNK });
        const treeLeavesGeo = new THREE.ConeGeometry(1.2, 2.5, 8);
        const treeLeavesMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.TREE_LEAVES });
        const clusters = 12;
        const treesPerCluster = Math.floor(CONFIG.WORLD.TREE_COUNT / clusters);
        for (let c = 0; c < clusters; c++) {
            const centerX = (Math.random() - 0.5) * CONFIG.WORLD.SIZE;
            const centerZ = (Math.random() - 0.5) * CONFIG.WORLD.SIZE;
            for (let i = 0; i < treesPerCluster; i++) {
                let x = centerX + (Math.random() - 0.5) * 40;
                let z = centerZ + (Math.random() - 0.5) * 40;
                if (this.isNearLake(x, z, 28)) continue;
                let isInsideBuilding = false;
                for (const b of this.buildingPositions) {
                    if (Math.sqrt(Math.pow(x - b.x, 2) + Math.pow(z - b.z, 2)) < b.size / 2 + 1.5) { isInsideBuilding = true; break; }
                }
                if (isInsideBuilding) continue;
                const treeGroup = new THREE.Group();
                const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
                trunk.position.y = 1;
                trunk.castShadow = true;
                treeGroup.add(trunk);
                const leaves = new THREE.Mesh(treeLeavesGeo, treeLeavesMat);
                leaves.position.y = 3;
                leaves.castShadow = true;
                treeGroup.add(leaves);
                treeGroup.position.set(x, 0, z);
                treeGroup.userData = { type: 'tree', id: `tree_${c}_${i}`, health: 3 };
                this.scene.add(treeGroup);
                this.trees.push(treeGroup);
            }
        }
    }

    spawnGarbage() {
        const trashTypes = [
            { emoji: '🥤', category: 'хуванцар' },
            { emoji: '🥫', category: 'металл' },
            { emoji: '📦', category: 'цаас' },
            { emoji: '🔋', category: 'металл' },
            { emoji: '🧴', category: 'хуванцар' },
            { emoji: '📰', category: 'цаас' }
        ];
        for (let i = 0; i < CONFIG.WORLD.GARBAGE_COUNT; i++) {
            const type = trashTypes[Math.floor(Math.random() * trashTypes.length)];
            const trash = this.createEmojiSprite(type.emoji, 1.2);
            let x = (Math.random() - 0.5) * CONFIG.WORLD.SIZE;
            let z = (Math.random() - 0.5) * CONFIG.WORLD.SIZE;
            if (this.isNearLake(x, z, 28)) x += 60;
            trash.position.set(x, 0.6, z);
            trash.userData = { type: 'garbage', id: i, category: type.category, emoji: type.emoji };
            this.scene.add(trash);
            this.garbage.push(trash);
        }
    }

    spawnNPCs() {
        const npcGeo = new THREE.CapsuleGeometry(0.4, 1, 4, 8);
        const npcMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.NPC });
        for (let i = 0; i < CONFIG.WORLD.NPC_COUNT; i++) {
            const npcGroup = new THREE.Group();
            const body = new THREE.Mesh(npcGeo, npcMat);
            body.position.y = 0.9;
            npcGroup.add(body);
            
            const nameTag = this.createTextSprite('Байгаль хамгаалагч', '#00ffff');
            nameTag.position.y = 2.2;
            nameTag.scale.set(3, 0.75, 1);
            npcGroup.add(nameTag);

            npcGroup.position.set((Math.random() - 0.5) * CONFIG.WORLD.SIZE * 0.5, 0, (Math.random() - 0.5) * CONFIG.WORLD.SIZE * 0.5);
            npcGroup.userData = { type: 'npc', id: `npc_main_${i}`, name: 'Байгаль хамгаалагч', quest: '10 Байгалийн оноо цуглуул' };
            npcGroup.traverse(c => { if (c.isMesh) c.castShadow = true; });
            this.scene.add(npcGroup);
            this.npcs.push(npcGroup);
        }
    }

    update(deltaTime, playerPos, oxygenLevel, natureScore) {
        this.time += deltaTime * 0.1;

        // Day/Night Cycle
        const sunAngle = this.time * 0.5;
        this.sunLight.position.set(Math.cos(sunAngle) * 100, Math.sin(sunAngle) * 100, 50);
        this.sunLight.intensity = Math.max(0, Math.sin(sunAngle)) * 2 + 0.5;
        this.ambientLight.intensity = Math.max(0.1, Math.sin(sunAngle)) * 0.5;

        // Environment visuals based on oxygen and nature score
        const pollT = 1 - (oxygenLevel / CONFIG.STATS.MAX_OXYGEN);
        const natureT = Math.max(0, natureScore / CONFIG.MISSION.NATURE_SCORE_TARGET);
        
        const cleanColor = new THREE.Color(CONFIG.COLORS.SKY_CLEAN);
        const pollutedColor = new THREE.Color(CONFIG.COLORS.SKY_POLLUTED);
        const currentColor = cleanColor.lerp(pollutedColor, pollT);
        
        // Adjust fog density based on pollution
        this.scene.fog.near = 10 + (natureT * 20); 
        this.scene.fog.far = CONFIG.WORLD.SIZE * (0.5 + natureT * 0.5);
        
        this.scene.background.copy(currentColor);
        this.scene.fog.color.copy(currentColor);

        // Water clarity based on nature score
        if (this.lake) {
            const cleanWater = new THREE.Color(0x00aaff);
            const muddyWater = new THREE.Color(0x4b3621);
            this.lake.material.color.copy(muddyWater.lerp(cleanWater, natureT));
            this.lake.material.opacity = 0.4 + (natureT * 0.4);
            this.fish.forEach(f => {
                f.visible = natureScore > 30;
                if (f.visible) f.material.opacity = Math.min(1, natureT + 0.5);
            });
        }

        // Purity particles when nature score is high
        if (natureScore > 100) {
            this.purityParticles.forEach(p => {
                if (!p.mesh.visible || p.life <= 0) {
                    p.mesh.visible = true;
                    p.mesh.position.set((Math.random()-0.5)*150, 1 + Math.random()*5, (Math.random()-0.5)*150);
                    p.velocity.set((Math.random()-0.5)*0.5, 0.5 + Math.random()*0.5, (Math.random()-0.5)*0.5);
                    p.life = 2.0 + Math.random() * 2.0;
                    p.mesh.scale.setScalar(0.2 + Math.random()*0.3);
                } else {
                    p.mesh.position.addScaledVector(p.velocity, deltaTime);
                    p.life -= deltaTime;
                    p.mesh.material.opacity = Math.min(1, p.life);
                    if (p.life <= 0) p.mesh.visible = false;
                }
            });
        } else {
            this.purityParticles.forEach(p => p.mesh.visible = false);
        }

        // Weather System
        this.weatherTimer -= deltaTime;
        
        // NPC animations (Name tags and Quest marks)
        this.npcs.forEach(npc => {
            if (npc.userData.questIndicator) {
                npc.userData.questIndicator.position.y = 3.2 + Math.sin(this.time * 2) * 0.2;
                npc.userData.questIndicator.rotation.y = Math.sin(this.time);
            }
        });

        if (this.weatherTimer <= 0) {
            if (Math.random() < CONFIG.WEATHER.FIRE_CHANCE) {
                this.weather = 'fire';
                this.weatherTimer = 10;
                window.dispatchEvent(new CustomEvent('weather-changed', { detail: '🔥 Ойн түймэр гарлаа!' }));
            } else if (Math.random() < CONFIG.WEATHER.RAIN_CHANCE) {
                this.weather = 'rain';
                this.weatherTimer = 15;
                window.dispatchEvent(new CustomEvent('weather-changed', { detail: '🌧️ Сэргээгч бороо орж байна' }));
            } else {
                this.weather = 'clear';
                this.weatherTimer = 20;
            }
        }

        // AI Updates
        const updateAI = (list) => {
            list.forEach(ent => {
                const data = ent.userData;
                data.moveTimer -= deltaTime;
                if (data.moveTimer <= 0) {
                    data.velocity.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                    data.moveTimer = 1 + Math.random() * 3;
                }
                ent.position.addScaledVector(data.velocity, data.speed * deltaTime);
                if (Math.abs(ent.position.x) > CONFIG.WORLD.SIZE) ent.position.x *= -0.9;
                if (Math.abs(ent.position.z) > CONFIG.WORLD.SIZE) ent.position.z *= -0.9;
            });
        };
        updateAI(this.animals);
        updateAI(this.loggers);
        updateAI(this.predators);
        updateAI(this.fish);

        // Weather Effects
        if (this.weather === 'fire') {
            this.fireParticles.forEach(p => {
                if (!p.mesh.visible || p.life <= 0) {
                    p.mesh.visible = true;
                    p.mesh.position.set(playerPos.x + (Math.random()-0.5)*20, 0.2, playerPos.z + (Math.random()-0.5)*20);
                    p.velocity.set((Math.random()-0.5)*2, 4 + Math.random()*4, (Math.random()-0.5)*2);
                    p.life = 1.0;
                } else {
                    p.mesh.position.addScaledVector(p.velocity, deltaTime);
                    p.life -= deltaTime;
                    p.mesh.scale.setScalar(p.life);
                    if (p.life <= 0) p.mesh.visible = false;
                }
            });
        } else if (this.weather === 'rain') {
            this.fireParticles.forEach(p => p.mesh.visible = false);
            this.rainParticles.forEach(p => {
                if (!p.mesh.visible || p.life <= 0) {
                    p.mesh.visible = true;
                    p.mesh.position.set(playerPos.x + (Math.random()-0.5)*30, 20, playerPos.z + (Math.random()-0.5)*30);
                    p.life = 1.5;
                } else {
                    p.mesh.position.addScaledVector(p.velocity, deltaTime);
                    p.life -= deltaTime;
                    if (p.life <= 0) p.mesh.visible = false;
                }
            });
        } else {
            this.fireParticles.forEach(p => p.mesh.visible = false);
            this.rainParticles.forEach(p => p.mesh.visible = false);
        }
    }
}
