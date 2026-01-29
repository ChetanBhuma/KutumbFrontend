// Cypress custom commands
/// <reference types="cypress" />

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to login
             * @example cy.login('test@example.com', 'password123')
             */
            login(email: string, password: string): Chainable<void>;

            /**
             * Custom command to login as specific role
             * @example cy.loginAsRole('ADMIN')
             */
            loginAsRole(role: 'OFFICER' | 'ADMIN' | 'SUPER_ADMIN' | 'CITIZEN'): Chainable<void>;

            /**
             * Custom command to create a test citizen
             * @example cy.createTestCitizen()
             */
            createTestCitizen(data?: any): Chainable<any>;

            /**
             * Custom command to wait for API response
             * @example cy.waitForApi('@getCitizens')
             */
            waitForApi(alias: string): Chainable<void>;
        }
    }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
});

// Login as specific role
Cypress.Commands.add('loginAsRole', (role) => {
    const credentials = {
        OFFICER: { email: 'officer@test.com', password: 'officer123' },
        ADMIN: { email: 'admin@test.com', password: 'admin123' },
        SUPER_ADMIN: { email: 'superadmin@test.com', password: 'superadmin123' },
        CITIZEN: { email: 'citizen@test.com', password: 'citizen123' },
    };

    const cred = credentials[role];
    cy.login(cred.email, cred.password);
});

// Create test citizen
Cypress.Commands.add('createTestCitizen', (data = {}) => {
    const defaultData = {
        fullName: 'Test Citizen',
        age: 70,
        gender: 'Male',
        mobileNumber: '+919876543210',
        permanentAddress: 'Test Address, Delhi',
        ...data,
    };

    return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/citizens`,
        body: defaultData,
        headers: {
            Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
        },
    }).then((response) => {
        expect(response.status).to.eq(201);
        return response.body.data;
    });
});

// Wait for API alias
Cypress.Commands.add('waitForApi', (alias: string) => {
    cy.wait(alias).its('response.statusCode').should('be.oneOf', [200, 201]);
});

export { };
