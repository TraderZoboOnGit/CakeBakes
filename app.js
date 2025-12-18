// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPwXYmXk8J9urZllw2OWgiKKYiNKo1_UM",
  authDomain: "momsproject-111f4.firebaseapp.com",
  projectId: "momsproject-111f4",
  storageBucket: "momsproject-111f4.firebasestorage.app",
  messagingSenderId: "664243766426",
  appId: "1:664243766426:web:98edfd88c15f8945dacb23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// App Configuration
const ADMIN_PASSWORD = "momscake123"; // Change this to your desired password
let currentUser = null;
let allBakes = [];

// DOM Elements
const adminBar = document.getElementById('adminBar');
const loginModal = document.getElementById('loginModal');
const adminPasswordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const addBakeForm = document.getElementById('addBakeForm');
const addNewBakeBtn = document.getElementById('addNewBakeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const logoutBtn = document.getElementById('logoutBtn');
const gallery = document.getElementById('gallery');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Check if already logged in (from previous session)
    const savedLogin = localStorage.getItem('bakeryAdminLoggedIn');
    if (savedLogin === 'true') {
        showAdminBar();
    } else {
        // Show login modal after 1 second
        setTimeout(() => {
            loginModal.classList.add('active');
        }, 1000);
    }
    
    // Load bakes from Firebase
    loadBakes();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Login
    loginBtn.addEventListener('click', handleLogin);
    adminPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Admin buttons
    addNewBakeBtn.addEventListener('click', () => {
        addBakeForm.classList.add('active');
        window.scrollTo({ top: addBakeForm.offsetTop - 100, behavior: 'smooth' });
    });
    
    logoutBtn.addEventListener('click', handleLogout);
    
    // Form
    addBakeForm.addEventListener('submit', handleAddBake);
    cancelBtn.addEventListener('click', () => {
        addBakeForm.classList.remove('active');
        addBakeForm.reset();
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterBakes(btn.dataset.filter);
        });
    });
}

// Handle login
function handleLogin() {
    const password = adminPasswordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        loginError.style.display = 'none';
        loginModal.classList.remove('active');
        showAdminBar();
        localStorage.setItem('bakeryAdminLoggedIn', 'true');
        adminPasswordInput.value = '';
    } else {
        loginError.style.display = 'block';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('bakeryAdminLoggedIn');
    hideAdminBar();
    addBakeForm.classList.remove('active');
    
    // Hide all delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Show login modal again
    setTimeout(() => {
        loginModal.classList.add('active');
    }, 500);
}

// Show admin interface
function showAdminBar() {
    adminBar.classList.remove('hidden');
    
    // Show delete buttons on existing bakes
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.style.display = 'block';
    });
}

// Hide admin interface
function hideAdminBar() {
    adminBar.classList.add('hidden');
}

// Load bakes from Firebase
function loadBakes() {
    const bakesRef = database.ref('bakes');
    
    bakesRef.on('value', (snapshot) => {
        allBakes = [];
        gallery.innerHTML = '';
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Convert object to array
            Object.keys(data).forEach(key => {
                allBakes.push({
                    id: key,
                    ...data[key]
                });
            });
            
            // Sort by newest first (assuming timestamp)
            allBakes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            // Display all bakes
            displayBakes(allBakes);
        } else {
            // No bakes yet
            gallery.innerHTML = `
                <div style="text-align: center; grid-column: 1 / -1; padding: 4rem;">
                    <h3 style="color: #a0522d; margin-bottom: 1rem;">No bakes yet!</h3>
                    <p style="color: #666;">Add your first bake using the "Add New Bake" button above.</p>
                </div>
            `;
        }
    });
}

// Display bakes in gallery
function displayBakes(bakes) {
    gallery.innerHTML = '';
    
    if (bakes.length === 0) {
        gallery.innerHTML = `
            <div style="text-align: center; grid-column: 1 / -1; padding: 4rem;">
                <p style="color: #666;">No bakes found in this category.</p>
            </div>
        `;
        return;
    }
    
    bakes.forEach(bake => {
        const bakeCard = document.createElement('div');
        bakeCard.className = 'bake-card';
        bakeCard.dataset.type = bake.type;
        
        const isAdmin = localStorage.getItem('bakeryAdminLoggedIn') === 'true';
        
        bakeCard.innerHTML = `
            <img src="${bake.imageUrl}" alt="${bake.name}" class="bake-image" 
                 onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'">
            <div class="bake-info">
                <span class="bake-type">${bake.type}</span>
                <h3 class="bake-title">${bake.name}</h3>
                <p class="bake-flavor">${bake.flavor}</p>
                <p class="bake-ingredients">${bake.ingredients}</p>
                <button class="delete-btn" onclick="deleteBake('${bake.id}')" 
                        style="display: ${isAdmin ? 'block' : 'none'}">
                    🗑️ Delete
                </button>
            </div>
        `;
        
        gallery.appendChild(bakeCard);
    });
}

// Filter bakes by type
function filterBakes(filterType) {
    if (filterType === 'all') {
        displayBakes(allBakes);
    } else {
        const filtered = allBakes.filter(bake => bake.type === filterType);
        displayBakes(filtered);
    }
}

// Handle adding a new bake
function handleAddBake(e) {
    e.preventDefault();
    
    const bakeData = {
        name: document.getElementById('bakeName').value.trim(),
        type: document.getElementById('bakeType').value,
        flavor: document.getElementById('flavor').value.trim(),
        imageUrl: document.getElementById('imageUrl').value.trim(),
        ingredients: document.getElementById('ingredients').value.trim(),
        timestamp: Date.now()
    };
    
    // Validate image URL
    if (!bakeData.imageUrl.startsWith('http')) {
        alert('Please enter a valid image URL (should start with http:// or https://)');
        return;
    }
    
    // Add to Firebase
    const newBakeRef = database.ref('bakes').push();
    newBakeRef.set(bakeData)
        .then(() => {
            alert('Bake added successfully!');
            addBakeForm.reset();
            addBakeForm.classList.remove('active');
            
            // Auto-scroll to the new bake
            setTimeout(() => {
                window.scrollTo({ top: gallery.offsetTop - 100, behavior: 'smooth' });
            }, 300);
        })
        .catch((error) => {
            alert('Error adding bake: ' + error.message);
        });
}

// Delete a bake
function deleteBake(bakeId) {
    if (confirm('Are you sure you want to delete this bake?')) {
        database.ref(`bakes/${bakeId}`).remove()
            .then(() => {
                console.log('Bake deleted successfully');
            })
            .catch((error) => {
                alert('Error deleting bake: ' + error.message);
            });
    }
}

// Make deleteBake available globally for inline onclick
window.deleteBake = deleteBake;