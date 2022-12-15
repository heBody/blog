// 把 dist_bak的目录移到dist， 然后上传到git服务器
const path = require("path");
const fss = require("fs-extra");
const childProcess = require("child_process");

let distPath = path.resolve("docs/.vuepress/dist/.git");
let distBackPath = path.resolve("docs/.vuepress/dist_bak/.git");
console.log("path:", distPath);
console.log("path:", distBackPath);

console.log("check:", fss.pathExistsSync(distBackPath));
if (fss.pathExistsSync(distBackPath)) {
  move(distBackPath, distPath, () => {
    doGit();
  });
} else {
  console.log("已移走");
  doGit();
}

function doGit() {
  gitAction([
    "git add .",
    `git commit -m "update"`,
    "git push",
    () => {
      setTimeout(() => {
        move(distPath, distBackPath);
      }, 100);
    },
  ]);
}

function move(from, to, cb) {
  fss.move(from, to, { overwrite: true }, (err) => {
    if (err) {
      return console.error(err);
    }
    if (cb) {
      cb();
    }
    console.log("move success!");
  });
}

function gitAction(cmdList) {
  if (cmdList.length <= 0) {
    return;
  }
  let cmd = cmdList.shift();
  console.log("exec:", cmd);
  if (typeof cmd == "function") {
    cmd();
    gitAction(cmdList);
    return;
  } else {
    let proc = childProcess.exec(
      cmd,
      { cwd: "./docs/.vuepress/dist/" },
      (err, out) => {
        gitAction(cmdList);
      }
    );
    pipeStd(proc);
  }
}

function pipeStd(proc) {
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
}
