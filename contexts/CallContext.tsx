/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth } from "./AuthContext"
import socket from "@/lib/socket"

type IncomingCall = { from: number }

interface CallContextType {
    incomingCall: IncomingCall | null
    callActive: boolean
    localStream: MediaStream | null
    localVideoRef: React.RefObject<HTMLVideoElement | null>
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>
    handleCall: (targetUserId: number) => void
    acceptCall: () => void
    rejectCall: () => void
    endCall: () => void
}

const CallContext = createContext<CallContextType>({} as CallContextType)

export function CallProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
    const [callActive, setCallActive] = useState(false)
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const iceCandidatesQueue = useRef<RTCIceCandidate[]>([])
    const [lastPeerId, setLastPeerId] = useState<number | null>(null)

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    // 🔹 Obtener stream local y mostrar en video
    const getLocalStream = async (): Promise<MediaStream> => {
        if (localStream) return localStream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setLocalStream(stream)
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
        }
        return stream
    }

    // 🔹 Crear conexión WebRTC con handlers
    const createPeerConnection = ({
        targetUserId,
        stream,
        onTrack,
    }: {
        targetUserId: number
        stream: MediaStream
        onTrack: (remoteStream: MediaStream) => void
    }): RTCPeerConnection => {
        const pc = new RTCPeerConnection()

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc:ice-candidate", { targetUserId, candidate: event.candidate })
            }
        }

        pc.ontrack = (event) => {
            const [remoteStream] = event.streams
            if (remoteStream) {
                console.log("[ontrack] remote stream received")
                onTrack(remoteStream)
            }
        }

        stream.getTracks().forEach(track => pc.addTrack(track, stream))
        setLastPeerId(targetUserId)

        return pc
    }

    // SOCKET LISTENERS
    useEffect(() => {
        socket.on("call:incoming", ({ from }) => {
            setIncomingCall({ from })
        })

        socket.on("call:accepted", async ({ from }) => {
            if (!user?.id) return
            const stream = await getLocalStream()
            const pc = createPeerConnection({
                targetUserId: from,
                stream,
                onTrack: (remoteStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream
                    }
                },
            })
            setPeerConnection(pc)

            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit("webrtc:offer", { targetUserId: from, offer })

            setCallActive(true) // llamada activa cuando aceptan
            setIncomingCall(null) // limpio llamada entrante
        })


        socket.on("call:rejected", () => {
            setIncomingCall(null)
            setPeerConnection(null)
            setCallActive(false)
        })

        socket.on("call:ended", () => {
            if (peerConnection) peerConnection.close()
            setPeerConnection(null)
            setIncomingCall(null)
            setCallActive(false)
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
            if (localVideoRef.current) localVideoRef.current.srcObject = null
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
                setLocalStream(null)
            }
        })


        return () => {
            socket.off("call:incoming")
            socket.off("call:accepted")
            socket.off("call:rejected")
            socket.off("call:ended")
        }
    }, [user, peerConnection, incomingCall])

    // 🔹 Escuchar oferta, respuesta e ICE
    useEffect(() => {
        if (!user?.id) return

        socket.on("webrtc:offer", async ({ from, offer }) => {
            const stream = await getLocalStream()
            const pc = createPeerConnection({
                targetUserId: from,
                stream,
                onTrack: (remoteStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream
                    }
                },
            })
            setPeerConnection(pc)

            await pc.setRemoteDescription(new RTCSessionDescription(offer))

            for (const candidate of iceCandidatesQueue.current) {
                await pc.addIceCandidate(candidate)
            }
            iceCandidatesQueue.current = []

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit("webrtc:answer", { targetUserId: from, answer })
            setCallActive(true)
            setIncomingCall(null)
        })

        socket.on("webrtc:answer", async ({ answer }) => {
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                for (const candidate of iceCandidatesQueue.current) {
                    await peerConnection.addIceCandidate(candidate)
                }
                iceCandidatesQueue.current = []
            }
        })

        socket.on("webrtc:ice-candidate", async ({ candidate }) => {
            const iceCandidate = new RTCIceCandidate(candidate)
            if (peerConnection?.remoteDescription) {
                await peerConnection.addIceCandidate(iceCandidate)
            } else {
                iceCandidatesQueue.current.push(iceCandidate)
            }
        })

        return () => {
            socket.off("webrtc:offer")
            socket.off("webrtc:answer")
            socket.off("webrtc:ice-candidate")
        }
    }, [user, peerConnection, localStream])

    // 🔹 Llamar a usuario
    const handleCall = async (targetUserId: number) => {
        if (!user?.id) return
        const stream = await getLocalStream()
        const pc = createPeerConnection({
        targetUserId,
        stream,
        onTrack: (remoteStream) => {
            if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
            }
        },
        })
        setPeerConnection(pc)
        socket.emit("call:user", { targetUserId, from: user.id })
        setCallActive(true)
    }

    // 🔹 Aceptar llamada
    const acceptCall = async () => {
        if (!incomingCall || !user?.id) return
        const stream = await getLocalStream()
        const pc = createPeerConnection({
            targetUserId: incomingCall.from,
            stream,
            onTrack: (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream
                }
            },
        })
        setPeerConnection(pc)
        socket.emit("call:accept", { to: incomingCall.from })
        setCallActive(true)
        setIncomingCall(null)
    }

    // Rechazar llamada
    const rejectCall = () => {
        if (!incomingCall) return
        socket.emit("call:reject", { to: incomingCall.from })
        setIncomingCall(null)
        setPeerConnection(null)
    }

    const endCall = () => {
        if (!user?.id || !peerConnection) return
        peerConnection.close()
        setPeerConnection(null)
        setIncomingCall(null)
        setCallActive(false)
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
        if (localVideoRef.current) localVideoRef.current.srcObject = null
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
            setLocalStream(null)
        }
        socket.emit("call:end", { targetUserId: lastPeerId }) // ahora vemos esto
    }


    return (
        <CallContext.Provider value={{
            incomingCall,
            callActive,
            localStream,
            localVideoRef,
            remoteVideoRef,
            handleCall,
            acceptCall,
            rejectCall,
            endCall
        }}>
            {children}
        </CallContext.Provider>
    )
}

export const useCall = () => {
    const context = useContext(CallContext)
    if (!context) throw new Error("useCall must be used within an CallProvider")
    return context
}