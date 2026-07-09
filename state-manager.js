// state-manager.js — State Management with localStorage Persistence
export class StateManager {
    constructor() {
        this.state = {
            session: {
                id: this.generateSessionId(),
                startTime: Date.now(),
                lastActivity: Date.now()
            },
            editor: {
                content: '',
                cursorPosition: 0,
                history: [],
                historyIndex: -1
            },
            terminal: {
                history: [],
                commandHistory: [],
                commandIndex: -1
            },
            wormChain: {
                blocks: [],
                lastHash: '0'.repeat(64)
            },
            proofs: {
                items: [],
                filter: 'all'
            },
            agents: {
                forge: { active: false, lastRun: null },
                sentinel: { active: false, lastRun: null },
                oracle: { active: false, lastRun: null },
                codex: { active: false, lastRun: null },
                vault: { active: false, lastRun: null }
            },
            ui: {
                theme: 'dark',
                fontSize: 14,
                currentRoute: '#/',
                sidebarCollapsed: false
            }
        };
        
        this.listeners = new Map();
        this.autoSaveInterval = null;
        
        // Load persisted state
        this.load();
        
        // Setup auto-save
        this.startAutoSave();
        
        // Track activity
        this.trackActivity();
    }
    
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Get state value by path
    get(path) {
        const keys = path.split('.');
        let value = this.state;
        
        for (const key of keys) {
            if (value === undefined || value === null) return undefined;
            value = value[key];
        }
        
        return value;
    }
    
    // Set state value by path
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.state;
        
        for (const key of keys) {
            if (!(key in target)) {
                target[key] = {};
            }
            target = target[key];
        }
        
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        // Update last activity
        this.state.session.lastActivity = Date.now();
        
        // Notify listeners
        this.notify(path, value, oldValue);
        
        return value;
    }
    
    // Update nested state (merge)
    update(path, updates) {
        const current = this.get(path) || {};
        const merged = { ...current, ...updates };
        this.set(path, merged);
        return merged;
    }
    
    // Subscribe to state changes
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(path);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }
    
    // Notify listeners of changes
    notify(path, newValue, oldValue) {
        // Notify exact path listeners
        const listeners = this.listeners.get(path);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
        
        // Notify wildcard listeners (path.*)
        const wildcardPath = path.split('.').slice(0, -1).join('.') + '.*';
        const wildcardListeners = this.listeners.get(wildcardPath);
        if (wildcardListeners) {
            wildcardListeners.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
    }
    
    // Save state to localStorage
    save() {
        try {
            const serialized = JSON.stringify(this.state);
            localStorage.setItem('s-autocode-state', serialized);
            localStorage.setItem('s-autocode-state-timestamp', Date.now().toString());
            return true;
        } catch (error) {
            console.error('Failed to save state:', error);
            return false;
        }
    }
    
    // Load state from localStorage
    load() {
        try {
            const serialized = localStorage.getItem('s-autocode-state');
            if (serialized) {
                const loaded = JSON.parse(serialized);
                
                // Merge loaded state with defaults (preserve new fields)
                this.state = this.deepMerge(this.state, loaded);
                
                // Update session info
                this.state.session.lastActivity = Date.now();
                
                console.log('State loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
        return false;
    }
    
    // Deep merge objects
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] instanceof Object && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    // Clear all state
    clear() {
        this.state = {
            session: {
                id: this.generateSessionId(),
                startTime: Date.now(),
                lastActivity: Date.now()
            },
            editor: { content: '', cursorPosition: 0, history: [], historyIndex: -1 },
            terminal: { history: [], commandHistory: [], commandIndex: -1 },
            wormChain: { blocks: [], lastHash: '0'.repeat(64) },
            proofs: { items: [], filter: 'all' },
            agents: {
                forge: { active: false, lastRun: null },
                sentinel: { active: false, lastRun: null },
                oracle: { active: false, lastRun: null },
                codex: { active: false, lastRun: null },
                vault: { active: false, lastRun: null }
            },
            ui: { theme: 'dark', fontSize: 14, currentRoute: '#/', sidebarCollapsed: false }
        };
        
        localStorage.removeItem('s-autocode-state');
        localStorage.removeItem('s-autocode-state-timestamp');
        
        this.notify('*', this.state, null);
    }
    
    // Export state as JSON
    export() {
        return {
            state: this.state,
            exported: Date.now(),
            version: '1.0.0'
        };
    }
    
    // Import state from JSON
    import(data) {
        try {
            if (data.state) {
                this.state = this.deepMerge(this.state, data.state);
                this.save();
                this.notify('*', this.state, null);
                return true;
            }
        } catch (error) {
            console.error('Failed to import state:', error);
        }
        return false;
    }
    
    // Start auto-save interval
    startAutoSave(interval = 30000) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.save();
        }, interval);
    }
    
    // Stop auto-save
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    // Track user activity
    trackActivity() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.state.session.lastActivity = Date.now();
            }, { passive: true });
        });
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.save();
        });
    }
    
    // Get session duration
    getSessionDuration() {
        return Date.now() - this.state.session.startTime;
    }
    
    // Get idle time
    getIdleTime() {
        return Date.now() - this.state.session.lastActivity;
    }
    
    // Check if session is active
    isActive(idleThreshold = 300000) { // 5 minutes
        return this.getIdleTime() < idleThreshold;
    }
    
    // Get state snapshot
    snapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    // Restore from snapshot
    restore(snapshot) {
        this.state = JSON.parse(JSON.stringify(snapshot));
        this.save();
        this.notify('*', this.state, null);
    }
}

