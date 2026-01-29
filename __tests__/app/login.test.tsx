// Example: Login Page Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

// Mock the API client
jest.mock('@/lib/api-client');
jest.mock('next/navigation');

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form', () => {
        render(<LoginPage />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('displays validation errors for empty fields', async () => {
        render(<LoginPage />);

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });

    it('submits form with valid credentials', async () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        (apiClient.login as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                accessToken: 'mock-token',
                user: { email: 'test@example.com', role: 'OFFICER' },
            },
        });

        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(apiClient.login).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('displays error message on failed login', async () => {
        (apiClient.login as jest.Mock).mockRejectedValue({
            response: {
                data: { message: 'Invalid credentials' },
            },
        });

        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'wrongpassword');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('disables submit button while loading', async () => {
        (apiClient.login as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 1000))
        );

        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        fireEvent.click(loginButton);

        expect(loginButton).toBeDisabled();
        expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
});
