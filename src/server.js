import http from 'http';
import { Server } from 'socket.io'; // Server 클래스를 올바르게 가져옵니다.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('view engine', 'pug');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public', 'views'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer); // Socket.IO 서버 인스턴스를 올바르게 생성합니다.

wsServer.on('connection', (socket) => {
    console.log('사용자가 연결되었습니다');

    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        // 내가 참가한 이후 참가한 사람이 있다는 알림을 받음
        socket.to(roomName).emit("welcome");
    });

    socket.on('offer', (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });

    socket.on('answer', (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on('ice', (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });

    socket.on('disconnect', () => {
        console.log('사용자가 연결을 끊었습니다');
    });

});

const handleListen = () => console.log(`http://localhost:3000에서 청취 중`);
httpServer.listen(3000, handleListen);