// Create singleton instance
export const stateManager = new StateManager();

// Helper functions for common operations
export function saveEditorState(content, cursorPosition) {
    stateManager.update('editor', {
        content,
        cursorPosition,
        lastModified: Date.now()
    });
}

export function loadEditorState() {
    return stateManager.get('editor');
}

export function addTerminalHistory(entry) {
    const history = stateManager.get('terminal.history') || [];
    history.push({
        ...entry,
        timestamp: Date.now()
    });
    
    // Keep last 1000 entries
    if (history.length > 1000) {
        history.shift();
    }
    
    stateManager.set('terminal.history', history);
}

export function addCommandHistory(command) {
    const history = stateManager.get('terminal.commandHistory') || [];
    
    // Don't add duplicates of last command
    if (history[history.length - 1] !== command) {
        history.push(command);
    }
    
    // Keep last 100 commands
    if (history.length > 100) {
        history.shift();
    }
    
    stateManager.set('terminal.commandHistory', history);
    stateManager.set('terminal.commandIndex', history.length);
}

export function getCommandHistory() {
    return stateManager.get('terminal.commandHistory') || [];
}

export function addWormBlock(block) {
    const blocks = stateManager.get('wormChain.blocks') || [];
    blocks.push(block);
    stateManager.set('wormChain.blocks', blocks);
    stateManager.set('wormChain.lastHash', block.hash);
}

export function getWormChain() {
    return stateManager.get('wormChain.blocks') || [];
}

export function addProof(proof) {
    const proofs = stateManager.get('proofs.items') || [];
    proofs.push({
        ...proof,
        id: `proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
    });
    stateManager.set('proofs.items', proofs);
}

export function getProofs() {
    return stateManager.get('proofs.items') || [];
}

export function updateAgentStatus(agentName, status) {
    stateManager.update(`agents.${agentName}`, {
        ...status,
        lastRun: Date.now()
    });
}

export function getAgentStatus(agentName) {
    return stateManager.get(`agents.${agentName}`);
}

export function setUIPreference(key, value) {
    stateManager.set(`ui.${key}`, value);
}

export function getUIPreference(key) {
    return stateManager.get(`ui.${key}`);
}

// Export state to file
export function exportStateToFile() {
    const data = stateManager.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `s-autocode-state-${Date.now()}.json`;
    a.click();
}

// Import state from file
export function importStateFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = stateManager.import(data);
                resolve(success);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

// Debug helper
window.stateManager = stateManager;
console.log('StateManager initialized. Access via window.stateManager');

// Made with Bob
