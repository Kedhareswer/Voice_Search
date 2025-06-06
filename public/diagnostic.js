// Diagnostic script to detect JavaScript errors
console.log("Diagnostic script loaded");

// Check if basic DOM manipulation works
try {
  document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    
    // Try to find common elements and log their existence
    const inputs = document.querySelectorAll('input');
    console.log(`Found ${inputs.length} input elements`);
    
    const buttons = document.querySelectorAll('button');
    console.log(`Found ${buttons.length} button elements`);
    
    // Try to attach event listeners to all inputs
    inputs.forEach((input, index) => {
      console.log(`Input ${index} id:`, input.id);
      input.addEventListener('click', function() {
        console.log(`Input ${index} clicked`);
      });
      input.addEventListener('focus', function() {
        console.log(`Input ${index} focused`);
      });
    });
    
    // Try to attach event listeners to all buttons
    buttons.forEach((button, index) => {
      console.log(`Button ${index} text:`, button.textContent);
      button.addEventListener('click', function() {
        console.log(`Button ${index} clicked`);
      });
    });
    
    // Check if the microphone button exists
    const micButton = document.querySelector('[aria-label="Toggle microphone"]') || 
                      document.querySelector('.microphone-button') ||
                      document.querySelector('button:has(svg)');
    
    if (micButton) {
      console.log("Microphone button found:", micButton);
      micButton.addEventListener('click', function() {
        console.log("Microphone button clicked via diagnostic");
      });
    } else {
      console.log("Microphone button not found");
    }
    
    // Check for any overlay or modal that might be blocking interaction
    const possibleOverlays = document.querySelectorAll('.overlay, .modal, [style*="position: fixed"]');
    console.log(`Found ${possibleOverlays.length} possible overlays`);
    possibleOverlays.forEach((overlay, index) => {
      console.log(`Overlay ${index}:`, overlay);
    });
  });
} catch (error) {
  console.error("Diagnostic error:", error);
}

// Check if the window object is properly initialized
try {
  console.log("Window object check:");
  console.log("- navigator.userAgent:", navigator.userAgent);
  console.log("- window.innerWidth:", window.innerWidth);
  console.log("- document.readyState:", document.readyState);
} catch (error) {
  console.error("Window object error:", error);
}

// Check for React and Next.js
try {
  console.log("Framework detection:");
  console.log("- React exists:", typeof React !== 'undefined');
  console.log("- ReactDOM exists:", typeof ReactDOM !== 'undefined');
  console.log("- Next.js exists:", typeof next !== 'undefined');
} catch (error) {
  console.log("Framework detection error:", error);
}

// Try to detect any JavaScript errors
window.addEventListener('error', function(event) {
  console.error("Global error caught:", event.message, "at", event.filename, ":", event.lineno);
});
