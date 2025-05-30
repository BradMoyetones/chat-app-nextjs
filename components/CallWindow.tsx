"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useCall } from "@/contexts/CallContext"
import { useContacts } from "@/contexts/ContactContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Phone, PhoneOff, Maximize2, Minimize2, RotateCcw, Mic, MicOff, Video, VideoOff } from "lucide-react"
import { cn } from "@/lib/utils"



export default function CallWindow() {
  const { localVideoRef, remoteVideoRef, acceptCall, rejectCall, endCall, callState, remoteUserId } = useCall()
  const { contacts } = useContacts()

  const [isLocalMain, setIsLocalMain] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  // Draggable refs
  const dragRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth - 400 - 16 : 0,
    y: 16,
  });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const callStartTime = useRef<number | null>(null)

  // Timer para duración de llamada
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (callState === "in-call") {
      if (!callStartTime.current) {
        callStartTime.current = Date.now()
      }

      interval = setInterval(() => {
        if (callStartTime.current) {
          setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
        }
      }, 1000)
    } else {
      callStartTime.current = null
      setCallDuration(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callState])

  // Drag functionality
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current || !dragRef.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      const newX = posRef.current.x + dx;
      const newY = posRef.current.y + dy;

      const width = dragRef.current.offsetWidth;
      const height = dragRef.current.offsetHeight;

      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;

      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));

      dragRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    }


    function handleMouseUp() {
      if (dragging.current && dragRef.current) {
        const transform = dragRef.current.style.transform;
        const match = transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
        if (match) {
          posRef.current.x = parseFloat(match[1]);
          posRef.current.y = parseFloat(match[2]);
        }
      }
      dragging.current = false;
    }


    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  function startDrag(e: React.MouseEvent) {
    if (isFullscreen) return
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
  }

  // Encontrar el contacto basado en remoteUserId
  const getCallerInfo = () => {
    if (!remoteUserId || !contacts) return null

    for (const contact of contacts) {
      if (contact.sender.id === remoteUserId) return contact.sender
      if (contact.receiver.id === remoteUserId) return contact.receiver
      if (contact.friend.id === remoteUserId) return contact.friend
    }
    return null
  }

  const callerInfo = getCallerInfo()
  const callerName = callerInfo ? `${callerInfo.firstName} ${callerInfo.lastName}` : "Usuario desconocido"
  const callerInitials = callerInfo ? `${callerInfo.firstName[0]}${callerInfo.lastName[0]}` : "UD"

  // Formatear duración de llamada
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Llamada entrante
  if (callState === "incoming") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <Card
          className="w-96 p-8 text-center shadow-2xl"
        >
          <div className="mb-6">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-blue-500 ring-opacity-50">
                <AvatarImage src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${callerInfo?.image}`} className="object-cover object-center" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {callerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -inset-2 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
            </div>

            <h3 className="text-2xl font-bold mb-2">{callerName}</h3>
            <p className="text-slate-300 mb-6">Incoming call...</p>

            <div className="animate-pulse">
              <div className="flex justify-center items-center space-x-2 mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <Button
              onClick={rejectCall}
              size="lg"
              className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16 p-0 shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button
              onClick={acceptCall}
              size="lg"
              className="bg-green-600 hover:bg-green-700 rounded-full w-16 h-16 p-0 shadow-lg"
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Llamada saliente
  if (callState === "calling") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <Card
          className="w-96 p-8 text-center shadow-2xl"
        >
          <div className="mb-6">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 text-indigo-600 ring-blue-500 ring-opacity-50">
              <AvatarImage src={callerInfo?.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {callerInitials}
              </AvatarFallback>
            </Avatar>

            <h3 className="text-2xl font-bold mb-2">{callerName}</h3>
            <p className="mb-6">Calling...</p>

            <div className="animate-pulse">
              <div className="flex justify-center items-center space-x-2 mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={endCall}
              size="lg"
              className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16 p-0 shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Llamada activa
  if (callState === "in-call") {
    return (
      <div
        ref={dragRef}
        className={`
          fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden 
          ${isFullscreen ? "inset-0 rounded-none" : "cursor-move"}
        `}
        style={{
          width: isFullscreen ? "100vw" : 400,
          height: isFullscreen ? "100vh" : 300,
          top: 0,
          left: 0,
          transform: isFullscreen
            ? "translate(0px, 0px)"
            : `translate(${posRef.current.x}px, ${posRef.current.y}px)`,
        }}
        onMouseDown={startDrag}
      >
        <div className="relative w-full h-full bg-black">
          {/* Video principal */}
          <video
            ref={isLocalMain ? localVideoRef : remoteVideoRef}
            autoPlay
            playsInline
            muted={isLocalMain}
            className="w-full h-full object-cover"
          />

          {/* Video miniatura */}
          <div
            className={cn(
              "absolute border-2 border-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105",
              isFullscreen ? "bottom-6 right-6 w-48 h-36" : "bottom-3 right-3 w-24 h-20",
            )}
            onClick={() => setIsLocalMain(!isLocalMain)}
          >
            <video
              ref={isLocalMain ? remoteVideoRef : localVideoRef}
              autoPlay
              playsInline
              muted={!isLocalMain}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <RotateCcw className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Header con info de llamada */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${callerInfo?.image}`} />
                  <AvatarFallback className="bg-slate-600 text-xs">{callerInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{callerName}</p>
                  <p className="text-xs text-slate-300">{formatDuration(callDuration)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 w-8 h-8 p-0"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button onClick={endCall} size="sm" className="bg-red-600 hover:bg-red-700 w-8 h-8 p-0">
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Controles de llamada */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setIsMuted(!isMuted)}
                size="sm"
                variant={isMuted ? "destructive" : "secondary"}
                className="rounded-full w-12 h-12 p-0"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => setIsVideoOff(!isVideoOff)}
                size="sm"
                variant={isVideoOff ? "destructive" : "secondary"}
                className="rounded-full w-12 h-12 p-0"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => setIsLocalMain(!isLocalMain)}
                size="sm"
                variant="secondary"
                className="rounded-full w-12 h-12 p-0"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
