/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import {
    createContext,
    useContext,
    useRef,
    useState,
    useEffect,
    ReactNode,
} from 'react'
import * as mediasoupClient from 'mediasoup-client'
import socket from '@/lib/socket'
import { useAuth } from './AuthContext'
import { MediaKind, RtpParameters, TransportOptions } from 'mediasoup-client/types'

// Tipos
type CallState = 'idle' | 'calling' | 'incoming' | 'in-call' | 'ended'

interface ConsumeResponse {
    id: string
    producerId: string
    kind: MediaKind
    rtpParameters: RtpParameters
    error?: string
}

interface RouterRtpCapabilities {
  // pon aquí la estructura que devuelve mediasoup (puedes importarla de mediasoup-client)
  [key: string]: unknown
}

type CreateTransportResponse = TransportOptions

type ProduceResponse = { id: string } | { error: string }



interface CallContextType {
    callState: CallState
    remoteUserId: number | null
    startCall: (targetUserId: number) => void
    acceptCall: () => void
    rejectCall: () => void
    endCall: () => void
    localVideoRef: React.RefObject<HTMLVideoElement | null>
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>
}

const CallContext = createContext<CallContextType | null>(null)

export function useCall() {
    const ctx = useContext(CallContext)
    if (!ctx) throw new Error('useCall must be used within CallProvider')
    return ctx
}

