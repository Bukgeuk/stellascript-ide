import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import * as path from 'path'
import * as settings from 'electron-settings'
import * as isDev from 'electron-is-dev'

let mainWindow: BrowserWindow | null

type windowState = {
    x: number,
    y: number,
    width: number,
    height: number,
    isMaximized: boolean
}

async function getState(): Promise<windowState> {
    let state: windowState

    if (await settings.hasSync('windowState')) {
        state = await settings.getSync('windowState') as windowState
    } else {
        state = {
            x: -1,
            y: -1,
            width: 1000,
            height: 600,
            isMaximized: false
        }
    }

    return state
}

async function saveState(win: BrowserWindow): Promise<void> {
    const bounds = win.getNormalBounds()

    let state: windowState = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: win.isMaximized()
    }

    await settings.setSync('windowState', state)
}

async function createMainWindow(): Promise<void> {
    const state = await getState()

    let options: BrowserWindowConstructorOptions = {
        width: state.width,
        height: state.height,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    }

    if (state.x != undefined && state.y != undefined) {
        options.x = state.x
        options.y = state.y
    }

    mainWindow = new BrowserWindow(options)

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()
    })

    mainWindow.on('close', async () => {
        if (mainWindow)
            await saveState(mainWindow)
    })

    if (state.isMaximized) mainWindow.maximize()

    mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, '../build/index.html')}`)

    if (isDev) {
        mainWindow.webContents.openDevTools()
    }
}

app.whenReady().then(() => {
    createMainWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow()
    }
})
