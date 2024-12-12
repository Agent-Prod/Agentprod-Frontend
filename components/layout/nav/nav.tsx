import React, { useEffect, useCallback } from 'react';
import { NavInterface } from "@/types";
import MiniNav from "./mini-nav";
import SimpleNav from "./simple-nav";
import CollapseNavItem from "./collapse-nav-item";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/auth-provider';

// Update the TawkAPI interface
interface TawkAPI {
  onStatusChange: (callback: (status: string) => void) => void;
  start: (config?: { showWidget: boolean }) => void;
  maximize: () => void;
  toggle: () => void;
  isChatMinimized: () => boolean;
  autoStart: boolean;
  onLoad: () => void;
  hideWidget: () => void;
  setAttributes?: (attributes: Record<string, any>, callback?: (error: any) => void) => void;
  addEvent?: (eventName: string, metadata?: Record<string, any>, callback?: (error: any) => void) => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
  }
}

interface NavProps {
  isCollapsed: boolean;
  links: NavInterface[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const { user } = useAuth();

  const initializeTawk = useCallback(() => {
    //@ts-ignore

    window.Tawk_API = window.Tawk_API || {};
    //@ts-ignore

    window.Tawk_API.autoStart = false;
    //@ts-ignore

    window.Tawk_API.onLoad = function() {
      window.Tawk_API?.hideWidget();

      if (user && window.Tawk_API?.setAttributes) {
        window.Tawk_API.setAttributes({
          name: user.name,
          email: user.email,
          id: user.id,
          hash: 'fb93e0d85c0a682dc54f0af7adaf6ae853a51743', // Use environment variable in production
        }, function(error) {
          if (error) console.error('Tawk setAttributes error:', error);
        });
      }

      if (user && window.Tawk_API?.addEvent) {
        window.Tawk_API.addEvent('user_logged_in', {
          username: user.name,
          email: user.email,
        }, function(error) {
          if (error) console.error('Tawk addEvent error:', error);
        });
      }
    };
//@ts-ignore
    window.Tawk_API.onStatusChange = function(status) {
      //@ts-ignore

      if (status === 'online') {
        window.Tawk_API?.start({ showWidget: false });
      }
    };
  }, [user]);

  useEffect(() => {
    const tawkScript = document.querySelector('script[src^="https://embed.tawk.to"]');
    if (tawkScript) {
      initializeTawk();
    } else {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/YOUR_TAWK_PROPERTY_ID/YOUR_TAWK_WIDGET_ID';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      script.onload = initializeTawk;
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, [initializeTawk]);

  const handleSupportClick = () => {
    if (window.Tawk_API?.isChatMinimized()) {
      window.Tawk_API?.maximize();
    } else {
      window.Tawk_API?.toggle();
    }
  };

  return (
    <div data-collapsed={isCollapsed} className="group flex flex-col h-full">
      <div className="flex-grow">
        <nav className="grid gap-1 px-2 pt-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {links.map((nav, index) => (
            <div key={index}>
              {nav.items.map((link) =>
                isCollapsed ? (
                  <MiniNav key={link.label} nav={link} />
                ) : !link.isCollapsible ? (
                  <SimpleNav key={link.label} nav={link} />
                ) 
                : (
                  <CollapseNavItem nav={link} key={link.label} />
                )
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {links[3]?.category === "Report a bug" &&<div className="mt-auto px-2 pb-2">
        <button
          className={`w-full py-2 px-3 bg-black text-sm text-white dark:border-white border rounded-md ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="Support"
          onClick={handleSupportClick}
        >
          {isCollapsed ? '?' : 'Report a bug'}
        </button>
      </div>}
    </div>
  );
}