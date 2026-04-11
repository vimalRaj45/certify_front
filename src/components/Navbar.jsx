import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';

const Navbar = ({ onOpenApp }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Products', icon: 'pi pi-th-large', id: '#features' },
        { name: 'Enterprise', icon: 'pi pi-briefcase', id: '#enterprise' },
        { name: 'Contact Us', icon: 'pi pi-envelope', id: '#contact' },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 flex justify-content-between align-items-center">
                
                {/* Logo with VSGRPS Branding */}
                <div className="flex align-items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors shadow-8">
                        <i className="pi pi-layers text-lg text-white"></i>
                    </div>
                    <div className="flex flex-column">
                        <span className="text-lg md:text-xl font-black tracking-tight font-heading leading-tight">
                            Certify<span className="text-blue-500">Pro</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.1em] leading-tight">By VSGRPS</span>
                    </div>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex align-items-center gap-6">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.id} 
                            className="text-gray-300 hover:text-white flex align-items-center gap-2 text-sm font-semibold transition-colors no-underline"
                        >
                            <i className={`${link.icon} text-xs text-blue-400`}></i>
                            {link.name}
                        </a>
                    ))}
                    <div className="h-6 w-px bg-white-alpha-10 ml-2 mr-2"></div>
                    <Button 
                        label="Launch Platform" 
                        icon="pi pi-rocket" 
                        className="p-button-sm p-button-rounded shadow-8 border-none bg-blue-600 hover:bg-blue-500" 
                        onClick={onOpenApp}
                    />
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden">
                    <Button 
                        icon={mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'} 
                        className="p-button-text p-button-secondary p-button-lg text-white" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                    />
                </div>
            </div>

            {/* Mobile Menu (Glass Sheet) */}
            <div 
                className={`md:hidden absolute top-full left-0 w-full glass-nav overflow-hidden transition-all duration-500 ease-in-out border-top-1 border-white-alpha-10 ${mobileMenuOpen ? 'max-h-[400px] border-bottom-1' : 'max-h-0'}`}
            >
                <div className="flex flex-column gap-3 p-4">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.id} 
                            className="text-gray-200 hover:text-white text-lg font-bold flex align-items-center gap-3 p-3 rounded-lg hover:bg-white-alpha-5 no-underline transition-all"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <i className={`${link.icon} text-blue-500`}></i>
                            {link.name}
                        </a>
                    ))}
                    <Button 
                        label="Launch Console" 
                        icon="pi pi-rocket" 
                        className="p-button-lg shadow-8 border-none bg-blue-600 mt-2" 
                        onClick={() => { setMobileMenuOpen(false); onOpenApp(); }}
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
