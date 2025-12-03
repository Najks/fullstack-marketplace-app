import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function GoogleSignIn({
                                         text = 'signin_with',
                                         theme = 'outline',
                                         size = 'large',
                                         shape = 'rectangular',
                                         width = 280,
                                         className = '',
                                         onSuccess,
                                         onError,
                                     }) {
    const buttonRef = useRef(null);
    const initializedRef = useRef(false);
    const { loginWithGoogleCredential } = useAuth();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    useEffect(() => {
        if (!clientId) {
            // No client id => no-op
            return;
        }
        const init = () => {
            if (initializedRef.current || !window.google?.accounts?.id) return;
            initializedRef.current = true;

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    try {
                        const data = await loginWithGoogleCredential(response.credential);
                        onSuccess?.(data);
                    } catch (e) {
                        console.error(e);
                        onError?.(e);
                    }
                },
                ux_mode: 'popup',
                auto_select: false,
            });

            if (buttonRef.current) {
                window.google.accounts.id.renderButton(buttonRef.current, {
                    type: 'standard',
                    theme,
                    size,
                    text,
                    shape,
                    width,
                    logo_alignment: 'left',
                });
            }

            // Optionally show One Tap
            window.google.accounts.id.prompt();
        };

        // load script if needed
        if (!window.google?.accounts?.id) {
            const scriptId = 'google-oauth-gsi';
            let script = document.getElementById(scriptId);
            if (!script) {
                script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = init;
                document.head.appendChild(script);
            } else if (script.onload) {
                script.onload = init;
            } else {
                const t = setTimeout(init, 0);
                return () => clearTimeout(t);
            }
        } else {
            init();
        }
    }, [clientId, loginWithGoogleCredential, onSuccess, onError, theme, size, text, shape, width]);

    return <div ref={buttonRef} className={className} />;
}