export function CallProvider({ children }: { children: ReactNode }) {
    const {user} = useAuth()
    const [callState, setCallState] = useState<CallState>('idle')
    const [remoteUserId, setRemoteUserId] = useState<number | null>(null)

    const deviceRef = useRef<mediasoupClient.Device | null>(null)
    const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null)
    const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null)
    const producerRef = useRef<mediasoupClient.types.Producer | null>(null)
    const consumerRef = useRef<mediasoupClient.types.Consumer | null>(null)
    const localStreamRef = useRef<MediaStream | null>(null)
    const remoteStreamRef = useRef<MediaStream | null>(null)

    const pendingProducersRef = useRef<{ producerId: string; kind: string }[]>([])


    // Video elements refs
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {

        socket.on('call:incoming', ({ from }) => {
            setRemoteUserId(from)
            setCallState('incoming')
        })

        socket.on('mediasoup:nuevo-producer', async ({ producerId, kind }) => {
            console.log('Nuevo producer recibido', producerId, kind)
            const device = deviceRef.current
            const recvTransport = recvTransportRef.current

            if (!device || !recvTransport) {
                console.warn('Transporte no listo aún, guardando producer en espera')
                pendingProducersRef.current.push({ producerId, kind })
                return
            }

            await consumeProducer(producerId)

            const rtpCapabilities = deviceRef.current?.rtpCapabilities
            if (!rtpCapabilities || !recvTransportRef.current) {
                console.error('No hay capacidades RTP o transporte de recepción')
                return
            }

            // Consumir el nuevo producer
            socket.emit('mediasoup:consume', {
                producerId,
                transportId: recvTransportRef.current.id,
                rtpCapabilities,
            }, async (response: ConsumeResponse) => {
                if (response?.error) {
                    console.error('Error consumiendo:', response.error)
                    return
                }

                const { id, kind, rtpParameters } = response

                if (!id || !kind || !rtpParameters) {
                    console.error('Respuesta incompleta del consume')
                    return
                }

                const consumer = await recvTransportRef.current!.consume({
                    id,
                    producerId,
                    kind,
                    rtpParameters,
                })

                consumerRef.current = consumer

                // Crear MediaStream para el video remoto
                const remoteStream = new MediaStream()
                remoteStream.addTrack(consumer.track)
                remoteStreamRef.current = remoteStream

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream
                }
            })
        })

        socket.on('call:accepted', ({ from }) => {
            setRemoteUserId(from)
            setCallState('in-call')
            startMediasoup()
        })

        socket.on('call:rejected', () => {
            alert('Llamada rechazada')
            resetCall()
        })

        socket.on('call:ended', () => {
            alert('Llamada terminada')
            resetCall()
        })

        return () => {
            socket.off('call:incoming')
            socket.off('call:accepted')
            socket.off('call:rejected')
            socket.off('call:ended')
            socket.off('mediasoup:nuevo-producer')
            
        }
    }, [user])

    async function consumeProducer(producerId: string) {
        const device = deviceRef.current
        const recvTransport = recvTransportRef.current

        if (!device || !recvTransport || !socket) return

        socket.emit('mediasoup:consume', {
            producerId,
            transportId: recvTransport.id,
            rtpCapabilities: device.rtpCapabilities,
        }, async (response: ConsumeResponse) => {
            if (response?.error) {
                console.error('Error consumiendo:', response.error)
                return
            }

            const { id, kind, rtpParameters } = response

            if (!id || !kind || !rtpParameters) {
                console.error('Respuesta incompleta del consume')
                return
            }

            const consumer = await recvTransport.consume({
                id,
                producerId,
                kind,
                rtpParameters,
            })

            consumerRef.current = consumer

            const remoteStream = new MediaStream()
            remoteStream.addTrack(consumer.track)
            remoteStreamRef.current = remoteStream

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream
            }
        })
    }


    // Función para iniciar llamada a otro usuario
    function startCall(targetUserId: number) {
        if (!socket) return
        socket.emit('call:user', { targetUserId, from: user?.id })
        setRemoteUserId(targetUserId)
        setCallState('calling')
    }

    // Aceptar llamada entrante
    function acceptCall() {
        if (!socket || !remoteUserId) return
        socket.emit('call:accept', { to: remoteUserId })
        setCallState('in-call')
        startMediasoup()
    }

    // Rechazar llamada
    function rejectCall() {
        if (!socket || !remoteUserId) return
        socket.emit('call:reject', { to: remoteUserId })
        resetCall()
    }

    // Terminar llamada
    function endCall() {
        if (!socket || !remoteUserId) return
        socket.emit('call:end', { targetUserId: remoteUserId })
        resetCall()
    }

    // Resetear todo
    function resetCall() {
        setCallState('idle')
        setRemoteUserId(null)

        if (producerRef.current) {
            producerRef.current.close()
            producerRef.current = null
        }

        if (consumerRef.current) {
            consumerRef.current.close()
            consumerRef.current = null
        }

        if (sendTransportRef.current) {
            sendTransportRef.current.close()
            sendTransportRef.current = null
        }

        if (recvTransportRef.current) {
            recvTransportRef.current.close()
            recvTransportRef.current = null
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop())
            localStreamRef.current = null
        }

        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach(t => t.stop())
            remoteStreamRef.current = null
        }

        if (localVideoRef.current) localVideoRef.current.srcObject = null
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    }

    async function startMediasoup() {

        // Obtener capacidades RTP del router
        const rtpCapabilities: RouterRtpCapabilities = await new Promise((resolve) => {
            socket.emit('mediasoup:getRouterRtpCapabilities', null, (data: RouterRtpCapabilities) => {
                resolve(data)
            })
        })


        const device = new mediasoupClient.Device()
        await device.load({ routerRtpCapabilities: rtpCapabilities })
        deviceRef.current = device

        // Crear transporte de envío (send)
        const sendTransportParams: CreateTransportResponse = await new Promise((resolve) => {
            socket.emit('mediasoup:crear-transporte', { roomId: 'default' }, ({params}:{params: CreateTransportResponse}) => {
                resolve(params)
            })
        })

        const sendTransport = device.createSendTransport(sendTransportParams)

        sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
            socket.emit('mediasoup:conectar-transporte', { dtlsParameters, transportId: sendTransport.id }, (res: { error?: Error }) => {
                if (res.error) errback(res.error)
                else callback()
            })
        })


        sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
            socket.emit(
                'mediasoup:produce',
                { transportId: sendTransport.id, kind, rtpParameters },
                (res: ProduceResponse) => {
                    if ('error' in res) errback(new Error(res.error))
                    else callback({ id: res.id })
                }
            )
        })


        sendTransportRef.current = sendTransport

        // Obtener stream local
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        // Producir cada track
        for (const track of stream.getTracks()) {
            producerRef.current = await sendTransport.produce({ track })
        }

        // Crear transporte de recepción (recv)
        const recvTransportParams: CreateTransportResponse = await new Promise((resolve) => {
            socket.emit('mediasoup:crear-transporte', { roomId: 'default' }, ({params}: {params: CreateTransportResponse}) => {
                resolve(params)
            })
        })

        const recvTransport = device.createRecvTransport(recvTransportParams)

        recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
            socket.emit(
                'mediasoup:conectar-transporte',
                { dtlsParameters, transportId: recvTransport.id },
                (res: { error?: string }) => {
                    if (res?.error) errback(new Error(res.error))
                    else callback()
                }
            )
        })


        recvTransportRef.current = recvTransport

        // Crear stream remoto vacío
        const remoteStream = new MediaStream()
        remoteStreamRef.current = remoteStream
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream

        // Escuchar cuando el otro usuario empieza a producir
        socket.on('mediasoup:nuevo-producer', async ({ producerId, kind }) => {
            if (!device.canProduce(kind)) return console.warn('Device no puede consumir ese tipo:', kind)

            const consumerParams: ConsumeResponse = await new Promise((resolve) => {
                socket.emit('mediasoup:consume', {
                    producerId,
                    transportId: recvTransport.id,
                    rtpCapabilities: device.rtpCapabilities,
                }, (params: ConsumeResponse) => {
                    resolve(params)
                })
            })

            // Verifica si tiene error
            if ('error' in consumerParams) {
                console.error('Error al consumir:', consumerParams.error)
                return
            }

            const consumer = await recvTransport.consume({
                id: consumerParams.id,
                producerId: consumerParams.producerId,
                kind: consumerParams.kind,
                rtpParameters: consumerParams.rtpParameters,
            })

            consumerRef.current = consumer
            remoteStream.addTrack(consumer.track)
        })


        // Consumir producers pendientes
        for (const { producerId } of pendingProducersRef.current) {
            await consumeProducer(producerId)
        }
        pendingProducersRef.current = []

    }

    return (
        <CallContext.Provider value={{
            callState,
            remoteUserId,
            startCall,
            acceptCall,
            rejectCall,
            endCall,
            localVideoRef,
            remoteVideoRef,
        }}>
            {children}
        </CallContext.Provider>
    )
}
