/**
 * Script principal do Spread
 * Gerencia a geração e customização de cards de visualização de links
 */

(function () {
    "use strict";
  
    console.log("Spread.js iniciando...");
  
    // === BASE PATH ===
    const base = (window.BASE_PATH || document.body.dataset.base || "").replace(/\/$/, "");
  
    // Favicon com base correto
    const fallbackFaviconSrc = base ? `${base}/favicon-light.svg` : "/favicon-light.svg";
  
    // === ELEMENTOS DOM ===
    const linkInput = document.getElementById("linkInput");
    const generateButton = document.getElementById("generateButton");
    const errorMessage = document.getElementById("errorMessage");
    
    // Preview Areas
    const skeletonLoader = document.getElementById("skeletonLoader");
    const previewContainer = document.getElementById("previewContainer");
    const previewCard = document.getElementById("previewCard");
    
    // Download
    const downloadButton = document.getElementById("downloadButton");
    const downloadSection = document.getElementById("downloadSection");
    const downloadStatus = document.getElementById("downloadStatus");
    
    // Card Elements
    const gradientBackground = document.getElementById("gradientBackground");
    const patternOverlay = document.getElementById("patternOverlay");
    const innerCard = document.getElementById("innerCard");
    const previewFavicon = document.getElementById("previewFavicon");
    const previewDomain = document.getElementById("previewDomain");
    const previewImage = document.getElementById("previewImage");
  
    // Controls - Colors
    const bgColor1 = document.getElementById("bgColor1");
    const bgColor2 = document.getElementById("bgColor2");
    const bgColor1Hex = document.getElementById("bgColor1Hex");
    const bgColor2Hex = document.getElementById("bgColor2Hex");
    const gradientStyle = document.getElementById("gradientStyle");
    
    // Controls - Background
    const patternSelector = document.getElementById("patternSelector");
    const bgImageInput = document.getElementById("bgImageInput");
    const removeBgImageBtn = document.getElementById("removeBgImage");
    
    // Controls - Typography
    const fontSelector = document.getElementById("fontSelector");
    const fontSizeSlider = document.getElementById("fontSizeSlider");
    const fontSizeValue = document.getElementById("fontSizeValue");
    
    // Controls - Layout
    const imageAspect = document.getElementById("imageAspect");
    const imagePosition = document.getElementById("imagePosition");
    const imageFit = document.getElementById("imageFit");
    const imageScaleSlider = document.getElementById("imageScaleSlider");
    const imageScaleValue = document.getElementById("imageScaleValue");

    const outerRadiusSlider = document.getElementById("outerRadiusSlider");
    const outerRadiusValue = document.getElementById("outerRadiusValue");
    const innerRadiusSlider = document.getElementById("innerRadiusSlider");
    const innerRadiusValue = document.getElementById("innerRadiusValue");
    const paddingSlider = document.getElementById("paddingSlider");
    const paddingValue = document.getElementById("paddingValue");
    const opacitySlider = document.getElementById("opacitySlider");
    const opacityValue = document.getElementById("opacityValue");
    
    // Controls - Export
    const exportSize = document.getElementById("exportSize");

    const resetButton = document.getElementById("resetButton");
  
    // Theme Buttons
    const themeButtons = {
        vibrant: document.getElementById("themeVibrant"),
        dark: document.getElementById("themeDark"),
        neon: document.getElementById("themeNeon"),
        sunset: document.getElementById("themeSunset"),
        forest: document.getElementById("themeForest"),
        midnight: document.getElementById("themeMidnight"),
        berry: document.getElementById("themeBerry"),
        ocean: document.getElementById("themeOcean")
    };

    const autoThemeBtn = document.getElementById("autoThemeBtn");
  
    const templates = {
      default: document.getElementById("templateDefault"),
      music: document.getElementById("templateMusic"),
      news: document.getElementById("templateNews"),
    };
  
    const templateData = {
      defaultTitle: document.getElementById("defaultTitle"),
      defaultDescription: document.getElementById("defaultDescription"),
      musicTitle: document.getElementById("musicTitle"),
      musicArtist: document.getElementById("musicArtist"),
      newsHeadline: document.getElementById("newsHeadline"),
      newsAuthor: document.getElementById("newsAuthor"),
      newsDescription: document.getElementById("newsDescription"),
      newsSourceIcon: document.getElementById("newsSourceIcon"), // New element
    };
  
    const platformIcon = document.getElementById("platformIcon");
  
    const colorThief = new ColorThief();
    let currentLinkData = null;
    let dominantColor = null;
    let isUpdatingFromHex = false;
    let lastFetchTime = 0;
    const FETCH_COOLDOWN = 2000; 
    const requestCache = new Map();
    let customBgImage = null;
  
    // === FUNÇÕES DE UI ===
    function showLoading(show) {
      if (show) {
        skeletonLoader.classList.remove("hidden");
        previewCard.classList.add("hidden");
        downloadSection.classList.add("hidden");
        downloadButton.disabled = true;
      } else {
        skeletonLoader.classList.add("hidden");
        previewCard.classList.remove("hidden");
        downloadSection.classList.remove("hidden");
        downloadButton.disabled = false;
      }
    }
  
    function showMessage(text, type = "") {
      errorMessage.textContent = text;
      errorMessage.className = `mt-2 text-xs text-center min-h-[1rem] ${
        type === "error" ? "text-red-400" : type === "success" ? "text-green-400" : "text-blue-400"
      }`;
    }
  
    function showDownloadStatus(text, type = "") {
      downloadStatus.textContent = text;
      downloadStatus.className = `text-xs h-4 ${
        type === "error" ? "text-red-400" : type === "success" ? "text-green-400" : "text-[var(--text-muted)]"
      }`;
    }
  
    // === ATUALIZAÇÃO VISUAL ===
  
    function updateGradient() {
      if (customBgImage) {
        gradientBackground.style.backgroundImage = `url('${customBgImage}')`;
        gradientBackground.style.backgroundSize = "cover";
        gradientBackground.style.backgroundPosition = "center";
      } else {
        const color1 = bgColor1.value;
        const color2 = bgColor2.value;
        const style = gradientStyle.value;
        const bg = style.includes("circle")
          ? `radial-gradient(${style}, ${color1}, ${color2})`
          : `linear-gradient(${style}, ${color1}, ${color2})`;
        
        gradientBackground.style.backgroundImage = bg;
        gradientBackground.style.backgroundSize = "auto";
      }
  
      if (!isUpdatingFromHex) {
        bgColor1Hex.value = bgColor1.value.toUpperCase();
        bgColor2Hex.value = bgColor2.value.toUpperCase();
      }
    }
  
    function updatePattern() {
        const pattern = patternSelector.value;
        patternOverlay.style.backgroundImage = "none";
        patternOverlay.style.opacity = "0.3";
        
        if (pattern === "dots") {
            patternOverlay.style.backgroundImage = "radial-gradient(#ffffff 1px, transparent 1px)";
            patternOverlay.style.backgroundSize = "20px 20px";
        } else if (pattern === "grid") {
            patternOverlay.style.backgroundImage = "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)";
            patternOverlay.style.backgroundSize = "20px 20px";
            patternOverlay.style.opacity = "0.1";
        } else if (pattern === "noise") {
             const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E`;
             patternOverlay.style.backgroundImage = `url("${noiseSvg}")`;
             patternOverlay.style.opacity = "0.15";
        }
    }

    function handleBgImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                customBgImage = event.target.result;
                updateGradient();
                removeBgImageBtn.classList.remove("hidden");
            };
            reader.readAsDataURL(file);
        }
    }

    function removeBgImage() {
        customBgImage = null;
        bgImageInput.value = "";
        removeBgImageBtn.classList.add("hidden");
        updateGradient();
    }
  
    function updateFont() {
        const font = fontSelector.value;
        const elements = [
            templateData.defaultTitle, templateData.defaultDescription,
            templateData.musicTitle, templateData.musicArtist,
            templateData.newsHeadline, templateData.newsAuthor, templateData.newsDescription,
            previewDomain
        ];
        
        elements.forEach(el => {
            if(el) el.style.fontFamily = `'${font}', sans-serif`;
        });
        
        if (font === 'Playfair Display') {
            templateData.newsHeadline.style.fontStyle = 'italic';
        } else {
            templateData.newsHeadline.style.fontStyle = 'normal';
        }
    }

    function updateImageStyle() {
      const aspect = imageAspect.value;
      const position = imagePosition.value;
      // New controls
      const fit = imageFit ? imageFit.value : "object-cover";
      const scale = imageScaleSlider ? imageScaleSlider.value / 100 : 1;
      
      const aspectClasses = ["aspect-video", "aspect-square", "aspect-[9/16]"];
      const positionClasses = [
        "object-center", "object-top", "object-bottom", "object-left", "object-right",
      ];
      const fitClasses = ["object-cover", "object-contain"];
  
      previewImage.classList.remove(...aspectClasses, ...positionClasses, ...fitClasses);
      previewImage.classList.add(aspect, position, fit);
      
      // Apply scale via transform
      previewImage.style.transform = `scale(${scale})`;
      
      if(imageScaleValue) imageScaleValue.textContent = Math.round(scale * 100) + "%";
    }
  
    function updateBorderRadius() {
      const outer = outerRadiusSlider.value + "px";
      const inner = innerRadiusSlider.value + "px";
      gradientBackground.style.borderRadius = outer;
      innerCard.style.borderRadius = inner;
      
      outerRadiusValue.textContent = outer;
      innerRadiusValue.textContent = inner;
    }
  
    function updatePadding() {
      const paddingValueText = paddingSlider.value * 0.25 + "rem";
      gradientBackground.style.padding = paddingValueText;
      paddingValue.textContent = paddingValueText;
    }
  
    function updateOpacity() {
      const opacity = opacitySlider.value / 100;
      innerCard.style.backgroundColor = `rgba(26, 26, 26, ${opacity})`;
      opacityValue.textContent = opacitySlider.value + "%";
    }
  
    function updateFontSize() {
      const scale = fontSizeSlider.value / 100;
      const titles = [
        templateData.defaultTitle,
        templateData.musicTitle,
        templateData.newsHeadline,
      ];
      const descriptions = [
        templateData.defaultDescription,
        templateData.musicArtist,
        templateData.newsAuthor,
        templateData.newsDescription,
      ];
  
      titles.forEach((el) => {
        if (el) el.style.fontSize = `${1.5 * scale}rem`;
      });
  
      descriptions.forEach((el) => {
        if (el) el.style.fontSize = `${0.875 * scale}rem`;
      });
  
      fontSizeValue.textContent = fontSizeSlider.value + "%";
    }
  
    // === THEME ASSISTANT ===
    function applyTheme(theme) {
        switch(theme) {
            case 'vibrant':
                bgColor1.value = "#c084fc"; // Purple 400
                bgColor2.value = "#f472b6"; // Pink 400
                gradientStyle.value = "135deg";
                break;
            case 'dark':
                bgColor1.value = "#18181b"; // Zinc 900
                bgColor2.value = "#3f3f46"; // Zinc 700
                gradientStyle.value = "circle at center";
                break;
            case 'neon':
                bgColor1.value = "#22d3ee"; // Cyan 400
                bgColor2.value = "#2563eb"; // Blue 600
                gradientStyle.value = "45deg";
                break;
            case 'sunset':
                bgColor1.value = "#fb923c"; // Orange 400
                bgColor2.value = "#ef4444"; // Red 500
                gradientStyle.value = "180deg";
                break;
            case 'forest':
                bgColor1.value = "#064e3b"; // Emerald 800
                bgColor2.value = "#16a34a"; // Green 600
                gradientStyle.value = "135deg";
                break;
            case 'midnight':
                bgColor1.value = "#0f172a"; // Slate 900
                bgColor2.value = "#312e81"; // Indigo 900
                gradientStyle.value = "circle at top left";
                break;
            case 'berry':
                bgColor1.value = "#881337"; // Rose 900
                bgColor2.value = "#9d174d"; // Pink 800
                gradientStyle.value = "45deg";
                break;
            case 'ocean':
                bgColor1.value = "#0284c7"; // Sky 600
                bgColor2.value = "#1e3a8a"; // Blue 900
                gradientStyle.value = "180deg";
                break;
        }
        updateGradient();
    }
  
    // === EXTRAÇÃO DE COR ===
    async function extractDominantColor(imageBase64) {
      if (!imageBase64) return;
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageBase64;
  
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
  
      try {
        const rgb = colorThief.getColor(img);
        dominantColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  
        const dominant = tinycolor(dominantColor);
        const dark = dominant.clone().darken(20).toHexString();
        const vibrant = dominant.clone().saturate(20).toHexString();

        bgColor1.value = dark;
        bgColor2.value = vibrant;
        updateGradient();
      } catch (err) {
        console.warn("⚠️ Falha ao extrair cor:", err);
      }
    }
  
    // === TEMPLATE ===
    function applyTemplate(data) {
      console.log("Aplicando template:", data.template || "default");
      currentLinkData = data;
  
      Object.values(templates).forEach((t) => t.classList.add("hidden"));
  
      // Favicon & Domain
      // ALWAYS use the Spread logo for the header
      previewFavicon.src = fallbackFaviconSrc;
      previewDomain.textContent = "Spread"; 
  
      // IMAGEM
      if (data.image) {
        previewImage.src = data.image;
        previewImage.classList.remove("hidden");
        downloadButton.disabled = false;
        extractDominantColor(data.image);
      } else {
        previewImage.src = "";
        previewImage.classList.add("hidden");
        downloadButton.disabled = true;
      }
  
      // TEMPLATES
      const template = data.template || "default";
  
      if (template === "music") {
        templates.music.classList.remove("hidden");
        templateData.musicTitle.textContent = data.title;
        templateData.musicArtist.textContent = data.author || "Artista desconhecido";
  
        const isSpotify = data.url && data.url.includes("spotify");
        const isYoutube = data.url && (data.url.includes("youtube") || data.url.includes("youtu.be"));
        const isYoutubeMusic = data.url && data.url.includes("music.youtube"); 
  
        if (isSpotify) {
          platformIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-[#1DB954]"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>';
          platformIcon.classList.remove("hidden");
        } else if (isYoutubeMusic) {
             platformIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-[#FF0000]"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"/><path d="M10 16.5v-9l6 4.5-6 4.5z" fill="#fff"/></svg>';
             platformIcon.classList.remove("hidden");
        } else if (isYoutube) {
          platformIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-[#FF0000]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';
          platformIcon.classList.remove("hidden");
        } else {
          platformIcon.classList.add("hidden");
        }
      } else if (template === "news") {
        templates.news.classList.remove("hidden");
        templateData.newsHeadline.textContent = data.title;
        templateData.newsAuthor.textContent = data.author ? `Por ${data.author}` : "";
        templateData.newsDescription.textContent = data.description;
        
        // Show source icon for news
        if(data.favicon) {
            templateData.newsSourceIcon.src = data.favicon;
            templateData.newsSourceIcon.classList.remove("hidden");
        } else {
            templateData.newsSourceIcon.classList.add("hidden");
        }
        
        platformIcon.classList.add("hidden");
      } else {
        templates.default.classList.remove("hidden");
        templateData.defaultTitle.textContent = data.title;
        templateData.defaultDescription.textContent = data.description;
        platformIcon.classList.add("hidden");
      }
  
      updateImageStyle();
      showLoading(false);
    }
  
    // === CONVERSÃO PARA BASE64 ===
    async function toBase64(url) {
      if (!url || url.startsWith("data:")) return url;
      
      const fetchWithProxy = async (targetUrl) => {
          try {
              // Tenta primeiro via proxy para evitar CORS
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
              const response = await fetch(proxyUrl);
              if (!response.ok) throw new Error("Proxy failed");
              return await response.blob();
          } catch (e) {
              // Fallback para fetch direto (pode falhar por CORS)
              const response = await fetch(targetUrl, { mode: "cors" });
              if (!response.ok) throw new Error("Direct fetch failed");
              return await response.blob();
          }
      };

      try {
        const blob = await fetchWithProxy(url);
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn("⚠️ Falha ao converter para Base64:", error);
        return null; // Retorna null para não quebrar, mas a imagem não aparecerá
      }
    }
  
    // === FETCH YOUTUBE MUSIC DATA ===
    async function fetchYouTubeMusicData(url) {
      try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        if (!videoId) throw new Error("ID do vídeo não encontrado");
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);
        if (!response.ok) throw new Error("Falha ao buscar dados do YouTube");
        const data = await response.json();
        
        // Clean author name (remove " - Topic")
        let author = data.author_name;
        if (author) {
            author = author.replace(/ - Topic$/, "");
        }

        return {
          title: data.title,
          author: author,
          thumbnail: data.thumbnail_url,
        };
      } catch (error) {
        console.warn("⚠️ Não foi possível buscar dados do YouTube Music:", error);
        return null;
      }
    }
  
    // === PARSE LINK ===
    async function parseLink(url) {
      if (!url || !url.match(/^https?:\/\//i)) {
        return showMessage("URL inválida. Use http:// ou https://", "error");
      }
      const now = Date.now();
      if (now - lastFetchTime < FETCH_COOLDOWN) {
        return showMessage("Aguarde um momento...", "error");
      }
      if (requestCache.has(url)) {
        applyTemplate(requestCache.get(url));
        return;
      }
      lastFetchTime = now;
      showLoading(true);
      showMessage("");
      showDownloadStatus("");
  
      try {
        let youtubeData = null;
        const isYouTubeMusic = url.includes("music.youtube.com");
        if (isYouTubeMusic) {
          youtubeData = await fetchYouTubeMusicData(url);
        }
        let linkData = null;
        try {
          const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error("API Error");
          const result = await response.json();
          linkData = await processMicrolinkData(result.data, url, youtubeData, isYouTubeMusic);
        } catch (microlinkError) {
          try {
            const jsonlinkUrl = `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`;
            const response = await fetch(jsonlinkUrl);
            if (response.ok) {
                const result = await response.json();
                linkData = await processJsonLinkData(result, url, youtubeData, isYouTubeMusic);
            } else {
                throw new Error("JSONLink Error");
            }
          } catch (jsonLinkError) {
             if (youtubeData) {
                linkData = {
                    title: youtubeData.title,
                    description: "YouTube Music",
                    image: youtubeData.thumbnail ? await toBase64(youtubeData.thumbnail) : "",
                    favicon: fallbackFaviconSrc,
                    domain: new URL(url).hostname,
                    author: youtubeData.author,
                    url,
                    template: "music",
                  };
             } else {
                 throw new Error("Não foi possível carregar os dados.");
             }
          }
        }
        if (linkData) {
          requestCache.set(url, linkData);
          if (requestCache.size > 10) {
            const firstKey = requestCache.keys().next().value;
            requestCache.delete(firstKey);
          }
          applyTemplate(linkData);
        }
      } catch (error) {
        console.error("❌ Erro:", error);
        showMessage("Falha ao carregar link.", "error");
        showLoading(false);
      }
    }
  
    // === PROCESSADORES DE DADOS ===
    async function processMicrolinkData(d, url, youtubeData, isYouTubeMusic) {
      let title = d.title || "Sem título";
      let author = d.author_name || d.author || null;
      let imageUrl = d.image?.url || d.screenshot?.url;
      
      if (youtubeData) {
        title = youtubeData.title;
        author = youtubeData.author;
        if (youtubeData.thumbnail) imageUrl = youtubeData.thumbnail;
      }
      
      // Clean author if not YouTube Music (just in case)
      if (author && typeof author === 'string') {
          author = author.replace(/ - Topic$/, "");
      }

      const image = imageUrl ? await toBase64(imageUrl) : "";
      
      // Get favicon for the source icon (not the header)
      let favicon = "";
      if (!isYouTubeMusic && d.logo?.url) {
          const fav = await toBase64(d.logo.url);
          if(fav) favicon = fav;
      }
      
      let template = "default";
      if (isYouTubeMusic || url.includes("spotify") || url.includes("bandcamp") || url.includes("soundcloud")) {
        template = "music";
        if (isYouTubeMusic && title.includes("-")) {
             const parts = title.split("-");
             if (parts.length >= 2) {
                 author = parts[0].trim();
                 title = parts.slice(1).join("-").trim();
             }
        }
      } else if (author) {
        template = "news";
      }
      return { title, description: d.description || "", image, favicon, domain: new URL(url).hostname, author, url, template };
    }

    async function processJsonLinkData(d, url, youtubeData, isYouTubeMusic) {
        let title = d.title || "Sem título";
        let author = d.author || null;
        let imageUrl = d.images?.[0] || d.image;
        if (youtubeData) {
          title = youtubeData.title;
          author = youtubeData.author;
          if (youtubeData.thumbnail) imageUrl = youtubeData.thumbnail;
        }
        
        if (author && typeof author === 'string') {
            author = author.replace(/ - Topic$/, "");
        }

        const image = imageUrl ? await toBase64(imageUrl) : "";
        
        // Get favicon for the source icon
        let favicon = "";
        if (!isYouTubeMusic && d.favicon) {
            const fav = await toBase64(d.favicon);
            if(fav) favicon = fav;
        }
        let template = "default";
        if (isYouTubeMusic || url.includes("spotify") || url.includes("bandcamp") || url.includes("soundcloud")) {
          template = "music";
        } else if (author) {
          template = "news";
        }
        return { title, description: d.description || "", image, favicon, domain: new URL(url).hostname, author, url, template };
      }

    // === EVENT LISTENERS ===
    generateButton.addEventListener("click", () => {
        const url = linkInput.value.trim();
        if (url) parseLink(url);
    });

    linkInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const url = linkInput.value.trim();
            if (url) parseLink(url);
        }
    });

    // Color Inputs
    bgColor1.addEventListener("input", updateGradient);
    bgColor2.addEventListener("input", updateGradient);
    gradientStyle.addEventListener("change", updateGradient);
    
    bgColor1Hex.addEventListener("input", (e) => {
        isUpdatingFromHex = true;
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            bgColor1.value = e.target.value;
            updateGradient();
        }
        isUpdatingFromHex = false;
    });

    bgColor2Hex.addEventListener("input", (e) => {
        isUpdatingFromHex = true;
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            bgColor2.value = e.target.value;
            updateGradient();
        }
        isUpdatingFromHex = false;
    });

    // Background Controls
    patternSelector.addEventListener("change", updatePattern);
    bgImageInput.addEventListener("change", handleBgImageUpload);
    removeBgImageBtn.addEventListener("click", removeBgImage);

    // Typography
    fontSelector.addEventListener("change", updateFont);
    fontSizeSlider.addEventListener("input", updateFontSize);

    // Layout
    imageAspect.addEventListener("change", updateImageStyle);
    imagePosition.addEventListener("change", updateImageStyle);
    imageFit.addEventListener("change", updateImageStyle);
    imageScaleSlider.addEventListener("input", updateImageStyle);
    
    outerRadiusSlider.addEventListener("input", updateBorderRadius);
    innerRadiusSlider.addEventListener("input", updateBorderRadius);
    paddingSlider.addEventListener("input", updatePadding);
    opacitySlider.addEventListener("input", updateOpacity);

    // Reset
    resetButton.addEventListener("click", () => {
        bgColor1.value = "#2e1065";
        bgColor2.value = "#be185d";
        gradientStyle.value = "135deg";
        patternSelector.value = "none";
        fontSelector.value = "Inter";
        fontSizeSlider.value = 100;
        imageAspect.value = "aspect-video";
        imagePosition.value = "object-center";
        imageFit.value = "object-cover";
        imageScaleSlider.value = 100;
        outerRadiusSlider.value = 0;
        innerRadiusSlider.value = 12;
        paddingSlider.value = 6;
        opacitySlider.value = 90;
        exportSize.value = "2";
        
        removeBgImage();
        updateGradient();
        updatePattern();
        updateFont();
        updateFontSize();
        updateImageStyle();
        updateBorderRadius();
        updatePadding();
        updateOpacity();
    });

    // Theme Buttons
    Object.entries(themeButtons).forEach(([key, btn]) => {
        if(btn) {
            btn.addEventListener("click", () => applyTheme(key));
        }
    });

    // Auto Theme Button
    if (autoThemeBtn) {
        autoThemeBtn.addEventListener("click", () => {
            if (currentLinkData && currentLinkData.image) {
                extractDominantColor(currentLinkData.image);
            } else {
                showMessage("Gere um card com imagem primeiro.", "error");
            }
        });
    }

    // Download
    downloadButton.addEventListener("click", async () => {
        if (!currentLinkData) return;
        downloadButton.disabled = true;
        showDownloadStatus("Gerando imagem...", "info");
        
        try {
            const scale = parseInt(exportSize.value) || 2;
            const dataUrl = await htmlToImage.toPng(gradientBackground, {
                quality: 1.0,
                pixelRatio: scale,
                style: { transform: "scale(1)" } // Ensure no transform issues
            });
            
            const link = document.createElement("a");
            link.download = `spread-${currentLinkData.domain}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            showDownloadStatus("Download iniciado!", "success");
        } catch (err) {
            console.error(err);
            showDownloadStatus("Erro ao gerar imagem.", "error");
        } finally {
            downloadButton.disabled = false;
            setTimeout(() => showDownloadStatus(""), 3000);
        }
    });

    // Init
    updateGradient();
    updatePattern();
    updateFont();
    updateFontSize();
    updateImageStyle();
    updateBorderRadius();
    updatePadding();
    updateOpacity();

})();
