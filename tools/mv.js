let { createReadStream,createWriteStream, readdirSync, statSync } = require("fs");
let { join } = require("path");

function isDirectory(path) {
  return statSync(path).isDirectory();
}

function getFolders(dir) {
  return readdirSync(dir).filter(file => isDirectory(join(dir, file)));
}
console.log("准备复制文件了")
const packagesPath = getFolders("packages")
packagesPath.forEach((filePath)=>{
  let file = createReadStream(join("packages",filePath,"package.json"))
  let out = createWriteStream(join("dist/@electron-boot",filePath,"package.json"))
  file.pipe(out)
})
console.log("文件复制完毕")

