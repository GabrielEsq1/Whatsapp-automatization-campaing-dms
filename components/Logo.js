import { MessageCircle, Zap } from 'lucide-react';

export default function Logo({ size = 40, className = "" }) {
    return (
        <div className={className} style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <MessageCircle
                    size={size}
                    color="#25D366"
                    fill="#25D366" // WhatsApp green fill
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <MessageCircle
                        size={size * 0.6}
                        color="#25D366"
                        fill="#25D366"
                        strokeWidth={0}
                    />
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: -size * 0.1,
                    right: -size * 0.1,
                    background: 'white',
                    borderRadius: '50%',
                    padding: size * 0.05,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <Zap size={size * 0.4} color="#F59E0B" fill="#F59E0B" />
                </div>
            </div>
        </div>
    );
}
