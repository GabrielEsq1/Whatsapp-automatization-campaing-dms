// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const socketIo = require('socket.io');
const whatsappManager = require('./lib/whatsappClient');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = socketIo(server);
    whatsappManager.setIO(io);

    io.on('connection', (socket) => {
        console.log('Client connected', socket.id);

        // Client joins a room based on their userID (sent in query or handmade handshake)
        socket.on('join', (userId) => {
            console.log(`Socket ${socket.id} joining room ${userId}`);
            socket.join(userId);

            // Return current status if exists
            const clientEntry = whatsappManager.getClient(userId);
            if (clientEntry) {
                socket.emit('status', { status: clientEntry.status });
                if (clientEntry.status === 'QR_READY' && clientEntry.qr) {
                    socket.emit('qr', { src: clientEntry.qr });
                }
            } else {
                socket.emit('status', { status: 'DISCONNECTED' });
            }
        });

        socket.on('start_session', (userId) => {
            whatsappManager.initClient(userId);
        });

        socket.on('logout', (userId) => {
            whatsappManager.logout(userId);
            socket.emit('status', { status: 'DISCONNECTED' });
        });
    });

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
