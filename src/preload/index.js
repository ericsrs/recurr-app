import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {

    // Renderer -> Main
    startRecording: () => ipcRenderer.send("startRecording"),
    stopRecording:  () => ipcRenderer.send("stopRecording"),
    runMacro:       () => ipcRenderer.send("runMacro"),

    // Main -> Renderer
    onMacroSaved:       (callback) => ipcRenderer.on("macroSaved",       () => callback()),
    onRecordingStarted: (callback) => ipcRenderer.on("recordingStarted", () => callback()),
    onPlaybackDone:     (callback) => ipcRenderer.on("playbackDone",     () => callback()),
    onError:            (callback) => ipcRenderer.on("error", (_, msg)   => callback(msg)),

}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    window.electron = electronAPI
    window.api = api
}