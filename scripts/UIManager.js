/**
 * UIManager - Handles UI components, modals, overlays, and interface interactions
 * including accordion toggles, modal management, and UI state changes
 */
class UIManager {
    constructor() {
        // Initialize any UI-related state if needed
    }

    /**
     * Toggles the visibility of a creature's roll group when clicked.
     *
     * This function handles the expansion and collapse of an accordion section
     * containing saved rolls for a specific creature. It changes the display
     * property of the content section and updates the accordion icon to reflect
     * the current state (+ for collapsed, - for expanded).
     *
     * @param {Element} header - The clicked accordion header element.
     */
    toggleAccordion(header) {
        const content = header.nextElementSibling;
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        header.querySelector(".accordion-icon").textContent = isHidden ? "-" : "+";
    }

    /**
     * Shows a modal overlay with custom content
     * @param {string} content - HTML content for the modal
     * @param {Object} options - Modal options (title, buttons, etc.)
     * @returns {Promise} - Resolves when modal is closed with result
     */
    showModal(content, options = {}) {
        return new Promise((resolve) => {
            this.showOverlay(true);

            const modal = document.createElement('div');
            modal.className = 'ui-modal';
            modal.style.position = 'fixed';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.backgroundColor = 'var(--ts-background-primary)';
            modal.style.padding = '20px';
            modal.style.border = '4px solid var(--ts-accessibility-border)';
            modal.style.zIndex = '1000';
            modal.style.boxShadow = '0 4px 8px var(--ts-background-primary)';
            modal.style.borderRadius = '4px';
            modal.style.color = 'var(--ts-color-primary)';
            modal.style.textAlign = 'center';
            modal.style.minWidth = '300px';

            // Add title if provided
            let modalHTML = '';
            if (options.title) {
                modalHTML += `<h3>${options.title}</h3>`;
            }
            
            modalHTML += content;

            // Add buttons if provided
            if (options.buttons && options.buttons.length > 0) {
                modalHTML += '<div style="display: flex; justify-content: space-around; margin-top: 20px;">';
                options.buttons.forEach((button, index) => {
                    modalHTML += `<button id="modal-btn-${index}" class="black-button">${button.text}</button>`;
                });
                modalHTML += '</div>';
            }

            modal.innerHTML = modalHTML;
            document.body.appendChild(modal);

            // Add event listeners for buttons
            if (options.buttons && options.buttons.length > 0) {
                options.buttons.forEach((button, index) => {
                    const btnElement = document.getElementById(`modal-btn-${index}`);
                    btnElement.addEventListener('click', () => {
                        document.body.removeChild(modal);
                        this.showOverlay(false);
                        resolve(button.value || button.text);
                    });
                });
            }

            // Add close on overlay click if no buttons
            if (!options.buttons || options.buttons.length === 0) {
                const overlay = document.getElementById('ui-overlay');
                if (overlay) {
                    overlay.addEventListener('click', () => {
                        document.body.removeChild(modal);
                        this.showOverlay(false);
                        resolve(null);
                    });
                }
            }
        });
    }

    /**
     * Shows a confirmation modal with Yes/No buttons
     * @param {string} message - The confirmation message
     * @param {string} title - Optional title for the modal
     * @returns {Promise<boolean>} - True if Yes, false if No
     */
    showConfirmation(message, title = 'Confirm') {
        return this.showModal(
            `<p>${message}</p>`,
            {
                title,
                buttons: [
                    { text: 'Yes', value: true },
                    { text: 'No', value: false }
                ]
            }
        );
    }

    /**
     * Shows an information modal with an OK button
     * @param {string} message - The information message
     * @param {string} title - Optional title for the modal
     * @returns {Promise} - Resolves when OK is clicked
     */
    showInfo(message, title = 'Information') {
        return this.showModal(
            `<p>${message}</p>`,
            {
                title,
                buttons: [
                    { text: 'OK', value: true }
                ]
            }
        );
    }

    /**
     * Shows an error modal with an OK button
     * @param {string} message - The error message
     * @param {string} title - Optional title for the modal
     * @returns {Promise} - Resolves when OK is clicked
     */
    showError(message, title = 'Error') {
        return this.showModal(
            `<p style="color: var(--ts-color-error, #ff6b6b);">${message}</p>`,
            {
                title,
                buttons: [
                    { text: 'OK', value: true }
                ]
            }
        );
    }

