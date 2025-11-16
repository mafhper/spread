/**
 * Script principal do Spread
 * Gerencia a geração e customização de cards de visualização de links
 */

(function () {
  "use strict";

  console.log("🚀 Spread.js iniciando...");

  // === BASE PATH ===
  const base = (document.body.dataset.base || "").replace(/\/$/, "");
  console.log("📁 Base path detectado:", base || "(raiz)");

  // Favicon com base correto - sempre usa o base se disponível
  const fallbackFaviconSrc = base ? `${base}/favicon.svg` : "/favicon.svg";
  console.log("🎨 Favicon path:", fallbackFaviconSrc);

  // === ELEMENTOS DOM ===
  const linkInput = document.getElementById("linkInput");
  const generateButton = document.getElementById("generateButton");
  const errorMessage = document.getElementById("errorMessage");
  const skeletonLoader = document.getElementById("skeletonLoader");
  const previewCard = document.getElementById("previewCard");
  const downloadButton = document.getElementById("downloadButton");
  const downloadSection = document.getElementById("downloadSection");
  const downloadStatus = document.getElementById("downloadStatus");
  const gradientBackground = document.getElementById("gradientBackground");
  const innerCard = document.getElementById("innerCard");
  const previewFavicon = document.getElementById("previewFavicon");
  const previewImage = document.getElementById("previewImage");

  const bgColor1 = document.getElementById("bgColor1");
  const bgColor2 = document.getElementById("bgColor2");
  const bgColor1Hex = document.getElementById("bgColor1Hex");
  const bgColor2Hex = document.getElementById("bgColor2Hex");
  const gradientStyle = document.getElementById("gradientStyle");
  const imageAspect = document.getElementById("imageAspect");
  const imagePosition = document.getElementById("imagePosition");
  const outerRadiusSlider = document.getElementById("outerRadiusSlider");
  const outerRadiusValue = document.getElementById("outerRadiusValue");
  const innerRadiusSlider = document.getElementById("innerRadiusSlider");
  const innerRadiusValue = document.getElementById("innerRadiusValue");
  const paddingSlider = document.getElementById("paddingSlider");
  const paddingValue = document.getElementById("paddingValue");
  const opacitySlider = document.getElementById("opacitySlider");
  const opacityValue = document.getElementById("opacityValue");
  const fontSizeSlider = document.getElementById("fontSizeSlider");
  const fontSizeValue = document.getElementById("fontSizeValue");
  const resetButton = document.getElementById("resetButton");

  const assistButtons = {
    analogous: document.getElementById("assistAnalogous"),
    triad: document.getElementById("assistTriad"),
    split: document.getElementById("assistSplit"),
    mono: document.getElementById("assistMono"),
  };

  const themeButtons = {
    sunset: document.getElementById("themeSunset"),
    ocean: document.getElementById("themeOcean"),
    forest: document.getElementById("themeForest"),
    neon: document.getElementById("themeNeon"),
  };

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
  };

  const platformIcon = document.getElementById("platformIcon");

  const colorThief = new ColorThief();
  let currentLinkData = null;
  let dominantColor = null;
  let isUpdatingFromHex = false;
  let lastFetchTime = 0;
  const FETCH_COOLDOWN = 2000; // 2 segundos entre requests
  const requestCache = new Map(); // Cache simples de requests

  // === FUNÇÕES DE UI ===
  function showLoading(show) {
    console.log("🔄 Loading:", show);
    if (show) {
      skeletonLoader.classList.remove("hidden");
      previewCard.classList.add("hidden");
      downloadSection.classList.add("hidden");
      downloadButton.disabled = true;
    } else {
      skeletonLoader.classList.add("hidden");
      previewCard.classList.remove("hidden");
      downloadSection.classList.remove("hidden");
    }
  }

  function showMessage(text, type = "") {
    errorMessage.textContent = text;
    errorMessage.className = `mt-2 text-sm ${
      type === "error"
        ? "message-error"
        : type === "success"
        ? "message-success"
        : "message-info"
    }`;
  }

  function showDownloadStatus(text, type = "") {
    downloadStatus.textContent = text;
    downloadStatus.className = `text-sm text-center min-h-[20px] ${
      type === "error"
        ? "message-error"
        : type === "success"
        ? "message-success"
        : "message-info"
    }`;
  }

  function updateGradient() {
    const color1 = bgColor1.value;
    const color2 = bgColor2.value;
    const style = gradientStyle.value;
    const bg = style.includes("circle")
      ? `radial-gradient(${style}, ${color1}, ${color2})`
      : `linear-gradient(${style}, ${color1}, ${color2})`;
    gradientBackground.style.backgroundImage = bg;

    if (!isUpdatingFromHex) {
      bgColor1Hex.value = color1.toUpperCase();
      bgColor2Hex.value = color2.toUpperCase();
    }
  }

  function updateImageStyle() {
    const aspect = imageAspect.value;
    const position = imagePosition.value;
    const aspectClasses = ["aspect-video", "aspect-square", "aspect-[9/16]"];
    const positionClasses = [
      "object-center",
      "object-top",
      "object-bottom",
      "object-left",
      "object-right",
    ];

    previewImage.classList.remove(...aspectClasses, ...positionClasses);
    previewImage.classList.add(aspect, position);
  }

  function updateBorderRadius() {
    const outer = outerRadiusSlider.value + "px";
    const inner = innerRadiusSlider.value + "px";
    gradientBackground.style.borderRadius = outer;
    innerCard.style.borderRadius = inner;
    previewImage.style.borderRadius = `calc(${innerRadiusSlider.value / 2}px)`;
    outerRadiusValue.textContent = outer;
    innerRadiusValue.textContent = inner;
  }

  function updatePadding() {
    const paddingPx = paddingSlider.value * 0.25 * 16;
    const paddingValueText = paddingSlider.value * 0.25 + "rem";
    gradientBackground.style.padding = paddingValueText;
    paddingValue.textContent = paddingValueText + ` (${paddingPx}px)`;
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
      if (el) el.style.fontSize = `${1.25 * scale}rem`;
    });

    descriptions.forEach((el) => {
      if (el) el.style.fontSize = `${0.875 * scale}rem`;
    });

    fontSizeValue.textContent = fontSizeSlider.value + "%";
  }

  function setAssistButtonsDisabled(disabled) {
    Object.values(assistButtons).forEach((button) => {
      button.disabled = disabled;
    });
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
      bgColor1.value = dominant.darken(10).toHexString();
      bgColor2.value = dominant.lighten(15).toHexString();
      bgColor1Hex.value = bgColor1.value.toUpperCase();
      bgColor2Hex.value = bgColor2.value.toUpperCase();
      updateGradient();
      setAssistButtonsDisabled(false);
    } catch (err) {
      console.warn("⚠️ Falha ao extrair cor:", err);
      setAssistButtonsDisabled(true);
    }
  }

  // === TEMPLATE ===
  function applyTemplate(data) {
    console.log("📝 Aplicando template:", data.template || "default");
    currentLinkData = data;

    // Esconde todos os templates
    Object.values(templates).forEach((t) => t.classList.add("hidden"));

    // SPREAD FIXO - corrige o favicon
    previewFavicon.src = fallbackFaviconSrc;
    previewFavicon.onerror = () => {
      // Silencioso em dev - usa fallback data URI
      if (!previewFavicon.src.startsWith("data:")) {
        console.log("ℹ️ Usando favicon fallback (normal em dev)");
        previewFavicon.src =
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmdHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYTE2MjU7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzI1MWEzMDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Imljb25HcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjMDg0ZmM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjBhYmZjO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNkOGI0ZmU7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI3IiBmaWxsPSJ1cmwoI2JnR3JhZGllbnQpIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCwgNCkgc2NhbGUoMSkiPgogICAgPHBhdGggZD0iTTEyIDlDMTAuMzQzMSA5IDkgNy42NTY4NSA5IDZDOSA0LjM0MzE1IDEwLjM0MzEgMyAxMiAzQzEzLjY1NjkgMyAxNSA0LjM0MzE1IDE1IDZDMTUgNy42NTY4NSAxMy42NTY5IDkgMTIgOVoiIHN0cm9rZT0idXJsKCNpY29uR3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjEuOCIvPgogICAgPHBhdGggZD0iTTUuNSAyMUMzLjg0MzE1IDIxIDIuNSAxOS42NTY5IDIuNSAxOEMyLjUgMTYuMzQzMSAzLjg0MzE1IDE1IDUuNSAxNUM3LjE1Njg1IDE1IDguNSAxNi4zNDMxIDguNSAxOEM4LjUgMTkuNjU2OSA3LjE1Njg1IDIxIDUuNSAyMVoiIHN0cm9rZT0idXJsKCNpY29uR3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjEuOCIvPgogICAgPHBhdGggZD0iTTE4LjUgMjFDMTYuODQzMSAyMSAxNS41IDE5LjY1NjkgMTUuNSAxOEMxNS41IDE2LjM0MzEgMTYuODQzMSAxNSAxOC41IDE1QzIwLjE1NjkgMTUgMjEuNSAxNi4zNDMxIDIxLjUgMThDMjEuNSAxOS42NTY5IDIwLjE1NjkgMjEgMTguNSAyMVoiIHN0cm9rZT0idXJsKCNpY29uR3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjEuOCIvPgogICAgPHBhdGggZD0iTTIwIDEzQzIwIDEwLjYxMDYgMTguOTUyNSA4LjQ2NTg5IDE3LjI5MTYgN000IDEzQzQgMTAuNjEwNiA1LjA0NzUyIDguNDY1ODkgNi43MDgzOCA3TTEwIDIwLjc0OEMxMC42MzkyIDIwLjkxMjUgMTEuMzA5NCAyMSAxMiAyMUMxMi42OTA2IDIxIDEzLjM2MDggMjAuOTEyNSAxNCAyMC43NDgiIHN0cm9rZT0idXJsKCNpY29uR3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPC9nPgo8L3N2Zz4=";
      }
    };

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
      templateData.musicArtist.textContent =
        data.author || "Artista desconhecido";

      const isSpotify = data.url && data.url.includes("spotify");
      const isYoutube =
        data.url &&
        (data.url.includes("youtube") || data.url.includes("youtu.be"));

      if (isSpotify) {
        platformIcon.innerHTML =
          '<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-green-500"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>';
        platformIcon.classList.remove("hidden");
      } else if (isYoutube) {
        platformIcon.innerHTML =
          '<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-red-500"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';
        platformIcon.classList.remove("hidden");
      } else {
        platformIcon.classList.add("hidden");
      }
    } else if (template === "news") {
      templates.news.classList.remove("hidden");
      templateData.newsHeadline.textContent = data.title;
      templateData.newsAuthor.textContent = `Por ${data.author}`;
      templateData.newsDescription.textContent = data.description;
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

    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) return null;

      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("⚠️ Falha ao converter para Base64:", error);
      return null;
    }
  }

  // === FETCH YOUTUBE MUSIC DATA ===
  async function fetchYouTubeMusicData(url) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");

      if (!videoId) {
        throw new Error("ID do vídeo não encontrado");
      }

      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        throw new Error("Falha ao buscar dados do YouTube");
      }

      const data = await response.json();

      return {
        title: data.title,
        author: data.author_name,
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

    // Rate limiting - previne requests muito frequentes
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      const waitTime = Math.ceil(
        (FETCH_COOLDOWN - (now - lastFetchTime)) / 1000
      );
      return showMessage(
        `Aguarde ${waitTime}s antes de fazer outro request`,
        "error"
      );
    }

    // Verifica cache
    if (requestCache.has(url)) {
      console.log("📦 Usando dados do cache para:", url);
      const cachedData = requestCache.get(url);
      applyTemplate(cachedData);
      return;
    }

    lastFetchTime = now;
    showLoading(true);
    showMessage("");
    showDownloadStatus("");
    setAssistButtonsDisabled(true);

    try {
      // Primeiro, verifica se é YouTube Music e busca dados específicos
      let youtubeData = null;
      const isYouTubeMusic = url.includes("music.youtube.com");

      if (isYouTubeMusic) {
        console.log(
          "🎵 Detectado YouTube Music, buscando dados específicos..."
        );
        youtubeData = await fetchYouTubeMusicData(url);
      }

      // Tenta Microlink primeiro
      let linkData = null;

      try {
        console.log("🔍 Tentando Microlink API...");
        const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(
          url
        )}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("RATE_LIMIT");
          }
          throw new Error(`Microlink retornou ${response.status}`);
        }

        const result = await response.json();
        linkData = await processMicrolinkData(
          result.data,
          url,
          youtubeData,
          isYouTubeMusic
        );
        console.log("✅ Dados obtidos via Microlink");
      } catch (microlinkError) {
        console.warn("⚠️ Microlink falhou:", microlinkError.message);

        // Fallback 1: Tenta jsonlink.io (gratuito, sem rate limit agressivo)
        try {
          console.log("🔍 Tentando JSONLink API (fallback)...");
          const jsonlinkUrl = `https://jsonlink.io/api/extract?url=${encodeURIComponent(
            url
          )}`;
          const response = await fetch(jsonlinkUrl);

          if (response.ok) {
            const result = await response.json();
            linkData = await processJsonLinkData(
              result,
              url,
              youtubeData,
              isYouTubeMusic
            );
            console.log("✅ Dados obtidos via JSONLink");
          } else {
            throw new Error(`JSONLink retornou ${response.status}`);
          }
        } catch (jsonlinkError) {
          console.warn("⚠️ JSONLink falhou:", jsonlinkError.message);

          // Fallback 2: Scraping direto via CORS proxy
          try {
            console.log("🔍 Tentando scraping direto (fallback final)...");
            linkData = await scrapeDirectly(url, youtubeData, isYouTubeMusic);
            console.log("✅ Dados obtidos via scraping direto");
          } catch (scrapeError) {
            console.error("❌ Todos os métodos falharam:", scrapeError.message);

            // Último recurso: usa apenas dados do YouTube se disponível
            if (youtubeData) {
              console.log("🎵 Usando apenas dados do YouTube oEmbed");
              linkData = {
                title: youtubeData.title,
                description: "YouTube Music",
                image: youtubeData.thumbnail
                  ? await toBase64(youtubeData.thumbnail)
                  : "",
                favicon: fallbackFaviconSrc,
                domain: new URL(url).hostname,
                author: youtubeData.author,
                url,
                template: "music",
              };
            } else {
              throw new Error(
                "Não foi possível carregar dados do link. Tente novamente mais tarde."
              );
            }
          }
        }
      }

      if (linkData) {
        // Salva no cache
        requestCache.set(url, linkData);

        // Limita tamanho do cache (máximo 10 URLs)
        if (requestCache.size > 10) {
          const firstKey = requestCache.keys().next().value;
          requestCache.delete(firstKey);
        }

        applyTemplate(linkData);
      }
    } catch (error) {
      console.error("❌ Erro ao processar link:", error);

      let errorMsg = error.message;
      if (error.message === "RATE_LIMIT") {
        errorMsg =
          "Limite de requisições atingido. Aguarde 1 minuto e tente novamente.";
      }

      showMessage(`Falha: ${errorMsg}`, "error");
      showLoading(false);
    }
  }

  // === PROCESSA DADOS DO MICROLINK ===
  async function processMicrolinkData(d, url, youtubeData, isYouTubeMusic) {
    let title = d.title || "Sem título";
    let author = d.author_name || d.author || null;
    let imageUrl = d.image?.url || d.screenshot?.url;

    if (youtubeData) {
      title = youtubeData.title;
      author = youtubeData.author;
      if (youtubeData.thumbnail) {
        imageUrl = youtubeData.thumbnail;
      }
    }

    const image = imageUrl ? await toBase64(imageUrl) : "";

    let favicon = fallbackFaviconSrc;
    if (!isYouTubeMusic) {
      const faviconUrl =
        d.logo?.url ||
        `https://www.google.com/s2/favicons?domain=${
          new URL(url).hostname
        }&sz=64`;
      const faviconBase64 = await toBase64(faviconUrl);
      if (faviconBase64) favicon = faviconBase64;
    }

    let template = "default";
    if (
      isYouTubeMusic ||
      url.includes("spotify.com") ||
      url.includes("bandcamp.com") ||
      url.includes("soundcloud.com")
    ) {
      template = "music";

      if (isYouTubeMusic && title) {
        const separators = [" - ", " – ", " — ", " | ", " • "];
        for (const sep of separators) {
          if (title.includes(sep)) {
            const parts = title.split(sep);
            if (parts.length >= 2) {
              author = parts[0].trim();
              title = parts.slice(1).join(" - ").trim();
              console.log("🎤 Extraído - Artista:", author, "Música:", title);
              break;
            }
          }
        }
      }
    } else if (author) {
      template = "news";
    }

    return {
      title,
      description: d.description || "Sem descrição",
      image,
      favicon,
      domain: new URL(url).hostname,
      author,
      url,
      template,
    };
  }

  // === PROCESSA DADOS DO JSONLINK ===
  async function processJsonLinkData(d, url, youtubeData, isYouTubeMusic) {
    let title = d.title || "Sem título";
    let author = d.author || null;
    let imageUrl = d.images?.[0] || d.image;

    if (youtubeData) {
      title = youtubeData.title;
      author = youtubeData.author;
      if (youtubeData.thumbnail) {
        imageUrl = youtubeData.thumbnail;
      }
    }

    const image = imageUrl ? await toBase64(imageUrl) : "";

    let favicon = fallbackFaviconSrc;
    if (!isYouTubeMusic) {
      const faviconUrl =
        d.favicon ||
        `https://www.google.com/s2/favicons?domain=${
          new URL(url).hostname
        }&sz=64`;
      const faviconBase64 = await toBase64(faviconUrl);
      if (faviconBase64) favicon = faviconBase64;
    }

    let template = "default";
    if (
      isYouTubeMusic ||
      url.includes("spotify.com") ||
      url.includes("bandcamp.com") ||
      url.includes("soundcloud.com")
    ) {
      template = "music";

      if (isYouTubeMusic && title) {
        const separators = [" - ", " – ", " — ", " | ", " • "];
        for (const sep of separators) {
          if (title.includes(sep)) {
            const parts = title.split(sep);
            if (parts.length >= 2) {
              author = parts[0].trim();
              title = parts.slice(1).join(" - ").trim();
              break;
            }
          }
        }
      }
    } else if (author) {
      template = "news";
    }

    return {
      title,
      description: d.description || "Sem descrição",
      image,
      favicon,
      domain: new URL(url).hostname,
      author,
      url,
      template,
    };
  }

  // === SCRAPING DIRETO ===
  async function scrapeDirectly(url, youtubeData, isYouTubeMusic) {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      url
    )}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error("Proxy falhou");
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMeta = (property) => {
      const meta = doc.querySelector(
        `meta[property="${property}"], meta[name="${property}"]`
      );
      return meta?.getAttribute("content") || "";
    };

    let title =
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      doc.title ||
      "Sem título";
    let author = getMeta("og:author") || getMeta("article:author") || null;
    let imageUrl = getMeta("og:image") || getMeta("twitter:image");
    const description =
      getMeta("og:description") || getMeta("description") || "Sem descrição";

    if (youtubeData) {
      title = youtubeData.title;
      author = youtubeData.author;
      if (youtubeData.thumbnail) {
        imageUrl = youtubeData.thumbnail;
      }
    }

    const image = imageUrl ? await toBase64(imageUrl) : "";

    let template = "default";
    if (
      isYouTubeMusic ||
      url.includes("spotify.com") ||
      url.includes("bandcamp.com") ||
      url.includes("soundcloud.com")
    ) {
      template = "music";

      if (isYouTubeMusic && title) {
        const separators = [" - ", " – ", " — ", " | ", " • "];
        for (const sep of separators) {
          if (title.includes(sep)) {
            const parts = title.split(sep);
            if (parts.length >= 2) {
              author = parts[0].trim();
              title = parts.slice(1).join(" - ").trim();
              break;
            }
          }
        }
      }
    } else if (author) {
      template = "news";
    }

    return {
      title,
      description,
      image,
      favicon: fallbackFaviconSrc,
      domain: new URL(url).hostname,
      author,
      url,
      template,
    };
  }

  // === DOWNLOAD ===
  async function downloadImage() {
    if (downloadButton.disabled) {
      return showDownloadStatus("Gere um preview primeiro", "error");
    }

    showDownloadStatus("Gerando imagem...", "info");

    try {
      const dataUrl = await htmlToImage.toPng(gradientBackground, {
        pixelRatio: 2,
        quality: 1,
        backgroundColor: "#0a0a0f",
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = currentLinkData?.title
        ? `${currentLinkData.title
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()
            .substring(0, 30)}-spread.png`
        : "spread-card.png";
      a.click();

      showDownloadStatus("✔ Download concluído!", "success");
      setTimeout(() => showDownloadStatus(""), 3000);
    } catch (error) {
      console.error("❌ Erro no download:", error);
      showDownloadStatus("Erro ao gerar imagem", "error");
    }
  }

  // === TEMAS E ASSISTENTE ===
  function applyTheme(theme) {
    const themes = {
      sunset: { colors: ["#ff6b35", "#f7931e"], gradient: "135deg" },
      ocean: { colors: ["#0077be", "#00b4d8"], gradient: "180deg" },
      forest: { colors: ["#2d6a4f", "#52b788"], gradient: "315deg" },
      neon: { colors: ["#ff006e", "#8338ec"], gradient: "circle at top left" },
    };

    const themeData = themes[theme];
    if (themeData) {
      bgColor1.value = themeData.colors[0];
      bgColor2.value = themeData.colors[1];
      bgColor1Hex.value = themeData.colors[0].toUpperCase();
      bgColor2Hex.value = themeData.colors[1].toUpperCase();
      gradientStyle.value = themeData.gradient;
      updateGradient();
    }
  }

  function applyColorAssist(type) {
    if (!dominantColor) return;

    const tiny = tinycolor(dominantColor);
    let palette;

    switch (type) {
      case "analogous":
        palette = tiny.analogous();
        bgColor1.value = palette[1].toHexString();
        bgColor2.value = palette[2].toHexString();
        break;
      case "triad":
        palette = tiny.triad();
        bgColor1.value = palette[1].toHexString();
        bgColor2.value = palette[2].toHexString();
        break;
      case "split":
        palette = tiny.splitcomplement();
        bgColor1.value = palette[1].toHexString();
        bgColor2.value = palette[2].toHexString();
        break;
      case "mono":
        palette = tiny.monochromatic();
        bgColor1.value = palette[1].toHexString();
        bgColor2.value = palette[2].toHexString();
        break;
    }

    bgColor1Hex.value = bgColor1.value.toUpperCase();
    bgColor2Hex.value = bgColor2.value.toUpperCase();
    updateGradient();
  }

  function resetSettings() {
    // Reseta estilos de layout primeiro
    gradientStyle.value = "135deg";
    imageAspect.value = "aspect-video";
    imagePosition.value = "object-center";
    outerRadiusSlider.value = 0;
    innerRadiusSlider.value = 8;
    paddingSlider.value = 6;
    opacitySlider.value = 80;
    fontSizeSlider.value = 100;

    // Se há uma imagem carregada, re-extrai as cores
    if (
      currentLinkData?.image &&
      previewImage.src &&
      !previewImage.classList.contains("hidden")
    ) {
      console.log("🎨 Re-extraindo cores da imagem ao resetar");
      extractDominantColor(currentLinkData.image);
    } else {
      // Se não há imagem, volta para as cores padrão
      console.log("🔄 Voltando para cores padrão");
      bgColor1.value = "#8b5cf6";
      bgColor2.value = "#ec4899";
      bgColor1Hex.value = "#8B5CF6";
      bgColor2Hex.value = "#EC4899";
      updateGradient();
    }

    updateImageStyle();
    updateBorderRadius();
    updatePadding();
    updateOpacity();
    updateFontSize();
  }

  // === EVENTOS ===
  generateButton.addEventListener("click", () =>
    parseLink(linkInput.value.trim())
  );
  linkInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && parseLink(linkInput.value.trim())
  );
  downloadButton.addEventListener("click", downloadImage);

  bgColor1.addEventListener(
    "input",
    () => !isUpdatingFromHex && updateGradient()
  );
  bgColor2.addEventListener(
    "input",
    () => !isUpdatingFromHex && updateGradient()
  );
  gradientStyle.addEventListener("input", updateGradient);
  imageAspect.addEventListener("input", updateImageStyle);
  imagePosition.addEventListener("input", updateImageStyle);
  outerRadiusSlider.addEventListener("input", updateBorderRadius);
  innerRadiusSlider.addEventListener("input", updateBorderRadius);
  paddingSlider.addEventListener("input", updatePadding);
  opacitySlider.addEventListener("input", updateOpacity);
  fontSizeSlider.addEventListener("input", updateFontSize);
  resetButton.addEventListener("click", resetSettings);

  // Hex input handlers
  function expandHex(hex) {
    if (hex.length === 4) {
      return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
  }

  bgColor1Hex.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  bgColor1Hex.addEventListener("change", (e) => {
    isUpdatingFromHex = true;
    let value = e.target.value.trim().toUpperCase();
    if (value && !value.startsWith("#")) value = "#" + value;

    const hexRegex = /^#([A-F0-9]{3}|[A-F0-9]{6})$/;
    if (hexRegex.test(value)) {
      const expandedValue = expandHex(value);
      bgColor1.value = expandedValue;
      e.target.value = expandedValue;
      updateGradient();
    } else {
      e.target.value = bgColor1.value.toUpperCase();
    }
    isUpdatingFromHex = false;
  });

  bgColor2Hex.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  bgColor2Hex.addEventListener("change", (e) => {
    isUpdatingFromHex = true;
    let value = e.target.value.trim().toUpperCase();
    if (value && !value.startsWith("#")) value = "#" + value;

    const hexRegex = /^#([A-F0-9]{3}|[A-F0-9]{6})$/;
    if (hexRegex.test(value)) {
      const expandedValue = expandHex(value);
      bgColor2.value = expandedValue;
      e.target.value = expandedValue;
      updateGradient();
    } else {
      e.target.value = bgColor2.value.toUpperCase();
    }
    isUpdatingFromHex = false;
  });

  // Temas
  themeButtons.sunset.addEventListener("click", () => applyTheme("sunset"));
  themeButtons.ocean.addEventListener("click", () => applyTheme("ocean"));
  themeButtons.forest.addEventListener("click", () => applyTheme("forest"));
  themeButtons.neon.addEventListener("click", () => applyTheme("neon"));

  // Assistente de cores
  assistButtons.analogous.addEventListener("click", () =>
    applyColorAssist("analogous")
  );
  assistButtons.triad.addEventListener("click", () =>
    applyColorAssist("triad")
  );
  assistButtons.split.addEventListener("click", () =>
    applyColorAssist("split")
  );
  assistButtons.mono.addEventListener("click", () => applyColorAssist("mono"));

  // === INICIALIZAÇÃO ===
  console.log("✅ Inicializando interface...");

  const initialColors = ["#8b5cf6", "#ec4899"];
  bgColor1.value = initialColors[0];
  bgColor2.value = initialColors[1];
  bgColor1Hex.value = initialColors[0].toUpperCase();
  bgColor2Hex.value = initialColors[1].toUpperCase();

  applyTemplate({
    title: "Bem-vindo ao Spread",
    description:
      "Crie e compartilhe visualizações de links elegantes e modernas, 100% no seu navegador.",
    domain: "Spread",
    image: "",
    template: "default",
  });

  updateGradient();
  updateImageStyle();
  updateBorderRadius();
  updatePadding();
  updateOpacity();
  updateFontSize();
  showLoading(false);

  console.log("✅ Spread.js inicializado com sucesso!");
})();
