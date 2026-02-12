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
                <Button onClick={handleDownload} style={{ gap: '8px' }}>
                    <Download style={{ height: '16px', width: '16px' }} /> Download
                </Button>
            </div>

            {/* Cards Container */}
            <div ref={cardRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '850px' }}>

                {/* ══════════════════════════════════════ */}
                {/*           FRONT OF CARD               */}
                {/* ══════════════════════════════════════ */}
                <div style={{
                    width: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}>
                    {/* ── Header ── */}
                    <div style={{
                        background: '#556B2F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 24px',
                    }}>
                        {/* Left Logo */}
                        <div style={{
                            width: '76px', height: '76px',
                            borderRadius: '8px',
                            flexShrink: 0,
                            background: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img src="/logo-without-text.png" alt="Delhi Police" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>

                        {/* Title */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '34px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '2px', lineHeight: 1.1 }}>DELHI POLICE</div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '3px', marginTop: '2px' }}>SENIOR CITIZEN  CARD</div>
                        </div>

                        {/* Right Logo */}
                        <div style={{
                            width: '76px', height: '76px',
                            borderRadius: '8px',
                            flexShrink: 0,
                            background: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img src="/SeniorCitisenLogo.png" alt="Senior Citizen" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div style={{
                        background: '#ededd1',
                        padding: '28px 28px 24px 28px',
                        position: 'relative',
                        minHeight: '340px',
                    }}>
                        {/* Watermark - centered */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            opacity: 0.15,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}>
                            <img src="/SeniorCitisenLogo.png" alt="" style={{ width: '260px', height: '260px', objectFit: 'contain' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '28px', position: 'relative', zIndex: 1 }}>
                            {/* Photo */}
                            <div style={{ flexShrink: 0 }}>
                                <div style={{
                                    width: '140px',
                                    height: '170px',
                                    border: '3px solid #556B2F',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    background: '#e5e7eb',
                                }}>
                                    {citizen.photoUrl ? (
                                        <img src={citizen.photoUrl} alt="Citizen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: '#d1d5db', color: '#6b7280',
                                            fontSize: '14px', fontWeight: 'bold',
                                        }}>PHOTO</div>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    {/* NAME */}
                                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', width: '120px', flexShrink: 0, color: '#000' }}>NAME</span>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', marginRight: '8px' }}>:</span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000', textTransform: 'uppercase' }}>{citizen.fullName || 'N/A'}</span>
                                    </div>
                                    {/* D.O.B */}
                                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', width: '120px', flexShrink: 0, color: '#000' }}>D.O.B</span>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', marginRight: '8px' }}>:</span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{formatDate(citizen.dateOfBirth)}</span>
                                    </div>
                                    {/* PH.NO. */}
                                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', width: '120px', flexShrink: 0, color: '#000' }}>PH.NO.</span>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', marginRight: '8px' }}>:</span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{citizen.mobileNumber || 'N/A'}</span>
                                    </div>
                                    {/* P.S */}
                                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', width: '120px', flexShrink: 0, color: '#000' }}>P.S</span>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', marginRight: '8px' }}>:</span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000', textTransform: 'uppercase' }}>{citizen.PoliceStation?.name || 'N/A'}</span>
                                    </div>
                                    {/* ADDRESS */}
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', width: '120px', flexShrink: 0, color: '#000' }}>ADDRESS</span>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', marginRight: '8px' }}>:</span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000', lineHeight: '1.4' }}>
                                            {citizen.addressLine1 && citizen.addressLine2
                                                ? `${citizen.addressLine1}, ${citizen.addressLine2}, ${citizen.city || ''}`
                                                : citizen.permanentAddress || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Signature Area - bottom right of details */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {/* Empty space for actual signature image in production */}
                                        <div style={{ width: '150px', height: '50px' }} />
                                        <div style={{ borderTop: '2px solid #000', width: '150px' }} />
                                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#000', marginTop: '4px', letterSpacing: '0.5px' }}>Issuing Authority</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ID Number - bottom left */}
                        <div style={{ position: 'absolute', bottom: '20px', left: '28px', zIndex: 1 }}>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: '#000' }}>ID.NO :  {citizen.digitalCardNumber || '00000'}</span>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════ */}
                {/*           BACK OF CARD                */}
                {/* ══════════════════════════════════════ */}
                <div style={{
                    width: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}>
                    {/* ── Header (same as front) ── */}
                    <div style={{
                        background: '#556421',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 24px',
                    }}>
                        <div style={{ width: '76px', height: '76px', borderRadius: '8px', flexShrink: 0, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/logo-without-text.png" alt="Delhi Police" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '34px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '2px', lineHeight: 1.1 }}>DELHI POLICE</div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '3px', marginTop: '2px' }}>SENIOR CITIZEN  CARD</div>
                        </div>
                        <div style={{ width: '76px', height: '76px', borderRadius: '8px', flexShrink: 0, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/SeniorCitisenLogo.png" alt="Senior Citizen" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div style={{
                        background: '#ededd1',
                        padding: '24px 28px 24px 28px',
                        position: 'relative',
                        minHeight: '340px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}>
                        {/* Watermark - centered */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            opacity: 0.12,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}>
                            <img src="/SeniorCitisenLogo.png" alt="" style={{ width: '280px', height: '280px', objectFit: 'contain' }} />
                        </div>

                        {/* Top: Details + QR */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div>
                                {/* DATE OF ISSUE */}
                                <div style={{ display: 'flex', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#000' }}>DARE OF ISSUE</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', margin: '0 8px' }}>:</span>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{issueDate}</span>
                                </div>
                                {/* EMERGENCY NO */}
                                <div style={{ display: 'flex', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#000' }}>EMERGENCY NO</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', margin: '0 8px' }}>:</span>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{citizen.EmergencyContact?.[0]?.mobileNumber || 'N/A'}</span>
                                </div>
                                {/* DOCTOR CONTACT NO */}
                                <div style={{ display: 'flex', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#000' }}>DOCTORE CONTACT NO</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#000', margin: '0 8px' }}>:</span>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{citizen.doctorContact || 'N/A'}</span>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div style={{
                                background: '#ffffff',
                                padding: '6px',
                                borderRadius: '4px',
                                border: '2px solid #333',
                                flexShrink: 0,
                                marginLeft: '16px',
                            }}>
                                <QRCodeSVG
                                    value={qrData}
                                    size={110}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        {/* Helpline Banner */}
                        <div style={{
                            // border: '2px solid #556421',
                            borderRadius: '30px',
                            position: 'relative',
                            zIndex: 1,
                            marginTop: '5px',
                            textAlign: 'center',
                            fontSize: '16px',
                            fontWeight: 900,
                            color: '#000000ff',
                            letterSpacing: '1px',
                        }}>
                            SENIOR CITIZEN HELPLINE NUMBER - 1291 &nbsp;|&nbsp; ERSS - 112
                        </div>

                        {/* Validity Banner */}
                        <div style={{
                            // border: '2px solid #DC2626',
                            borderRadius: '30px',
                            position: 'relative',
                            zIndex: 1,
                            marginTop: '5px',
                            textAlign: 'center',
                            fontSize: '16px',
                            fontWeight: 900,
                            color: '#000000ff',
                            letterSpacing: '1px',
                        }}>
                            VALID UPTO : 3 YEARS FROM THE DATE OF ISSUE
                        </div>

                        {/* Lost/Found Notice - red text */}
                        <div style={{
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1,
                            marginTop: '5px',
                        }}>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '800',
                                color: '#000000ff',
                                lineHeight: '1.6',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            }}>
                                IN CASE, THIS CARD IS LOST/FOUND, KINDLY INFORM RETURN TO THE NEAREST POLICE STATION
                            </span>
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
