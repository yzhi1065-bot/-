export {}

declare global {
  interface Window {
    electronAPI?: {
      connectDevice: (type: string) => Promise<any>
      getDeviceStatus: () => Promise<any[]>
      onDeviceData: (callback: (data: any) => void) => void
      saveFile: (data: any) => Promise<boolean>
    }
  }
}
