"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Users, Phone, FileText, MapPin, Heart, CheckCircle, ArrowRight, Star, Clock, Award, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

// Banner Slider Component
function BannerSlider() {
    const [activeSlide, setActiveSlide] = useState(0)

    const slides = [
        {
            image: '/commissioner-banner.png',
            title: 'Message from the Commissioner',
            subtitle: 'Committed to the safety and welfare of our senior citizens through integrity, service, and modern technology.'
        },
        {
            image: '/cyber-safety-banner.png',
            title: 'Cyber Safety Awareness',
            subtitle: 'Interactive videos on cyber safety - protecting our seniors from online threats.'
        },
        // {
        //     image: '/senior-welfare-banner.png',
        //     title: 'Senior Welfare Program',
        //     subtitle: 'Dedicated officers ensuring the well-being and safety of our elderly citizens.'
        // },
        {
            image: '/emergency-sos-banner.png',
            title: '24/7 Emergency SOS',
            subtitle: 'One-touch emergency assistance with GPS tracking and instant police response.'
        }
    ]

    // Auto-rotate slides
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [slides.length])

    const nextSlide = () => {
        setActiveSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    return (
        <section className="relative bg-gradient-to-r from-gray-50 to-blue-50 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="container mx-auto relative">
                <div className="relative h-[400px] md:h-[500px] overflow-hidden group">
                    {/* Slides */}
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === activeSlide
                                ? 'opacity-100 translate-x-0'
                                : index < activeSlide
                                    ? 'opacity-0 -translate-x-full'
                                    : 'opacity-0 translate-x-full'
                                }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8 text-white max-w-3xl">
                                <div className="bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-xl border border-white/20 shadow-2xl">
                                    <p className="text-sm md:text-base font-semibold mb-2 text-blue-200">{slide.title}</p>
                                    <p className="text-lg md:text-xl font-medium">{slide.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6 text-white" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6 text-white" />
                    </button>

                    {/* Dots Navigation */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveSlide(index)}
                                className={`transition-all duration-300 rounded-full ${index === activeSlide
                                    ? 'bg-white w-8 h-3'
                                    : 'bg-white/50 hover:bg-white/75 w-3 h-3'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function LandingPage() {
    const [activeTestimonial, setActiveTestimonial] = useState(0)
    const [stats, setStats] = useState({
        citizens: 0,
        stations: 0,
        visits: 0,
        response: 0
    })

    // Animated counter effect
    useEffect(() => {
        const targetStats = {
            citizens: 12847,
            stations: 24,
            visits: 1500,
            response: 15
        }

        const duration = 2000
        const steps = 60
        const increment = {
            citizens: targetStats.citizens / steps,
            stations: targetStats.stations / steps,
            visits: targetStats.visits / steps,
            response: targetStats.response / steps
        }

        let currentStep = 0
        const timer = setInterval(() => {
            if (currentStep < steps) {
                setStats({
                    citizens: Math.floor(increment.citizens * currentStep),
                    stations: Math.floor(increment.stations * currentStep),
                    visits: Math.floor(increment.visits * currentStep),
                    response: Math.floor(increment.response * currentStep)
                })
                currentStep++
            } else {
                setStats(targetStats)
                clearInterval(timer)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [])

    // Auto-rotate testimonials
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const testimonials = [
        {
            name: "Mrs. Kamla Devi",
            age: 72,
            location: "Connaught Place",
            text: "The regular visits from beat officers make me feel safe and cared for. The SOS feature gives me peace of mind.",
            rating: 5
        },
        {
            name: "Mr. Rajesh Kumar",
            age: 68,
            location: "Rohini",
            text: "Excellent service! The officers are very respectful and helpful. My family feels relieved knowing I'm registered.",
            rating: 5
        },
        {
            name: "Mrs. Sunita Sharma",
            age: 75,
            location: "Dwarka",
            text: "The digital card and emergency contacts feature is wonderful. Technology made easy for senior citizens!",
            rating: 5
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Header with Delhi Police Branding */}
            <header className="sticky top-0 z-50 border-b bg-[#001f3f] shadow-lg backdrop-blur-sm" role="banner">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 relative group" aria-label="Delhi Police Logo">
                                <img
                                    src="/delhi-police-logo.png"
                                    alt="Delhi Police - Shanti Sewa Nyaya"
                                    className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="hidden md:block border-l border-white/20 pl-4">
                                <h1 className="text-xl font-bold text-white">Senior Citizen Welfare Portal</h1>
                                <p className="text-sm text-blue-100">Ensuring Safety & Care for Our Elders</p>
                            </div>
                        </div>
                        <nav className="flex items-center gap-4" aria-label="Main Navigation">
                            <Link href="/citizen-portal/login" aria-label="Login to Citizen Portal">
                                <Button variant="outline" className="border-white text-[#001f3f] hover:bg-blue-50 hover:text-[#001f3f] transition-all duration-300">
                                    Citizen Login
                                </Button>
                            </Link>
                            <Link href="/admin/login" aria-label="Login to Admin Portal">
                                <Button className="bg-white text-[#001f3f] hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Admin Login
                                </Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Enhanced Multi-Image Slider */}
            <BannerSlider />

            {/* Hero Section with Animated Background */}
            <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold animate-fade-in">
                        🏆 Trusted by 12,000+ Senior Citizens
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
                        Your Safety, <span className="text-[#0033A0]">Our Priority</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-200">
                        A comprehensive digital platform connecting senior citizens with Delhi Police for welfare visits,
                        emergency assistance, health monitoring, and community support.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap animate-slide-up animation-delay-400">
                        <Link href="/citizen-portal/register">
                            <Button size="lg" className="bg-[#0033A0] hover:bg-[#002080] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <Users className="mr-2 h-5 w-5" />
                                Register Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="#how-it-works">
                            <Button size="lg" variant="outline" className="border-2 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white transition-all duration-300">
                                <Shield className="mr-2 h-5 w-5" />
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Animated Stats Section */}
            <section className="py-16 bg-gradient-to-r from-[#0033A0] to-[#001f3f] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatCard
                            icon={<Users className="h-10 w-10" />}
                            value={stats.citizens.toLocaleString()}
                            label="Registered Citizens"
                            suffix="+"
                        />
                        <StatCard
                            icon={<MapPin className="h-10 w-10" />}
                            value={stats.stations}
                            label="Police Stations"
                        />
                        <StatCard
                            icon={<Heart className="h-10 w-10" />}
                            value={stats.visits.toLocaleString()}
                            label="Monthly Visits"
                            suffix="+"
                        />
                        <StatCard
                            icon={<Clock className="h-10 w-10" />}
                            value={stats.response}
                            label="Min Response Time"
                            suffix=" min"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works - Timeline */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
                        <p className="text-xl text-gray-600">Simple steps to get started</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0033A0] to-[#D4AF37] transform md:-translate-x-1/2"></div>

                            <TimelineStep
                                number={1}
                                title="Register Online"
                                description="Fill out the simple registration form with your details and verify your mobile number."
                                position="left"
                            />
                            <TimelineStep
                                number={2}
                                title="Complete Profile"
                                description="Add health information, emergency contacts, and preferences for welfare visits."
                                position="right"
                            />
                            <TimelineStep
                                number={3}
                                title="Get Verified"
                                description="Our team will verify your information and assign a beat officer to your area."
                                position="left"
                            />
                            <TimelineStep
                                number={4}
                                title="Stay Connected"
                                description="Receive regular visits, use emergency SOS, and stay updated through notifications."
                                position="right"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Slider */}
            {/* <section className="py-20 bg-gradient-to-br from-blue-50 to-amber-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">What Our Citizens Say</h3>
                        <p className="text-xl text-gray-600">Real experiences from our community</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
                                <CardContent className="p-8 md:p-12">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                                                <Star key={i} className="h-6 w-6 fill-[#D4AF37] text-[#D4AF37]" />
                                            ))}
                                        </div>
                                        <p className="text-xl text-gray-700 italic mb-6">
                                            "{testimonials[activeTestimonial].text}"
                                        </p>
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#0033A0] to-[#001f3f] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                                            {testimonials[activeTestimonial].name.charAt(0)}
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">{testimonials[activeTestimonial].name}</h4>
                                        <p className="text-gray-600">{testimonials[activeTestimonial].age} years • {testimonials[activeTestimonial].location}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-center gap-2 mt-6">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTestimonial(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeTestimonial
                                            ? 'bg-[#0033A0] w-8'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        aria-label={`View testimonial ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
                        <p className="text-xl text-gray-600">Trusted by thousands of families across Delhi</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<Award className="h-8 w-8" />}
                            title="Government Verified"
                            description="Official Delhi Police initiative"
                        />
                        <FeatureCard
                            icon={<Shield className="h-8 w-8" />}
                            title="Secure & Private"
                            description="Your data is protected"
                        />
                        <FeatureCard
                            icon={<Clock className="h-8 w-8" />}
                            title="24/7 Support"
                            description="Always here when you need us"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-8 w-8" />}
                            title="Proven Results"
                            description="12,000+ satisfied citizens"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section with Pattern Background */}
            <section className="py-20 bg-gradient-to-r from-[#0033A0] to-[#001f3f] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h3 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h3>
                    <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                        Join thousands of senior citizens who trust Delhi Police for their safety and welfare.
                    </p>
                    <Link href="/citizen-portal/register">
                        <Button size="lg" className="bg-white text-[#0033A0] hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 text-lg px-8 py-6">
                            <Users className="mr-2 h-6 w-6" />
                            Register Now - It's Free
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Delhi Police
                            </h4>
                            <p className="text-sm">Senior Citizen Welfare Portal</p>
                            <p className="text-sm mt-2 text-gray-400">Shanti Sewa Nyaya</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/citizen-portal/register" className="hover:text-white transition-colors">Register</Link></li>
                                <li><Link href="/citizen-portal/login" className="hover:text-white transition-colors">Citizen Login</Link></li>
                                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
                                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Information</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Emergency Contact</h4>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Police: <span className="text-white font-bold">100</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Ambulance: <span className="text-white font-bold">102</span>
                                </p>
                                <p className="text-gray-400 mt-4">Support: 1800-XXX-XXXX</p>
                                <p className="text-gray-400">Email: support@delhipolice.gov.in</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2024 Delhi Police. All rights reserved.</p>
                        <p className="text-gray-400 mt-2">Senior Citizen Welfare Portal v1.0</p>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.8s ease-out;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                    animation-fill-mode: backwards;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                    animation-fill-mode: backwards;
                }

                .bg-pattern {
                    background-image:
                        linear-gradient(30deg, #0033A0 12%, transparent 12.5%, transparent 87%, #0033A0 87.5%, #0033A0),
                        linear-gradient(150deg, #0033A0 12%, transparent 12.5%, transparent 87%, #0033A0 87.5%, #0033A0),
                        linear-gradient(30deg, #0033A0 12%, transparent 12.5%, transparent 87%, #0033A0 87.5%, #0033A0),
                        linear-gradient(150deg, #0033A0 12%, transparent 12.5%, transparent 87%, #0033A0 87.5%, #0033A0);
                    background-size: 80px 140px;
                    background-position: 0 0, 0 0, 40px 70px, 40px 70px;
                }

                .bg-grid-pattern {
                    background-image:
                        linear-gradient(rgba(0, 51, 160, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 51, 160, 0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
            `}</style>
        </div>
    )
}

function StatCard({ icon, value, label, suffix = '' }: { icon: React.ReactNode; value: string | number; label: string; suffix?: string }) {
    return (
        <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                {icon}
            </div>
            <div className="text-4xl font-bold mb-2">{value}{suffix}</div>
            <div className="text-blue-100 text-sm">{label}</div>
        </div>
    )
}

function TimelineStep({ number, title, description, position }: {
    number: number;
    title: string;
    description: string;
    position: 'left' | 'right';
}) {
    return (
        <div className={`relative mb-12 ${position === 'right' ? 'md:ml-auto md:pl-12' : 'md:pr-12'} md:w-1/2`}>
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#0033A0] to-[#D4AF37] text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg z-10">
                    {number}
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">{title}</h4>
                </div>
            </div>
            <Card className="ml-20 md:ml-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                    <p className="text-gray-600">{description}</p>
                </CardContent>
            </Card>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <Card className="text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0">
            <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0033A0] to-[#001f3f] rounded-full mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <h4 className="text-lg font-bold mb-2 text-gray-900">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </CardContent>
        </Card>
    )
}
