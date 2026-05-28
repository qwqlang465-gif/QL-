module.exports = {
  appId: "com.qwqlang465.ql",
  productName: "QL",
  directories: {
    output: "release",
    buildResources: "build",
  },
  electronDist: "node_modules/electron/dist",
  files: ["dist/**/*", "electron/**/*", "package.json"],
  asar: true,
  win: {
    signAndEditExecutable: false,
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    icon: "build/icon.ico",
    artifactName: "${productName}-${version}-Setup-${arch}.${ext}",
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "QL",
  },
};
