export function createPeerConnection(onIceCandidate: (candidate: RTCIceCandidate) => void): RTCPeerConnection {
    const pc = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ]
    })

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            onIceCandidate(event.candidate)
        }
    }

    return pc
}
