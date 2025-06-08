const { app, BrowserWindow, ipcMain, dialog } = require("electron/main");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.resolve(__dirname, "renderer", "dist", "index.html"));
};

app.whenReady().then(createWindow);

ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
    properties: ["openFile"],
  });
  return result.filePaths[0];
});
ipcMain.handle("process-file", async (event, filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: "A",
    defval: "",
    range: 1,
  });

  let errores = [];
  const dniSet = new Set();

  data.forEach((fila, index) => {
    // Validar espacios en columnas A, B , F , G , H J
    ["A", "B", "F", "G" , "H" , "J" ].forEach((col) => {
      const valor = fila[col];
      if (typeof valor === "string" && valor.trim() !== valor) {
        errores.push(
          `Fila ${index + 2} | Columna ${col} -> espacio extra (valor: "${valor}")`
        );
      }
    });

    // Validar DNI único (columna C)
    const rawDni = fila["C"];
    const dni = String(rawDni).trim();

    if (!dni) {
      errores.push(`Fila ${index + 2} | Columna C -> DNI no definido (celda vacía)`);
    } else {
      if (!/^\d{7,8}$/.test(dni)) {
        errores.push(`Fila ${index + 2} | Columna C -> DNI inválido (${dni})`);
      }
      if (dniSet.has(dni)) {
        errores.push(`Fila ${index + 2} | Columna C -> DNI duplicado (${dni})`);
      } else {
        dniSet.add(dni);
      }
    }
  });

  return errores;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
