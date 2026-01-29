// E2E Test: Authentication Flow
describe('Authentication Flow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display login page', () => {
        cy.visit('/login');
        cy.contains('h1', /login/i).should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
        cy.visit('/login');
        cy.get('button[type="submit"]').click();
        cy.contains(/email is required/i).should('be.visible');
        cy.contains(/password is required/i).should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
        cy.intercept('POST', '**/auth/login').as('loginRequest');

        cy.visit('/login');
        cy.get('input[name="email"]').type('officer@test.com');
        cy.get('input[name="password"]').type('officer123');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');
        cy.url().should('include', '/dashboard');
        cy.contains(/dashboard/i).should('be.visible');
    });

    it('should show error for invalid credentials', () => {
        cy.intercept('POST', '**/auth/login', {
            statusCode: 401,
            body: {
                success: false,
                message: 'Invalid credentials',
            },
        }).as('loginRequest');

        cy.visit('/login');
        cy.get('input[name="email"]').type('wrong@test.com');
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');
        cy.contains(/invalid credentials/i).should('be.visible');
    });

    it('should logout successfully', () => {
        cy.loginAsRole('OFFICER');

        // Find and click logout button
        cy.contains('button', /logout/i).click();

        // Should redirect to login
        cy.url().should('include', '/login');

        // Local storage should be cleared
        cy.window().then((win) => {
            expect(win.localStorage.getItem('accessToken')).to.be.null;
        });
    });
});
