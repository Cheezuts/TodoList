// Variables globales
let tabs = [];
let currentTabId = null;
let editingTabId = null;
let editingColumnId = null;
let editingTodoId = null;
let draggedTodo = null;
let draggedTab = null;
let draggedColumn = null;
let draggedColumnIndex = null;
let dropIndicator = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    if (tabs.length === 0) {
        // Créer un onglet par défaut si aucun n'existe
        createDefaultTab();
    }
    renderTabs();
    if (tabs.length > 0) {
        switchTab(tabs[0].id);
    }
});

function createDefaultTab() {
    const defaultTab = {
        id: generateId(),
        name: 'Mon Premier Onglet',
        backgroundColor: '#ffffff',
        columns: []
    };
    tabs.push(defaultTab);
    saveData();
}

function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Gestion des onglets
function openTabModal(tabId = null) {
    editingTabId = tabId;
    const modal = document.getElementById('tabModal');
    const title = document.getElementById('tabModalTitle');
    const nameInput = document.getElementById('tabName');
    const colorInput = document.getElementById('tabColor');

    if (tabId) {
        const tab = tabs.find(t => t.id === tabId);
        title.textContent = 'Éditer l\'Onglet';
        nameInput.value = tab.name;
        colorInput.value = tab.backgroundColor || '#ffffff';
    } else {
        title.textContent = 'Créer un Onglet';
        nameInput.value = '';
        colorInput.value = '#ffffff';
    }

    modal.style.display = 'block';
    nameInput.focus();
}

function closeTabModal() {
    document.getElementById('tabModal').style.display = 'none';
    editingTabId = null;
}

function saveTab() {
    const name = document.getElementById('tabName').value.trim();
    const backgroundColor = document.getElementById('tabColor').value;
    
    if (!name) {
        alert('Veuillez entrer un nom pour l\'onglet');
        return;
    }

    if (editingTabId) {
        // Édition
        const tab = tabs.find(t => t.id === editingTabId);
        tab.name = name;
        tab.backgroundColor = backgroundColor;
    } else {
        // Création
        const newTab = {
            id: generateId(),
            name: name,
            backgroundColor: backgroundColor,
            columns: []
        };
        tabs.push(newTab);
        currentTabId = newTab.id;
    }

    saveData();
    renderTabs();
    if (currentTabId) {
        switchTab(currentTabId);
    }
    closeTabModal();
}

function deleteTab(tabId) {
    if (tabs.length <= 1) {
        alert('Vous devez avoir au moins un onglet');
        return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet onglet ?')) {
        tabs = tabs.filter(t => t.id !== tabId);
        if (currentTabId === tabId) {
            currentTabId = tabs[0].id;
        }
        saveData();
        renderTabs();
        switchTab(currentTabId);
    }
}

function switchTab(tabId) {
    currentTabId = tabId;
    renderTabs();
    renderColumns();
}

