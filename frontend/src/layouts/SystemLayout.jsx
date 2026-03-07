import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Toaster, useToasterStore } from "react-hot-toast";
import SystemSidebar from "../components/SystemSidebar";

const playNotificationSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "error") {
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.3,
      );
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(750, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.3,
      );
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const ToastListener = () => {
  const { toasts } = useToasterStore();
  const [played, setPlayed] = useState(new Set());

  useEffect(() => {
    const visibleToasts = toasts.filter((t) => t.visible);
    visibleToasts.forEach((t) => {
      if (!played.has(t.id)) {
        playNotificationSound(t.type);
        setPlayed((prev) => {
          const newSet = new Set(prev);
          newSet.add(t.id);
          return newSet;
        });
      }
    });
  }, [toasts, played]);

  return null;
};

const SystemLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-green-100 overflow-hidden">
      <SystemSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 overflow-auto w-full flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-gray-800">
            System Portal
          </span>
        </div>

        <div className="p-4 md:p-8 flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      <ToastListener />
      <Toaster position="top-right" />
    </div>
  );
};

export default SystemLayout;
