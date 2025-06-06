// This script fixes interactivity issues by ensuring all elements have pointer-events enabled
// It runs as soon as possible and applies fixes to both the document and any shadow DOM

(function() {
  console.log('🔧 Global interactivity fix script loaded');
  
  // Apply fixes immediately
  applyInteractivityFixes();
  
  // Also apply when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyInteractivityFixes);
  }
  
  // And periodically check for any dynamically added elements
  setInterval(applyInteractivityFixes, 1000);
  
  function applyInteractivityFixes() {
    console.log('🔧 Applying interactivity fixes');
    
    // 1. Add global style to force pointer-events
    ensureGlobalStyle();
    
    // 2. Fix any overlay elements that might be blocking interaction
    fixOverlays();
    
    // 3. Fix specific problematic elements
    fixSpecificElements();
    
    // 4. Ensure all form elements are interactive
    fixFormElements();
    
    // 5. Fix any shadow DOM elements
    fixShadowDom();
    
    console.log('✅ Interactivity fixes applied');
  }
  
  function ensureGlobalStyle() {
    // Check if our style already exists
    if (!document.getElementById('global-interactivity-fix')) {
      const style = document.createElement('style');
      style.id = 'global-interactivity-fix';
      style.innerHTML = `
        * { 
          pointer-events: auto !important;
        }
        
        input, button, [role="button"], a, select, textarea, label {
          pointer-events: auto !important;
          cursor: pointer;
        }
        
        .overlay, [class*="overlay"], [style*="position: fixed"], [style*="position:fixed"] {
          pointer-events: none !important;
        }
        
        .card, .dialog, .input-container, form {
          z-index: 10;
          position: relative;
        }
      `;
      document.head.appendChild(style);
      console.log('✅ Global style added');
    }
  }
  
  function fixOverlays() {
    // Find potential overlay elements that might be blocking interaction
    const overlays = document.querySelectorAll(
      '[class*="overlay"], [style*="position: fixed"], [style*="position:fixed"], [style*="z-index"]'
    );
    
    overlays.forEach(overlay => {
      // Only disable pointer events on elements that might be blocking
      const computedStyle = window.getComputedStyle(overlay);
      const zIndex = parseInt(computedStyle.zIndex, 10);
      
      // If this is a high z-index overlay, disable its pointer events
      if (zIndex > 10 && computedStyle.position === 'fixed') {
        overlay.style.pointerEvents = 'none';
        console.log('🔧 Fixed overlay:', overlay);
      }
    });
  }
  
  function fixSpecificElements() {
    // Fix specific elements that might have interactivity issues
    
    // 1. Fix microphone buttons
    document.querySelectorAll('button').forEach(button => {
      button.style.pointerEvents = 'auto';
      
      // Add click logging to debug issues
      if (!button._interactivityFixed) {
        button._interactivityFixed = true;
        const originalOnClick = button.onclick;
        
        button.onclick = function(e) {
          console.log('🖱️ Button clicked:', button);
          if (originalOnClick) originalOnClick.call(this, e);
        };
      }
    });
    
    // 2. Fix input fields
    document.querySelectorAll('input').forEach(input => {
      input.style.pointerEvents = 'auto';
      
      // Make sure inputs can be focused
      if (!input._interactivityFixed) {
        input._interactivityFixed = true;
        input.addEventListener('click', () => {
          console.log('🖱️ Input clicked:', input);
          input.focus();
        });
      }
    });
  }
  
  function fixFormElements() {
    // Ensure all form elements are interactive
    const formElements = document.querySelectorAll('input, button, select, textarea');
    
    formElements.forEach(el => {
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      
      // Remove any disabled attributes unless explicitly set by application
      if (el.hasAttribute('disabled') && !el._appDisabled) {
        el._wasDisabled = true;
        el.removeAttribute('disabled');
      }
    });
  }
  
  function fixShadowDom() {
    // Fix elements in shadow DOM
    document.querySelectorAll('*').forEach(element => {
      if (element.shadowRoot) {
        const shadowStyle = document.createElement('style');
        shadowStyle.textContent = `
          * { 
            pointer-events: auto !important;
          }
          
          input, button, [role="button"], a, select, textarea, label {
            pointer-events: auto !important;
            cursor: pointer;
          }
        `;
        
        if (!element.shadowRoot.querySelector('#shadow-interactivity-fix')) {
          shadowStyle.id = 'shadow-interactivity-fix';
          element.shadowRoot.appendChild(shadowStyle);
          console.log('✅ Fixed shadow DOM for:', element);
        }
      }
    });
  }
})();
