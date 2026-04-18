import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class InteractionSystem {
    constructor(player, environment) {
        this.player = player;
        this.environment = environment;
        this.interactionRadius = 3;
        this.nearbyObject = null;
        
        // Listen for interaction events (e.g., from jump button or custom button)
        window.addEventListener('player-interact', () => this.handleInteraction());
    }

    update() {
        // Find nearest interactable object
        let closest = null;
        let minDist = Infinity;

        const objects = [
            ...this.environment.trees, 
            ...this.environment.garbage, 
            ...this.environment.npcs,
            ...this.environment.animals
        ];

        for (const obj of objects) {
            if (!obj.parent) continue; // Skip if removed from scene

            const dist = this.player.mesh.position.distanceTo(obj.position);
            
            let reach = this.interactionRadius;
            if (obj.userData.type === 'tree') reach = this.player.stats.reach;
            if (obj.userData.type === 'animal') reach = this.player.stats.reach;
            
            if (dist < reach && dist < minDist) {
                minDist = dist;
                closest = obj;
            }
        }

        if (this.nearbyObject !== closest) {
            this.nearbyObject = closest;
            window.dispatchEvent(new CustomEvent('nearby-object-changed', { detail: closest ? closest.userData : null }));
        }
    }

    handleInteraction() {
        if (!this.nearbyObject) return;

        const data = this.nearbyObject.userData;

        if (data.type === 'tree') {
            if (this.player.stats.durability <= 0) {
                alert("Weapon broken! Visit the shop to repair or upgrade.");
                return;
            }
            if (this.player.attack()) {
                this.player.updateStats(0, 0, 0, 0, -0.5); // Durability loss
                this.handleCutTree();
            }
        } else if (data.type === 'animal') {
            if (!this.player.stats.hasHuntingGear) {
                alert("You need Hunting Gear from the SHOP to hunt animals!");
                return;
            }
            if (this.player.attack()) {
                this.handleHuntAnimal();
            }
        } else if (data.type === 'garbage') {
            this.handleCollectGarbage();
        } else if (data.type === 'npc') {
            this.handleNPCInteract();
        }
    }

    handleHuntAnimal() {
        const animal = this.nearbyObject;
        animal.userData.health -= 1;
        
        // Flee on hit
        animal.userData.speed *= 1.5;
        animal.userData.moveTimer = 0;

        if (animal.userData.health <= 0) {
            this.environment.scene.remove(animal);
            const index = this.environment.animals.indexOf(animal);
            if (index > -1) this.environment.animals.splice(index, 1);
            
            this.player.updateStats(0, CONFIG.STATS.ANIMAL_REWARD, 0, 0);
        }
    }

    handleCutTree() {
        const tree = this.nearbyObject;
        tree.userData.health -= 1;
        
        // Show hit effect
        tree.scale.set(1.1, 0.9, 1.1);
        setTimeout(() => tree.scale.set(1, 1, 1), 100);

        if (tree.userData.health <= 0) {
            // "Cut down"
            this.environment.scene.remove(tree);
            const index = this.environment.trees.indexOf(tree);
            if (index > -1) this.environment.trees.splice(index, 1);
            
            // Apply efficiency
            const oxygenLoss = CONFIG.STATS.OXYGEN_DECAY_PER_TREE * this.player.stats.efficiency;
            this.player.updateStats(-oxygenLoss, 0, 1, 0);
            
            // Increment quest progress if active
            if (this.player.activeQuest && this.player.activeQuest.type === 'cut_trees') {
                this.player.activeQuest.progress++;
                if (this.player.activeQuest.progress >= this.player.activeQuest.target) {
                    window.dispatchEvent(new CustomEvent('quest-complete', { detail: this.player.activeQuest }));
                }
            }
        }
    }

    handleCollectGarbage() {
        const garbage = this.nearbyObject;
        this.environment.scene.remove(garbage);
        const index = this.environment.garbage.indexOf(garbage);
        if (index > -1) this.environment.garbage.splice(index, 1);
        
        this.player.updateStats(CONFIG.STATS.OXYGEN_GAIN_PER_GARBAGE, CONFIG.STATS.MONEY_GAIN_PER_GARBAGE, 0, 1);
    }

    handleNPCInteract() {
        const npcData = this.nearbyObject.userData;
        
        if (this.player.activeQuest && this.player.activeQuest.isComplete) {
            // Turn in quest
            this.player.updateStats(0, this.player.activeQuest.reward, 0, 0);
            this.player.activeQuest = null;
            window.dispatchEvent(new CustomEvent('quest-turned-in'));
        } else if (!this.player.activeQuest) {
            // Take new quest
            this.player.activeQuest = {
                title: 'Mayor\'s Request',
                description: 'The town needs wood. Cut 3 trees.',
                type: 'cut_trees',
                progress: 0,
                target: 3,
                reward: 100,
                isComplete: false
            };
            window.dispatchEvent(new CustomEvent('quest-accepted', { detail: this.player.activeQuest }));
        }
    }
}
