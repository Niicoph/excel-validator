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
  const data = XLSX.utils.sheet_to_json(sheet);

  let errores = [];
  const dniSet = new Set();
  data.forEach((fila, index) => {
    // Ejemplo fila:
    // { "Tipo Operaciòn": "I", "Tipo documento": "D", "Nro doc": 29695700, "ESTADO": "H" }

    // Recorremos las columnas que queremos validar espacios extras
    ["Tipo Operaciòn", "Tipo documento", "ESTADO"].forEach((col) => {
      const valor = fila[col];
      if (typeof valor === "string") {
        // Chequear espacios al principio o final
        if (valor.trim() !== valor) {
          errores.push(
            `Fila ${
              index + 2
            }: espacio extra en columna "${col}" (valor: "${valor}")`
          );
        }
      }
    });
    // Validar DNI único
    const rawDni = fila["Nro doc"];
    if (rawDni === undefined || rawDni === null || String(rawDni).trim() === "") {
      errores.push(`Fila ${index + 2}: DNI no definido (celda vacía)`);
    } else {
      const dni = String(rawDni).trim();
      if (dniSet.has(dni)) {
        errores.push(`Fila ${index + 2}: DNI duplicado (${dni})`);
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
