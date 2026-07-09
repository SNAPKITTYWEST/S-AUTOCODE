// proof-registry.js — Proof Registry Implementation
export function initProofRegistry(proofStore) {
    const container = document.getElementById('proof-list');
    const detailPanel = document.getElementById('proof-detail');
    const filterButtons = document.querySelectorAll('.proof-filter-btn');
    
    if (!container || !detailPanel) {
        console.error('Proof registry elements not found');
        return null;
    }
    
    let currentFilter = 'all';
    
    function renderProofs() {
        const proofs = proofStore.getProofs();
        const filtered = filterProofs(proofs, currentFilter);
        
        container.innerHTML = '';
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="proof-empty">
                    <div class="proof-empty-icon">📋</div>
                    <div class="proof-empty-text">No proofs ${currentFilter !== 'all' ? `with status "${currentFilter}"` : 'yet'}</div>
                    <div class="proof-empty-hint">Run verification commands to generate proofs</div>
                </div>
            `;
            return;
        }
        
        filtered.forEach(proof => {
            const proofEl = document.createElement('div');
            proofEl.className = `proof-item proof-status-${proof.status}`;
            proofEl.dataset.proofId = proof.id;
            
            const statusIcon = getStatusIcon(proof.status);
            const statusColor = getStatusColor(proof.status);
            
            proofEl.innerHTML = `
                <div class="proof-item-header">
                    <span class="proof-status-badge" style="background: ${statusColor}">
                        ${statusIcon} ${proof.status}
                    </span>
                    <span class="proof-timestamp">${formatTime(proof.timestamp)}</span>
                </div>
                <div class="proof-item-title">${proof.theorem}</div>
                <div class="proof-item-meta">
                    <span class="proof-meta-item">
                        <span class="proof-meta-label">Prover:</span>
                        <span class="proof-meta-value">${proof.prover}</span>
                    </span>
                    <span class="proof-meta-item">
                        <span class="proof-meta-label">Steps:</span>
                        <span class="proof-meta-value">${proof.steps || 0}</span>
                    </span>
                </div>
            `;
            
            proofEl.addEventListener('click', () => showProofDetail(proof));
            container.appendChild(proofEl);
        });
        
        // Update stats
        updateStats(proofs);
    }
    
    function filterProofs(proofs, filter) {
        if (filter === 'all') return proofs;
        return proofs.filter(p => p.status === filter);
    }
    
    function showProofDetail(proof) {
        detailPanel.innerHTML = `
            <div class="proof-detail">
                <div class="proof-detail-header">
                    <h3>${proof.theorem}</h3>
                    <span class="proof-status-badge" style="background: ${getStatusColor(proof.status)}">
                        ${getStatusIcon(proof.status)} ${proof.status}
                    </span>
                </div>
                
                <div class="proof-detail-section">
                    <h4>Metadata</h4>
                    <div class="detail-row">
                        <label>Proof ID:</label>
                        <code>${proof.id}</code>
                    </div>
                    <div class="detail-row">
                        <label>Prover:</label>
                        <span>${proof.prover}</span>
                    </div>
                    <div class="detail-row">
                        <label>Timestamp:</label>
                        <span>${new Date(proof.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <label>Steps:</label>
                        <span>${proof.steps || 0}</span>
                    </div>
                </div>
                
                ${proof.assumptions ? `
                <div class="proof-detail-section">
                    <h4>Assumptions</h4>
                    <ul class="proof-list">
                        ${proof.assumptions.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${proof.tactics ? `
                <div class="proof-detail-section">
                    <h4>Proof Tactics</h4>
                    <pre class="proof-code">${proof.tactics.join('\n')}</pre>
                </div>
                ` : ''}
                
                ${proof.conclusion ? `
                <div class="proof-detail-section">
                    <h4>Conclusion</h4>
                    <div class="proof-conclusion">${proof.conclusion}</div>
                </div>
                ` : ''}
                
                ${proof.error ? `
                <div class="proof-detail-section">
                    <h4>Error Details</h4>
                    <div class="proof-error">${proof.error}</div>
                </div>
                ` : ''}
                
                <div class="proof-detail-actions">
                    <button class="btn btn-sm" onclick="navigator.clipboard.writeText('${proof.id}')">
                        Copy ID
                    </button>
                    <button class="btn btn-sm" onclick="navigator.clipboard.writeText('${JSON.stringify(proof, null, 2)}')">
                        Copy Proof
                    </button>
                    ${proof.status === 'verified' ? `
                    <button class="btn btn-sm btn-success">
                        ✓ Verified
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    function getStatusIcon(status) {
        const icons = {
            'verified': '✓',
            'pending': '⏳',
            'failed': '✗',
            'timeout': '⏱',
            'invalid': '⚠'
        };
        return icons[status] || '●';
    }
    
    function getStatusColor(status) {
        const colors = {
            'verified': 'rgba(52, 199, 89, 0.2)',
            'pending': 'rgba(255, 204, 0, 0.2)',
            'failed': 'rgba(255, 59, 48, 0.2)',
            'timeout': 'rgba(255, 149, 0, 0.2)',
            'invalid': 'rgba(175, 82, 222, 0.2)'
        };
        return colors[status] || 'rgba(142, 142, 147, 0.2)';
    }
    
    function formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 1000) return 'Just now';
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }
    
    function updateStats(proofs) {
        const stats = {
            total: proofs.length,
            verified: proofs.filter(p => p.status === 'verified').length,
            pending: proofs.filter(p => p.status === 'pending').length,
            failed: proofs.filter(p => p.status === 'failed').length
        };
        
        const statsEl = document.querySelector('.proof-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="stat-item">
                    <span class="stat-value">${stats.total}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-item stat-success">
                    <span class="stat-value">${stats.verified}</span>
                    <span class="stat-label">Verified</span>
                </div>
                <div class="stat-item stat-warning">
                    <span class="stat-value">${stats.pending}</span>
                    <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item stat-error">
                    <span class="stat-value">${stats.failed}</span>
                    <span class="stat-label">Failed</span>
                </div>
            `;
        }
    }
    
    function setFilter(filter) {
        currentFilter = filter;
        
        // Update button states
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('is-active');
            } else {
                btn.classList.remove('is-active');
            }
        });
        
        renderProofs();
    }
    
    function exportProofs() {
        const proofs = proofStore.getProofs();
        const data = JSON.stringify({
            proofs,
            exported: Date.now(),
            total: proofs.length,
            verified: proofs.filter(p => p.status === 'verified').length
        }, null, 2);
        
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `proofs-${Date.now()}.json`;
        a.click();
    }
    
    // Setup filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });
    
    // Initial render
    renderProofs();
    
    // Return public API
    return {
        renderProofs,
        setFilter,
        exportProofs
    };
}

// Add CSS for proof registry
const style = document.createElement('style');
style.textContent = `
.proof-layout {
    display: flex;
    gap: 16px;
    padding: 16px;
    height: 100%;
    overflow: hidden;
}

.proof-sidebar {
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.proof-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
}

.stat-item {
    text-align: center;
    padding: 12px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
}

.stat-value {
    display: block;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
}

.stat-label {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 4px;
}

.stat-item.stat-success .stat-value {
    color: var(--status-success);
}

.stat-item.stat-warning .stat-value {
    color: var(--status-warning);
}

.stat-item.stat-error .stat-value {
    color: var(--status-error);
}

.proof-filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
}

.proof-filter-btn {
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--duration-fast);
    text-align: left;
}

.proof-filter-btn:hover {
    background: var(--bg-elevated);
    border-color: var(--border-accent);
}

.proof-filter-btn.is-active {
    background: var(--accent-glow);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
    font-weight: var(--font-weight-semibold);
}

.proof-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
}

.proof-detail {
    width: 400px;
    overflow-y: auto;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
}

.proof-empty {
    text-align: center;
    padding: 60px 20px;
}

.proof-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.proof-empty-text {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.proof-empty-hint {
    font-size: var(--font-size-sm);
    color: var(--text-tertiary);
}

.proof-item {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all var(--duration-fast);
}

.proof-item:hover {
    border-color: var(--border-accent);
    background: var(--bg-elevated);
}

.proof-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.proof-status-badge {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
}

.proof-timestamp {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
}

.proof-item-title {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-bottom: 8px;
}

.proof-item-meta {
    display: flex;
    gap: 16px;
    font-size: var(--font-size-xs);
}

.proof-meta-label {
    color: var(--text-secondary);
}

.proof-meta-value {
    color: var(--text-primary);
    font-family: var(--font-mono);
}

.proof-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-subtle);
}

.proof-detail-header h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin: 0;
    flex: 1;
}

.proof-detail-section {
    margin-bottom: 20px;
}

.proof-detail-section h4 {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
}

.proof-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.proof-list li {
    padding: 8px 12px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    margin-bottom: 4px;
    font-size: var(--font-size-sm);
}

.proof-code {
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    background: var(--bg-primary);
    padding: 12px;
    border-radius: var(--radius-sm);
    overflow-x: auto;
    color: var(--text-mono);
}

.proof-conclusion {
    padding: 12px;
    background: rgba(52, 199, 89, 0.1);
    border-left: 3px solid var(--status-success);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
}

.proof-error {
    padding: 12px;
    background: rgba(255, 59, 48, 0.1);
    border-left: 3px solid var(--status-error);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    color: var(--status-error);
}

.proof-detail-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
}

.btn-success {
    background: var(--status-success);
    color: white;
}
`;
document.head.appendChild(style);

// Made with Bob
