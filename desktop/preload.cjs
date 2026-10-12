const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('kursklarDesktop',{info:()=>ipcRenderer.invoke('desktop:info'),check:()=>ipcRenderer.invoke('desktop:check'),download:()=>ipcRenderer.invoke('desktop:download')});
