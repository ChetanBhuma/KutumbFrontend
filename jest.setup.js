// Jest setup for frontend
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/',
        };
    },
    usePathname() {
        return '/';
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// Mock API client
jest.mock('./lib/api-client', () => ({
    __esModule: true,
    default: {
        login: jest.fn(),
        register: jest.fn(),
        getCitizens: jest.fn(),
        getCitizenById: jest.fn(),
        createCitizen: jest.fn(),
        updateCitizen: jest.fn(),
        deleteCitizen: jest.fn(),
        getActiveAlerts: jest.fn(),
        getOfficers: jest.fn(),
        getVisits: jest.fn(),
    },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
} as any;
