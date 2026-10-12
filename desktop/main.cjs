const {app,BrowserWindow,ipcMain,shell,protocol,net,session,Menu}=require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const config=require('./release-config.json');
const {validRepo,releaseInfo}=require('./update.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'kursklar',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
app.setName('Kursklar');
if(process.env.KURSKLAR_TEST_PROFILE)app.setPath('userData',process.env.KURSKLAR_TEST_PROFILE);
let window,update={status:'idle'},pending;
async function check(){
 if(pending)return pending;
 pending=(async()=>{try{
 if(!validRepo(config.repository))return update={status:'error',message:'Die Update-Adresse ist noch nicht eingerichtet.'};
 const response=await fetch(`https://api.github.com/repos/${config.repository}/releases/latest`,{headers:{Accept:'application/vnd.github+json','User-Agent':'Kursklar'},signal:AbortSignal.timeout(10000)});
 if(response.status===404)return update={status:'error',message:'Noch keine veröffentlichte Version gefunden. Du kannst die App trotzdem offline verwenden.'};
 if(!response.ok)throw Error('Update-Server nicht erreichbar. Versuche es später erneut.');
 return update=releaseInfo(await response.json(),app.getVersion(),config.repository,process.arch);
 }catch(e){return update={status:'error',message:e.name==='TimeoutError'?'Zeitüberschreitung bei der Update-Prüfung.':e.message};}finally{pending=null;}})();return pending;
}
function trusted(event){if(event.sender!==window?.webContents||!event.senderFrame?.url.startsWith('kursklar://app/'))throw Error('Unzulässiger Zugriff.');}
app.whenReady().then(()=>{
 const root=path.join(app.getAppPath(),'dist');
 protocol.handle('kursklar',request=>{const url=new URL(request.url);if(url.host!=='app')return new Response('Not found',{status:404});const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep))return new Response('Forbidden',{status:403});return net.fetch(pathToFileURL(file).href);});
 session.defaultSession.setPermissionRequestHandler((_,__,callback)=>callback(false));
 session.defaultSession.webRequest.onHeadersReceived((details,callback)=>callback({responseHeaders:{...details.responseHeaders,'Content-Security-Policy':["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'"]}}));
 ipcMain.handle('desktop:info',event=>{trusted(event);return {version:app.getVersion(),repository:config.repository,update};});
 ipcMain.handle('desktop:check',event=>{trusted(event);return check();});
 ipcMain.handle('desktop:download',async event=>{trusted(event);if(update.status!=='available')throw Error('Kein Update verfügbar.');await shell.openExternal(update.url);return true;});
 const create=()=>{window=new BrowserWindow({width:1440,height:900,minWidth:1000,minHeight:650,title:'Kursklar',backgroundColor:'#101218',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});window.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//.test(url))shell.openExternal(url);return {action:'deny'};});window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('kursklar://app/')){event.preventDefault();if(/^https:\/\//.test(url))shell.openExternal(url);}});window.loadURL('kursklar://app/index.html');};
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Kursklar',submenu:[{role:'about'},{role:'quit'}]},{label:'Bearbeiten',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},{label:'Ansicht',submenu:[{role:'reload'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]}]));
 create();check();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)create();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
