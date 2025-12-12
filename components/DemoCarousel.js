// components/DemoCarousel.js
import React from 'react';

// Real screenshots captured by puppeteer
const images = [
    '/screenshots/home.png',
    '/screenshots/dashboard.png',
    // add more if needed
];

export default function DemoCarousel() {
    return (
        <div style={{ overflowX: 'auto', display: 'flex', scrollSnapType: 'x mandatory', width: '100vw' }}>
            {images.map((src, i) => (
                <div key={i} style={{ flex: '0 0 100%', scrollSnapAlign: 'center' }}>
                    <img src={src} alt={`Demo ${i + 1}`} style={{ width: '100%', height: 'calc(100vh - 120px)', objectFit: 'cover' }} />
                </div>
            ))}
        </div>
    );
}
