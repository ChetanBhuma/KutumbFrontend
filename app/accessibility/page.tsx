import React from 'react';

export default function AccessibilityPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Accessibility Statement</h1>

            <div className="prose prose-blue max-w-none">
                <p className="lead text-lg text-gray-600 mb-6">
                    Delhi Police is committed to ensuring that the Senior Citizen Welfare Portal is accessible to all users,
                    irrespective of device in use, technology or ability. It has been built, with an aim to provide maximum
                    accessibility and usability to its visitors.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Conformance Status</h2>
                <p className="mb-4">
                    We have made our best efforts to ensure that all information on this website is accessible to people with disabilities.
                    For example, a user with visual disability can access this website using assistive technologies, such as screen readers
                    and screen magnifiers.
                </p>
                <p className="mb-4">
                    We also aim to be standards compliant and follow principles of usability and universal design, which should help all
                    visitors of this website. This website is designed to meet Level AA of the Web Content Accessibility Guidelines (WCAG) 2.0
                    laid down by the World Wide Web Consortium (W3C). Part of the information in the website is also made available through
                    links to external Websites. External Websites are maintained by the respective departments who are responsible for making
                    these sites accessible.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Accessibility Features</h2>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li><strong>Skip to Main Content:</strong> Quick access to the core content of the page.</li>
                    <li><strong>Text Size Adjustment:</strong> Users can increase or decrease the text size for better readability.</li>
                    <li><strong>High Contrast Mode:</strong> Option to switch to high contrast mode for users with low vision.</li>
                    <li><strong>Descriptive Alt Text:</strong> All images have alternative text descriptions.</li>
                    <li><strong>Keyboard Navigation:</strong> The entire site can be navigated using a keyboard.</li>
                    <li><strong>Consistent Navigation:</strong> Consistent layout and navigation mechanisms across the website.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Feedback</h2>
                <p className="mb-4">
                    We welcome your feedback on the accessibility of the Senior Citizen Welfare Portal. Please let us know if you encounter
                    accessibility barriers on this website:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li><strong>Phone:</strong> 1291 (Senior Citizen Helpline)</li>
                    <li><strong>Email:</strong> accessibility@delhipolice.gov.in</li>
                    <li><strong>Address:</strong> Police Headquarters, Jai Singh Road, New Delhi - 110001</li>
                </ul>
            </div>
        </div>
    );
}
