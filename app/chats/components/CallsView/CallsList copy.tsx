/* eslint-disable @next/next/no-img-element */
import HeaderList from "@/components/HeaderList";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/contexts/ContactContext";
import socket from "@/lib/socket";
import { createPeerConnection } from "@/lib/webrtc";
import { Filter, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CallsList() {
    const { user } = useAuth()
    const { contacts } = useContacts()
    
    const [incomingCall, setIncomingCall] = useState<null | { from: number }>(null)
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const iceCandidatesQueue = useRef<RTCIceCandidate[]>([])
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    // Obtener y guardar stream local sólo una vez
    useEffect(() => {
        async function getLocalStream() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                setLocalStream(stream)
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }
            } catch (e) {
                console.error("No se pudo acceder a la cámara y micrófono", e)
            }
        }
        getLocalStream()
    }, [])

    // Función para crear y configurar RTCPeerConnection
    function setupPeerConnection(targetUserId: number) {
        const pc = createPeerConnection((candidate) => {
            socket.emit('webrtc:ice-candidate', { targetUserId, candidate })
        })

        // Asignar video remoto al recibir track
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0]
            }
        }

        // Agregar tracks locales al PC
        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
        }

        return pc
    }

    // Socket listeners para llamadas (incoming, accepted, rejected)
    useEffect(() => {
        socket.on("call:incoming", ({ from }) => {
            setIncomingCall({ from })
        })

        socket.on("call:accepted", () => {
            alert("Llamada aceptada, inicia WebRTC aquí")
        })

        socket.on("call:rejected", () => {
            alert("Llamada rechazada")
        })

        return () => {
            socket.off("call:incoming")
            socket.off("call:accepted")
            socket.off("call:rejected")
        }
    }, [])

  // WebRTC signaling handlers: offer, answer, ice-candidate
    useEffect(() => {
        if (!user?.id) return

        socket.on('webrtc:offer', async ({ from, offer }) => {
            const pc = setupPeerConnection(from)

            await pc.setRemoteDescription(new RTCSessionDescription(offer))

            // Aquí es donde pones la lógica para añadir candidatos pendientes:
            for (const candidate of iceCandidatesQueue.current) {
                try {
                await pc.addIceCandidate(candidate)
                } catch (error) {
                console.error("Error añadiendo ICE candidate retrasado:", error)
                }
            }
            iceCandidatesQueue.current = []

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            socket.emit('webrtc:answer', { targetUserId: from, answer })
            setPeerConnection(pc)
        })


        socket.on('webrtc:answer', async ({ answer }) => {
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))

                for (const candidate of iceCandidatesQueue.current) {
                    try {
                        await peerConnection.addIceCandidate(candidate)
                    } catch (error) {
                        console.error("Error añadiendo ICE candidate retrasado:", error)
                    }
                }
                iceCandidatesQueue.current = []
            }
        })


        socket.on('webrtc:ice-candidate', async ({ candidate }) => {
            if (peerConnection) {
                const iceCandidate = new RTCIceCandidate(candidate)
                if (peerConnection.remoteDescription) {
                    try {
                        await peerConnection.addIceCandidate(iceCandidate)
                    } catch (error) {
                        console.error("Error al añadir ICE:", error)
                    }
                } else {
                    // Guardar en queue para añadir luego
                    iceCandidatesQueue.current.push(iceCandidate)
                }
            }
        })


        return () => {
            socket.off('webrtc:offer')
            socket.off('webrtc:answer')
            socket.off('webrtc:ice-candidate')
        }
    }, [user, peerConnection, localStream])

    // Iniciar llamada
    const handleCall = async (targetUserId: number) => {
        if (!user?.id || !localStream) {
            alert("Medios locales no listos")
            return
        }

        const pc = setupPeerConnection(targetUserId)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socket.emit("call:user", { targetUserId, from: user.id })

        setPeerConnection(pc)
    }

    // Aceptar llamada entrante
    const acceptCall = async () => {
        if (!incomingCall || !user?.id || !localStream) return

        // Ya tienes el stream local asignado en el primer useEffect, no hace falta pedirlo otra vez ni asignarlo aquí

        const pc = setupPeerConnection(incomingCall.from)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socket.emit('webrtc:offer', { targetUserId: incomingCall.from, offer })

        setPeerConnection(pc)
        socket.emit("call:accept", { to: incomingCall.from })
        setIncomingCall(null)
    }

    const rejectCall = () => {
        if (!incomingCall) return
        socket.emit("call:reject", { to: incomingCall.from })
        setIncomingCall(null)
    }

    return (
        <ScrollArea className='h-screen'>

            <div className=''>
                <HeaderList>
                    Calls
                </HeaderList>

                <div className='relative mx-4'>
                    <Input placeholder='Search' className='my-4 pl-8 pr-8' type="text" />
                    <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                    <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
                </div>

                <div className='space-y-2 px-4'>
                    {contacts.map((contact) => {
                        const friend = contact.friend
                        return (
                            <div key={friend.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center gap-2">
                                    {friend.image ? (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${friend.image}`} alt="avatar" width={32} height={32} className="rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-muted" />
                                    )}
                                    <span>{friend.firstName} {friend.lastName}</span>
                                </div>
                                <button
                                    onClick={() => handleCall(friend.id)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Llamar
                                </button>
                            </div>
                        )
                    })}

                    {incomingCall && (
                        <div className="bg-muted p-4 rounded mt-4">
                            <p className="mb-2">¡Te está llamando el usuario <strong>{contacts.find(c => c.friend.id === incomingCall.from)?.friend.firstName}</strong>!</p>
                            <div className="flex gap-2">
                                <button onClick={acceptCall} className="bg-green-500 text-white px-3 py-1 rounded">
                                    Aceptar
                                </button>
                                <button onClick={rejectCall} className="bg-red-500 text-white px-3 py-1 rounded">
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    )}

                    <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "150px", position: "fixed", bottom: 10, right: 10, zIndex: 10, borderRadius: 8, border: "2px solid #fff" }}
      />

      {/* Video remoto */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%" }}
      />
                </div>
            </div>
        </ScrollArea>
    )
}
