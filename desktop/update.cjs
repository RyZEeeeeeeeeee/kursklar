const validRepo = value => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]+$/.test(value);
function compare(a,b) {const parse=v=>{const m=/^v?(\d+)\.(\d+)\.(\d+)$/.exec(v);if(!m)throw Error('Ungültige Versionsnummer.');return m.slice(1).map(Number);};const x=parse(a),y=parse(b);for(let i=0;i<3;i++)if(x[i]!==y[i])return Math.sign(x[i]-y[i]);return 0;}
function releaseInfo(release,current,repo,arch){
 if(!validRepo(repo)||!release||release.draft||release.prerelease||compare(release.tag_name,current)<=0)return {status:'current',version:current};
 const asset=release.assets?.find(a=>typeof a.name==='string'&&a.name.endsWith(`-${arch}.dmg`));
 if(!asset)return {status:'error',message:`Die neue Version enthält noch keine Mac-Datei für ${arch}.`};
 const url=new URL(asset.browser_download_url);if(url.origin!=='https://github.com'||!url.pathname.startsWith(`/${repo}/releases/download/`))throw Error('Ungültige Download-Adresse.');
 return {status:'available',version:release.tag_name.replace(/^v/,''),url:url.href,name:asset.name};
}
module.exports={validRepo,compare,releaseInfo};