function renderTabs() {
    const container = document.getElementById('tabsContainer');
    const addButton = container.querySelector('.add-tab-btn');
    
    // Supprimer tous les onglets existants
    container.querySelectorAll('.tab').forEach(tab => tab.remove());

    tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${tab.id === currentTabId ? 'active' : ''}`;
        tabElement.style.backgroundColor = tab.backgroundColor || '#ffffff';
        tabElement.draggable = true;
        tabElement.innerHTML = `
            <span class="tab-name" onclick="switchTab('${tab.id}')">${tab.name}</span>
            <span onclick="openTabModal('${tab.id}')" title="Éditer l'onglet" style="cursor: pointer; opacity: 0.7;">✏️</span>
            <span class="tab-close" onclick="event.stopPropagation(); deleteTab('${tab.id}')" title="Supprimer l'onglet">×</span>
        `;
        
        // Événements de drag pour les onglets
        tabElement.addEventListener('dragstart', (e) => dragTabStart(e, tab.id));
        tabElement.addEventListener('dragend', dragTabEnd);
        tabElement.addEventListener('dragover', allowTabDrop);
        tabElement.addEventListener('drop', (e) => dropTab(e, tab.id));
        
        container.insertBefore(tabElement, addButton);
    });
}

// Fonctions de drag and drop pour les onglets
function dragTabStart(event, tabId) {
    draggedTab = tabId;
    event.target.classList.add('dragging');
}

function dragTabEnd(event) {
    event.target.classList.remove('dragging');
    draggedTab = null;
}

function allowTabDrop(event) {
    event.preventDefault();
}

function dropTab(event, targetTabId) {
    event.preventDefault();
    
    if (!draggedTab || draggedTab === targetTabId) return;

    const draggedIndex = tabs.findIndex(t => t.id === draggedTab);
    const targetIndex = tabs.findIndex(t => t.id === targetTabId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        // Réorganiser les onglets
        const draggedTabObj = tabs.splice(draggedIndex, 1)[0];
        tabs.splice(targetIndex, 0, draggedTabObj);
        
        saveData();
        renderTabs();
    }
}
// Gestion des colonnes
function openColumnModal(columnId = null) {
    editingColumnId = columnId;
    const modal = document.getElementById('columnModal');
    const title = document.getElementById('columnModalTitle');
    const nameInput = document.getElementById('columnName');
    const colorInput = document.getElementById('columnColor');

    if (columnId) {
        const currentTab = tabs.find(t => t.id === currentTabId);
        const column = currentTab.columns.find(c => c.id === columnId);
        title.textContent = 'Éditer la Colonne';
        nameInput.value = column.name;
        colorInput.value = column.color;
    } else {
        title.textContent = 'Créer une Colonne';
        nameInput.value = '';
        colorInput.value = '#f8f9fa';
    }

    modal.style.display = 'block';
    nameInput.focus();
}

function closeColumnModal() {
    document.getElementById('columnModal').style.display = 'none';
    editingColumnId = null;
}

function saveColumn() {
    const name = document.getElementById('columnName').value.trim();
    const color = document.getElementById('columnColor').value;

    if (!name) {
        alert('Veuillez entrer un nom pour la colonne');
        return;
    }

    const currentTab = tabs.find(t => t.id === currentTabId);

    if (editingColumnId) {
        // Édition
        const column = currentTab.columns.find(c => c.id === editingColumnId);
        column.name = name;
        column.color = color;
    } else {
        // Création
        const newColumn = {
            id: generateId(),
            name: name,
            color: color,
            locked: false,
            todos: []
        };
        currentTab.columns.push(newColumn);
    }

    saveData();
    renderColumns();
    closeColumnModal();
}

function deleteColumn(columnId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette colonne ?')) {
        const currentTab = tabs.find(t => t.id === currentTabId);
        currentTab.columns = currentTab.columns.filter(c => c.id !== columnId);
        saveData();
        renderColumns();
    }
}

function lockColumn(columnId) {
    const currentTab = tabs.find(t => t.id === currentTabId);
    const column = currentTab.columns.find(c => c.id === columnId);
    column.locked = !column.locked;
    saveData();
    renderColumns();
}

function resetColumn(columnId) {
    if (confirm('Êtes-vous sûr de vouloir vider cette colonne ?')) {
        const currentTab = tabs.find(t => t.id === currentTabId);
        const column = currentTab.columns.find(c => c.id === columnId);
        column.todos = [];
        saveData();
        renderColumns();
    }
}

function renderColumns() {
    const tabContent = document.getElementById('tabContent');
    const currentTab = tabs.find(t => t.id === currentTabId);

    if (!currentTab) {
        tabContent.innerHTML = '<div class="empty-state"><h3>Aucun onglet sélectionné</h3></div>';
        return;
    }

    // Appliquer la couleur de fond de l'onglet
    tabContent.style.backgroundColor = currentTab.backgroundColor || '#ffffff';

    if (currentTab.columns.length === 0) {
        tabContent.innerHTML = `
            <div class="empty-state">
                <h3>Aucune colonne dans cet onglet</h3>
                <p>Créez votre première colonne pour organiser vos tâches.</p>
                <button class="add-column-btn" onclick="openColumnModal()">+ Ajouter une Colonne</button>
            </div>
        `;
        return;
    }

    const columnsHtml = currentTab.columns.map((column, index) => `
        <div class="column" 
             style="background-color: ${column.color}" 
             draggable="true"
             data-column-id="${column.id}"
             data-column-index="${index}"
             ondrop="drop(event, '${column.id}')" 
             ondragover="allowDrop(event)"
             ondragstart="dragColumnStart(event, '${column.id}', ${index})"
             ondragend="dragColumnEnd(event)"
             ondragenter="dragColumnEnter(event, ${index})"
             ondragleave="dragColumnLeave(event)">
            <div class="column-header" style="background-color: ${column.color}">
                <div class="column-title">${column.name}</div>
                <div class="column-actions">
                    ${column.locked ? '<span title="Colonne verrouillée">🔒</span>' : ''}
                    <button class="column-btn" onclick="openColumnModal('${column.id}')" title="Éditer">✏️</button>
                    <button class="column-btn" onclick="lockColumn('${column.id}')" title="${column.locked ? 'Déverrouiller' : 'Verrouiller'}">${column.locked ? '🔓' : '🔒'}</button>
                    <button class="column-btn" onclick="resetColumn('${column.id}')" title="Vider la colonne">🗑️</button>
                    <button class="column-btn" onclick="event.stopPropagation(); deleteColumn('${column.id}')" title="Supprimer">❌</button>
                </div>
            </div>
            <div class="todos-container" id="todos-${column.id}">
                ${renderTodos(column.todos, column.id)}
            </div>
            <button class="add-todo-btn" onclick="openTodoModal('${column.id}')" ${column.locked ? 'disabled' : ''}>+ Ajouter un Todo</button>
        </div>
    `).join('');

    tabContent.innerHTML = `
        <div class="columns-container">
            ${columnsHtml}
        </div>
        <button class="add-column-btn" onclick="openColumnModal()">+ Ajouter une Colonne</button>
    `;
}

// Gestion des todos
function openTodoModal(columnId, todoId = null) {
    editingTodoId = todoId;
    const modal = document.getElementById('todoModal');
    const title = document.getElementById('todoModalTitle');
    const textInput = document.getElementById('todoText');
    const colorInput = document.getElementById('todoColor');

    if (todoId) {
        const currentTab = tabs.find(t => t.id === currentTabId);
        const column = currentTab.columns.find(c => c.id === columnId);
        const todo = column.todos.find(t => t.id === todoId);
        title.textContent = 'Éditer le Todo';
        textInput.value = todo.text;
        colorInput.value = todo.color || '#ffffff';
    } else {
        title.textContent = 'Créer un Todo';
        textInput.value = '';
        colorInput.value = '#ffffff';
    }

    modal.style.display = 'block';
    modal.setAttribute('data-column-id', columnId);
    textInput.focus();
}

function closeTodoModal() {
    document.getElementById('todoModal').style.display = 'none';
    editingTodoId = null;
}

function saveTodo() {
    const text = document.getElementById('todoText').value.trim();
    const color = document.getElementById('todoColor').value;

    if (!text) {
        alert('Veuillez entrer un texte pour le todo');
        return;
    }

    const currentTab = tabs.find(t => t.id === currentTabId);

    if (editingTodoId) {
        // Édition
        let todoFound = false;
        currentTab.columns.forEach(column => {
            const todo = column.todos.find(t => t.id === editingTodoId);
            if (todo) {
                todo.text = text;
                todo.color = color;
                todoFound = true;
            }
        });
    } else {
        // Création - trouver la colonne cible
        const targetColumnId = document.getElementById('todoModal').getAttribute('data-column-id');
        const column = currentTab.columns.find(c => c.id === targetColumnId);
        if (column && !column.locked) {
            const newTodo = {
                id: generateId(),
                text: text,
                color: color,
                completed: false,
                locked: false
            };
            column.todos.push(newTodo);
        }
    }

    saveData();
    renderColumns();
    closeTodoModal();
}

function deleteTodo(todoId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce todo ?')) {
        const currentTab = tabs.find(t => t.id === currentTabId);
        currentTab.columns.forEach(column => {
            column.todos = column.todos.filter(t => t.id !== todoId);
        });
        saveData();
        renderColumns();
    }
}

function toggleTodoComplete(todoId) {
    const currentTab = tabs.find(t => t.id === currentTabId);
    currentTab.columns.forEach(column => {
        const todo = column.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
        }
    });
    saveData();
    renderColumns();
}

function lockTodo(todoId) {
    const currentTab = tabs.find(t => t.id === currentTabId);
    currentTab.columns.forEach(column => {
        const todo = column.todos.find(t => t.id === todoId);
        if (todo) {
            todo.locked = !todo.locked;
        }
    });
    saveData();
    renderColumns();
}

function cloneTodo(todoId) {
    const currentTab = tabs.find(t => t.id === currentTabId);
    currentTab.columns.forEach(column => {
        const todo = column.todos.find(t => t.id === todoId);
        if (todo) {
            const clonedTodo = {
                id: generateId(),
                text: todo.text + ' (copie)',
                color: todo.color,
                completed: false,
                locked: false
            };
            column.todos.push(clonedTodo);
        }
    });
    saveData();
    renderColumns();
}

function renderTodos(todos, columnId) {
    if (todos.length === 0) {
        return '<div class="empty-state">Aucun todo dans cette colonne</div>';
    }

    return todos.map((todo, index) => `
        <div class="drop-indicator" data-index="${index}"></div>
        <div class="todo-item ${todo.completed ? 'completed' : ''} ${todo.locked ? 'locked' : ''}" 
             draggable="${!todo.locked}" 
             ondragstart="dragStart(event, '${todo.id}', '${columnId}', ${index})"
             ondragend="dragEnd(event)"
             ondragover="allowTodoDrop(event, ${index})"
             data-todo-id="${todo.id}"
             data-index="${index}"
             style="background-color: ${todo.color || '#ffffff'}">
            <div class="todo-header">
                <div class="todo-content">${todo.text}</div>
                <div class="todo-actions">
                    ${todo.locked ? '<span title="Todo verrouillé">🔒</span>' : ''}
                    <button class="todo-btn" onclick="toggleTodoComplete('${todo.id}')" title="${todo.completed ? 'Marquer comme à faire' : 'Marquer comme fait'}">${todo.completed ? '↩️' : '✅'}</button>
                    <button class="todo-btn" onclick="openTodoModal('${columnId}', '${todo.id}')" title="Éditer">✏️</button>
                    <button class="todo-btn" onclick="lockTodo('${todo.id}')" title="${todo.locked ? 'Déverrouiller' : 'Verrouiller'}">${todo.locked ? '🔓' : '🔒'}</button>
                    <button class="todo-btn" onclick="cloneTodo('${todo.id}')" title="Cloner">📋</button>
                    <button class="todo-btn" onclick="event.stopPropagation(); deleteTodo('${todo.id}')" title="Supprimer">🗑️</button>
                </div>
            </div>
        </div>
    `).join('') + '<div class="drop-indicator" data-index="' + todos.length + '"></div>';
}

// Gestion du drag and drop
function dragStart(event, todoId) {
    draggedTodo = todoId;
    event.target.classList.add('dragging');
}

function dragEnd(event) {
    event.target.classList.remove('dragging');
    draggedTodo = null;
    // Cacher tous les indicateurs de drop
    document.querySelectorAll('.drop-indicator').forEach(indicator => {
        indicator.classList.remove('active');
    });
}

function allowDrop(event) {
    event.preventDefault();
    const column = event.currentTarget;
    if (!column.classList.contains('drag-over')) {
        column.classList.add('drag-over');
    }
}

function allowTodoDrop(event, index) {
    event.preventDefault();
    event.stopPropagation();
    
    // Cacher tous les autres indicateurs
    document.querySelectorAll('.drop-indicator').forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Montrer l'indicateur pour cette position
    const todoContainer = event.currentTarget.parentElement;
    const indicators = todoContainer.querySelectorAll('.drop-indicator');
    
    // Calculer la position relative de la souris dans l'élément
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    const halfHeight = rect.height / 2;
    
    // Déterminer si on insère avant ou après cet élément
    if (mouseY < halfHeight) {
        // Insérer avant - utiliser l'indicateur à cet index
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
    } else {
        // Insérer après - utiliser l'indicateur à index + 1
        if (indicators[index + 1]) {
            indicators[index + 1].classList.add('active');
        }
    }
}

function drop(event, targetColumnId) {
    event.preventDefault();
    const column = event.currentTarget;
    column.classList.remove('drag-over');

    if (!draggedTodo) return;

    const currentTab = tabs.find(t => t.id === currentTabId);
    const targetColumn = currentTab.columns.find(c => c.id === targetColumnId);
    
    if (targetColumn.locked) {
        alert('Cette colonne est verrouillée');
        return;
    }

    // Trouver l'indicateur actif pour déterminer la position d'insertion
    const activeIndicator = document.querySelector('.drop-indicator.active');
    let insertIndex = targetColumn.todos.length; // Par défaut, insérer à la fin

    if (activeIndicator) {
        insertIndex = parseInt(activeIndicator.dataset.index);
    }

    // Trouver et supprimer le todo de sa colonne actuelle
    let todoToMove = null;
    let sourceColumnId = null;
    let originalIndex = -1;

    currentTab.columns.forEach(column => {
        const todoIndex = column.todos.findIndex(t => t.id === draggedTodo);
        if (todoIndex !== -1) {
            todoToMove = column.todos[todoIndex];
            sourceColumnId = column.id;
            originalIndex = todoIndex;
            if (!todoToMove.locked) {
                column.todos.splice(todoIndex, 1);
            }
        }
    });

    // Ajouter le todo à la nouvelle position si pas verrouillé
    if (todoToMove && !todoToMove.locked) {
        // Si on déplace dans la même colonne et que l'index d'insertion est après la position originale,
        // il faut ajuster l'index car on a supprimé un élément avant
        if (sourceColumnId === targetColumnId && insertIndex > originalIndex) {
            insertIndex--;
        }
        
        // Insérer à la position désirée
        targetColumn.todos.splice(insertIndex, 0, todoToMove);
        saveData();
        renderColumns();
    } else if (todoToMove && todoToMove.locked) {
        alert('Ce todo est verrouillé et ne peut pas être déplacé');
    }

    // Cacher tous les indicateurs
    document.querySelectorAll('.drop-indicator').forEach(indicator => {
        indicator.classList.remove('active');
    });
}

// Gestion du drag and drop pour les colonnes
function dragColumnStart(event, columnId, columnIndex) {
    draggedColumn = columnId;
    draggedColumnIndex = columnIndex;
    event.target.classList.add('dragging');
    
    // Empêcher le drag & drop des todos pendant le drag d'une colonne
    event.target.querySelectorAll('.todo-item').forEach(todo => {
        todo.draggable = false;
    });
}

function dragColumnEnd(event) {
    event.target.classList.remove('dragging');
    
    // Réactiver le drag & drop des todos
    event.target.querySelectorAll('.todo-item').forEach(todo => {
        todo.draggable = !todo.dataset.locked;
    });
    
    // Nettoyer les classes de drag-over
    document.querySelectorAll('.column').forEach(column => {
        column.classList.remove('drag-over');
    });
    
    draggedColumn = null;
    draggedColumnIndex = null;
}

function dragColumnEnter(event, targetIndex) {
    event.preventDefault();
    
    if (!draggedColumn || draggedColumnIndex === targetIndex) return;
    
    event.currentTarget.classList.add('drag-over');
}

function dragColumnLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

// Override de la fonction allowDrop pour gérer les colonnes
const originalAllowDrop = allowDrop;
allowDrop = function(event) {
    event.preventDefault();
    
    // Si on drag une colonne, gérer le réarrangement des colonnes
    if (draggedColumn) {
        const targetColumn = event.currentTarget;
        const targetIndex = parseInt(targetColumn.dataset.columnIndex);
        
        if (draggedColumnIndex !== targetIndex) {
            const currentTab = tabs.find(t => t.id === currentTabId);
            
            // Réorganiser les colonnes
            const draggedColumnObj = currentTab.columns.splice(draggedColumnIndex, 1)[0];
            currentTab.columns.splice(targetIndex, 0, draggedColumnObj);
            
            // Mettre à jour l'index de la colonne draggée
            draggedColumnIndex = targetIndex;
            
            saveData();
            renderColumns();
        }
    } else {
        // Comportement original pour les todos
        originalAllowDrop(event);
    }
};

// Gestion des couleurs prédéfinies
function selectPresetColor(color, type) {
    if (type === 'column') {
        document.getElementById('columnColor').value = color;
    } else if (type === 'todo') {
        document.getElementById('todoColor').value = color;
    } else if (type === 'tab') {
        document.getElementById('tabColor').value = color;
    }
    
    // Mettre à jour la sélection visuelle
    const container = event.target.parentElement;
    container.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

// Sauvegarde et chargement des données
function saveData() {
    const data = {
        tabs: tabs,
        currentTabId: currentTabId
    };
    // Simulation de sauvegarde en localStorage (remplacé par stockage en mémoire)
    window.appData = data;
}

function loadData() {
    // Simulation de chargement depuis localStorage (remplacé par stockage en mémoire)
    if (window.appData) {
        tabs = window.appData.tabs || [];
        currentTabId = window.appData.currentTabId;
    }
}

// Gestion des événements de drag over pour les colonnes
document.addEventListener('dragover', function(event) {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        if (!column.contains(event.target)) {
            column.classList.remove('drag-over');
        }
    });
});

// Modifier openTodoModal pour stocker l'ID de la colonne
const originalOpenTodoModal = openTodoModal;
openTodoModal = function(columnId, todoId = null) {
    const modal = document.getElementById('todoModal');
    modal.setAttribute('data-column-id', columnId);
    originalOpenTodoModal(columnId, todoId);
};

// Gestion des événements clavier
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTabModal();
        closeColumnModal();
        closeTodoModal();
    }
});

// Gestion du clic en dehors des modales
window.addEventListener('click', function(event) {
    const modals = ['tabModal', 'columnModal', 'todoModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Gestion responsive pour mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Améliorations pour les interactions tactiles
if ('ontouchstart' in window) {
    // Empêcher le zoom double-tap sur les boutons
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Améliorer le feedback tactile sur tous les éléments interactifs
    const interactiveElements = '.tab, .column-btn, .todo-btn, .add-tab-btn, .add-column-btn, .add-todo-btn, .btn-primary, .btn-secondary, .color-option, .close';
    
    document.addEventListener('touchstart', function(e) {
        if (e.target.matches(interactiveElements)) {
            e.target.style.transition = 'transform 0.1s ease';
        }
    }, {passive: true});
    
    document.addEventListener('touchend', function(e) {
        if (e.target.matches(interactiveElements)) {
            setTimeout(() => {
                e.target.style.transition = '';
            }, 150);
        }
    }, {passive: true});
}

// Gestion du scroll horizontal pour les onglets sur mobile
let isScrolling = false;
const tabsContainer = document.getElementById('tabsContainer');

if (tabsContainer) {
    tabsContainer.addEventListener('scroll', function() {
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 150);
    }, {passive: true});
}

// Améliorer l'ouverture des modals sur mobile
const originalOpenModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Empêcher le scroll du body sur mobile quand le modal est ouvert
        if (isMobile()) {
            document.body.style.overflow = 'hidden';
        }
        
        // Focus automatique sur le premier input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea');
            if (firstInput && !isMobile()) { // Pas de focus auto sur mobile pour éviter le zoom
                firstInput.focus();
            }
        }, 100);
    }
};

const originalCloseModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Restaurer le scroll du body
        document.body.style.overflow = '';
    }
};

// Override des fonctions de modal existantes
const originalCloseTabModal = closeTabModal;
closeTabModal = function() {
    originalCloseTabModal();
    document.body.style.overflow = '';
};

const originalCloseColumnModal = closeColumnModal;
closeColumnModal = function() {
    originalCloseColumnModal();
    document.body.style.overflow = '';
};

const originalCloseTodoModal = closeTodoModal;
closeTodoModal = function() {
    originalCloseTodoModal();
    document.body.style.overflow = '';
};

// Gestion améliorée du drag and drop sur mobile
let touchStartY = 0;
let touchStartX = 0;
let isDragging = false;

document.addEventListener('touchstart', function(e) {
    // Gestion du touch pour les todos
    if (e.target.closest('.todo-item[draggable="true"]') && !e.target.closest('.todo-btn')) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isDragging = false;
    }
    // Gestion du touch pour les colonnes
    else if (e.target.closest('.column[draggable="true"]') && !e.target.closest('.column-btn, .todo-item, .add-todo-btn')) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isDragging = false;
    }
}, {passive: true});

document.addEventListener('touchmove', function(e) {
    if (touchStartY && Math.abs(e.touches[0].clientY - touchStartY) > 10) {
        isDragging = true;
    }
}, {passive: true});

document.addEventListener('touchend', function(e) {
    touchStartY = 0;
    touchStartX = 0;
    isDragging = false;
}, {passive: true});

// Ajuster la taille des éléments selon l'orientation
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        renderTabs();
        renderColumns();
    }, 300);
});