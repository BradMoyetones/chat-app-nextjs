import { io } from 'socket.io-client'

const socket = io('http://192.168.68.103:3003', {
    autoConnect: false, // lo controlamos manualmente
})

export default socket
