"use client";

import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function PrivacyPage() {
    return (
        <LegalPageLayout title="Privacy Policy" lastUpdated="January 30, 2026">
            <p>
                <em>Last updated: January 30, 2026</em>
            </p>

            <h2>1. Introduction</h2>
            <p>
                Welcome to <strong>Saloon Book</strong> (the "Platform", "we", "us", or "our"), an online booking platform that connects users ("you", "your", "data principal") with salons, spas, beauty professionals, and other service providers ("Vendors", "Salons").
            </p>
            <p>
                We are committed to protecting your privacy and handling your personal data responsibly in accordance with applicable laws, including the <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP Act) of India, and generally accepted data protection principles.
            </p>
            <p>
                This Privacy Policy explains what personal data we collect, how we collect it, why we use it, with whom we may share it, how we protect it, and what rights you have regarding your personal data.
            </p>
            <p>
                By accessing or using the Saloon Book website, mobile application, or any related services (collectively, the "Services"), you consent to the practices described in this Privacy Policy. If you do not agree, please do not use our Services.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide Directly</h3>
            <ul>
                <li>Account registration data: full name, email address, mobile phone number, password / authentication credentials</li>
                <li>Booking-related data: selected services, appointment date & time, special requests, notes</li>
                <li>Payment-related data: billing name, payment method details (handled by PCI-DSS compliant third-party processors — we do not store full card numbers)</li>
                <li>Profile / preference data: gender (optional), preferred stylist, allergies or medical notes relevant to services, profile photo (optional)</li>
                <li>Communication data: messages sent to salons, support tickets, reviews & ratings you submit</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
                <li>Device & usage data: IP address, browser type & version, operating system, device identifiers, pages viewed, time spent, referral source</li>
                <li>Location data: approximate location derived from IP; precise geolocation only when you actively enable the "Find Salons Near Me" feature and give permission</li>
                <li>Cookies & similar technologies: session cookies, analytics cookies, preference cookies (see Section 10 below)</li>
            </ul>

            <h3>2.3 Information Received from Third Parties</h3>
            <ul>
                <li>Vendors/Salons may share limited confirmation or cancellation updates</li>
                <li>Payment gateways or fraud detection providers (anonymized risk signals only)</li>
                <li>Social login providers (if you choose to sign in with Google, Apple, etc.) — basic profile information</li>
            </ul>

            <h2>3. How We Use Your Personal Data</h2>
            <p>We process your personal data for the following purposes:</p>
            <ul>
                <li>To create and manage your user account</li>
                <li>To facilitate booking, rescheduling, and cancellation of appointments</li>
                <li>To send essential service communications (booking confirmations, reminders, cancellations, reschedule requests, payment receipts)</li>
                <li>To process payments and refunds (via third-party processors)</li>
                <li>To enable Vendors to prepare for and deliver the booked services</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To personalize your experience (e.g., showing recently viewed services or favorite salons)</li>
                <li>To detect, prevent, and investigate fraud, abuse, security incidents</li>
                <li>To improve the Platform, analyze usage trends, debug issues (aggregated/anonymized data)</li>
                <li>To comply with legal obligations, respond to court orders, protect rights & safety</li>
                <li>With your explicit consent — to send marketing communications, promotional offers, newsletters</li>
            </ul>

            <h2>4. Legal Basis for Processing (Under DPDP Act & Applicable Law)</h2>
            <p>We rely on the following lawful bases:</p>
            <ul>
                <li><strong>Consent</strong> — where you have given clear, informed, specific, free and unambiguous consent (you may withdraw consent at any time)</li>
                <li><strong>Performance of a contract</strong> — to provide the booking and related services you request</li>
                <li><strong>Legitimate interests</strong> — fraud prevention, platform security, service improvement (balanced against your rights)</li>
                <li><strong>Legal obligation</strong> — compliance with tax, accounting, consumer protection or other mandatory laws</li>
            </ul>

            <h2>5. Sharing & Disclosure of Your Personal Data</h2>
            <p>We do <strong>not</strong> sell your personal data. We share information only in these limited circumstances:</p>
            <ul>
                <li>With the specific Vendor/Salon you book with — only the data necessary for them to fulfill the appointment (name, phone, booked services, special requests, relevant medical notes you provided)</li>
                <li>With service providers / processors under strict contracts (payment gateways, cloud hosting, analytics providers, email/SMS delivery services, customer support tools) — they are bound to use data only for our purposes and to apply adequate security</li>
                <li>In case of merger, acquisition, or sale of assets — your data may be transferred as a business asset (with notice where required)</li>
                <li>To comply with law, protect rights, respond to subpoenas, court orders, or government requests</li>
                <li>To protect the safety, rights, or property of Saloon Book, our users, or the public</li>
            </ul>

            <h2>6. International Data Transfers</h2>
            <p>
                We may transfer your personal data to countries outside India (e.g., cloud servers in the US, EU, Singapore). When we do so, we ensure appropriate safeguards are in place (such as standard contractual clauses, adequacy decisions, or binding corporate rules) consistent with the DPDP Act and other applicable laws.
            </p>

            <h2>7. Data Retention</h2>
            <p>
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Policy, or as required by law (e.g., accounting, tax, or dispute resolution purposes). After that period, data is securely deleted or irreversibly anonymized.
            </p>
            <p>
                Typical retention periods (subject to change):
            </p>
            <ul>
                <li>Active account data — while your account remains active + 24 months after last activity</li>
                <li>Booking history — 5 years (for accounting & dispute purposes)</li>
                <li>Payment transaction metadata — as required by financial regulations (usually 7–10 years)</li>
            </ul>

            <h2>8. Your Rights as a Data Principal</h2>
            <p>Subject to applicable law (especially the DPDP Act), you have the right to:</p>
            <ul>
                <li>Access your personal data we hold</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Erase your data (subject to legal retention obligations)</li>
                <li>Restrict or object to certain processing</li>
                <li>Withdraw consent at any time (does not affect prior lawful processing)</li>
                <li>Data portability (where technically feasible)</li>
                <li>Grieve / complain to the Data Protection Board of India or other relevant authority</li>
            </ul>
            <p>
                To exercise these rights, please contact us at <a href="mailto:my.codecraftstudio@gmail.com">my.codecraftstudio@gmail.com</a>. We will respond within the timeframes prescribed by law (usually within 30 days).
            </p>

            <h2>9. Data Security</h2>
            <p>
                We implement commercially reasonable technical, organizational, and physical security measures (including encryption in transit & at rest, access controls, regular security assessments) to protect your personal data. However, no internet-based system is 100% secure — we cannot guarantee absolute security.
            </p>
            <p>
                In the unlikely event of a personal data breach, we will notify you and the relevant authorities as required by the DPDP Act and other applicable laws.
            </p>

            <h2>10. Cookies and Tracking Technologies</h2>
            <p>
                We use cookies, pixels, and similar technologies for essential functionality, analytics, and (with consent) marketing. You can manage preferences via our cookie banner or browser settings. For details, please refer to our separate <strong>Cookie Policy</strong> (if published) or contact us.
            </p>

            <h2>11. Children’s Privacy</h2>
            <p>
                Our Services are not directed to children under 18 years of age. We do not knowingly collect personal data from children. If we become aware that we have collected such data, we will delete it promptly.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. The updated version will be posted here with a revised "Last updated" date. Material changes will be communicated via email or in-app notification where appropriate.
            </p>

            <h2>13. Contact Us</h2>
            <p>
                If you have any questions, concerns, or wish to exercise your data rights, please contact:
            </p>
            <p>
                Email: <a href="mailto:my.codecraftstudio@gmail.com">my.codecraftstudio@gmail.com</a><br />
                We aim to respond within 7 business days.
            </p>

            <p>
                Thank you for trusting Saloon Book with your personal information.
            </p>
        </LegalPageLayout>
    );
}