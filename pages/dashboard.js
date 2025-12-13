// ... imports
import MetaConfig from '../components/MetaConfig';

// ... inside render tabs
{
    activeTab === 'dashboard' && (
        <div className='...'>
            {/* ... existing dashboard content ... */}
            {/* Replace QR Section with MetaConfig for Vercel users, or show alongside */}
            {/* For simplicity, we just append it below the status */}
            <MetaConfig user={settingsData || {}} />
        </div>
    )
}
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
// import io from 'socket.io-client'; // Removed for Vercel/Docker persistence logic
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import {
    LogOut,
    Send,
    MessageSquare,
    Settings,
    BarChart,
    Smartphone,
    QrCode,
    Pause,
    Play,
    Users,
    CheckCircle,
    AlertCircle,
    Sparkles
} from 'lucide-react';

const fetcher = (url) => fetch(url).then(r => r.json());
// let socket; // Removed

export default function Dashboard() {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    // Real Enterprise Polling (Replaces WebSockets for better compatibility with serverless/container mix)
    const { data, mutate } = useSWR(userId ? `/api/status?userId=${userId}` : null, fetcher, { refreshInterval: 2000 });
    const { data: settingsData } = useSWR(userId ? `/api/settings?userId=${userId}` : null, fetcher);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [singleTo, setSingleTo] = useState('');
    const [singleMsg, setSingleMsg] = useState('');
    const [campName, setCampName] = useState('');
    const [campNumbers, setCampNumbers] = useState('');
    const [campMessage, setCampMessage] = useState('');
    const [campDelay, setCampDelay] = useState('safe');
    const [isGenerating, setIsGenerating] = useState(false);
    const [delayMs, setDelayMs] = useState(1500);
    const [concurrency, setConcurrency] = useState(1);
    const [waStatus, setWaStatus] = useState('DISCONNECTED');
    const [qrSrc, setQrSrc] = useState(null);

    // Sync status from polling
    useEffect(() => {
        if (data?.status) setWaStatus(data.status);
        if (data?.qr) {
            setQrSrc(data.qr);
            setWaStatus('QR_READY');
        } else if (data?.status === 'READY') {
            setQrSrc(null);
            if (waStatus !== 'READY') setWaStatus('READY');
        }
    }, [data]);

    useEffect(() => {
        if (settingsData) {
            if (settingsData.delayMs) setDelayMs(settingsData.delayMs);
            if (settingsData.concurrency) setConcurrency(settingsData.concurrency);
        }
    }, [settingsData]);

    if (!session) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;

    const deliveries = data?.deliveries || [];
    const queue = data?.queue;

    const connectWhatsApp = async () => {
        try {
            setWaStatus('Iniciando...');
            const res = await fetch('/api/auth/whatsapp/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error('Failed to start session');
            mutate();
        } catch (e) {
            alert('Error al conectar: ' + e.message);
            setWaStatus('DISCONNECTED');
        }
    };

    const logoutWhatsApp = async () => {
        await fetch('/api/auth/whatsapp/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        setWaStatus('DISCONNECTED');
        setQrSrc(null);
        mutate();
    };

    async function sendSingle() {
        if (waStatus !== 'READY') return alert('Debes conectar tu WhatsApp primero (Botón arriba a la derecha)');
        try {
            await fetch('/api/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: singleTo, message: singleMsg, userId }) });
            setSingleTo(''); setSingleMsg(''); mutate();
            alert('Enviado a la cola');
        } catch (e) { alert('Error: ' + e.message); }
    }

    async function createCampaign() {
        if (!campName || !campNumbers || !campMessage) return alert('Completa todos los campos');
        // Default delay 5s if custom not set or invalid
        const delay = parseInt(campDelay) > 0 ? parseInt(campDelay) : 5;

        const res = await fetch('/api/campaigns/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: campName, numbers: campNumbers, message: campMessage, userId, delaySeconds: delay })
        });
        const d = await res.json();
        if (d.id && confirm(`Campaña creada con ${d._count.contacts} números. ¿Iniciar envío ahora?`)) {
            await fetch('/api/campaigns/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, campaignId: d.id, delaySeconds: delay })
            });
            alert('Campaña iniciada. Revisa el Dashboard.');
            setActiveTab('dashboard');
        }
        setCampName(''); setCampNumbers(''); setCampMessage(''); setCampDelay('');
    }

    async function control(action) {
        await fetch('/api/control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
        mutate();
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

            {/* Sidebar */}
            <aside style={{ width: 260, background: 'white', borderRight: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '3rem' }}>
                    {/* Brand Logo */}
                    <Logo size={40} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ReaTel Pro</h2>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart size={18} />}>Dashboard & Info</NavButton>
                    <NavButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} icon={<Users size={18} />}>Campañas Masivas</NavButton>
                    <NavButton active={activeTab === 'single'} onClick={() => setActiveTab('single')} icon={<MessageSquare size={18} />}>Mensaje Directo</NavButton>
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {session.user.email[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.email}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Plan Pro</div>
                        </div>
                    </div>
                    <button onClick={() => signOut()} className="btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem' }}>
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

                {/* Header Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem' }}>
                            {activeTab === 'dashboard' && 'Panel Principal'}
                            {activeTab === 'campaigns' && 'Campañas Masivas'}
                            {activeTab === 'single' && 'Mensaje Individual'}
                        </h1>
                        <p style={{ color: 'var(--muted-foreground)' }}>Gestiona tus envíos automatizados</p>
                    </div>

                    <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: waStatus === 'READY' ? '#22c55e' : waStatus === 'DISCONNECTED' ? '#ef4444' : '#f59e0b' }} />
                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                {waStatus === 'READY' ? 'Conectado' : waStatus === 'DISCONNECTED' ? 'Desconectado' : 'Iniciando...'}
                            </span>
                        </div>
                        {waStatus === 'DISCONNECTED' && <button onClick={connectWhatsApp} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>Conectar</button>}
                        {waStatus === 'READY' && <button onClick={logoutWhatsApp} className="btn-outline" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>Desconectar</button>}
                    </div>
                </div>

                {/* QR Code Modal/Overlay */}
                <AnimatePresence>
                    {waStatus === 'QR_READY' && qrSrc && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                            <div className="card" style={{ background: 'white', textAlign: 'center', maxWidth: 400 }}>
                                <h3 style={{ marginBottom: 16 }}>Escanea el QR</h3>
                                <img src={qrSrc} alt="QR" style={{ width: 250, height: 250, display: 'block', margin: '0 auto' }} />
                                <p style={{ marginTop: 16, color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Abre WhatsApp en tu celular {'>'} Dispositivos Vinculados</p>
                                <button onClick={() => setWaStatus('DISCONNECTED')} style={{ marginTop: 16 }} className="btn-outline">Cancelar</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem' }}>Estado de la Cola</h3>
                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                                    <StatBox label="En Cola" value={queue?.size || 0} color="orange" />
                                    <StatBox label="Procesando" value={queue?.pending || 0} color="blue" />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => control('pause')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Pause size={16} /> Pausar Cola</button>
                                    <button onClick={() => control('resume')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Play size={16} /> Reanudar</button>
                                </div>
                            </div>

                            {/* Meta Cloud API Config */}
                            {settingsData && <MetaConfig user={settingsData} />}
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Historial Reciente</h3>
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                {deliveries.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#ccc' }}>Sin actividad</div>}
                                {deliveries.map(d => (
                                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 500 }}>{d.to}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{d.body.substring(0, 30)}...</div>
                                            {d.error && (
                                                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4, background: '#fee2e2', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>
                                                    {translateError(d.error)}
                                                </div>
                                            )}
                                        </div>
                                        <StatusBadge status={d.status} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div style={{ maxWidth: 800 }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Nueva Campaña</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500 }}>Nombre de Campaña</label>
                                    <input placeholder="Ej: Promo Verano" value={campName} onChange={e => setCampName(e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500 }}>Lista de Números</label>
                                    <textarea rows={5} placeholder="Pega aquí los números (separados por coma o salto de línea)" value={campNumbers} onChange={e => setCampNumbers(e.target.value)} />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: 4 }}>Formatos aceptados: 57300123... (Sin espacios ni guiones preferiblemente)</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500 }}>Mensaje Base (IA Variaciones)</label>
                                    <textarea rows={4} placeholder="Hola! Tenemos una oferta para ti..." value={campMessage} onChange={e => setCampMessage(e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500 }}>Intervalo entre mensajes (segundos)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Min: 2 seg"
                                        value={campDelay}
                                        onChange={e => setCampDelay(e.target.value)}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: 4 }}>Ayuda a evitar bloqueos y simula comportamiento humano.</p>
                                </div>
                                <button onClick={createCampaign} className="btn-primary" style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Send size={18} /> Lanzar Campaña
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'single' && (
                    <div style={{ maxWidth: 600 }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Enviar Mensaje Rápido</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input placeholder="Número (Ej: 573001234567)" value={singleTo} onChange={e => setSingleTo(e.target.value)} />
                                <textarea placeholder="Escribe tu mensaje..." rows={4} value={singleMsg} onChange={e => setSingleMsg(e.target.value)} />
                                <button onClick={sendSingle} className="btn-primary" style={{ justifySelf: 'start' }}>Enviar Ahora</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function translateError(err) {
    if (!err) return '';
    if (err.includes('WhatsApp no inicializado') || err.includes('client not ready'))
        return '⚠️ Sesión perdida. Reconecta el QR.';
    if (err.includes('No LID') || err.includes('Evaluation failed'))
        return '🚫 Número no válido (No tiene WhatsApp)';
    if (err.includes('Execution context'))
        return '🔄 Error temporal. Reintentar.';
    return err; // Return original if unknown
}

function NavButton({ children, active, onClick, icon }) {
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem',
            background: active ? 'var(--muted)' : 'transparent',
            color: active ? 'var(--primary)' : 'var(--foreground)',
            fontWeight: active ? 600 : 400,
            textAlign: 'left', border: 'none', borderRadius: 8, width: '100%', cursor: 'pointer'
        }}>
            {icon}
            {children}
        </button>
    )
}

function StatBox({ label, value, color }) {
    return (
        <div style={{ padding: '1rem 1.5rem', background: 'var(--muted)', borderRadius: 12, flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
        </div>
    )
}

function StatusBadge({ status }) {
    let className = 'status-badge ';
    let icon = null;
    if (status === 'queued') { className += 'status-queued'; icon = <AlertCircle size={12} />; }
    if (status === 'sending') { className += 'status-sending'; icon = <Send size={12} />; }
    if (status === 'sent') { className += 'status-sent'; icon = <CheckCircle size={12} />; }
    if (status === 'error') { className += 'status-error'; icon = <AlertCircle size={12} />; }

    return (
        <span className={className} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {icon} {status}
        </span>
    )
}
