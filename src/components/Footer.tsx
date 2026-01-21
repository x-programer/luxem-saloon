import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <span className="text-xl font-bold text-primary">LuxeSalon</span>
                        <p className="text-sm text-gray-500 mt-2">© 2026 LuxeSalon Inc.</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Privacy</Link>
                        <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Terms</Link>
                        <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Contact</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Social icons placeholders */}
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-violet-50 hover:text-primary transition-colors cursor-pointer">
                            <span className="sr-only">Twitter</span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-violet-50 hover:text-primary transition-colors cursor-pointer">
                            <span className="sr-only">Instagram</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"></line></svg>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
