// pages/auth/signin.js
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        const res = await signIn('credentials', { redirect: false, email, password });
        if (res?.ok) {
            router.push('/dashboard');
        } else {
            alert('Login fallido. Verifica tus credenciales.');
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card glass"
                style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 48, height: 48, background: '#2563eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' }}>
                        <Smartphone size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bienvenido</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Inicia sesión en ReaTel Pro</p>
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', top: 12, left: 12, color: '#94a3b8' }} />
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', top: 12, left: 12, color: '#94a3b8' }} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : <>Entrar <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>¿No tienes cuenta? </span>
                    <Link href="/auth/register" style={{ fontWeight: 600 }}>Regístrate</Link>
                </div>
            </motion.div>
        </div>
    );
}
