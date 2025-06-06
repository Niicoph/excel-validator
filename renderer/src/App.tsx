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
      toast.error("Errores encontrados", {
        // description: errors.join(", "),
      });
    } else {
      toast.success("Validación completa", {
        description: "No se encontraron errores.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <Toaster position="top-right" richColors />
      <h1 className="text-3xl font-bold mb-6 text-center">Excel Validator</h1>

      <Card className="max-w-xl mx-auto shadow-lg">
        <CardContent className="p-6 space-y-4">
          <Label htmlFor="file" className="mb-4">
            Seleccionar archivo Excel
          </Label>
          <Button onClick={handleSelectFile} className="w-full">
            Seleccionar archivo Excel
          </Button>

          <Button
            onClick={handleValidate}
            className="w-full"
            disabled={!filePath}
          >
            Validar archivo
          </Button>
        </CardContent>
      </Card>
      {errorsData && errorsData.length > 0 && (
        <Card className="max-w-2xl mx-auto mt-4 p-4 shadow-md border border-red-300">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Errores encontrados:
          </h2>
          <ul className="list-disc list-inside text-red-600">
            {errorsData.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default App;
