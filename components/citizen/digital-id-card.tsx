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

            {/* Print styles for true physical CR80 (85.6mm × 54mm) */}
            <style>{`
                @media print {
                    .cr80-card-list {
                        max-width: none !important;
                        gap: 8mm !important;
                    }
                    .cr80-card {
                        width: 85.6mm !important;
                        height: 54mm !important;
                        border-radius: 3.18mm !important;
                        box-shadow: none !important;
                        page-break-inside: avoid;
                    }
                }
            `}</style>

            {/* Cards Container (CR80: 85.6 × 54 mm) */}
            <div ref={cardRef} className="cr80-card-list" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '540px' }}>

                {/* ══════════════════════════════════════ */}
                {/*           FRONT OF CARD               */}
                {/* ══════════════════════════════════════ */}
                <div className="cr80-card" style={{
                    width: '100%',
                    aspectRatio: '85.6 / 54',
                    display: 'flex',
                    flexDirection: 'column',
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
                        padding: '8px 14px',
                        flexShrink: 0,
                    }}>
                        {/* Left Logo */}
                        <div style={{
                            width: '46px', height: '46px',
                            borderRadius: '6px',
                            flexShrink: 0,
                            background: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img src="/logo-without-text.png" alt="Delhi Police" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                        </div>

                        {/* Title */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '21px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1.5px', lineHeight: 1.1 }}>DELHI POLICE</div>
                            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '2px', marginTop: '2px' }}>SENIOR CITIZEN  CARD</div>
                        </div>

                        {/* Right Logo */}
                        <div style={{
                            width: '46px', height: '46px',
                            borderRadius: '6px',
                            flexShrink: 0,
                            background: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img src="/SeniorCitisenLogo.png" alt="Senior Citizen" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div style={{
                        background: '#ededd1',
                        padding: '14px 16px 12px 16px',
                        position: 'relative',
                        flex: 1,
                        minHeight: 0,
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
                            opacity: 0.15,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}>
                            <img src="/SeniorCitisenLogo.png" alt="" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '14px', position: 'relative', zIndex: 1 }}>
                            {/* Photo */}
                            <div style={{ flexShrink: 0 }}>
                                <div style={{
                                    width: '94px',
                                    height: '116px',
                                    border: '2px solid #556B2F',
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
                                            fontSize: '11px', fontWeight: 'bold',
                                        }}>PHOTO</div>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                <div>
                                    {/* NAME */}
                                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', width: '78px', flexShrink: 0, color: '#000' }}>NAME</span>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', marginRight: '6px' }}>:</span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#000', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{citizen.fullName || 'N/A'}</span>
                                    </div>
                                    {/* D.O.B */}
                                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', width: '78px', flexShrink: 0, color: '#000' }}>D.O.B</span>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', marginRight: '6px' }}>:</span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#000' }}>{formatDate(citizen.dateOfBirth)}</span>
                                    </div>
                                    {/* PH.NO. */}
                                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', width: '78px', flexShrink: 0, color: '#000' }}>PH.NO.</span>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', marginRight: '6px' }}>:</span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#000' }}>{citizen.mobileNumber || 'N/A'}</span>
                                    </div>
                                    {/* P.S */}
                                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', width: '78px', flexShrink: 0, color: '#000' }}>P.S</span>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', marginRight: '6px' }}>:</span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#000', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{citizen.PoliceStation?.name || 'N/A'}</span>
                                    </div>
                                    {/* ADDRESS */}
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', width: '78px', flexShrink: 0, color: '#000' }}>ADDRESS</span>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', marginRight: '6px' }}>:</span>
                                        <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#000', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {citizen.addressLine1 && citizen.addressLine2
                                                ? `${citizen.addressLine1}, ${citizen.addressLine2}, ${citizen.city || ''}`
                                                : citizen.permanentAddress || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: ID Number & Issuing Authority */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '900', color: '#000' }}>ID.NO :  {citizen.digitalCardNumber || '00000'}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ borderTop: '1.5px solid #000', width: '110px' }} />
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#000', marginTop: '3px', letterSpacing: '0.4px' }}>Issuing Authority</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════ */}
                {/*           BACK OF CARD                */}
                {/* ══════════════════════════════════════ */}
                <div className="cr80-card" style={{
                    width: '100%',
                    aspectRatio: '85.6 / 54',
                    display: 'flex',
                    flexDirection: 'column',
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
                        padding: '8px 14px',
                        flexShrink: 0,
                    }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '6px', flexShrink: 0, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/logo-without-text.png" alt="Delhi Police" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '21px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1.5px', lineHeight: 1.1 }}>DELHI POLICE</div>
                            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '2px', marginTop: '2px' }}>SENIOR CITIZEN  CARD</div>
                        </div>
                        <div style={{ width: '46px', height: '46px', borderRadius: '6px', flexShrink: 0, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/SeniorCitisenLogo.png" alt="Senior Citizen" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div style={{
                        background: '#ededd1',
                        padding: '14px 16px',
                        position: 'relative',
                        flex: 1,
                        minHeight: 0,
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
                            <img src="/SeniorCitisenLogo.png" alt="" style={{ width: '165px', height: '165px', objectFit: 'contain' }} />
                        </div>

                        {/* Top: Details + QR */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div>
                                {/* DATE OF ISSUE */}
                                <div style={{ display: 'flex', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000' }}>DARE OF ISSUE</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', margin: '0 6px' }}>:</span>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#000' }}>{issueDate}</span>
                                </div>
                                {/* EMERGENCY NO */}
                                <div style={{ display: 'flex', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000' }}>EMERGENCY NO</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', margin: '0 6px' }}>:</span>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#000' }}>{citizen.EmergencyContact?.[0]?.mobileNumber || 'N/A'}</span>
                                </div>
                                {/* DOCTOR CONTACT NO */}
                                <div style={{ display: 'flex', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000' }}>DOCTORE CONTACT NO</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', margin: '0 6px' }}>:</span>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#000' }}>{citizen.doctorContact || 'N/A'}</span>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div style={{
                                background: '#ffffff',
                                padding: '4px',
                                borderRadius: '4px',
                                border: '1.5px solid #333',
                                flexShrink: 0,
                                marginLeft: '12px',
                            }}>
                                <QRCodeSVG
                                    value={qrData}
                                    size={74}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        {/* Helpline Banner */}
                        <div style={{
                            borderRadius: '30px',
                            position: 'relative',
                            zIndex: 1,
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: 900,
                            color: '#000000ff',
                            letterSpacing: '0.6px',
                        }}>
                            SENIOR CITIZEN HELPLINE NUMBER - 1291 &nbsp;|&nbsp; ERSS - 112
                        </div>

                        {/* Validity Banner */}
                        <div style={{
                            borderRadius: '30px',
                            position: 'relative',
                            zIndex: 1,
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: 900,
                            color: '#000000ff',
                            letterSpacing: '0.6px',
                        }}>
                            VALID UPTO : 3 YEARS FROM THE DATE OF ISSUE
                        </div>

                        {/* Lost/Found Notice */}
                        <div style={{
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1,
                        }}>
                            <span style={{
                                fontSize: '9.5px',
                                fontWeight: '800',
                                color: '#000000ff',
                                lineHeight: '1.35',
                                letterSpacing: '0.4px',
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
