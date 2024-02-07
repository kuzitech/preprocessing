const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 620,
    title: 'Preprocessing APP',
    minHeight: 620,
  });

  win.loadFile('index.html');
  win.setMenu(null)
  win.getBackgroundColor("#09F793")
  win.setSize(1200,660)
};

app.on("ready", () => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
