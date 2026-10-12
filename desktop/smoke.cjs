const {_electron:electron}=require('playwright');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
(async()=>{const profile=fs.mkdtempSync(path.join(os.tmpdir(),'kursklar-smoke-'));const app=await electron.launch({args:[path.join(__dirname,'..')],env:{...process.env,KURSKLAR_TEST_PROFILE:profile}});try{const page=await app.firstWindow();await page.getByRole('button',{name:'Bei null starten'}).waitFor();const info=await page.evaluate(()=>window.kursklarDesktop.info());if(info.version!==require('../package.json').version)throw Error('Falsche App-Version');await page.locator('.sidebar').getByRole('button',{name:'Trading-Kalender',exact:true}).click();await page.getByRole('button',{name:'Trade / Tagesergebnis eintragen'}).waitFor();console.log('Electron-Start, lokale Assets, Desktop-API und Kalender erfolgreich.');}finally{await app.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


