// pages/auth/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function onSubmit(e) {
        e.preventDefault();
        setError('');

        if (password !== confirmPass) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Success animation or slight delay before redirect
                alert('¡Cuenta creada con éxito!');
                router.push('/auth/signin');
            } else {
                setError(data.error || 'Error al registrarse');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Ocurrió un error inesperado');
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="card glass"
                style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/logo.png" alt="ReaTel Logo" style={{ width: 72, height: 72, margin: '0 auto 1rem', display: 'block' }} />
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#1e293b' }}>Crear Cuenta</h1>
                    <p style={{ color: '#64748b' }}>Únete a ReaTel Pro y automatiza tu marketing</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}
                    >
                        <AlertCircle size={16} /> {error}
                    </motion.div>
                )}

                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: 12, left: 12, color: '#94a3b8' }} />
                            <input
                                type="email"
                                placeholder="juan@empresa.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: 12, left: 12, color: '#94a3b8' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Confirmar Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: 12, left: 12, color: '#94a3b8' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                required
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, fontSize: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : <>Registrarse <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <span style={{ color: '#64748b' }}>¿Ya tienes una cuenta? </span>
                    <Link href="/auth/signin" style={{ fontWeight: 600, color: '#2563eb' }}>Inicia Sesión</Link>
                </div>
            </motion.div>
        </div>
    );
}
