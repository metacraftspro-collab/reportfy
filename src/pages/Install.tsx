import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Check, Monitor, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install: React.FC = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-3xl flex items-center gap-2 py-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-sm font-bold">Install Arabika App</h1>
        </div>
      </header>

      <main className="container max-w-3xl py-10 px-4">
        <div className="text-center mb-8">
          <img src="/pwa-icon-192.png" alt="Arabika" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h2 className="text-2xl font-bold mb-2">Arabika Coffee</h2>
          <p className="text-muted-foreground">Report Manager Tool</p>
        </div>

        {isInstalled ? (
          <Card className="p-8 text-center">
            <Check className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Already Installed!</h3>
            <p className="text-muted-foreground text-sm">
              Arabika app তোমার device-এ install করা আছে। Taskbar বা Home screen থেকে open করো।
            </p>
          </Card>
        ) : deferredPrompt ? (
          <Card className="p-8 text-center">
            <Download className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Install করো</h3>
            <p className="text-muted-foreground text-sm mb-6">
              PC বা Phone-এ install করো — native app এর মতো কাজ করবে, offline-ও চলবে।
            </p>
            <Button size="lg" onClick={handleInstall} className="gap-2">
              <Download className="w-4 h-4" /> Install Arabika App
            </Button>
          </Card>
        ) : (
          <Card className="p-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Manually Install করো</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <Monitor className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Desktop (Chrome / Edge)</p>
                  <ol className="text-sm text-muted-foreground mt-1 space-y-1 list-decimal list-inside">
                    <li>Address bar-এ install icon (⊕) দেখবে — click করো</li>
                    <li>অথবা Menu (⋮) → "Install Arabika Coffee..."</li>
                    <li>"Install" press করো</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Smartphone className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Mobile (Android / iOS)</p>
                  <ol className="text-sm text-muted-foreground mt-1 space-y-1 list-decimal list-inside">
                    <li><strong>Android:</strong> Chrome → Menu (⋮) → "Add to Home screen"</li>
                    <li><strong>iPhone:</strong> Safari → Share (↑) → "Add to Home Screen"</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Install;
