import { io } from 'socket.io-client'

const socket = io('http://localhost:3003', {
    autoConnect: false, // lo controlamos manualmente
})

export default socket
