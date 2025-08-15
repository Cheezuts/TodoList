// Système d'authentification pour Todo List
const Auth = {
    KEYS: {
        USERS: 'todoListUsers',
        CURRENT_USER: 'todoListCurrentUser'
    },

    // Hachage simple du mot de passe (pour demo - en production utiliser une vraie lib de hash)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    },

    // Validation de l'email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validation du mot de passe
    validatePassword(password) {
        return password.length >= 6;
    },

    // Récupérer tous les utilisateurs
    getUsers() {
        try {
            const users = localStorage.getItem(this.KEYS.USERS);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            return [];
        }
    },

    // Sauvegarder les utilisateurs
    saveUsers(users) {
        try {
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
            return false;
        }
    },

    // Vérifier si un email existe déjà
    emailExists(email) {
        const users = this.getUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    },

    // Inscription d'un nouvel utilisateur
    register(name, email, password) {
        try {
            // Validations
            if (!name.trim()) {
                throw new Error('Le nom est requis');
            }
            if (!this.validateEmail(email)) {
                throw new Error('Format d\'email invalide');
            }
            if (!this.validatePassword(password)) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            }
            if (this.emailExists(email)) {
                throw new Error('Cet email est déjà utilisé');
            }

            const users = this.getUsers();
            const newUser = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: this.hashPassword(password),
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            
            if (this.saveUsers(users)) {
                return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
            } else {
                throw new Error('Erreur lors de la sauvegarde');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Connexion d'un utilisateur
    login(email, password) {
        try {
            if (!this.validateEmail(email)) {
                throw new Error('Format d\'email invalide');
            }
            if (!password) {
                throw new Error('Mot de passe requis');
            }

            const users = this.getUsers();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }

            if (user.password !== this.hashPassword(password)) {
                throw new Error('Email ou mot de passe incorrect');
            }

            // Créer la session
            const sessionUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                loginAt: new Date().toISOString()
            };

            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(sessionUser));
            return { success: true, user: sessionUser };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Déconnexion
    logout() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        return true;
    },

    // Récupérer l'utilisateur connecté
    getCurrentUser() {
        try {
            const currentUser = localStorage.getItem(this.KEYS.CURRENT_USER);
            return currentUser ? JSON.parse(currentUser) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return null;
        }
    },

    // Vérifier si un utilisateur est connecté
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }
};

// Gestion des formulaires
document.addEventListener('DOMContentLoaded', function() {
    // Formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = Auth.login(email, password);
            
            if (result.success) {
                alert('Connexion réussie ! Bienvenue ' + result.user.name);
                window.location.href = 'index.html';
            } else {
                alert('Erreur de connexion : ' + result.error);
            }
        });
    }

    // Formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Vérifier que les mots de passe correspondent
            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            
            const result = Auth.register(name, email, password);
            
            if (result.success) {
                alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                window.location.href = 'login.html';
            } else {
                alert('Erreur d\'inscription : ' + result.error);
            }
        });
    }

    // Redirection si déjà connecté (pour les pages de connexion/inscription)
    if ((window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) && Auth.isLoggedIn()) {
        window.location.href = 'index.html';
    }
});

// Fonction utilitaire pour vérifier l'authentification sur les pages protégées
function requireAuth() {
    if (!Auth.isLoggedIn()) {
        alert('Vous devez être connecté pour accéder à cette page');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Fonction pour déconnecter l'utilisateur
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        Auth.logout();
        alert('Vous avez été déconnecté');
        window.location.href = 'index.html';
    }
}