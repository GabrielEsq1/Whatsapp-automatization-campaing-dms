// pages/index.js
import Link from 'next/link';
import { motion } from 'framer-motion';
import DemoCarousel from '../components/DemoCarousel';
import { Zap, ArrowRight, MessageCircle, Shield } from 'lucide-react';

export default function Home() {
    return (
        <div style={{ minHeight: '100vh', background: 'white' }}>

            {/* Navbar */}
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.25rem', color: '#0f172a' }}>
                    <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Zap size={20} fill="white" />
                    </div>
                    ReaTel Pro
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <Link href="/auth/signin" style={{ color: '#475569', fontWeight: 500 }}>Login</Link>
                    <Link href="/auth/register">
                        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Empezar Gratis</button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 900, margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #1e293b, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Marketing por WhatsApp <br /> Automatizado y Seguro.
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Lanza campañas masivas, genera variaciones con IA para evitar spam, <br /> y conecta directamente con tu número personal.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <Link href="/auth/register">
                            <button className="btn-primary" style={{ height: 56, padding: '0 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                Crear Cuenta Gratis <ArrowRight size={20} />
                            </button>
                        </Link>
                        <Link href="/auth/signin">
                            <button className="btn-outline" style={{ height: 56, padding: '0 2rem', fontSize: '1.1rem' }}>
                                Tengo Cuenta
                            </button>
                        </Link>
                    </div>

                    {/* Demo Carousel */}
                    <DemoCarousel />
                </motion.div>
            </section>

            {/* Features */}
            <section style={{ padding: '5rem 2rem', background: '#f0f9ff' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <FeatureCard
                        icon={<MessageCircle color="#2563eb" size={32} />}
                        title="Mensajes Masivos"
                        desc="Envía a miles de contactos con un solo clic. Gestiona listas y campañas fácilmente."
                    />
                    <FeatureCard
                        icon={<Shield color="#2563eb" size={32} />}
                        title="Anti-Bloqueo"
                        desc="Algoritmos de ritmo humano y variaciones de contenido generadas por IA."
                    />
                    <FeatureCard
                        icon={<Zap color="#2563eb" size={32} />}
                        title="Conexión Directa"
                        desc="Usa tu propio WhatsApp. Escanea el QR y empieza a enviar al instante."
                    />
                </div>
            </section>

            <footer style={{ padding: '3rem 2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
                <p>&copy; 2025 ReaTel Pro SaaS. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div style={{ background: 'white', padding: '2rem', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h3>
            <p style={{ color: '#64748b', lineHeight: 1.5 }}>{desc}</p>
        </div>
    )
}
