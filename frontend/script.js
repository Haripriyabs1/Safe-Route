/* ===========================
   SafeRoute — Main Script
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== NAVBAR =====
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('show');
    });

    // Close mobile menu on link click
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('show');
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    navLinkItems.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });

    // ===== STREET LIGHT TOGGLE =====
    const streetLightToggle = document.getElementById('street_light');
    const toggleLabelText = document.getElementById('toggleLabelText');

    streetLightToggle.addEventListener('change', () => {
        toggleLabelText.textContent = streetLightToggle.checked ? 'Yes' : 'No';
    });

    // ===== SAFETY CHECK FORM =====
    const safetyForm = document.getElementById('safetyForm');
    const resultContainer = document.getElementById('resultContainer');
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultDescription = document.getElementById('resultDescription');
    const checkBtn = document.getElementById('checkSafetyBtn');

    safetyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const crimeRate = document.getElementById('crime_rate').value;
        const populationDensity = document.getElementById('population_density').value;
        const streetLight = streetLightToggle.checked ? 1 : 0;

        // Show loading
        checkBtn.classList.add('loading');
        checkBtn.querySelector('svg').style.display = 'none';
        const originalText = 'Check Safety';
        checkBtn.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = ' Analyzing... ';
            }
        });

        try {
            // Use absolute URL to backend
            const API_URL = 'http://127.0.0.1:5000/predict';
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crime_rate: parseFloat(crimeRate),
                    population_density: parseFloat(populationDensity),
                    street_light: streetLight
                })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log('Prediction result:', data);
            displayResult(data.safety_label);
        } catch (error) {
            console.error('Fetch error:', error);
            displayResult('error');
        } finally {
            // Reset button
            checkBtn.classList.remove('loading');
            checkBtn.querySelector('svg').style.display = '';
            checkBtn.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = '\n                        ' + originalText + '\n                    ';
                }
            });
        }
    });

    function displayResult(label) {
        resultContainer.classList.add('show');
        resultCard.className = 'result-card';

        const normalizedLabel = label.toString().toLowerCase().trim();

        if (normalizedLabel.includes('safe') && !normalizedLabel.includes('unsafe')) {
            resultCard.classList.add('safe');
            resultIcon.textContent = '✅';
            resultTitle.textContent = 'Safe Route';
            resultDescription.textContent = 'This route appears to be safe based on the provided data. Stay aware of your surroundings.';
        } else if (normalizedLabel.includes('moderate')) {
            resultCard.classList.add('moderate');
            resultIcon.textContent = '⚠️';
            resultTitle.textContent = 'Moderate Risk';
            resultDescription.textContent = 'This route has moderate risk. Consider traveling with a companion or during daylight hours.';
        } else if (normalizedLabel.includes('unsafe') || normalizedLabel.includes('danger')) {
            resultCard.classList.add('unsafe');
            resultIcon.textContent = '🚨';
            resultTitle.textContent = 'Unsafe Route';
            resultDescription.textContent = 'This route is potentially unsafe. We recommend choosing an alternative route.';
        } else if (normalizedLabel === 'error') {
            resultCard.classList.add('unsafe');
            resultIcon.textContent = '❌';
            resultTitle.textContent = 'Connection Error';
            resultDescription.textContent = 'Could not reach the server. Please ensure the backend is running and try again.';
        } else {
            // Fallback: display the raw label
            resultCard.classList.add('moderate');
            resultIcon.textContent = 'ℹ️';
            resultTitle.textContent = `Result: ${label}`;
            resultDescription.textContent = 'Route analysis complete. Please review the result above.';
        }

        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ===== EMERGENCY CONTACT FORM =====
    const emergencyForm = document.getElementById('emergencyForm');
    const contactsList = document.getElementById('contactsList');
    const confirmation = document.getElementById('confirmation');
    let savedContacts = JSON.parse(localStorage.getItem('safeRouteContacts') || '[]');

    // Render existing contacts
    renderContacts();

    emergencyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();

        if (!name || !phone) return;

        const contact = { id: Date.now(), name, phone };
        savedContacts.push(contact);
        localStorage.setItem('safeRouteContacts', JSON.stringify(savedContacts));

        renderContacts();
        emergencyForm.reset();

        // Show confirmation
        confirmation.classList.add('show');
        setTimeout(() => confirmation.classList.remove('show'), 3000);
    });

    function renderContacts() {
        if (savedContacts.length === 0) {
            contactsList.innerHTML = '';
            return;
        }

        contactsList.innerHTML = savedContacts.map(contact => `
            <div class="contact-item" data-id="${contact.id}">
                <div class="contact-info">
                    <div class="contact-avatar">${contact.name.charAt(0).toUpperCase()}</div>
                    <div class="contact-details">
                        <h4>${escapeHtml(contact.name)}</h4>
                        <span>${escapeHtml(contact.phone)}</span>
                    </div>
                </div>
                <button class="contact-delete" onclick="deleteContact(${contact.id})" aria-label="Delete contact">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // Global delete function
    window.deleteContact = (id) => {
        savedContacts = savedContacts.filter(c => c.id !== id);
        localStorage.setItem('safeRouteContacts', JSON.stringify(savedContacts));
        renderContacts();
    };

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ===== SMOOTH SCROLL FOR CTA =====
    document.getElementById('ctaButton').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('route').scrollIntoView({ behavior: 'smooth' });
    });

});