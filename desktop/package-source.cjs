
// Nur Projektcode und Anleitungen einpacken, keine Browserdaten oder Abhängigkeiten.
const {execFileSync}=require('node:child_process');
execFileSync('python',['-c',`import zipfile,pathlib
root=pathlib.Path.cwd()
folders=['src','public','desktop','.github','backend']
files=['package.json','package-lock.json','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json','index.html','playwright.config.ts','.gitignore','README.md','MAC-APP.md','PRUEFUNG.md']
with zipfile.ZipFile(root/'Kursklar-Mac-Vorbereitung.zip','w',zipfile.ZIP_DEFLATED) as z:
 for folder in folders:
  for p in (root/folder).rglob('*'):
   if p.is_file(): z.write(p,str(p.relative_to(root)))
 for file in files:
  if (root/file).is_file(): z.write(root/file,file)
 for p in (root/'tests').glob('*.ts'): z.write(p,str(p.relative_to(root)))
print('Kursklar-Mac-Vorbereitung.zip erstellt (ohne persönliche Einträge).')`],{stdio:'inherit'});


