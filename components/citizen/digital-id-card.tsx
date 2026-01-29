'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

interface DigitalIdCardProps {
    citizen: any;
}

export function DigitalIdCard({ citizen }: DigitalIdCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!cardRef.current) {
            console.error('Card ref not found');
            return;
        }

        try {
            console.log('Starting download...');
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Delhi_Police_Senior_Citizen_Card_${citizen.digitalCardNumber || citizen.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('Download completed');
        } catch (err) {
            console.error('Failed to generate card image:', err);
            alert('Failed to download card. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const qrData = JSON.stringify({
        id: citizen.id,
        cardNo: citizen.digitalCardNumber || citizen.id,
        name: citizen.fullName,
        dob: citizen.dateOfBirth,
        emergencyContact: citizen.EmergencyContact?.[0]?.mobileNumber || '',
        policeStation: citizen.PoliceStation?.name || '',
    });

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '.');
    };

    const issueDate = citizen.createdAt ? formatDate(citizen.createdAt) : formatDate(new Date().toISOString());

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px' }} className="print:hidden">
                {/* <Button onClick={handlePrint} variant="outline" style={{ gap: '8px' }}>
                    <Printer style={{ height: '16px', width: '16px' }} /> Print Card
                </Button> */}
                <Button onClick={handleDownload} style={{ gap: '8px' }}>
                    <Download style={{ height: '16px', width: '16px' }} /> Download
                </Button>
            </div>

            {/* Cards Container */}
            <div ref={cardRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '850px' }}>

                {/* FRONT OF CARD */}
                <div style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eff6ff 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    border: '4px solid #d1d5db',
                    padding: '24px',
                    position: 'relative'
                }}>
                    {/* Watermark/Background Design */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.3,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 0
                    }}>
                        <img
                            src="/SeniorCitisenLogo.png"
                            alt="Watermark"
                            style={{
                                width: '300px',
                                height: '300px',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        borderBottom: '4px solid #eab308',
                        marginBottom: '24px',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        {/* Delhi Police Logo */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden'
                        }}>
                            <img
                                src="/logo-without-text.png"
                                alt="Delhi Police"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>

                        {/* Title */}
                        <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#b91c1c', margin: 0, letterSpacing: '-0.025em' }}>DELHI POLICE</h1>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px', margin: 0 }}>SENIOR CITIZEN CARD</h2>
                        </div>

                        {/* Right Logo */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #d1d5db',
                            flexShrink: 0,
                            overflow: 'hidden'
                        }}>
                            <img
                                src="/SeniorCitisenLogo.png"
                                alt="Senior Citizen Logo"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ display: 'flex', gap: '20px', paddingLeft: '20px', paddingRight: '24px', paddingBottom: '24px' }}>
                        {/* Photo */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', flexShrink: 0 }}>
                            <div style={{
                                width: '120px',
                                height: '150px',
                                border: '4px solid #1f2937',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: '#e5e7eb'
                            }}>
                                {citizen.photoUrl ? (
                                    <img src={citizen.photoUrl} alt="Citizen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1d5db', color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>
                                        PHOTO
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '12px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#000000' }}>ID. NO: {citizen.digitalCardNumber || '00000'}</p>
                            </div>
                        </div>

                        {/* Details and Signature Container */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px', position: 'relative', zIndex: 10 }}>
                            {/* Details */}
                            {/* Details */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', width: '112px', flexShrink: 0, color: '#000000' }}>NAME</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>{citizen.fullName}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', width: '112px', flexShrink: 0, color: '#000000' }}>D.O.B</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{formatDate(citizen.dateOfBirth)}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', width: '112px', flexShrink: 0, color: '#000000' }}>PH.NO.</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{citizen.mobileNumber}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', width: '112px', flexShrink: 0, color: '#000000' }}>P.S</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>{citizen.PoliceStation?.name || 'N/A'}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', width: '112px', flexShrink: 0, color: '#000000' }}>ADDRESS</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1.2', color: '#000000' }}>
                                    {citizen.addressLine1 && citizen.addressLine2
                                        ? `${citizen.addressLine1}, ${citizen.addressLine2}, ${citizen.city || ''}`
                                        : citizen.permanentAddress || 'N/A'}
                                </span>
                            </div>

                            {/* Signature - Fixed positioning */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingRight: '24px', alignItems: 'flex-end', flex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px', lineHeight: 1 }}>✒</div>
                                    <div style={{ borderTop: '2px solid #000000', width: '96px' }}></div>
                                    <p style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '2px', textAlign: 'center', margin: '2px 0 0 0', color: '#000000', whiteSpace: 'nowrap' }}>Issuing Authority</p>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* BACK OF CARD */}
                <div style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eff6ff 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    border: '4px solid #d1d5db',
                    padding: '32px',
                    position: 'relative'
                }}>
                    {/* Watermark/Background Design */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.3,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 0
                    }}>
                        <img
                            src="/SeniorCitisenLogo.png"
                            alt="Watermark"
                            style={{
                                width: '300px',
                                height: '300px',
                                objectFit: 'contain'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 10 }}>
                        {/* Top Section */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', color: '#000000' }}>DATE OF ISSUE</span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{issueDate}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', color: '#000000' }}>EMERGENCY NO</span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{citizen.EmergencyContact?.[0]?.mobileNumber || 'N/A'}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', color: '#000000' }}>DOCTOR CONTACT NO</span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>:</span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{citizen.doctorContact || 'N/A'}</span>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div style={{ background: '#ffffff', padding: '8px', borderRadius: '4px', border: '2px solid #1f2937', marginLeft: '16px' }}>
                                <QRCodeSVG
                                    value={qrData}
                                    size={100}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        {/* Helpline */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
                            <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.5)', padding: '12px 24px', borderRadius: '8px', border: '2px solid #1f2937' }}>
                                <p style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '0.05em', margin: 0, color: '#000000' }}>
                                    SENIOR CITIZEN HELPLINE NUMBER-1291  <span style={{ margin: '0 8px' }}>|</span> ERSS-112
                                </p>
                            </div>
                        </div>

                        {/* Bottom Notices */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: '#fef9c3', border: '2px solid #ca8a04', borderRadius: '8px', padding: '8px 16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', margin: 0, color: '#000000' }}>
                                    VALID UPTO: 3 YEARS FROM THE DATE OF ISSUE
                                </p>
                            </div>

                            <div style={{ background: '#fef2f2', border: '2px solid #dc2626', borderRadius: '8px', padding: '12px 16px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.5', margin: 0, color: '#000000' }}>
                                    IN CASE, THIS CARD IS LOST/ FOUND, KINDLY INFORM<br />
                                    RETURN TO THE NEAREST POLICE STATION
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', maxWidth: '800px', marginTop: '16px' }} className="print:hidden">
                This digital card is a valid proof of registration with Delhi Police Senior Citizen Portal.
                Valid for 3 years from date of issue. Can be used for emergency verification.
            </p>
        </div>
    );
}
