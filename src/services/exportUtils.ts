/**
 * Export Utilities
 * Helpers to embed fonts and images as Base64 to prevent CORS/Security errors in html-to-image
 */

export async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Fetches an image (bypassing CORS if possible via proxy if needed, or just standard fetch)
 * and returns a Base64 string.
 */
export async function urlToBase64(url: string): Promise<string | null> {
    const fetchWithProxy = async (targetUrl: string, useProxy: boolean) => {
        const finalUrl = useProxy ? `https://corsproxy.io/?${encodeURIComponent(targetUrl)}` : targetUrl;
        try {
            const response = await fetch(finalUrl, { cache: 'force-cache' });
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            return await blobToBase64(blob);
        } catch (error) {
            throw error;
        }
    };

    const isHighRisk = url.includes('youtube.com') || url.includes('googleusercontent.com') || url.includes('i.ytimg.com');

    try {
        // 1. Try Direct only if not high risk
        if (!isHighRisk) {
            console.log('[Proxy] Attempting direct fetch:', url);
            return await fetchWithProxy(url, false);
        }
        console.log('[Proxy] Proactive skip (High Risk):', url);
        throw new Error('Proactive proxy fallback');
    } catch (err) {
        // 2. Try Proxy
        console.log('[Proxy] Attempting proxy fetch:', url);
        try {
            return await fetchWithProxy(url, true);
        } catch (proxyErr) {
            console.warn('[Proxy] Both direct and proxy failed:', url, { err, proxyErr });
            return null;
        }
    }
}

/**
 * Embeds Google Fonts as Base64
 * 1. Fetches the CSS
 * 2. Parses the WOFF2 URLs
 * 3. Fetches WOFF2 data
 * 4. Reconstructs CSS with Data URLs
 */
export async function getEmbeddedFontCSS(fontFamily: string): Promise<string> {
    try {
        const cssUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
        const res = await fetch(cssUrl);
        let css = await res.text();

        // Find all URLs in the CSS
        const urlRegex = /url\(([^)]+)\)/g;
        const matches = [...css.matchAll(urlRegex)];
        
        for (const match of matches) {
            const originalUrl = match[1].replace(/['"]/g, ''); // Clean quotes
            
            // Fetch font file
            try {
                const fontRes = await fetch(originalUrl);
                const fontBlob = await fontRes.blob();
                const base64 = await blobToBase64(fontBlob);
                
                // Replace in CSS
                css = css.replace(match[1], `"${base64}"`);
            } catch {
                console.warn('Failed to embed specific font file:', originalUrl);
            }
        }
        return css;
    } catch (e) {
         console.warn('Failed to embed font CSS', e);
         return '';
    }
}
