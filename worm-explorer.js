// worm-explorer.js — WORM Chain Explorer UI
export function initWormExplorer(wormChain) {
    const chainEl = document.getElementById('worm-chain');
    const detailEl = document.getElementById('worm-detail');
    
    if (!chainEl || !detailEl) {
        console.warn('WORM explorer elements not found');
        return null;
    }
    
    function renderChain() {
        const chain = wormChain.getChain();
        chainEl.innerHTML = '';
        
        if (chain.length === 0) {
            chainEl.innerHTML = '<div class="empty-state">No blocks in chain yet</div>';
            return;
        }
        
        chain.forEach((block, i) => {
            const blockEl = document.createElement('div');
            blockEl.className = 'worm-block';
            blockEl.innerHTML = `
                <div class="worm-block-header">
                    <span class="worm-block-number">#${block.block}</span>
                    <span class="worm-block-type">${block.type}</span>
                </div>
                <div class="worm-block-hash">${block.hash.substring(0, 16)}...</div>
                <div class="worm-block-time">${new Date(block.timestamp).toLocaleTimeString()}</div>
            `;
            blockEl.addEventListener('click', () => showBlockDetail(block));
            chainEl.appendChild(blockEl);
        });
    }
    
    function showBlockDetail(block) {
        detailEl.innerHTML = `
            <div class="worm-detail-content">
                <h3>Block #${block.block}</h3>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${block.type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Hash:</span>
                    <span class="detail-value code">${block.hash}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Previous:</span>
                    <span class="detail-value code">${block.prevHash}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Timestamp:</span>
                    <span class="detail-value">${new Date(block.timestamp).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Data:</span>
                    <pre class="detail-value code">${JSON.stringify(block.data, null, 2)}</pre>
                </div>
            </div>
        `;
    }
    
    renderChain();
    
    return { renderChain, showBlockDetail };
}

// Made with Bob
