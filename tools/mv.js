let { readdirSync, statSync,copyFile } = require("fs");
let { join } = require("path");

function isDirectory(path) {
  return statSync(path).isDirectory();
}

function getFolders(dir) {
  return readdirSync(dir).filter(file => isDirectory(join(dir, file)));
}

const packagesPath = getFolders("packages")
packagesPath.forEach((filePath)=>{
  const root = join(__dirname,"../")
  console.log(join(root,"packages",filePath,"package.json"))
  if (filePath!=="base"){
    const src = join(root,"packages",filePath,"package.json")
    const dist = join(root,"dist/packages",filePath,"package.json")
    copyFile(src,dist,function(err) {
      if (err){
        console.log(err);
      }else{
        console.log(`copy file ${src} success`);
      }
    })
    if (filePath==="bundle"){
      const src = join(root,"packages",filePath,"bin","bundle.js")
      const dist = join(root,"dist/packages",filePath,"bin","bundle.js")
      copyFile(src,dist,function(err) {
        if (err){
          console.log(err);
        }else{
          console.log(`copy file ${src} success`);
        }
      })
    }
  }
})

