import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy</h1>

            <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 mb-6">Last Updated: November 26, 2025</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
                <p className="mb-4">
                    Delhi Police ("we", "us", or "our") operates the Senior Citizen Welfare Portal (the "Service").
                    This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service
                    and the choices you have associated with that data.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information Collection and Use</h2>
                <p className="mb-4">
                    We collect several different types of information for various purposes to provide and improve our Service to you.
                </p>
                <h3 className="text-xl font-medium mt-4 mb-2">Types of Data Collected</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li><strong>Personal Data:</strong> Name, Date of Birth, Gender, Aadhaar Number (optional), Address, Mobile Number.</li>
                    <li><strong>Health Data:</strong> Medical conditions, blood group, emergency medical information.</li>
                    <li><strong>Contact Data:</strong> Emergency contacts, family details.</li>
                    <li><strong>Location Data:</strong> We may use and store information about your location if you give us permission to do so.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Use of Data</h2>
                <p className="mb-4">Delhi Police uses the collected data for various purposes:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>To provide and maintain the Service</li>
                    <li>To notify you about changes to our Service</li>
                    <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                    <li>To provide customer care and support</li>
                    <li>To provide analysis or valuable information so that we can improve the Service</li>
                    <li>To monitor the usage of the Service</li>
                    <li>To detect, prevent and address technical issues</li>
                    <li>To coordinate welfare visits and emergency response</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
                <p className="mb-4">
                    The security of your data is important to us, but remember that no method of transmission over the Internet,
                    or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your
                    Personal Data, we cannot guarantee its absolute security.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
                <p className="mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>By email: privacy@delhipolice.gov.in</li>
                    <li>By phone: 1291</li>
                </ul>
            </div>
        </div>
    );
}
