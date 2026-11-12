import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {

    // Main -> Renderer
    //onMacroSaved:       (callback) => ipcRenderer.on("macroSaved",       () => callback()),
    onMacrosUpdated: (callback) => { const handler = (_, macros) => callback(macros)
                                        ipcRenderer.on('macrosUpdated', handler)
                                        return () => ipcRenderer.removeListener('macrosUpdated', handler) 
                                    },

    onRecordingStarted: (callback) => ipcRenderer.on("recordingStarted", () => callback()),
    onPlaybackDone:     (callback) => ipcRenderer.on("playbackDone",     () => callback()),
    onError:            (callback) => ipcRenderer.on("error", (_, msg)   => callback(msg)),

    // Edit Macro 
    getMacroIndex:  ()           => ipcRenderer.invoke('getMacroIndex'),
    getMacroEvents: (id)         => ipcRenderer.invoke('getMacroEvents', id),
    deleteMacro:    (id)         => ipcRenderer.invoke('deleteMacro', id),
    startRecording: ()           => ipcRenderer.send('startRecording'),
    stopRecording:  ()           => ipcRenderer.send('stopRecording'),
    runMacro:       (id)         => ipcRenderer.send('runMacro', id),

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