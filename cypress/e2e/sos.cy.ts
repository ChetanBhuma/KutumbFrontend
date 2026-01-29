// E2E Test: SOS Alert Flow
describe('SOS Alert System', () => {
    beforeEach(() => {
        cy.loginAsRole('OFFICER');
    });

    it('should display active SOS alerts', () => {
        cy.intercept('GET', '**/sos/active').as('getActiveAlerts');

        cy.visit('/sos');
        cy.wait('@getActiveAlerts');

        cy.contains('h1', /sos/i).should('be.visible');
        cy.get('[data-testid="sos-alert-card"]').should('exist');
    });

    it('should show alert details when clicked', () => {
        cy.intercept('GET', '**/sos/active').as('getActiveAlerts');

        cy.visit('/sos');
        cy.wait('@getActiveAlerts');

        // Click first alert
        cy.get('[data-testid="sos-alert-card"]').first().click();

        // Details should be visible
        cy.contains(/citizen name/i).should('be.visible');
        cy.contains(/location/i).should('be.visible');
        cy.contains(/time/i).should('be.visible');
    });

    it('should respond to SOS alert', () => {
        cy.intercept('GET', '**/sos/active').as('getActiveAlerts');
        cy.intercept('POST', '**/sos/*/respond').as('respondAlert');

        cy.visit('/sos');
        cy.wait('@getActiveAlerts');

        // Click first alert
        cy.get('[data-testid="sos-alert-card"]').first().click();

        // Click respond button
        cy.contains('button', /respond/i).click();

        // Confirm response
        cy.get('textarea[name="responseNotes"]').type('Responding to emergency');
        cy.contains('button', /confirm/i).click();

        cy.wait('@respondAlert');

        // Should show success message
        cy.contains(/responded successfully/i).should('be.visible');
    });

    it('should mark alert as resolved', () => {
        cy.intercept('POST', '**/sos/*/resolve').as('resolveAlert');

        cy.visit('/sos');

        // Select an alert and resolve
        cy.get('[data-testid="sos-alert-card"]').first().click();
        cy.contains('button', /resolve/i).click();

        // Add resolution notes
        cy.get('textarea[name="resolutionNotes"]').type('False alarm - citizen is safe');
        cy.get('select[name="resolutionType"]').select('False Alarm');
        cy.contains('button', /confirm/i).click();

        cy.wait('@resolveAlert');
        cy.contains(/resolved successfully/i).should('be.visible');
    });

    it('should filter alerts by status', () => {
        cy.intercept('GET', '**/sos*').as('filterAlerts');

        cy.visit('/sos');

        // Select filter
        cy.get('select[name="status"]').select('Active');

        cy.wait('@filterAlerts');
        cy.url().should('include', 'status=Active');
    });

    it('should auto-refresh alerts', () => {
        cy.intercept('GET', '**/sos/active').as('getActiveAlerts');

        cy.visit('/sos');
        cy.wait('@getActiveAlerts');

        // Wait for auto-refresh (15 seconds configured in component)
        cy.wait(15000);

        // Should have made another request
        cy.wait('@getActiveAlerts');
    });
});
