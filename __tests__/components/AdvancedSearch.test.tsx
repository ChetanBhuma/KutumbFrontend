// Example: AdvancedSearch Component Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvancedSearch from '@/components/AdvancedSearch';

describe('AdvancedSearch Component', () => {
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders search input and button', () => {
        render(<AdvancedSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

        expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('calls onSearch with query when search button clicked', async () => {
        render(<AdvancedSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

        const searchInput = screen.getByPlaceholderText(/search by name/i);
        const searchButton = screen.getByRole('button', { name: /search/i });

        await userEvent.type(searchInput, 'John Doe');
        fireEvent.click(searchButton);

        expect(mockOnSearch).toHaveBeenCalledWith(
            expect.objectContaining({ query: 'John Doe' })
        );
    });

    it('expands and collapses advanced filters', async () => {
        render(<AdvancedSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

        const expandButton = screen.getByRole('button', { name: /expand filters/i });
        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByLabelText(/age range/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
        });

        const collapseButton = screen.getByRole('button', { name: /collapse/i });
        fireEvent.click(collapseButton);

        await waitFor(() => {
            expect(screen.queryByLabelText(/age range/i)).not.toBeInTheDocument();
        });
    });

    it('applies multiple filters', async () => {
        render(<AdvancedSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

        // Expand filters
        const expandButton = screen.getByRole('button', { name: /expand filters/i });
        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByLabelText(/age range/i)).toBeInTheDocument();
        });

        // Set filters
        const minAgeInput = screen.getByPlaceholderText(/min/i);
        await userEvent.type(minAgeInput, '60');

        // TODO: Add more filter interactions

        const searchButton = screen.getByRole('button', { name: /search/i });
        fireEvent.click(searchButton);

        expect(mockOnSearch).toHaveBeenCalledWith(
            expect.objectContaining({ minAge: 60 })
        );
    });

    it('shows active filter count', async () => {
        render(<AdvancedSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

        const searchInput = screen.getByPlaceholderText(/search by name/i);
        await userEvent.type(searchInput, 'test');

        await waitFor(() => {
            expect(screen.getByText(/1 active filter/i)).toBeInTheDocument();
        });
    });

    it('clears all filters', async () => {
        render(<AdvancedSearch onSearch={mockOnSearch} onReset={mockOnReset} />);

        const searchInput = screen.getByPlaceholderText(/search by name/i);
        await userEvent.type(searchInput, 'test');

        const clearButton = screen.getByRole('button', { name: /clear all/i });
        fireEvent.click(clearButton);

        expect(mockOnReset).toHaveBeenCalled();
        expect(searchInput).toHaveValue('');
    });
});
