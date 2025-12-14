// Minimal interaction enhancements
document.addEventListener('DOMContentLoaded', function() {
    const options = document.querySelectorAll('.option');
    
    // Add subtle touch feedback
    options.forEach(option => {
        option.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        option.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.opacity = '1';
            }, 150);
        });
        
        // Handle option clicks (you can customize these)
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const optionType = this.getAttribute('data-option');
            
            // Add a subtle ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                width: 100px;
                height: 100px;
                left: 50%;
                top: 50%;
                margin-left: -50px;
                margin-top: -50px;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Here you can add navigation logic
            console.log(`Selected: ${optionType}`);
            // Example: window.location.href = `/${optionType}`;
        });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

