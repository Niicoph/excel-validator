import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

declare global {
  interface Window {
    api: {
      selectFile: () => Promise<string>;
      processFile: (filePath: string) => Promise<string[]>;
    };
  }
}

function App() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [errorsData, setErrorsData] = useState<string[] | null>(null);

  const handleSelectFile = async () => {
    const selectedPath = await window.api.selectFile();
    if (selectedPath) {
      setFilePath(selectedPath);
      toast.success("Archivo cargado", {
        description: selectedPath.split("/").pop(),
      });
    }
  };

  const handleValidate = async () => {
    if (!filePath) {
      toast.error("Error", {
        description: "Por favor seleccioná un archivo",
      });
      return;
    }

    const errors = await window.api.processFile(filePath);

    if (errors.length > 0) {
      setErrorsData(errors);
      toast.error("Errores encontrados");
    } else {
      toast.success("Validación completa", {
        description: "No se encontraron errores.",
      });
    }
    setFilePath(null);
  };

  const groupedErrors = errorsData?.reduce(
    (acc: Record<string, string[]>, error) => {
      const match = error.match(/Columna (\w)/);
      if (match) {
        const col = match[1];
        if (!acc[col]) acc[col] = [];
        acc[col].push(error);
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <Toaster position="top-right" richColors />
      <h1 className="text-3xl font-bold mb-6 text-center">Excel Validator</h1>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <Label htmlFor="file" className="mb-4">
            Seleccionar archivo Excel
          </Label>
          <Button onClick={handleSelectFile} className="w-full">
            Seleccionar archivo Excel
          </Button>
          {filePath && (
            <p className="text-sm text-black mb-2 flex">
              Archivo:{" "}
              <p className="text-emerald-600"> {filePath.split("/").pop()}</p>
            </p>
          )}
          <Button
            onClick={handleValidate}
            className="w-full"
            disabled={!filePath}
          >
            Validar archivo
          </Button>
        </CardContent>
      </Card>
      {groupedErrors && (
        <Card className="max-w-6xl mx-auto mt-4 p-4 shadow-md border border-red-300">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Errores encontrados
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Object.entries(groupedErrors)
              .sort(([colA], [colB]) => colA.localeCompare(colB)) // 👈 orden alfabético por columna
              .map(([col, errores]) => (
                <div key={col}>
                  <h3 className="text-md font-semibold text-red-500 mb-2">
                    Columna {col}
                  </h3>
                  <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                    {errores.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default App;
