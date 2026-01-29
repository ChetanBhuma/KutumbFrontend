// E2E Test: Citizen Management Flow
describe('Citizen Management', () => {
    beforeEach(() => {
        cy.loginAsRole('ADMIN');
    });

    describe('Citizens List', () => {
        it('should display citizens list page', () => {
            cy.intercept('GET', '**/citizens*').as('getCitizens');

            cy.visit('/citizens');
            cy.wait('@getCitizens');

            cy.contains('h1', /citizens/i).should('be.visible');
            cy.get('[data-testid="citizen-card"]').should('have.length.greaterThan', 0);
        });

        it('should search for citizens by name', () => {
            cy.intercept('GET', '**/citizens*').as('searchCitizens');

            cy.visit('/citizens');
            cy.get('input[placeholder*="Search"]').type('John Doe');
            cy.get('button').contains(/search/i).click();

            cy.wait('@searchCitizens');
            cy.url().should('include', 'search=John Doe');
        });

        it('should filter citizens by vulnerability level', () => {
            cy.intercept('GET', '**/citizens*').as('filterCitizens');

            cy.visit('/citizens');

            // Open filter dropdown
            cy.get('select[name="vulnerabilityLevel"]').select('High');

            cy.wait('@filterCitizens');
            cy.get('[data-testid="citizen-card"]').each(($card) => {
                cy.wrap($card).contains(/high/i).should('be.visible');
            });
        });

        it('should navigate to citizen detail page', () => {
            cy.intercept('GET', '**/citizens').as('getCitizens');
            cy.intercept('GET', '**/citizens/*').as('getCitizen');

            cy.visit('/citizens');
            cy.wait('@getCitizens');

            // Click first citizen card
            cy.get('[data-testid="citizen-card"]').first().click();

            cy.wait('@getCitizen');
            cy.url().should('include', '/citizens/');
            cy.contains(/personal information/i).should('be.visible');
        });
    });

    describe('Citizen Registration', () => {
        it('should complete full registration flow', () => {
            cy.visit('/citizens/register');

            // Step 1: Personal Details
            cy.get('input[name="fullName"]').type('Test Citizen E2E');
            cy.get('input[name="age"]').type('72');
            cy.get('select[name="gender"]').select('Male');
            cy.get('input[name="dateOfBirth"]').type('1952-01-15');
            cy.contains('button', /next/i).click();

            // Step 2: Contact & Address
            cy.get('input[name="mobileNumber"]').type('+919876543210');
            cy.get('input[name="email"]').type('testcitizen@example.com');
            cy.get('textarea[name="permanentAddress"]').type('123 Test Street, Delhi');
            cy.get('input[name="pincode"]').type('110001');
            cy.contains('button', /next/i).click();

            // Step 3: Family & Health
            cy.get('select[name="livingArrangement"]').select('Alone');
            cy.get('input[name="hasHealthConditions"]').check();
            cy.get('textarea[name="healthConditions"]').type('Diabetes, Hypertension');
            cy.contains('button', /next/i).click();

            // Step 4: Emergency Contacts & Consent
            cy.get('input[name="emergencyContactName"]').type('Family Member');
            cy.get('input[name="emergencyContactPhone"]').type('+919876543211');
            cy.get('input[name="emergencyContactRelation"]').type('Son');
            cy.get('input[name="consentGiven"]').check();

            // Submit
            cy.intercept('POST', '**/citizens').as('createCitizen');
            cy.contains('button', /submit/i).click();

            cy.wait('@createCitizen');

            // Should redirect to citizen detail or success page
            cy.url().should('not.include', '/register');
            cy.contains(/success/i).should('be.visible');
        });

        it('should validate required fields in registration', () => {
            cy.visit('/citizens/register');

            // Try to proceed without filling required fields
            cy.contains('button', /next/i).click();

            // Should show validation errors
            cy.contains(/required/i).should('be.visible');
        });
    });

    describe('Citizen Detail View', () => {
        it('should display comprehensive citizen information', () => {
            cy.intercept('GET', '**/citizens/*').as('getCitizen');

            // Assuming we have a test citizen ID
            cy.visit('/citizens/citizen_test_123');
            cy.wait('@getCitizen');

            // Check tabs are visible
            cy.contains('button', /personal/i).should('be.visible');
            cy.contains('button', /family/i).should('be.visible');
            cy.contains('button', /health/i).should('be.visible');
            cy.contains('button', /visits/i).should('be.visible');
        });

        it('should switch between tabs', () => {
            cy.intercept('GET', '**/citizens/*').as('getCitizen');

            cy.visit('/citizens/citizen_test_123');
            cy.wait('@getCitizen');

            // Click Health tab
            cy.contains('button', /health/i).click();
            cy.contains(/health conditions/i).should('be.visible');

            // Click Visits tab
            cy.contains('button', /visits/i).click();
            cy.contains(/visit history/i).should('be.visible');
        });
    });
});
