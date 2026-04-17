import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join }                               from 'path'
import { electronApp, optimizer, is }         from '@electron-toolkit/utils'
import { spawn }                              from "child_process"
import * as fs                                from 'fs'

/*  FILE PATHS  */
const userDataPath       = app.getPath('userData');

const macroExePath = join(process.cwd(), 'src', 'cpp', 'macro_engine.exe');
const macrosDir    = join(userDataPath, 'macros'); // macros folder path

const iconPath = join(__dirname, '../../resources/Recurr-icon.png');
const preloadPath = join(__dirname, '../preload/index.js');
/****************/


let hwProcess  = null;
let buffer     = '';
let mainWindow = null;


/***********************************************
 * Hardware Process
***********************************************/

function startHardwareProcess()
{
    hwProcess = spawn(macroExePath);

    hwProcess.stdout.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop(); // hold incomplete line

        for (const line of lines)
        {
            if (line.trim()) handleResponse(JSON.parse(line));
        }
    });

    hwProcess.stderr.on('data', (chunk) => {
        console.error('[C++]', chunk.toString());
    });

    hwProcess.on('close', () => {
        console.log('Hardware process exited');
        hwProcess = null;
    });

    hwProcess.on('error', (error) => {
        console.error('Failed to start hardware process:', error);
    });

    console.log('Hardware process started');
}


function sendCommand(cmd)
{
    if (!hwProcess)
    {
        console.error('Hardware process not running');
        return;
    }

    hwProcess.stdin.write(JSON.stringify(cmd) + '\n');
}


function handleResponse(msg)
{
    if (msg.status === 'recording')
    {
        console.log('Recording started');
        mainWindow.webContents.send('recordingStarted');
    }
    else if (msg.status === 'stopped')
    {
        console.log('Recording stopped');

        console.log('events received: ', msg.events);
        console.log('events length: ', msg.events?.length);

        saveMacro(msg.events);
        mainWindow.webContents.send('macroSaved');
    }
    else if (msg.status === 'playback')
    {
        console.log('Playback complete');
        mainWindow.webContents.send('playbackDone');
    }
    else if (msg.error)
    {
        console.error('Hardware error:', msg.error);
        mainWindow.webContents.send('error', msg.error);
    }
}



/***********************************************
 * Save Macro
***********************************************/

function saveMacro(events)
{
    if (!fs.existsSync(macrosDir))
        fs.mkdirSync(macrosDir, { recursive: true });

    const savePath = join(macrosDir, 'macro.json');
    fs.writeFileSync(savePath, JSON.stringify(events, null, 2));
    console.log('Macro saved to', savePath);
}



/***********************************************
 * Window
***********************************************/

function createWindow() {
   mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}



/***********************************************
 * App
***********************************************/

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Log user data path
  console.log("User data path:", app.getPath('userData'));

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  startHardwareProcess();

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') 
    {
        shutdownHardwareProcess()
        app.quit();
    }
})


// Clean up the process when the app quits
app.on('before-quit', () => {
    shutdownHardwareProcess()
})


function shutdownHardwareProcess()
{
    console.log('shutdownHardwareProcess called, hwProcess:', hwProcess?.pid ?? 'null');

    if (!hwProcess) return;

    sendCommand({ cmd: 'exit' });
    
    const proc = hwProcess;
    hwProcess = null;

    setTimeout(() => {
        if (!proc.killed)
        {
            console.log('Force killing hardware process');
            proc.kill();
        }
    }, 1000);
}


/***********************************************
 * IPC Handlers
***********************************************/

ipcMain.on('startRecording', () => {
    console.log("ipcMain: startRecording");
    sendCommand({ cmd: 'startRecording' });
});

ipcMain.on('stopRecording', () => {
    console.log("ipcMain: stopRecording");
    sendCommand({ cmd: 'stopRecording' });
});

ipcMain.on('runMacro', () => {
    console.log("ipcMain: runMacro");

    const macroPath = join(macrosDir, 'macro.json');

    console.log('playback path: ', macroPath);
    sendCommand({ cmd: 'playback', file: macroPath });
});