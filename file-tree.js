// File Tree System with Drag-Drop and Context Menus
// Cursor-style file explorer

export class FileTree {
    constructor(container) {
        this.container = container;
        this.files = new Map();
        this.selectedFile = null;
        this.contextMenu = null;
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.className = 'file-tree';
        
        // Create default project structure
        this.addFile('/', 'root', 'directory', null, true);
        this.addFile('/examples', 'examples', 'directory', '/');
        this.addFile('/examples/factorial.ac', 'factorial.ac', 'file', '/examples');
        this.addFile('/examples/fibonacci.ac', 'fibonacci.ac', 'file', '/examples');
        this.addFile('/src', 'src', 'directory', '/');
        this.addFile('/src/main.ac', 'main.ac', 'file', '/src');
        this.addFile('/README.md', 'README.md', 'file', '/');
        
        this.render();
        this.setupContextMenu();
    }

    addFile(path, name, type, parent, expanded = false) {
        this.files.set(path, {
            path,
            name,
            type,
            parent,
            expanded,
            children: []
        });
        
        if (parent && this.files.has(parent)) {
            this.files.get(parent).children.push(path);
        }
    }

    render() {
        this.container.innerHTML = '';
        this.renderNode('/', 0);
    }

    renderNode(path, depth) {
        const file = this.files.get(path);
        if (!file) return;

        const isRoot = path === '/';
        if (!isRoot) {
            const el = document.createElement('div');
            el.className = `file-tree-item ${file.type === 'directory' ? 'is-directory' : 'is-file'} ${this.selectedFile === path ? 'is-selected' : ''}`;
            el.style.paddingLeft = `${depth * 16 + 8}px`;
            el.dataset.path = path;
            el.draggable = true;

            const icon = file.type === 'directory' 
                ? (file.expanded ? '📂' : '📁')
                : this.getFileIcon(file.name);

            el.innerHTML = `
                <span class="file-tree-icon">${icon}</span>
                <span class="file-tree-label">${file.name}</span>
            `;

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (file.type === 'directory') {
                    file.expanded = !file.expanded;
                    this.render();
                } else {
                    this.selectFile(path);
                }
            });

            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, path);
            });

            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', path);
                el.classList.add('is-dragging');
            });

            el.addEventListener('dragend', () => {
                el.classList.remove('is-dragging');
            });

            el.addEventListener('dragover', (e) => {
                if (file.type === 'directory') {
                    e.preventDefault();
                    el.classList.add('is-drag-over');
                }
            });

            el.addEventListener('dragleave', () => {
                el.classList.remove('is-drag-over');
            });

            el.addEventListener('drop', (e) => {
                e.preventDefault();
                el.classList.remove('is-drag-over');
                const draggedPath = e.dataTransfer.getData('text/plain');
                this.moveFile(draggedPath, path);
            });

            this.container.appendChild(el);
        }

        if (file.type === 'directory' && (file.expanded || isRoot)) {
            file.children.forEach(childPath => {
                this.renderNode(childPath, depth + 1);
            });
        }
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'ac': '📝',
            'md': '📄',
            'js': '📜',
            'json': '⚙️',
            'rs': '🦀',
            'lean': '🔷',
            'toml': '⚙️'
        };
        return icons[ext] || '📄';
    }

    selectFile(path) {
        this.selectedFile = path;
        this.render();
        this.emit('file:select', path);
    }

    setupContextMenu() {
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.style.display = 'none';
        document.body.appendChild(this.contextMenu);

        document.addEventListener('click', () => {
            this.contextMenu.style.display = 'none';
        });
    }

    showContextMenu(e, path) {
        const file = this.files.get(path);
        const items = file.type === 'directory' 
            ? [
                { icon: '📄', label: 'New File', action: () => this.newFile(path) },
                { icon: '📁', label: 'New Folder', action: () => this.newFolder(path) },
                { separator: true },
                { icon: '✏️', label: 'Rename', action: () => this.rename(path) },
                { icon: '🗑️', label: 'Delete', action: () => this.delete(path) }
            ]
            : [
                { icon: '📂', label: 'Open', action: () => this.selectFile(path) },
                { icon: '📋', label: 'Copy Path', action: () => this.copyPath(path) },
                { separator: true },
                { icon: '✏️', label: 'Rename', action: () => this.rename(path) },
                { icon: '🗑️', label: 'Delete', action: () => this.delete(path) }
            ];

        this.contextMenu.innerHTML = items.map(item => {
            if (item.separator) {
                return '<div class="context-menu-separator"></div>';
            }
            return `
                <div class="context-menu-item">
                    <span class="context-menu-icon">${item.icon}</span>
                    <span class="context-menu-label">${item.label}</span>
                </div>
            `;
        }).join('');

        this.contextMenu.querySelectorAll('.context-menu-item').forEach((el, i) => {
            const item = items.filter(it => !it.separator)[i];
            el.addEventListener('click', () => {
                item.action();
                this.contextMenu.style.display = 'none';
            });
        });

        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = `${e.clientX}px`;
        this.contextMenu.style.top = `${e.clientY}px`;
    }

    newFile(parentPath) {
        const name = prompt('File name:');
        if (name) {
            const path = `${parentPath}/${name}`;
            this.addFile(path, name, 'file', parentPath);
            this.render();
            this.emit('file:create', path);
        }
    }

    newFolder(parentPath) {
        const name = prompt('Folder name:');
        if (name) {
            const path = `${parentPath}/${name}`;
            this.addFile(path, name, 'directory', parentPath);
            this.render();
        }
    }

    rename(path) {
        const file = this.files.get(path);
        const newName = prompt('New name:', file.name);
        if (newName && newName !== file.name) {
            file.name = newName;
            this.render();
            this.emit('file:rename', path, newName);
        }
    }

    delete(path) {
        if (confirm(`Delete ${this.files.get(path).name}?`)) {
            this.files.delete(path);
            this.render();
            this.emit('file:delete', path);
        }
    }

    copyPath(path) {
        navigator.clipboard.writeText(path);
        this.emit('notification', 'Path copied to clipboard');
    }

    moveFile(fromPath, toPath) {
        const file = this.files.get(fromPath);
        const target = this.files.get(toPath);
        
        if (target.type === 'directory') {
            const oldParent = this.files.get(file.parent);
            oldParent.children = oldParent.children.filter(p => p !== fromPath);
            
            file.parent = toPath;
            target.children.push(fromPath);
            
            this.render();
            this.emit('file:move', fromPath, toPath);
        }
    }

    emit(event, ...args) {
        const customEvent = new CustomEvent(`filetree:${event}`, { detail: args });
        document.dispatchEvent(customEvent);
    }

    on(event, handler) {
        document.addEventListener(`filetree:${event}`, (e) => handler(...e.detail));
    }
}

// Made with Bob
