
let db;

document.addEventListener('DOMContentLoaded', () => {
  carregarTela('inicio');

  const request = indexedDB.open('contatosDB', 1);

  request.onerror = () => alert('Erro ao abrir o banco');

  request.onupgradeneeded = e => {
    db = e.target.result;
    const store = db.createObjectStore('contatos', { keyPath: 'id', autoIncrement: true });
    store.createIndex('nome', 'nome', { unique: false });
  };

  request.onsuccess = e => {
    db = e.target.result;
    listarContatos();
  };
});

function carregarTela(nome) {
  return fetch(`${nome}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;
      if (nome === 'lista') listarContatos();
    });
}

function salvarContato(e) {
  e.preventDefault();
  const id = document.getElementById('id').value;
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  if (!nome || !telefone) return alert('Preencha todos os campos.');

  const trans = db.transaction('contatos', 'readwrite');
  const store = trans.objectStore('contatos');
  const contato = { nome, telefone };

  if (id) {
    contato.id = Number(id);
    store.put(contato);
  } else {
    store.add(contato);
  }

  trans.oncomplete = () => carregarTela('lista');
}

function listarContatos() {
  const lista = document.getElementById('lista-contatos');
  if (!lista) return;
  lista.innerHTML = '';
  const trans = db.transaction('contatos', 'readonly');
  const store = trans.objectStore('contatos');
  store.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (cursor) {
      const contato = cursor.value;
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <strong>${contato.nome}</strong> (${contato.telefone})<br>
        <button onclick="verDetalhes(${contato.id})">Ver</button>
        <button onclick="editarContato(${contato.id})">Editar</button>
        <button onclick="excluirContato(${contato.id})">Excluir</button>
      `;
      lista.appendChild(div);
      cursor.continue();
    }
  };
}

function editarContato(id) {
  const trans = db.transaction('contatos', 'readonly');
  const store = trans.objectStore('contatos');
  const req = store.get(id);
  req.onsuccess = () => {
    carregarTela('insercao').then(() => {
      const c = req.result;
      document.getElementById('id').value = c.id;
      document.getElementById('nome').value = c.nome;
      document.getElementById('telefone').value = c.telefone;
    });
  };
}

function excluirContato(id) {
  if (confirm('Deseja realmente excluir?')) {
    const trans = db.transaction('contatos', 'readwrite');
    const store = trans.objectStore('contatos');
    store.delete(id);
    trans.oncomplete = listarContatos;
  }
}

function verDetalhes(id) {
  const trans = db.transaction('contatos', 'readonly');
  const store = trans.objectStore('contatos');
  const req = store.get(id);
  req.onsuccess = () => {
    carregarTela('detalhes').then(() => {
      const c = req.result;
      document.getElementById('detalhe-nome').textContent = c.nome;
      document.getElementById('detalhe-telefone').textContent = c.telefone;
    });
  };
}

function toggleTheme() {
  const theme = document.body.getAttribute('data-theme') === 'dark' ? '' : 'dark';
  document.body.setAttribute('data-theme', theme);
}
