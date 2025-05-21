const API_URL = "http://localhost:3000/rotinas";

const form = document.getElementById("routine-form");
const diaInput = document.getElementById("rotina-dia");
const descInput = document.getElementById("rotina-desc");
const idInput = document.getElementById("rotina-id");
const lista = document.getElementById("rotinas-lista");

form.onsubmit = async (e) => {
  e.preventDefault();
  const rotina = { dia: diaInput.value, descricao: descInput.value };
  const id = idInput.value;

  if (id) {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rotina),
    });
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rotina),
    });
  }

  form.reset();
  carregar();
};

async function carregar() {
  const res = await fetch(API_URL);
  const rotinas = await res.json();
  lista.innerHTML = "";
  rotinas.forEach(r => {
    const div = document.createElement("div");
    div.innerHTML = `<b>${r.dia}</b>: ${r.descricao}
      <button onclick="editar(${r.id}, '${r.dia}', '${r.descricao}')">Editar</button>
      <button onclick="deletar(${r.id})">Excluir</button>`;
    lista.appendChild(div);
  });
}

function editar(id, dia, desc) {
  idInput.value = id;
  diaInput.value = dia;
  descInput.value = desc;
}

async function deletar(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  carregar();
}

window.onload = carregar;
