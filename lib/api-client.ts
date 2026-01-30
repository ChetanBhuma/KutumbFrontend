// API Client for backend communication
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { resolveApiBaseUrl } from './api-base';

class ApiClient {
    private client: AxiosInstance;
    private readonly baseURL: string;

    constructor() {
        this.baseURL = resolveApiBaseUrl();
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // For cookies
        });

        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            (config) => {
                // Allow skipping auth header for specific requests
                if (config.headers?.skipAuth) {
                    delete config.headers.skipAuth;
                    console.log('DEBUG: Skipping Auth for', config.url);
                    return config;
                }

                const token = this.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                console.log('DEBUG: Request Headers:', config.url, config.headers);
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

                // If 401 and not already retried, try to refresh token
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = this.getRefreshToken();
                        const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;
                        const refreshEndpoint = (userType === 'CITIZEN' || userType === 'citizen')
                            ? `${this.baseURL}/citizen-auth/refresh-token`
                            : `${this.baseURL}/auth/refresh-token`;

                        if (refreshToken) {
                            const response = await axios.post(refreshEndpoint, {
                                refreshToken,
                            });

                            const { accessToken } = response.data.data;
                            this.setAccessToken(accessToken);

                            // Retry original request with new token
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                            }
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, clear tokens and redirect to login
                        this.clearTokens();
                        if (typeof window !== 'undefined') {
                            // Save current path for redirect after login
                            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);

                            // Fix #3: Redirect to appropriate login page based on user type
                            const userType = localStorage.getItem('userType');
                            const loginPath = (userType === 'CITIZEN' || userType === 'citizen') ? '/citizen-portal/login' : '/admin/login';
                            window.location.href = loginPath;
                        }
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private storeTokens(tokens?: { accessToken: string; refreshToken: string }) {
        if (!tokens) return;
        if (tokens.accessToken) {
            this.setAccessToken(tokens.accessToken);
        }
        if (tokens.refreshToken) {
            this.setRefreshToken(tokens.refreshToken);
        }
    }

    // Token management
    private getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('accessToken');
    }

    private getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('refreshToken');
    }

    setAccessToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    }

    setRefreshToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', token);
        }
    }

    clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    // Generic HTTP methods
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    // Authentication APIs
    async login(emailOrPhone: string, password: string) {
        // Fix: Send 'identifier' key to match backend expectation
        const result = await this.post<any>('/auth/login', { identifier: emailOrPhone, password });

        this.storeTokens(result.data?.tokens);

        // Store user data for AuthContext
        if (result.data?.user && typeof window !== 'undefined') {
            localStorage.setItem('kutumb-app-user', JSON.stringify(result.data.user));
            // Store simple role for quick access if needed
            localStorage.setItem('userType', result.data.user.role || 'staff');
        }

        return result;
    }

    async register(data: any) {
        return this.post<any>('/auth/register', data);
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.clearTokens();
            if (typeof window !== 'undefined') {
                localStorage.removeItem('userType');
            }
        }
    }

    async sendOTP(emailOrPhone: string) {
        // Fix: Send 'identifier' key to match backend expectation
        return this.post<any>('/auth/otp/send', { identifier: emailOrPhone });
    }

    async sendCitizenOTP(mobileNumber: string) {
        return this.post<any>('/citizen-auth/request-otp', { mobileNumber }, {
            headers: { skipAuth: 'true' }
        });
    }

    async checkCitizenRegistration(mobileNumber: string) {
        return this.post<any>('/citizen-auth/check-registration', { mobileNumber }, {
            headers: { skipAuth: 'true' }
        });
    }

    async verifyOTP(emailOrPhone: string, otp: string) {
        // Fix: Send 'identifier' key to match backend expectation
        const result = await this.post<any>('/auth/otp/verify', { identifier: emailOrPhone, otp });

        this.storeTokens(result.data?.tokens);

        // Store user data for AuthContext
        if (result.data?.user && typeof window !== 'undefined') {
            localStorage.setItem('kutumb-app-user', JSON.stringify(result.data.user));
            localStorage.setItem('userType', result.data.user.role || 'staff');
        }

        return result;
    }

    async getCurrentUser() {
        if (typeof window !== 'undefined') {
            const userType = localStorage.getItem('userType');
            if (userType === 'citizen') {
                const response = await this.getMyProfile();
                // Transform citizen profile to match User structure for AuthProvider
                if (response.success && response.data.citizen) {
                    const citizen = response.data.citizen;
                    return {
                        success: true,
                        data: {
                            user: {
                                id: citizen.id,
                                name: citizen.fullName,
                                mobile: citizen.mobileNumber,
                                role: 'CITIZEN',
                                permissions: ['*'] // or specific permissions
                            }
                        }
                    };
                }
                return response;
            }
        }
        return this.get<any>('/auth/me');
    }

    // Officer App Auth
    async sendOfficerOTP(badgeNumber: string) {
        return this.post<any>('/officer-app/auth/send-otp', { badgeNumber });
    }

    async verifyOfficerOTP(badgeNumber: string, otp: string) {
        const result = await this.post<any>('/officer-app/auth/verify-otp', { badgeNumber, otp });
        this.storeTokens(result.data?.tokens);
        return result;
    }

    // Officer App Dashboard
    async getOfficerDashboardMetrics() {
        return this.get<any>('/officer-app/dashboard/metrics');
    }

    async getOfficerSuggestions() {
        return this.get<any>('/officer-app/dashboard/suggestions');
    }

    async getNearbyCitizens() {
        return this.get<any>('/officer-app/dashboard/nearby');
    }

    async getOfficerProfile() {
        return this.get<any>('/officer-app/profile');
    }

    async getMyBeatCitizens(params?: { page?: number; limit?: number; search?: string }) {
        return this.get<any>('/officer-app/dashboard/citizens', { params });
    }


    async viewDocument(fileUrl: string) {
        if (!fileUrl) return;

        try {
            // Handle cloud URLs directly (if external)
            if (fileUrl.startsWith('http') && !fileUrl.includes(window.location.host)) {
                window.open(fileUrl, '_blank');
                return;
            }

            // Get token
            const token = this.getAccessToken();
            if (!token) {
                console.error("No access token found for document view");
                alert("You must be logged in to view documents.");
                return;
            }

            // Construct Full URL or API URL
            let fullUrl = fileUrl;

            // Logic to switch to API endpoint for /uploads/
            // Original URL: http://localhost:3000/uploads/documents/foo.pdf
            // Target API: http://localhost:3000/api/v1/files/serve/documents/foo.pdf
            if (fileUrl.includes('/uploads/')) {
                const parts = fileUrl.split('/uploads/');
                if (parts.length > 1) {
                    const relativePath = parts[1]; // e.g. "documents/foo.pdf"
                    const pathSegments = relativePath.split('/');

                    if (pathSegments.length >= 2) {
                        const folder = pathSegments[0];
                        const filename = pathSegments.slice(1).join('/'); // technically serveFile might not support nested / but we try.
                        // Actually serveFile controller BLOCKS slashes in filename.
                        // So we can only support 1 level deep (folder/file).
                        // If standard upload, it is folder/file.

                        fullUrl = `${this.baseURL}/files/serve/${folder}/${filename}`;
                        console.log(`[ViewDocument] Converted static URL to API: ${fullUrl}`);
                    }
                }
            } else {
                 fullUrl = fileUrl.startsWith('http')
                    ? fileUrl
                    : `${window.location.origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
            }

            console.log(`[ViewDocument] Fetching securely: ${fullUrl}`);

            const response = await fetch(fullUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Access Denied (403) - You do not have permission to view this file.");
                }
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            // Create object URL from blob
            const blobUrl = URL.createObjectURL(blob);

            // Open in new tab
            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) {
                alert("Please allow popups to view this document.");
            }

            // Clean up the object URL after a delay (e.g. 1 minute) to allow time for the new tab to load it
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

        } catch (error: any) {
            console.error("View doc error", error);
            alert(error.message || "Error viewing document");
        }
    }

    async uploadDocument(file: File, documentType: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        return this.post<any>('/citizen-profile/documents', formData, {
            headers: { 'Content-Type': null }
        });
    }

    async uploadCitizenDocument(citizenId: string, file: File, documentType: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        return this.post<any>(`/citizens/${citizenId}/documents`, formData, {
            headers: { 'Content-Type': null }
        });
    }

    // Citizen APIs
    async getCitizens(params?: {
        page?: number;
        limit?: number;
        search?: string;
        policeStationId?: string;
        beatId?: string;
        vulnerabilityLevel?: string;
        verificationStatus?: string;
    }) {
        return this.get<any>('/citizens', { params });
    }

    async getCitizenById(id: string) {
        return this.get<any>(`/citizens/${id}`);
    }

    async createCitizen(data: any) {
        return this.post<any>('/citizens', data);
    }

    async updateCitizen(id: string, data: any) {
        return this.put<any>(`/citizens/${id}`, data);
    }

    async deleteCitizen(id: string) {
        return this.delete<any>(`/citizens/${id}`);
    }

    // Officer Management APIs
    async getOfficers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        policeStationId?: string;
        districtId?: string;
        beatId?: string;
        isActive?: boolean;
        hasBeat?: boolean;
    }) {
        return this.get<any>('/officers', { params });
    }

    async getOfficerById(id: string) {
        return this.get<any>(`/officers/${id}`);
    }

    async createOfficer(data: any) {
        return this.post<any>('/officers', data);
    }

    async updateOfficer(id: string, data: any) {
        return this.put<any>(`/officers/${id}`, data);
    }

    async deleteOfficer(id: string) {
        return this.delete<any>(`/officers/${id}`);
    }

    async updateVerificationStatus(id: string, status: string, remarks?: string) {
        return this.patch<any>(`/citizens/${id}/verification`, { status, remarks });
    }

    async issueDigitalCard(id: string) {
        return this.post<any>(`/citizens/${id}/digital-card`);
    }

    async transferOfficer(id: string, data: { newBeatId: string | null; newPoliceStationId?: string; effectiveDate?: string; reason?: string }) {
        // If beatId is null (unassign), we might need a specific endpoint or handle it in transfer
        // For now assuming backend handles null beatId as unassignment if logic permits,
        // OR we use a specific unassign endpoint.
        // Based on OfficerController, transferOfficer expects newBeatId.
        // If unassigning, we might need to add an unassign endpoint or modify transfer logic.
        // Let's assume for now we pass null but the controller might expect a string.
        // Checking controller: "if (!newBeatId) throw ..." - so standard transfer needs a beat.
        // We need a separate method for unassignment or rely on assignToBeat for simple updates.

        // If existing controller assignToBeat works for simple updates:
        if (data.newBeatId === null) {
             // Use assignToBeat with null (if supported) or a different approach
             // The assignToBeat controller: "const { beatId } = req.body; ... data: { beatId }"
             // So passing null should work for unassignment if prisma allows it.
             return this.post<any>(`/officers/${id}/assign-beat`, { beatId: null });
        }

        // For actual transfer with side effects:
        return this.post<any>(`/officers/${id}/transfer`, data);
    }

    async assignOfficerToBeat(id: string, beatId: string | null) {
        return this.post<any>(`/officers/${id}/assign-beat`, { beatId });
    }

    async getCitizenStatistics(params?: { policeStationId?: string; beatId?: string }) {
        return this.get<any>('/citizens/statistics', { params });
    }

    // Citizen Authentication
    async loginCitizen(data: { mobileNumber: string; password: string }) {
        const result = await this.post<any>('/citizen-auth/login', data);
        this.storeTokens(result.data?.tokens);
        if (typeof window !== 'undefined') {
            localStorage.setItem('userType', 'citizen');
        }
        return result;
    }

    async registerCitizen(data: { mobileNumber: string; password: string }) {
        return this.post<any>('/citizen-auth/register', data);
    }

    async requestCitizenOTP(mobileNumber: string) {
        const result = await this.post<any>('/citizen-auth/otp/request', { mobileNumber });

        // Log OTP to browser console in development
        if (process.env.NODE_ENV !== 'production' && result.data?.otp) {
            console.log('\n' + '='.repeat(60));
            console.log('%c🔐 OTP FOR CITIZEN LOGIN', 'color: #4F46E5; font-size: 16px; font-weight: bold;');
            console.log('='.repeat(60));
            console.log(`%c📱 Mobile: ${mobileNumber}`, 'color: #059669; font-size: 14px;');
            console.log(`%c🔢 OTP Code: ${result.data.otp}`, 'color: #DC2626; font-size: 18px; font-weight: bold;');
            console.log(`%c⏰ Expires: ${new Date(result.data.expiresAt).toLocaleTimeString()}`, 'color: #EA580C; font-size: 14px;');
            console.log('='.repeat(60) + '\n');
        }

        return result;
    }

    async verifyCitizenOTP(mobileNumber: string, otp: string) {
        return this.post<any>('/citizen-auth/verify-otp', { mobileNumber, otp }, {
            headers: { skipAuth: 'true' }
        });
    }

    async forgotCitizenPassword(mobileNumber: string) {
        return this.post<any>('/citizen-auth/forgot-password', { mobileNumber });
    }

    async resetCitizenPassword(data: { mobileNumber: string; otp: string; newPassword: string }) {
        return this.post<any>('/citizen-auth/reset-password', data);
    }

    // Citizen Profile APIs (Authenticated)
    async getMyProfile() {
        return this.get<any>('/citizen-profile/profile');
    }

    async updateMyProfile(data: any) {
        return this.patch<any>('/citizen-profile/profile', data);
    }

    async getMyVisits(params?: any) {
        return this.get<any>('/citizen-portal/my-visits', { params });
    }

    async requestMyVisit(data: { preferredDate?: string; preferredTimeSlot?: string; visitType: string; notes?: string }) {
        return this.post<any>('/citizen-profile/visits/request', data);
    }

    async getMySOS() {
        return this.get<any>('/citizen-profile/sos');
    }

    async createMySOS(data: { latitude: number; longitude: number; address?: string }) {
        return this.post<any>('/citizen-profile/sos', data);
    }

    async getMyDocuments() {
        return this.get<any>('/citizen-profile/documents');
    }

    async uploadMyDocument(formData: FormData) {
        return this.post<any>('/citizen-profile/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    async updateMyNotifications(preferences: any) {
        return this.patch<any>('/citizen-profile/notifications', preferences);
    }

    async submitMyFeedback(data: { visitId: string; rating: number; comment?: string }) {
        return this.post<any>('/citizen-profile/feedback', data);
    }

    // Citizen portal APIs
    async startCitizenRegistration(data: { mobileNumber: string; fullName?: string }) {
        return this.post<any>('/citizen-portal/registrations/start', data);
    }

    async getCitizenRegistration(id: string) {
        return this.get<any>(`/citizen-portal/registrations/${id}`);
    }

    async getCitizenRegistrationDetails(id: string) {
        return this.get<any>(`/citizen-portal/registrations/${id}/details`);
    }

    async saveCitizenRegistrationStep(id: string, payload: { step?: string; data?: any; status?: string; otpVerified?: boolean }) {
        return this.patch<any>(`/citizen-portal/registrations/${id}`, payload);
    }

    async submitCitizenRegistration(id: string, citizenData: any) {
        return this.post<any>(`/citizen-portal/registrations/${id}/submit`, { citizenData });
    }

    async verifyCitizenRegistrationOTP(id: string, otp: string) {
        const result = await this.post<any>(`/citizen-portal/registrations/${id}/verify-otp`, { otp });

        // Explicitly store tokens to ensure persistence
        if (result.data && result.data.accessToken) {
            console.log('DEBUG: Storing registration tokens', result.data);
            this.setAccessToken(result.data.accessToken);
            if (result.data.refreshToken) {
                this.setRefreshToken(result.data.refreshToken);
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem('userType', 'citizen');
                // Store incomplete user profile if citizen is missing
                if (!result.data.citizen) {
                    localStorage.setItem('kutumb-app-user', JSON.stringify({
                        role: 'CITIZEN',
                        permissions: ['*'],
                        isRegistrationPending: true
                    }));
                }
            }
        } else {
            console.error('DEBUG: No access token in verify response', result);
        }

        return result;
    }

    async getCitizenRegistrations(params?: { status?: string }) {
        return this.get<any>('/citizen-portal/registrations', { params });
    }

    async updateCitizenRegistrationStatus(id: string, data: { status: string; remarks?: string }) {
        return this.patch<any>(`/citizen-portal/registrations/${id}/status`, data);
    }

    async createCitizenVisitRequest(citizenId: string, data: { preferredDate?: string; preferredTimeSlot?: string; visitType?: string; notes?: string }) {
        return this.post<any>(`/citizen-portal/citizens/${citizenId}/visit-requests`, data);
    }

    async createRegistrationVisitRequest(registrationId: string, data: { preferredDate?: string; preferredTimeSlot?: string; visitType?: string; notes?: string }) {
        return this.post<any>(`/citizen-portal/registrations/${registrationId}/visit-requests`, data);
    }

    async getVisitRequests(params?: { status?: string }) {
        return this.get<any>('/citizen-portal/visit-requests', { params });
    }

    async updateVisitRequest(id: string, status: string) {
        return this.patch<any>(`/citizen-portal/visit-requests/${id}`, { status });
    }

    // Vulnerability configuration APIs
    async getVulnerabilityConfig() {
        return this.get<any>('/vulnerability/config');
    }

    async getVulnerabilityConfigHistory() {
        return this.get<any>('/vulnerability/config/history');
    }

    async previewVulnerabilityImpact(data: { weights: any; bands: any[] }) {
        return this.post<any>('/vulnerability/preview', data);
    }

    async updateVulnerabilityConfig(data: { weights: any; bands: any[]; notes?: string }) {
        return this.post<any>('/vulnerability/config', data);
    }

    // Role & Permission APIs
    async getRoles() {
        return this.get<any>('/roles');
    }

    async createRole(data: any) {
        return this.post<any>('/roles', data);
    }

    async updateRole(id: string, data: any) {
        return this.put<any>(`/roles/${id}`, data);
    }

    async deleteRole(id: string) {
        return this.delete<any>(`/roles/${id}`);
    }

    async getRoleMatrix() {
        return this.get<any>('/roles/matrix');
    }

    async getDistricts() {
        return this.get<any>('/masters/districts');
    }

    async getPoliceStations(params?: { districtId?: string }) {
        return this.get<any>('/masters/police-stations', { params });
    }

    async getPublicMasters() {
        return this.get<any>('/masters/all');
    }

    // User management APIs
    async getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: 'active' | 'inactive';
    }) {
        return this.get<any>('/users', { params });
    }

    async updateUserRole(id: string, roleCode: string) {
        return this.put<any>(`/users/${id}/role`, { roleCode });
    }

    async updateUserStatus(id: string, isActive: boolean) {
        return this.patch<any>(`/users/${id}`, { isActive });
    }

    async createUser(data: { email: string; phone: string; roleCode: string; password?: string }) {
        return this.post<any>('/users', data);
    }

    // Visit APIs
    async getVisits(params?: {
        page?: number;
        limit?: number;
        status?: string;
        officerId?: string;
        citizenId?: string;
        startDate?: string;
        endDate?: string;
    }) {
        return this.get<any>('/visits', { params });
    }

    async createVisit(data: any) {
        return this.post<any>('/visits', data);
    }

    async completeVisit(id: string, data: any) {
        return this.post<any>(`/visits/${id}/complete`, data);
    }

    async cancelVisit(id: string, reason: string) {
        return this.post<any>(`/visits/${id}/cancel`, { reason });
    }

    async getCalendar(startDate: string, endDate: string, params?: any) {
        return this.get<any>('/visits/calendar', { params: { startDate, endDate, ...params } });
    }

    async getVisitById(id: string) {
        return this.get<any>(`/visits/${id}`);
    }

    async updateVisit(id: string, data: any) {
        return this.put<any>(`/visits/${id}`, data);
    }

    async autoScheduleVisits(data: { startDate: string; endDate: string }) {
        return this.post<any>('/visits/auto-schedule', data);
    }

    async getOfficerAssignments(params?: { status?: string }) {
        return this.get<any>('/officer-app/assignments', { params });
    }



    async startVisit(id: string, coords?: { latitude?: number; longitude?: number }) {
        return this.post<any>(`/visits/${id}/start`, coords);
    }

    async officerCompleteVisit(id: string, payload: {
        assessmentData?: any;
        riskScore?: number;
        photoUrl?: string;
        notes?: string;
        gpsLatitude?: number;
        gpsLongitude?: number;
        duration?: number;
    }) {
        return this.post<any>(`/visits/${id}/officer-complete`, payload);
    }

    // SOS APIs
    async createSOSAlert(latitude: number, longitude: number, address?: string) {
        return this.post<any>('/sos', { latitude, longitude, address });
    }

    async getActiveAlerts(params?: { policeStationId?: string; beatId?: string }) {
        return this.get<any>('/sos/active', { params });
    }

    async updateSOSStatus(id: string, status: string, notes?: string) {
        return this.patch<any>(`/sos/${id}/status`, { status, notes });
    }

    async updateSOSLocation(id: string, data: { latitude: number; longitude: number; batteryLevel?: number; deviceInfo?: string }) {
        return this.post<any>(`/sos/${id}/location`, data);
    }

    // Report APIs
    async getDashboardStats(params?: {
        policeStationId?: string;
        beatId?: string;
        startDate?: string;
        endDate?: string;
    }) {
        return this.get<any>('/reports/dashboard', { params });
    }

    async getCitizenDemographics(params?: { policeStationId?: string; beatId?: string }) {
        return this.get<any>('/reports/demographics', { params });
    }

    async getVisitAnalytics(params?: any) {
        return this.get<any>('/reports/visits', { params });
    }

    async getOfficerPerformance(params?: any) {
        return this.get<any>('/reports/performance', { params });
    }

    async exportData(type: string, format: string = 'csv', params?: any) {
        return this.get<any>('/reports/export', { params: { type, format, ...params } });
    }

    async getBeats(params?: { policeStationId?: string }) {
        // Use the SECURE beats endpoint which applies data scoping
        return this.get<any>('/beats', { params });
    }

    // GeoJSON APIs
    async getGeoDistricts() {
        return this.get<any>('/geo/districts');
    }

    async getGeoRanges() {
        return this.get<any>('/geo/ranges');
    }

    async getGeoSubDivisions() {
        return this.get<any>('/geo/sub-divisions');
    }

    async getGeoBoundaries() {
        return this.get<any>('/geo/boundaries');
    }

    async getGeoPoliceStations() {
        return this.get<any>('/geo/police-stations');
    }

    // Audit Logs
    async getAuditLogs(params?: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: string;
        endDate?: string;
    }) {
        return this.get<any>('/system/audits/logs', { params });
    }

    // System Settings
    async getSettings() {
        return this.get<any>('/settings');
    }

    async updateSetting(key: string, value: any, description?: string) {
        return this.put<any>(`/settings/${key}`, { value, description });
    }

    // Roster APIs
    async getRosterItems(params?: { date?: string; shift?: string }) {
        return this.get<any>('/roster/items', { params });
    }

    async assignRosterItem(itemId: string, beatId: string, notes?: string) {
        return this.post<any>('/roster/assign', { itemId, beatId, notes });
    }

    async autoAssignRoster(date: string, shift: string) {
        return this.post<any>('/roster/auto-assign', { date, shift });
    }

    // System Config APIs
    async getSystemConfig() {
        return this.get<any>('/system-config');
    }

    async updateSystemConfig(configs: Record<string, any>) {
        return this.put<any>('/system-config', { configs });
    }

    // Bulk Masters API
    async getAllMasters() {
        return this.get<any>('/masters/all');
    }

    // Living Arrangements
    async getLivingArrangements() {
        return this.get<any>('/masters/living-arrangements');
    }

    async getHealthConditions() {
        return this.get<any>('/masters/health-conditions');
    }

    // ============================================
    // PERMISSION MANAGEMENT APIs
    // ============================================

    /**
     * Get all permissions with hierarchical structure
     */
    async getAllPermissions() {
        return this.get<any>('/permissions/all');
    }

    /**
     * Get permissions grouped by category
     */
    async getPermissionCategories() {
        return this.get<any>('/permissions/categories');
    }

    /**
     * Get only menu items
     */
    async getMenuItems() {
        return this.get<any>('/permissions/menu-items');
    }

    /**
     * Get current user's permissions
     */
    async getMyPermissions() {
        return this.get<any>('/permissions/my-permissions');
    }

    /**
     * Get permission by ID
     */
    async getPermissionById(id: string) {
        return this.get<any>(`/permissions/${id}`);
    }

    /**
     * Create new permission
     */
    async createPermission(data: any) {
        return this.post<any>('/permissions', data);
    }

    /**
     * Update permission
     */
    async updatePermission(id: string, data: any) {
        return this.put<any>(`/permissions/${id}`, data);
    }

    /**
     * Delete permission
     */
    async deletePermission(id: string) {
        return this.delete<any>(`/permissions/${id}`);
    }

    /**
     * Get all permission categories
     */
    async getAllCategories() {
        return this.get<any>('/permissions/categories/all');
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: string) {
        return this.get<any>(`/permissions/categories/${id}`);
    }

    /**
     * Create new category
     */
    async createCategory(data: any) {
        return this.post<any>('/permissions/categories', data);
    }

    /**
     * Update category
     */
    async updateCategory(id: string, data: any) {
        return this.put<any>(`/permissions/categories/${id}`, data);
    }

    /**
     * Delete category
     */
    async deleteCategory(id: string) {
        return this.delete<any>(`/permissions/categories/${id}`);
    }

    // Notification APIs
    async getNotifications(page = 1, limit = 20) {
        return this.get<any>('/notifications', { params: { page, limit } });
    }

    async markNotificationRead(id: string) {
        return this.patch<any>(`/notifications/${id}/read`);
    }

    async markAllNotificationsRead() {
        return this.patch<any>('/notifications/read-all');
    }

    async deleteNotification(id: string) {
        return this.delete<any>(`/notifications/${id}`);
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
