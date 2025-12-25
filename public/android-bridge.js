/**
 * PlayTorrio Android Bridge
 * 
 * This file provides a compatibility layer for the web frontend
 * to work on Android via Capacitor, replacing Electron-specific APIs.
 */

import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';

// Detect if running on Android
const isAndroid = () => {
    return /Android/i.test(navigator.userAgent) || 
           (window.Capacitor && window.Capacitor.getPlatform() === 'android');
};

// Initialize Android bridge
const initAndroidBridge = () => {
    if (!isAndroid()) {
        console.log('[Android Bridge] Not on Android, skipping initialization');
        return;
    }

    console.log('[Android Bridge] Initializing...');

    // Create electronAPI compatibility layer
    window.electronAPI = {
        // Platform detection
        platform: 'android',

        // AIOSTREAMS Manifest Storage
        manifestWrite: async (url) => {
            try {
                await Preferences.set({ key: 'manifest_url', value: url });
                return { success: true };
            } catch (error) {
                console.error('[Android Bridge] manifestWrite error:', error);
                return { success: false, error: error.message };
            }
        },

        manifestRead: async () => {
            try {
                const { value } = await Preferences.get({ key: 'manifest_url' });
                return { success: true, data: value || '' };
            } catch (error) {
                console.error('[Android Bridge] manifestRead error:', error);
                return { success: false, data: '' };
            }
        },

        // Stremio Addons (stored in preferences)
        addonInstall: async (url) => {
            try {
                const addonsData = await Preferences.get({ key: 'installed_addons' });
                const addons = addonsData.value ? JSON.parse(addonsData.value) : [];
                
                // Fetch manifest from URL
                const response = await fetch(url);
                const manifest = await response.json();
                
                // Check if already installed
                const existingIndex = addons.findIndex(a => a.manifest.id === manifest.id);
                if (existingIndex >= 0) {
                    addons[existingIndex] = { url, manifest };
                } else {
                    addons.push({ url, manifest });
                }
                
                await Preferences.set({ key: 'installed_addons', value: JSON.stringify(addons) });
                return { success: true };
            } catch (error) {
                console.error('[Android Bridge] addonInstall error:', error);
                return { success: false, message: error.message };
            }
        },

        addonList: async () => {
            try {
                const { value } = await Preferences.get({ key: 'installed_addons' });
                return { success: true, addons: value ? JSON.parse(value) : [] };
            } catch (error) {
                console.error('[Android Bridge] addonList error:', error);
                return { success: true, addons: [] };
            }
        },

        addonRemove: async (id) => {
            try {
                const { value } = await Preferences.get({ key: 'installed_addons' });
                const addons = value ? JSON.parse(value) : [];
                const filtered = addons.filter(a => a.manifest.id !== id);
                await Preferences.set({ key: 'installed_addons', value: JSON.stringify(filtered) });
                return { success: true };
            } catch (error) {
                console.error('[Android Bridge] addonRemove error:', error);
                return { success: false };
            }
        },

        // Window Controls (no-op on Android)
        minimizeWindow: async () => {},
        maximizeWindow: async () => {},
        closeWindow: async () => {},
        onMaximizeChanged: (cb) => {},

        // Player Launchers - Open in external apps on Android
        spawnMpvjsPlayer: async (payload) => {
            console.log('[Android Bridge] External player requested');
            return { success: false, message: 'Use in-app player on Android' };
        },

        openInMPV: async (data) => {
            // Try to open in external video player
            if (data.url) {
                try {
                    await Browser.open({ url: data.url });
                    return { success: true };
                } catch (error) {
                    return { success: false, message: error.message };
                }
            }
            return { success: false, message: 'No URL provided' };
        },

        openMPVDirect: async (url) => {
            try {
                await Browser.open({ url });
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        openMpvWithHeaders: async (options) => {
            console.log('[Android Bridge] openMpvWithHeaders - use in-app player');
            return { success: false, message: 'Use in-app player on Android' };
        },

        openInVLC: async (data) => {
            // Try to open VLC for Android via intent
            if (data.url) {
                try {
                    const vlcUrl = `vlc://${data.url}`;
                    await Browser.open({ url: vlcUrl });
                    return { success: true };
                } catch (error) {
                    return { success: false, message: error.message };
                }
            }
            return { success: false, message: 'No URL provided' };
        },

        openVLCDirect: async (url) => {
            try {
                const vlcUrl = `vlc://${url}`;
                await Browser.open({ url: vlcUrl });
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        openInIINA: async (data) => {
            // IINA is macOS only
            return { success: false, message: 'IINA not available on Android' };
        },

        playXDMovies: async (data) => {
            return { success: false, message: 'Not available on Android' };
        },

        // Chromecast (would need a native plugin)
        castToChromecast: async (data) => {
            console.log('[Android Bridge] Chromecast not yet implemented');
            return { success: false, message: 'Chromecast support coming soon' };
        },

        discoverChromecastDevices: async () => {
            return [];
        },

        onStreamClosed: (callback) => {},

        // Cache + Files
        clearWebtorrentTemp: async () => {
            try {
                // Clear cache directory
                await Filesystem.rmdir({
                    path: 'webtorrent_cache',
                    directory: Directory.Cache,
                    recursive: true
                });
                return { success: true };
            } catch (error) {
                return { success: true }; // Don't error if directory doesn't exist
            }
        },

        clearCache: async () => {
            try {
                await Filesystem.rmdir({
                    path: 'cache',
                    directory: Directory.Cache,
                    recursive: true
                });
                return { success: true };
            } catch (error) {
                return { success: true };
            }
        },

        selectCacheFolder: async () => {
            return { success: false, message: 'Not available on Android' };
        },

        restartApp: async () => {
            window.location.reload();
            return { success: true };
        },

        openExternal: async (url) => {
            try {
                await Browser.open({ url, windowName: '_system' });
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        copyToClipboard: async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                return { success: true };
            } catch (error) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return { success: true };
            }
        },

        showFolderInExplorer: async (folderPath) => {
            return { success: false, message: 'Not available on Android' };
        },

        // Books
        booksGetUrl: async () => null,
        onBooksUrl: (cb) => {},

        // Updates (handled by Play Store)
        onUpdateChecking: (cb) => {},
        onUpdateAvailable: (cb) => {},
        onUpdateNotAvailable: (cb) => {},
        onUpdateProgress: (cb) => {},
        onUpdateDownloaded: (cb) => {},
        installUpdateNow: async () => {},

        // My List
        myListRead: async () => {
            try {
                const { value } = await Preferences.get({ key: 'my_list' });
                return { success: true, data: value ? JSON.parse(value) : [] };
            } catch (error) {
                return { success: true, data: [] };
            }
        },

        myListWrite: async (data) => {
            try {
                await Preferences.set({ key: 'my_list', value: JSON.stringify(data) });
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Done Watching
        doneWatchingRead: async () => {
            try {
                const { value } = await Preferences.get({ key: 'done_watching' });
                return { success: true, data: value ? JSON.parse(value) : [] };
            } catch (error) {
                return { success: true, data: [] };
            }
        },

        doneWatchingWrite: async (data) => {
            try {
                await Preferences.set({ key: 'done_watching', value: JSON.stringify(data) });
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Fullscreen
        setFullscreen: async (isFullscreen) => {
            try {
                if (isFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.fullscreenElement) {
                    await document.exitFullscreen();
                }
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        getFullscreen: async () => {
            return !!document.fullscreenElement;
        },

        // Discord Rich Presence (not available on Android)
        updateDiscordPresence: async (data) => {},
        clearDiscordPresence: async () => {},

        // EPUB
        getEpubFolder: async () => {
            return Directory.Documents + '/PlayTorrio/EPubs';
        },

        downloadEpub: async (payload) => {
            const { url, bookData } = typeof payload === 'object' ? payload : { url: payload, bookData: null };
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                
                return new Promise((resolve, reject) => {
                    reader.onload = async () => {
                        try {
                            const base64 = reader.result.split(',')[1];
                            const fileName = bookData?.title ? 
                                `${bookData.title.replace(/[^a-z0-9]/gi, '_')}.epub` : 
                                `book_${Date.now()}.epub`;
                            
                            await Filesystem.writeFile({
                                path: `PlayTorrio/EPubs/${fileName}`,
                                data: base64,
                                directory: Directory.Documents
                            });
                            
                            resolve({ success: true, path: `PlayTorrio/EPubs/${fileName}` });
                        } catch (error) {
                            reject({ success: false, error: error.message });
                        }
                    };
                    reader.onerror = () => reject({ success: false, error: 'Failed to read file' });
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        getEpubLibrary: async () => {
            try {
                const result = await Filesystem.readdir({
                    path: 'PlayTorrio/EPubs',
                    directory: Directory.Documents
                });
                return { success: true, files: result.files };
            } catch (error) {
                return { success: true, files: [] };
            }
        },

        readEpubFile: async (filePath) => {
            try {
                const result = await Filesystem.readFile({
                    path: filePath,
                    directory: Directory.Documents
                });
                return { success: true, data: result.data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Music offline
        musicDownloadTrack: async (track) => {
            // This would need a more sophisticated implementation
            return { success: false, message: 'Music download not yet implemented' };
        },

        musicGetOfflineLibrary: async () => {
            try {
                const { value } = await Preferences.get({ key: 'offline_music' });
                return { success: true, tracks: value ? JSON.parse(value) : [] };
            } catch (error) {
                return { success: true, tracks: [] };
            }
        },

        musicDeleteOfflineTrack: async (entryId) => {
            return { success: false, message: 'Not implemented' };
        },

        // WebChimera (not available on Android)
        wcjs: {
            available: false,
            init() { return null; }
        }
    };

    // Hide splash screen after initialization
    setTimeout(() => {
        SplashScreen.hide();
    }, 1000);

    console.log('[Android Bridge] Initialized successfully');
};

// Share functionality
window.shareContent = async (title, text, url) => {
    try {
        await Share.share({
            title,
            text,
            url,
            dialogTitle: 'Share with'
        });
        return { success: true };
    } catch (error) {
        console.error('[Android Bridge] Share error:', error);
        return { success: false, message: error.message };
    }
};

// Network status
window.getNetworkStatus = async () => {
    try {
        const status = await Network.getStatus();
        return status;
    } catch (error) {
        return { connected: true, connectionType: 'unknown' };
    }
};

// Listen for network changes
Network.addListener('networkStatusChange', (status) => {
    console.log('[Android Bridge] Network status changed:', status);
    window.dispatchEvent(new CustomEvent('networkStatusChange', { detail: status }));
});

// Export for use
export { initAndroidBridge, isAndroid };

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    initAndroidBridge();
});
