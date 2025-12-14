import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML configuration for MusiGuess
 * Optimized for SEO and AdSense compliance
 */
export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

                {/* SEO Meta Tags */}
                <title>MusiGuess - The Ultimate Music Trivia Game | Play Free Online</title>
                <meta name="description" content="Challenge your music knowledge with MusiGuess! Listen to song previews and guess the track. Play solo or compete with friends in real-time multiplayer. Free to play, no signup required." />
                <meta name="keywords" content="music trivia, music quiz, guess the song, music game, multiplayer music game, iTunes music trivia, song guessing game, free music game" />
                <meta name="author" content="MusiGuess" />
                <meta name="robots" content="index, follow" />

                {/* Open Graph / Social Media */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="MusiGuess - The Ultimate Music Trivia Game" />
                <meta property="og:description" content="Challenge your music knowledge! Listen to song previews and guess the track. Play solo or with friends." />
                <meta property="og:url" content="https://musiguess.live" />
                <meta property="og:site_name" content="MusiGuess" />
                <meta property="og:image" content="https://musiguess.live/og-image.png" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="MusiGuess - The Ultimate Music Trivia Game" />
                <meta name="twitter:description" content="Challenge your music knowledge! Listen to song previews and guess the track." />
                <meta name="twitter:image" content="https://musiguess.live/og-image.png" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://musiguess.live" />

                {/* Favicon */}
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

                {/* Theme Color */}
                <meta name="theme-color" content="#0a0e17" />
                <meta name="msapplication-TileColor" content="#0a0e17" />

                {/* Structured Data (JSON-LD) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "MusiGuess",
                            "description": "The ultimate music trivia game. Listen to song previews and guess the track.",
                            "url": "https://musiguess.live",
                            "applicationCategory": "GameApplication",
                            "operatingSystem": "Web Browser",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "author": {
                                "@type": "Organization",
                                "name": "MusiGuess"
                            }
                        })
                    }}
                />

                {/* Google AdSense */}
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9555506877953640"
                    crossOrigin="anonymous"
                />

                {/* Preconnect to external resources */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://itunes.apple.com" />

                {/* GitHub Pages SPA redirect handling */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function(l) {
                        if (l.search[1] === '/') {
                            var decoded = l.search.slice(1).split('&').map(function(s) {
                                return s.replace(/~and~/g, '&')
                            }).join('?');
                            window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
                        }
                    }(window.location))
                    `
                }} />

                <ScrollViewStyleReset />

                {/* Global Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #0a0e17;
                        overflow-x: hidden;
                    }
                    /* Smooth scrolling */
                    html {
                        scroll-behavior: smooth;
                    }
                    /* Focus styles for accessibility */
                    *:focus-visible {
                        outline: 2px solid #00f3ff;
                        outline-offset: 2px;
                    }
                    /* Selection color */
                    ::selection {
                        background-color: rgba(0, 243, 255, 0.3);
                        color: #ffffff;
                    }
                `}} />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
