'use client'

import { useEffect, useRef, useState } from "react";
import { useCall } from "@/contexts/CallContext";

export default function CallWindow() {
  const {
    localVideoRef,
    remoteVideoRef,
    acceptCall,
    rejectCall,
    endCall,
    callState
  } = useCall();

  const [isLocalMain, setIsLocalMain] = useState(false);


  // Draggable window refs y lógica
  const dragRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current || !dragRef.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragRef.current.style.transform = `translate(${posRef.current.x + dx}px, ${posRef.current.y + dy}px)`;
    }

    function handleMouseUp() {
      if (dragging.current && dragRef.current) {
        const transform = dragRef.current.style.transform;
        const match = transform.match(/translate\(([-\d]+)px, ([-\d]+)px\)/);
        if (match) {
          posRef.current.x = parseInt(match[1]);
          posRef.current.y = parseInt(match[2]);
        }
      }
      dragging.current = false;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  function startDrag(e: React.MouseEvent) {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  return (
    <>
      {/* Modal llamada entrante */}
      {callState === 'incoming' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 text-center">
            <p className="mb-4 text-lg font-semibold">
              ¡Te está llamando alguien!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  acceptCall();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Aceptar
              </button>
              <button
                onClick={() => {
                  rejectCall();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ventana llamada activa draggable */}
      {callState === 'in-call' && (
        <div
          ref={dragRef}
          className="fixed top-4 right-4 z-50 bg-black rounded-lg shadow-lg overflow-hidden cursor-move"
          style={{ width: 320, height: 240, transform: "translate(0px, 0px)" }}
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
            {/* Video pequeño toggle */}
            <video
              ref={isLocalMain ? remoteVideoRef : localVideoRef}
              autoPlay
              playsInline
              muted={!isLocalMain}
              className="absolute bottom-2 right-2 w-24 h-24 rounded-md border-2 border-white object-cover cursor-pointer"
              onClick={() => setIsLocalMain((v) => !v)}
            />

            {/* Botón colgar */}
            <button
              onClick={() => {
                endCall();
              }}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded"
              title="Colgar llamada"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
