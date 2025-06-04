const formCategoria = document.getElementById("formCategoria");
const inputCategoria = document.getElementById("nomeCategoria");
const listaCategorias = document.getElementById("listaCategorias");

const areaTarefas = document.getElementById("areaTarefas");
const tituloTarefas = document.getElementById("tituloTarefas");
const formTarefa = document.getElementById("formTarefa");
const inputTarefa = document.getElementById("descricaoTarefa");
const listaTarefas = document.getElementById("listaTarefas");

let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let categoriaAtivaId = null;

formCategoria.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = inputCategoria.value.trim();
  if (!nome) return;
  const novaCategoria = { id: Date.now(), nome };
  categorias.push(novaCategoria);
  salvar("categorias", categorias);
  renderizarCategorias();
  formCategoria.reset();
});

function renderizarCategorias() {
  listaCategorias.innerHTML = "";
  categorias.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span onclick="abrirTarefas(${cat.id})" style="cursor:pointer">${cat.nome}</span>
      <div>
        <button onclick="editarCategoria(${cat.id})">✏️</button>
        <button class="excluir" onclick="excluirCategoria(${cat.id})">🗑️</button>
      </div>
    `;
    listaCategorias.appendChild(li);
  });
}

function salvar(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function excluirCategoria(id) {
  categorias = categorias.filter(c => c.id !== id);
  tarefas = tarefas.filter(t => t.categoriaId !== id);
  salvar("categorias", categorias);
  salvar("tarefas", tarefas);
  renderizarCategorias();
  fecharTarefas();
}

function editarCategoria(id) {
  const novoNome = prompt("Novo nome:");
  if (!novoNome) return;
  const cat = categorias.find(c => c.id === id);
  if (cat) {
    cat.nome = novoNome;
    salvar("categorias", categorias);
    renderizarCategorias();
  }
}

function abrirTarefas(id) {
  categoriaAtivaId = id;
  const cat = categorias.find(c => c.id === id);
  if (!cat) return;
  tituloTarefas.textContent = `Tarefas de: ${cat.nome}`;
  areaTarefas.classList.remove("hidden");
  renderizarTarefas();
}

function fecharTarefas() {
  areaTarefas.classList.add("hidden");
  categoriaAtivaId = null;
}

formTarefa.addEventListener("submit", (e) => {
  e.preventDefault();
  const descricao = inputTarefa.value.trim();
  if (!descricao || categoriaAtivaId === null) return;
  const novaTarefa = {
    id: Date.now(),
    descricao,
    categoriaId: categoriaAtivaId
  };
  tarefas.push(novaTarefa);
  salvar("tarefas", tarefas);
  renderizarTarefas();
  formTarefa.reset();
});

function renderizarTarefas() {
  listaTarefas.innerHTML = "";
  const tarefasDaCategoria = tarefas.filter(t => t.categoriaId === categoriaAtivaId);
  tarefasDaCategoria.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.descricao}</span>
      <div>
        <button onclick="editarTarefa(${t.id})">✏️</button>
        <button class="excluir" onclick="excluirTarefa(${t.id})">🗑️</button>
      </div>
    `;
    listaTarefas.appendChild(li);
  });
}

function editarTarefa(id) {
  const novaDescricao = prompt("Nova descrição da tarefa:");
  const tarefa = tarefas.find(t => t.id === id);
  if (tarefa && novaDescricao) {
    tarefa.descricao = novaDescricao;
    salvar("tarefas", tarefas);
    renderizarTarefas();
  }
}

function excluirTarefa(id) {
  tarefas = tarefas.filter(t => t.id !== id);
  salvar("tarefas", tarefas);
  renderizarTarefas();
}

renderizarCategorias();