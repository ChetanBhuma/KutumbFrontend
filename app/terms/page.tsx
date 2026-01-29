import React from 'react';

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Terms of Service</h1>

            <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 mb-6">Last Updated: November 26, 2025</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing or using the Senior Citizen Welfare Portal ("Service"), you agree to be bound by these Terms.
                    If you disagree with any part of the terms then you may not access the Service.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Eligibility</h2>
                <p className="mb-4">
                    You must be a senior citizen (aged 60 years or above) residing in Delhi to register for this Service.
                    By registering, you represent and warrant that you meet these eligibility requirements.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
                <p className="mb-4">
                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                    Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                </p>
                <p className="mb-4">
                    You are responsible for safeguarding the password that you use to access the Service and for any activities or actions
                    under your password.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Emergency Services</h2>
                <p className="mb-4">
                    The SOS feature is intended for genuine emergencies only. Misuse of the emergency SOS feature may lead to legal action
                    and termination of service. While we strive to provide prompt response, response times may vary based on location,
                    traffic, and availability of personnel.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
                <p className="mb-4">
                    The Service and its original content, features and functionality are and will remain the exclusive property of
                    Delhi Police and its licensors.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termination</h2>
                <p className="mb-4">
                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever,
                    including without limitation if you breach the Terms.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes</h2>
                <p className="mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material
                    change will be determined at our sole discretion.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
                <p className="mb-4">If you have any questions about these Terms, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>By email: legal@delhipolice.gov.in</li>
                    <li>By phone: 1291</li>
                </ul>
            </div>
        </div>
    );
}
