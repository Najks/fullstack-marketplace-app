import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
    const { user, loading, loginWithGoogleCredential } = useAuth();
    const [err, setErr] = useState('');
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const buttonRef = useRef(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const navigate = useNavigate();

    // Redirect when authenticated
    useEffect(() => {
        if (!loading && user) {
            navigate('/', { replace: true });
        }
    }, [loading, user, navigate]);

    useEffect(() => {
        if (loading || user) return;
        if (!clientId) {
            setErr('Missing VITE_GOOGLE_CLIENT_ID.');
            return;
        }

        let scriptEl;

        const initGsi = () => {
            if (!window.google || !buttonRef.current) return;

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    try {
                        await loginWithGoogleCredential(response.credential);
                        navigate('/', { replace: true });
                    } catch (e) {
                        setErr(e?.message || 'Authentication error');
                    }
                },
            });

            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                shape: 'rectangular',
                text: 'signin_with',
            });

            setScriptLoaded(true);
        };

        if (window.google?.accounts?.id) {
            initGsi();
            return () => window.google.accounts.id.cancel();
        }

        scriptEl = document.createElement('script');
        scriptEl.src = 'https://accounts.google.com/gsi/client';
        scriptEl.async = true;
        scriptEl.defer = true;
        scriptEl.onload = initGsi;
        scriptEl.onerror = () => setErr('Failed to load Google Identity Services.');
        document.head.appendChild(scriptEl);

        return () => {
            if (window.google?.accounts?.id) window.google.accounts.id.cancel();
            if (scriptEl) scriptEl.remove();
        };
    }, [clientId, loading, user, loginWithGoogleCredential, navigate]);

    return (
        <div className="container py-5" style={{ maxWidth: 560 }}>
            <h1 className="h3 mb-4">Login with Google</h1>

            {!loading && <div ref={buttonRef} />}

            {(loading || !scriptLoaded) && <div className="text-muted">Loading...</div>}

            {err && (
                <div className="alert alert-danger mt-3" role="alert">
                    {err}
                </div>
            )}
        </div>
    );
}