// Global Variables
let currentQuestionIndex = 0;
let quizScore = 0;
let quizAnswers = [];
let particles = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeParticles();
    initializeEventListeners();
    initializeSkillBars();
    loadSubmissions();
});

// Particle Animation System
function initializeParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Event Listeners
function initializeEventListeners() {
    // Start button
    document.getElementById('start-btn').addEventListener('click', () => {
        showSection('skills');
    });
    
    // Quiz option buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('option-btn')) {
            handleQuizAnswer(e.target);
        }
    });
    
    // Form submission
    document.getElementById('employer-form').addEventListener('submit', handleFormSubmission);
    
    // Modal close
    document.addEventListener('click', (e) => {
        if (e.target.id === 'success-modal') {
            closeModal();
        }
    });
}

// Initialize skill bars animation
function initializeSkillBars() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const levelBar = card.querySelector('.level-bar');
            const level = levelBar.dataset.level;
            levelBar.style.setProperty('--level', level + '%');
        });
    });
}

// Section Management
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Add animation class
    document.getElementById(sectionId).classList.add('fade-in');
    
    // Reset quiz if showing quiz section
    if (sectionId === 'quiz') {
        resetQuiz();
    }
}

// Quiz System
function resetQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    quizAnswers = [];
    
    // Hide all question cards
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Show first question
    document.querySelector('.question-card[data-question="0"]').classList.add('active');
    
    // Reset progress
    updateQuizProgress();
    
    // Hide result
    document.querySelector('.quiz-result').style.display = 'none';
}

function handleQuizAnswer(button) {
    const value = parseInt(button.dataset.value);
    const questionCard = button.closest('.question-card');
    
    // Remove previous selections
    questionCard.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Mark current selection
    button.classList.add('selected');
    
    // Store answer
    quizAnswers[currentQuestionIndex] = value;
    quizScore += value;
    
    // Wait a bit then move to next question
    setTimeout(() => {
        nextQuestion();
    }, 800);
}

function nextQuestion() {
    const currentCard = document.querySelector(`.question-card[data-question="${currentQuestionIndex}"]`);
    currentQuestionIndex++;
    
    // Hide current question
    currentCard.classList.remove('active');
    
    if (currentQuestionIndex < 5) {
        // Show next question
        setTimeout(() => {
            const nextCard = document.querySelector(`.question-card[data-question="${currentQuestionIndex}"]`);
            nextCard.classList.add('active');
            updateQuizProgress();
        }, 300);
    } else {
        // Show results
        setTimeout(() => {
            showQuizResults();
        }, 300);
    }
}

function updateQuizProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    const progress = ((currentQuestionIndex + 1) / 5) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Question ${currentQuestionIndex + 1} of 5`;
}

function showQuizResults() {
    const resultDiv = document.querySelector('.quiz-result');
    const scoreText = document.querySelector('.score-text');
    const scoreMessage = document.querySelector('.score-message');
    const scoreCircle = document.querySelector('.score-circle');
    
    // Calculate percentage
    const percentage = Math.round((quizScore / 50) * 100);
    
    // Animate score
    let currentScore = 0;
    const scoreAnimation = setInterval(() => {
        currentScore += 2;
        scoreText.textContent = currentScore + '%';
        
        // Update circle gradient
        const deg = (currentScore / 100) * 360;
        scoreCircle.style.background = `conic-gradient(#667eea 0deg, #764ba2 ${deg}deg, #e0e0e0 ${deg}deg, #e0e0e0 360deg)`;
        
        if (currentScore >= percentage) {
            clearInterval(scoreAnimation);
            scoreText.textContent = percentage + '%';
        }
    }, 50);
    
    // Set message based on score
    let message = '';
    if (percentage >= 80) {
        message = "🎉 Excellent! You seem like my kind of employer!";
    } else if (percentage >= 60) {
        message = "👍 Not bad! We might be able to work something out.";
    } else if (percentage >= 40) {
        message = "😐 Hmm, you need some work on your employer game.";
    } else {
        message = "😬 Yikes! Maybe reconsider your management style?";
    }
    
    scoreMessage.textContent = message;
    resultDiv.style.display = 'block';
    resultDiv.classList.add('slide-up');
}