    /**
     * Shows an input modal with OK/Cancel buttons
     * @param {string} message - The input prompt message
     * @param {string} placeholder - Optional placeholder text for the input
     * @param {string} title - Optional title for the modal
     * @param {string} defaultValue - Optional default value for the input
     * @returns {Promise<string|null>} - Resolves with input value or null if cancelled
     */
    showInput(message, placeholder = '', title = 'Input', defaultValue = '') {
        return new Promise((resolve) => {
            this.showOverlay(true);

            const modal = document.createElement('div');
            modal.className = 'ui-modal';
            modal.style.position = 'fixed';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.backgroundColor = 'var(--ts-background-primary)';
            modal.style.padding = '20px';
            modal.style.border = '4px solid var(--ts-accessibility-border)';
            modal.style.zIndex = '1000';
            modal.style.boxShadow = '0 4px 8px var(--ts-background-primary)';
            modal.style.borderRadius = '4px';
            modal.style.color = 'var(--ts-color-primary)';
            modal.style.textAlign = 'center';
            modal.style.minWidth = '300px';

            modal.innerHTML = `
                <h3>${title}</h3>
                <p style="margin-bottom: 15px;">${message}</p>
                <input type="text" id="modal-input" 
                       placeholder="${placeholder}" 
                       value="${defaultValue}"
                       style="width: 100%; padding: 8px; margin-bottom: 15px; 
                              border: 1px solid var(--ts-accessibility-border); 
                              border-radius: 4px; background-color: var(--ts-background-tertiary);
                              color: var(--ts-color-primary); font-size: 14px;">
                <div style="display: flex; justify-content: space-around; margin-top: 20px;">
                    <button id="modal-ok" class="black-button"><i class="ts-icon-check ts-icon-xsmall"></i></button>
                    <button id="modal-cancel" class="black-button"><i class="ts-icon-remove ts-icon-xsmall"></i></button>
                </div>
            `;

            document.body.appendChild(modal);

            const input = document.getElementById('modal-input');
            const okBtn = document.getElementById('modal-ok');
            const cancelBtn = document.getElementById('modal-cancel');

            // Focus the input
            input.focus();
            input.select();

            // Handle Enter key
            const handleEnter = (e) => {
                if (e.key === 'Enter') {
                    okBtn.click();
                }
            };

            // Handle Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            };

            input.addEventListener('keydown', handleEnter);
            document.addEventListener('keydown', handleEscape);

            okBtn.addEventListener('click', () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.removeChild(modal);
                this.showOverlay(false);
                resolve(input.value.trim());
            });

            cancelBtn.addEventListener('click', () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.removeChild(modal);
                this.showOverlay(false);
                resolve(null);
            });
        });
    }

    /**
     * Toggles the modal overlay
     * @param {boolean} show - Whether to show or hide the overlay
     */
    showOverlay(show) {
        if (show) {
            // Remove existing overlay if present
            const existingOverlay = document.getElementById('ui-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            const overlay = document.createElement('div');
            overlay.id = 'ui-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'var(--ts-background-primary)';
            overlay.style.zIndex = '999';
            overlay.style.pointerEvents = 'auto';
            document.body.appendChild(overlay);
        } else {
            const overlay = document.getElementById('ui-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    /**
     * Hides the overlay
     */
    hideOverlay() {
        this.showOverlay(false);
    }

    /**
     * Shows a loading spinner overlay
     * @param {string} message - Optional loading message
     */
    showLoading(message = 'Loading...') {
        this.showOverlay(true);

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.style.position = 'fixed';
        loadingDiv.style.left = '50%';
        loadingDiv.style.top = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.backgroundColor = 'var(--ts-background-primary)';
        loadingDiv.style.padding = '20px';
        loadingDiv.style.border = '2px solid var(--ts-accessibility-border)';
        loadingDiv.style.borderRadius = '4px';
        loadingDiv.style.zIndex = '1001';
        loadingDiv.style.color = 'var(--ts-color-primary)';
        loadingDiv.style.textAlign = 'center';

        // Simple text-based spinner
        loadingDiv.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">⟳</div>
            <div>${message}</div>
        `;

        document.body.appendChild(loadingDiv);

        // Animate the spinner
        const spinner = loadingDiv.querySelector('div');
        let rotation = 0;
        const rotateSpinner = () => {
            rotation += 10;
            spinner.style.transform = `rotate(${rotation}deg)`;
            if (document.getElementById('loading-indicator')) {
                requestAnimationFrame(rotateSpinner);
            }
        };
        requestAnimationFrame(rotateSpinner);
    }

    /**
     * Hides the loading spinner
     */
    hideLoading() {
        const loadingDiv = document.getElementById('loading-indicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        this.hideOverlay();
    }

    /**
     * Adds or removes a CSS class from an element
     * @param {Element|string} elementOrSelector - Element or CSS selector
     * @param {string} className - The CSS class name
     * @param {boolean} add - Whether to add (true) or remove (false) the class
     */
    toggleClass(elementOrSelector, className, add) {
        const element = typeof elementOrSelector === 'string' 
            ? document.querySelector(elementOrSelector) 
            : elementOrSelector;
            
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }

    /**
     * Sets the visibility of an element
     * @param {Element|string} elementOrSelector - Element or CSS selector
     * @param {boolean} visible - Whether the element should be visible
     */
    setVisible(elementOrSelector, visible) {
        const element = typeof elementOrSelector === 'string' 
            ? document.querySelector(elementOrSelector) 
            : elementOrSelector;
            
        if (element) {
            element.style.display = visible ? '' : 'none';
        }
    }

    /**
     * Sets the content of an element
     * @param {Element|string} elementOrSelector - Element or CSS selector
     * @param {string} content - The HTML content to set
     */
    setContent(elementOrSelector, content) {
        const element = typeof elementOrSelector === 'string' 
            ? document.querySelector(elementOrSelector) 
            : elementOrSelector;
            
        if (element) {
            element.innerHTML = content;
        }
    }

    /**
     * Gets the content of an element
     * @param {Element|string} elementOrSelector - Element or CSS selector
     * @returns {string} - The element's HTML content
     */
    getContent(elementOrSelector) {
        const element = typeof elementOrSelector === 'string' 
            ? document.querySelector(elementOrSelector) 
            : elementOrSelector;
            
        return element ? element.innerHTML : '';
    }

    /**
     * Highlights an element temporarily
     * @param {Element|string} elementOrSelector - Element or CSS selector
     * @param {number} duration - Duration in milliseconds (default: 1000ms)
     * @param {string} highlightClass - CSS class for highlighting (default: 'highlight')
     */
    highlightElement(elementOrSelector, duration = 1000, highlightClass = 'highlight') {
        const element = typeof elementOrSelector === 'string' 
            ? document.querySelector(elementOrSelector) 
            : elementOrSelector;
            
        if (element) {
            element.classList.add(highlightClass);
            setTimeout(() => {
                element.classList.remove(highlightClass);
            }, duration);
        }
    }

    /**
     * Scrolls an element into view smoothly
     * @param {Element|string} elementOrSelector - Element or CSS selector
     * @param {Object} options - Scroll options
     */
    scrollToElement(elementOrSelector, options = { behavior: 'smooth', block: 'center' }) {
        const element = typeof elementOrSelector === 'string' 
            ? document.querySelector(elementOrSelector) 
            : elementOrSelector;
            
        if (element) {
            element.scrollIntoView(options);
        }
    }

    /**
     * Creates a toast notification
     * @param {string} message - The notification message
     * @param {string} type - Type of notification ('info', 'success', 'warning', 'error')
     * @param {number} duration - Duration in milliseconds (default: 3000ms)
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 20px';
        toast.style.border = '2px solid var(--ts-accessibility-border)';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '1002';
        toast.style.color = 'var(--ts-color-primary)';
        toast.style.maxWidth = '300px';
        toast.style.wordWrap = 'break-word';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';

        // Set background color based on type
        const colors = {
            info: 'var(--ts-background-secondary, #333)',
            success: 'var(--ts-color-success, #4caf50)',
            warning: 'var(--ts-color-warning, #ff9800)',
            error: 'var(--ts-color-error, #f44336)'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * Creates a simple progress bar
     * @param {number} percentage - Progress percentage (0-100)
     * @param {Element|string} containerOrSelector - Container element or selector
     */
    updateProgressBar(percentage, containerOrSelector) {
        const container = typeof containerOrSelector === 'string' 
            ? document.querySelector(containerOrSelector) 
            : containerOrSelector;
            
        if (!container) return;

        let progressBar = container.querySelector('.ui-progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'ui-progress-bar';
            progressBar.style.width = '100%';
            progressBar.style.height = '20px';
            progressBar.style.backgroundColor = 'var(--ts-background-secondary, #333)';
            progressBar.style.border = '1px solid var(--ts-accessibility-border)';
            progressBar.style.borderRadius = '4px';
            progressBar.style.overflow = 'hidden';

            const progressFill = document.createElement('div');
            progressFill.className = 'ui-progress-fill';
            progressFill.style.height = '100%';
            progressFill.style.backgroundColor = 'var(--ts-color-primary, #007acc)';
            progressFill.style.transition = 'width 0.3s ease';
            progressFill.style.width = '0%';

            progressBar.appendChild(progressFill);
            container.appendChild(progressBar);
        }

        const progressFill = progressBar.querySelector('.ui-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        }
    }
}
