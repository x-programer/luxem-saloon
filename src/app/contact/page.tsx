import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Mail, MessageCircle, ArrowRight } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="pt-24 pb-12 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight mb-4">
                            Get in touch
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Have a question or feedback? We'd love to hear from you.
                            Fill out the form or reach out to us directly.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                        {/* Left Column: Contact Info */}
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
                                <p className="text-slate-600 mb-8 leading-relaxed">
                                    Our support team is available Monday through Friday, 9am to 6pm EST.
                                    We aim to respond to all inquiries within 24 hours.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 text-primary">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Email Us</h3>
                                            <p className="text-slate-500 text-sm mb-2">For general inquiries and support</p>
                                            <a href="mailto:my.codecraftstudio@gmail.com" className="text-primary font-medium hover:text-purple-700 transition-colors">
                                                my.codecraftstudio@gmail.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 text-primary">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Live Chat</h3>
                                            <p className="text-slate-500 text-sm mb-2">Available for urgent issues</p>
                                            <button className="text-slate-400 font-medium cursor-not-allowed">
                                                Coming Soon
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-purple-500/5">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Frequently Asked Questions</h3>
                                <p className="text-slate-600 text-sm mb-6">
                                    Find answers to common questions about bookings, payments, and account management in our Help Center.
                                </p>
                                <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-purple-700 transition-colors group">
                                    Visit Help Center
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="jane@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 resize-none"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
