// routes.js — Hash-based SPA router for S-AUTOCODE
const routes = {
    '/': { view: 'view-observatory', title: 'S-AUTOCODE' },
    '/observatory': { view: 'view-observatory', title: 'Observatory' },
    '/editor': { view: 'view-editor', title: 'Editor' },
    '/sandbox': { view: 'view-sandbox', title: 'Sandbox' },
    '/sandbox/:sessionId': { view: 'view-sandbox', title: 'Sandbox Session' },
    '/agents': { view: 'view-agents', title: 'Agents' },
    '/proofs': { view: 'view-proofs', title: 'Proofs' },
    '/symbols/:id': { view: 'view-symbols', title: 'Symbol Inspector' },
    '/worm': { view: 'view-worm', title: 'WORM Chain' },
    '/deploy': { view: 'view-deploy', title: 'Deploy' }
};

let currentRoute = '/';
let routeParams = {};

function parseHash() {
    const hash = window.location.hash.replace('#', '') || '/';
    const parts = hash.split('/').filter(Boolean);
    
    // Try exact match first
    if (routes[hash]) {
        return { route: hash, params: {} };
    }
    
    // Try parameterized match
    for (const pattern of Object.keys(routes)) {
        const patternParts = pattern.split('/').filter(Boolean);
        if (patternParts.length !== parts.length) continue;
        
        const params = {};
        let match = true;
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = parts[i];
            } else if (patternParts[i] !== parts[i]) {
                match = false;
                break;
            }
        }
        if (match) return { route: pattern, params };
    }
    
    return { route: '/404', params: {} };
}

export function navigate(path) {
    window.location.hash = '#' + path;
}

export function getCurrentRoute() {
    return { route: currentRoute, params: routeParams };
}

export function onRouteChange(callback) {
    window.addEventListener('hashchange', () => {
        const { route, params } = parseHash();
        currentRoute = route;
        routeParams = params;
        
        // Hide all views
        document.querySelectorAll('.route-view').forEach(v => v.classList.add('hidden'));
        
        // Show target view
        const config = routes[route] || routes['/404'];
        const view = document.getElementById(config.view);
        if (view) {
            view.classList.remove('hidden');
            document.title = config.title + ' | S-AUTOCODE';
        }
        
        // Update nav active state
        document.querySelectorAll('.menu-item[data-route]').forEach(item => {
            item.classList.toggle('is-active', item.dataset.route === route || 
                (route === '/' && item.dataset.route === '/observatory'));
        });
        
        callback(route, params);
    });
}

export function initRouter() {
    const { route, params } = parseHash();
    currentRoute = route;
    routeParams = params;
    
    const config = routes[route] || routes['/404'];
    const view = document.getElementById(config.view);
    if (view) {
        view.classList.remove('hidden');
        document.title = config.title + ' | S-AUTOCODE';
    }
    
    // Nav click handlers
    document.querySelectorAll('.menu-item[data-route]').forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.route));
    });
}