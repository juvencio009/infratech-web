async function Loader(route) {
  try {
    const res = await fetch(route);
    if (!res.ok) throw new Error("Erro ao carregar os dados");
    
    return await res.json();
  } catch (err) {
    console.error("Erro Detectado:", err);
    throw err;
  }
}


window.onload = function (){
    document.getElementById("loader").style.display='none';
}