// Form Handling
function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submission = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        quizScore: quizScore,
        companyName: formData.get('companyName'),
        yourName: formData.get('yourName'),
        yourRole: formData.get('yourRole'),
        whyHire: formData.get('whyHire'),
        companyCulture: formData.get('companyCulture'),
        salaryRange: formData.get('salaryRange'),
        specialPerks: formData.get('specialPerks'),
        remoteWork: formData.get('remoteWork') === 'yes',
        coffeeBreaks: formData.get('coffeeBreaks') === 'unlimited'
    };
    
    // Save to localStorage
    saveSubmission(submission);
    
    // Show success modal with confetti
    showSuccessModal();
    
    // Reset form
    e.target.reset();
}

function saveSubmission(submission) {
    let submissions = JSON.parse(localStorage.getItem('employerSubmissions') || '[]');
    submissions.unshift(submission); // Add to beginning
    localStorage.setItem('employerSubmissions', JSON.stringify(submissions));
}

function showSuccessModal() {
    // Trigger confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    // Show modal
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('success-modal').classList.remove('active');
}

function viewSubmissions() {
    closeModal();
    showSection('submissions');
    loadSubmissions();
}

// Submissions Management
function loadSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('employerSubmissions') || '[]');
    const submissionsList = document.getElementById('submissions-list');
    
    if (submissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="no-submissions">
                <h3>No applications yet!</h3>
                <p>Employers haven't discovered your awesomeness yet. Give them time! 😉</p>
            </div>
        `;
        return;
    }
    
    submissionsList.innerHTML = submissions.map(submission => {
        const date = new Date(submission.timestamp).toLocaleDateString();
        const scorePercentage = Math.round((submission.quizScore / 50) * 100);
        
        let scoreClass = 'score-poor';
        if (scorePercentage >= 80) scoreClass = 'score-excellent';
        else if (scorePercentage >= 60) scoreClass = 'score-good';
        
        return `
            <div class="submission-card">
                <div class="submission-header">
                    <div class="company-name">${submission.companyName}</div>
                    <div class="submission-date">${date}</div>
                </div>
                
                <div class="submission-info">
                    <div class="info-row">
                        <div class="info-label">Contact:</div>
                        <div class="info-value">${submission.yourName} (${submission.yourRole})</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Salary:</div>
                        <div class="info-value">${submission.salaryRange || 'Not specified'}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Remote:</div>
                        <div class="info-value">${submission.remoteWork ? '✅ Yes' : '❌ No'}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Coffee:</div>
                        <div class="info-value">${submission.coffeeBreaks ? '☕ Unlimited' : '⏰ Limited'}</div>
                    </div>
                </div>
                
                <div class="submission-text">
                    <strong>Why they want to hire me:</strong><br>
                    "${submission.whyHire}"
                </div>
                
                <div class="submission-text">
                    <strong>Their company culture:</strong><br>
                    "${submission.companyCulture}"
                </div>
                
                ${submission.specialPerks ? `
                    <div class="submission-text">
                        <strong>Special perks:</strong><br>
                        "${submission.specialPerks}"
                    </div>
                ` : ''}
                
                <div class="compatibility-score">
                    <span>Compatibility Score:</span>
                    <div class="score-badge ${scoreClass}">${scorePercentage}%</div>
                </div>
            </div>
        `;
    }).join('');
}

function clearSubmissions() {
    if (confirm('Are you sure you want to clear all applications?')) {
        localStorage.removeItem('employerSubmissions');
        loadSubmissions();
        
        // Show confetti for the clean slate
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#ff6b6b', '#feca57']
        });
    }
}

// Utility Functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Smooth scrolling for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Add some easter eggs
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        // Easter egg activated!
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#ff6b6b', '#feca57', '#667eea', '#764ba2']
        });
        
        alert('🎉 Konami Code activated! You\'re definitely hired! 🎉');
        konamiCode = [];
    }
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect on page load
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.innerHTML;
    
    // Small delay before starting the typing effect
    setTimeout(() => {
        typeWriter(heroTitle, originalText, 50);
    }, 500);
});

// Add some interactive hover effects
document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('skill-card')) {
        e.target.style.transform = 'translateY(-10px) rotateY(5deg)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('skill-card')) {
        e.target.style.transform = 'translateY(0) rotateY(0)';
    }
});

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize particle animation for mobile
const isMobile = window.innerWidth <= 768;
if (isMobile) {
    // Reduce particles on mobile for better performance
    particles.splice(25); // Keep only 25 particles on mobile
}