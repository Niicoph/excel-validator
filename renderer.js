document.getElementById("cargar").addEventListener("click", async () => {
  const path = await window.api.selectFile();
  if (!path) return;

  const errores = await window.api.processFile(path);
  const lista = document.getElementById("errores");
  lista.innerHTML = "";

  if (errores.length === 0) {
    lista.innerHTML = "<li>Sin errores 🎉</li>";
  } else {
    errores.forEach((error) => {
      const li = document.createElement("li");
      li.textContent = error;
      lista.appendChild(li);
    });
  }
});
