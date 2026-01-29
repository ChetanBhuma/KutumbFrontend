// Import commands
import './commands';

// Cypress support file
/// <reference types="cypress" />

// Example: Global before hook
beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
    // Return false to prevent Cypress from failing the test
    // Customize based on your needs
    if (err.message.includes('ResizeObserver')) {
        return false;
    }
    return true;
});
