var FtpDeploy = require("ftp-deploy");
var ftpDeploy = new FtpDeploy();

var config = {
    user: "barneym",
    // Password optional, prompted if none given
    // password: "password",
    host: "ftp.wheresbarney.com",
    port: 21,
    localRoot: __dirname + "/build",
    remoteRoot: "/public_html/xox/",
    include: ["*", "**/*"],      // this would upload everything except dot files
    // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
    // exclude: ["dist/**/*.map", "node_modules/**", "node_modules/**/.*", ".git/**"],
    // delete ALL existing files at destination before uploading, if true
    deleteRemote: false,
    // Passive mode is forced (EPSV command is not sent)
    forcePasv: true,
    // use sftp or ftp
    sftp: false
};

ftpDeploy
    .deploy(config)
    .then(res => console.log("finished:", res))
    .catch(err => console.log(err));
