// memory-tape.js — Interactive memory viewer
export class MemoryTape {
    constructor(container) {
        this.container = container;
        this.offset = 0;
        this.cellsPerRow = 8;
        this.rows = 4;
        this.memory = new Array(256).fill(0);
        this.modifications = new Set();
    }

    render() {
        let html = `<div class="tape-header">
            <span class="tape-addr-label">ADDR</span>`;
        for (let i = 0; i < this.cellsPerRow; i++) {
            html += `<span class="tape-cell-label">${i}</span>`;
        }
        html += '</div>';

        for (let row = 0; row < this.rows; row++) {
            const baseAddr = this.offset + row * this.cellsPerRow;
            html += `<div class="tape-row">
                <span class="tape-address">0x${baseAddr.toString(16).padStart(4, '0')}</span>`;
            for (let col = 0; col < this.cellsPerRow; col++) {
                const addr = baseAddr + col;
                const val = this.memory[addr] || 0;
                const hex = (val & 0xFF).toString(16).padStart(2, '0').toUpperCase();
                const isActive = val !== 0;
                const isModified = this.modifications.has(addr);
                html += `<span class="tape-cell${isActive ? ' is-active' : ''}${isModified ? ' is-modified' : ''}" data-addr="${addr}">${hex}</span>`;
            }
            html += '</div>';
        }

        this.container.innerHTML = html;
        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelectorAll('.tape-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const addr = parseInt(cell.dataset.addr);
                this.onCellClick?.(addr, this.memory[addr]);
            });
        });
    }

    updateMemory(memory) {
        this.memory = memory;
        this.render();
    }

    scrollUp() {
        this.offset = Math.max(0, this.offset - this.cellsPerRow);
        this.render();
    }

    scrollDown() {
        this.offset = Math.min(this.memory.length - this.cellsPerRow * this.rows, this.offset + this.cellsPerRow);
        this.render();
    }

    markModified(addr) {
        this.modifications.add(addr);
        this.render();
    }

    clearModifications() {
        this.modifications.clear();
        this.render();
    }
}