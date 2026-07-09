// worm-receipts.js — WORM chain and sealed receipts
export class WormChain {
    constructor() {
        this.chain = [];
        this.seal();
    }

    async seal() {
        const genesis = {
            block: 0,
            type: 'GENESIS',
            timestamp: Date.now(),
            data: { system: 'S-AUTOCODE', version: '1.0.0' },
            prevHash: '0000000000000000'
        };
        genesis.hash = await this.hash(genesis);
        this.chain.push(genesis);
        return genesis;
    }

    async append(type, data, agent = 'SYSTEM') {
        const prevHash = this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '0000000000000000';
        
        const block = {
            block: this.chain.length,
            type,
            agent,
            timestamp: Date.now(),
            data,
            prevHash
        };

        block.hash = await this.hash(block);
        block.signature = await this.sign(block);
        this.chain.push(block);

        return block;
    }

    async hash(block) {
        const content = JSON.stringify({ block: block.block, type: block.type, data: block.data, prevHash: block.prevHash });
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async sign(block) {
        // Simplified signing — in production use Ed25519
        const content = JSON.stringify(block);
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const sigBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(sigBuffer)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verify() {
        for (let i = 1; i < this.chain.length; i++) {
            const block = this.chain[i];
            const prev = this.chain[i - 1];
            if (block.prevHash !== prev.hash) {
                return { valid: false, block: i, reason: 'Hash chain broken' };
            }
        }
        return { valid: true, blocks: this.chain.length };
    }

    getChain() {
        return this.chain;
    }

    getBlock(n) {
        return this.chain[n] || null;
    }

    getReceipts(agent) {
        return this.chain.filter(b => b.agent === agent);
    }

    export() {
        return JSON.stringify(this.chain, null, 2);
    }
}