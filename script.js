async function verificarEmail(email) {
    //aq é a api para verificar se o email é valido!!
    const apiKey = '7c744f92afce415198e46217498e7d46';

    try{
    const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
    const data = await response.json();

    if (!data.deliverability || data.deliverability === "UNDELIVERABLE") {
        alert("Email inválido ou não existente!");
        return false;
    }
    return true;
}  catch (error) {
        console.error("Erro ao validar e-mail:", error);
        alert("Ocorreu um erro ao verificar o e-mail. Tente novamente mais tarde.");
        return false;
    }
}

function verificaridade(datanascimento) {
    //esta verificando se a pessoa e maior de 18 anos
    const hoje = new Date();
    const nascimento = new Date(datanascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    //aq verifico se ela ja fez aniversario ou não
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade >= 18;
}
//async serve para o await funcionar para a verificação do email
async function cadastrar(event) {
    event.preventDefault();
    //variaveis dos dados do usuario
    const nome = document.getElementById("txtnome").value;
    const cpf = document.getElementById("txtcpf").value;
    const email = document.getElementById("txtEmail").value;
    const senha = document.getElementById("txtSenha").value;
     const erroSenhaCurta = document.getElementById("erroSenhaCurta");
    const telefoneuser = document.getElementById("txtnumero").value;
    const confirmarsenha = document.getElementById("txtconfirmarsenha").value;
    const datanascimento = document.getElementById("txtnascimento").value;
    const errosenha = document.getElementById("txterro");
    const erroHistoriaCurta = document.getElementById("erroHistoriaCurta");

    /*aq estou verificando se oq foi digitado no campo senha é igual o que ta no campo de confirmação
    se não for igual ele apresenta a mensagem que ta em alert*/
    if (senha.length < 8) {
        erroSenhaCurta.style.display = "block";
        return; // interrompe o cadastro aqui
    } else {
        erroSenhaCurta.style.display = "none";
    }
    if (senha !== confirmarsenha) {
        alert('As senhas devem ser iguais!');
        errosenha.style.display = "block";
        return;
    } else {
        errosenha.style.display = "none";
    }

    //isso aparece se o usuario colocar uma data na qual a soma não de a idade necessaria
    if (!verificaridade(datanascimento)) {
        alert("Você precisa ter 18 anos ou mais para se cadastrar.");
        return;
    }

    //verificando se o email é valido obs: a api so pode ser chamada 100 vezes a partir disso cobra
    const emailValido = await verificarEmail(email);
    if (!emailValido) return;

    //criando uma variavel com nome usuario pra guardar os dados
    const usuario = { nome, cpf, email, senha, telefoneuser, datanascimento };

    

    // Verifica se já existe um usuário com o mesmo nome ou e-mail
for (let i = 0; i < localStorage.length; i++) {
  const chave = localStorage.key(i);

  try {
    const usuarioExistente = JSON.parse(localStorage.getItem(chave));

    if (usuarioExistente && typeof usuarioExistente === "object") {
      if (usuarioExistente.cpf === cpf) {
        alert("Já existe um usuário com este cpf");
        return;
      }
      if (usuarioExistente.email === email) {
        alert("Já existe um usuário com este e-mail.");
        return;
      }
    }
  } catch (e) {
    // ignora chaves inválidas
  }
}

    localStorage.setItem(email, JSON.stringify(usuario));
    alert('Usuário cadastrado com sucesso!');
    window.location.href = 'login.html';
}
//aqui é referente ao login
function login(event) {
   event.preventDefault();
    const user = document.getElementById('txtusuario').value;
    const senhaa = document.getElementById('txtsenha').value;

     if (!user || !senhaa) {
        alert('Preencha todos os campos!');
        return;
    }

    const moderadorLogin = {
        usuario: "admin@vozesdaverdade.com",
        senha: "123456"
    };

    if (user === moderadorLogin.usuario && senhaa === moderadorLogin.senha) {
        localStorage.setItem("moderadorLogado", "true");
        alert("Login de moderador realizado com sucesso!");
        window.location.href = "moderadores.html";
        return;  // Importante parar aqui
    }

    // aq to verificando se todos os campos foram preenchidos
   
    //verificando os dados que ta no localstorage
    const usuariocadastrado = localStorage.getItem(user);

    // se os dados for diferente do q ta salvo na localstorage ele mostra isso 
    if (!usuariocadastrado) {
        alert('Usuário ou senha não encontrados!');
        return;
    }

    const usuarioifsistema = JSON.parse(usuariocadastrado);
    //se tiver tudo certo ela vai direto para a pagina de inicio
    if (usuarioifsistema.senha === senhaa) {
      localStorage.setItem("usuarioLogado", usuarioifsistema.email);
        window.location.href = 'index.html';
        

        //se não ele aparece isso aq
    } else {
        alert('Usuário ou senha inválidos!');
    }
}

//essa parte aq leva a historia compartilhada ate os moderadores caso eles aprovar ela vai pra pagina historias
function enviarHistoria() {
  const texto = document.getElementById("campo-historia").value;
  const categoria = document.getElementById("categoria").value;

  if (texto.trim() === "") {
    alert("Digite sua história antes de enviar.");
    return;
  }

  if (texto.trim().length < 30) {
    erroHistoriaCurta.style.display = "block";
    return;
  }

  if (!categoria) {
    alert("Por favor, selecione uma categoria.");
    return;
  }

  const usuarioLogado = localStorage.getItem("usuarioLogado");
  let nome = "Anônimo";

  if (usuarioLogado) {
    const usuario = JSON.parse(localStorage.getItem(usuarioLogado));
    if (usuario && usuario.nome) {
      nome = usuario.nome;
    }
  } else {
    nome = document.getElementById("nomesemcadastro").value || "Anônimo";
  }

  const agora = new Date();
  const datapost = agora.toLocaleDateString("pt-BR");
  const horapost = agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  const id = Date.now().toString();

  let pendentes = JSON.parse(localStorage.getItem("historiasPendentes")) || [];
  pendentes.push({ id, nome, texto, categoria, datapost, horapost });
  localStorage.setItem("historiasPendentes", JSON.stringify(pendentes));

  alert("Sua história foi enviada para moderação!");
  window.location.href = "index.html";
}



//moderadores
function carregarPendentes() {
  const container = document.getElementById("pendentes-container");
  const pendentes = JSON.parse(localStorage.getItem("historiasPendentes")) || [];

  container.innerHTML = "";

  pendentes.forEach((historia, index) => {
    const card = document.createElement("div");
    card.classList.add("historia-pendente");
    card.innerHTML = `
      <h3>${historia.nome} - ${historia.datapost}</h3>
      <p>${historia.texto}</p>
      <div class="botoes-moderacao">
        <button class="btn-aprovar" onclick="aprovarHistoria(${index})">Aprovar</button>
        <button class="btn-rejeitar" onclick="rejeitarHistoria(${index})">Rejeitar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function carregarAprovadasParaModeracao() {
  const container = document.getElementById("aprovadas-moderacao-container");
  if (!container) return;

  const historias = JSON.parse(localStorage.getItem("historiasAprovadas")) || [];

  container.innerHTML = "";

  historias.forEach((historia) => {
    const card = document.createElement("div");
    card.classList.add("historia-pendente"); // ou outro estilo se quiser

    card.innerHTML = `
      <h3>${historia.nome} - ${historia.datapost}</h3>
      <p>${historia.texto}</p>
      <div class="botoes-moderacao">
        <button class="btn-rejeitar" onclick="removerHistoriaAprovada('${historia.id}')">Remover</button>
      </div>
    `;

    container.appendChild(card);
  });
}





function aprovarHistoria(index) {
  let pendentes = JSON.parse(localStorage.getItem("historiasPendentes")) || [];
  let aprovadas = JSON.parse(localStorage.getItem("historiasAprovadas")) || [];

  const historiaAprovada = pendentes.splice(index, 1)[0];
  aprovadas.push(historiaAprovada);

  localStorage.setItem("historiasPendentes", JSON.stringify(pendentes));
  localStorage.setItem("historiasAprovadas", JSON.stringify(aprovadas));

  carregarPendentes(); // atualiza a tela
}

function rejeitarHistoria(index) {
  let pendentes = JSON.parse(localStorage.getItem("historiasPendentes")) || [];

  // Remove a história do array
  pendentes.splice(index, 1);

  // Atualiza o localStorage
  localStorage.setItem("historiasPendentes", JSON.stringify(pendentes));

  // Atualiza a lista na tela
  carregarPendentes();
}

function deletarHistoria(historiaId) {
  let aprovadas = JSON.parse(localStorage.getItem("historiasAprovadas")) || [];
  aprovadas = aprovadas.filter(historia => historia.id !== historiaId);
  localStorage.setItem("historiasAprovadas", JSON.stringify(aprovadas));

  alert("História excluída com sucesso.");
  carregarAprovadas();
}


//lista de historias

function carregarAprovadas() {
  const container = document.getElementById("aprovadas-container");
  const historias = JSON.parse(localStorage.getItem("historiasAprovadas")) || [];
  const comentariosSalvos = JSON.parse(localStorage.getItem("comentariosPorHistoria") || "{}");

  container.innerHTML = "";

  historias.sort((a, b) => {
    const dataHoraA = new Date(`${a.datapost} ${a.horapost}`);
    const dataHoraB = new Date(`${b.datapost} ${b.horapost}`);
    return dataHoraB - dataHoraA;
  });

  historias.forEach((historia) => {
    const historiaId = historia.id;
    const card = document.createElement("div");
    card.classList.add("card-historia");

    card.innerHTML =`
 
      <div class="historia-card" data-id="${historiaId}">
        <h3>${historia.nome}</h3>
        <p>${historia.datapost} ${historia.horapost || ''}</p>
        <p>${historia.texto}</p>

        <div class="botoes-historia">
         
          <button class="btn-historia" onclick="abrirComentario(this)">Comentar</button>
        </div>

        <div class="comentario-box" style="display: none;">
          <textarea placeholder="Digite seu comentário..."></textarea>
          <button onclick="enviarComentario(this)">Enviar</button>
        </div>

        <div class="comentarios">
          ${
            comentariosSalvos[historiaId]?.map(
              com => `<p><strong>${com.nome}:</strong> ${com.texto}</p>`
            ).join("") || ""
          }
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}




function abrirComentario(botao) {
  const comentarioBox = botao.parentElement.nextElementSibling;
  comentarioBox.style.display = comentarioBox.style.display === "none" ? "block" : "none";
}

function enviarComentario(botao) {
  const textarea = botao.previousElementSibling;
  const texto = textarea.value.trim();
  if (!texto) return;

  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Anônimo";

  const card = botao.closest(".historia-card");
  const historiaId = card.getAttribute("data-id");

  const comentarios = JSON.parse(localStorage.getItem("comentariosPorHistoria") || "{}");
  if (!comentarios[historiaId]) comentarios[historiaId] = [];

  comentarios[historiaId].push({ nome: nomeUsuario, texto });
  localStorage.setItem("comentariosPorHistoria", JSON.stringify(comentarios));

  const comentariosDiv = card.querySelector(".comentarios");
  const novoComentario = document.createElement("p");
  novoComentario.innerHTML = `<strong>${nomeUsuario}:</strong> ${texto}`;
  comentariosDiv.appendChild(novoComentario);

  textarea.value = "";
  botao.parentElement.style.display = "none";
}


// Esconde os botões "Login" e "Cadastro" se o usuário estiver logado
document.addEventListener("DOMContentLoaded", () => {
  const nomeLogado = localStorage.getItem("usuarioLogado");

  if (nomeLogado) {
    const loginLink = document.querySelector('a[href="login.html"]');
    const cadastroLink = document.querySelector('a[href="cadastro.html"]');
    const perfilLink = document.getElementById("linkPerfil");

    if (loginLink) loginLink.style.display = "none";
    if (cadastroLink) cadastroLink.style.display = "none";
    if (perfilLink) perfilLink.style.display = "inline-block";

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("usuarioLogado");
        alert("Você saiu da sua conta.");
        window.location.href = "index.html";
      });
    }
  }
});



window.onload = () => {
  const nomeLogado = localStorage.getItem("usuarioLogado");
  const loginLink = document.querySelector('a[href="login.html"]');
  const cadastroLink = document.querySelector('a[href="cadastro.html"]');
  const logoutBtn = document.getElementById("logoutBtn");

  if (nomeLogado) {
    if (loginLink) {
      loginLink.style.display = "none";
    }
    if (cadastroLink) {
      cadastroLink.style.display = "none";
    }
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("usuarioLogado");
        alert("Você saiu da sua conta.");
        window.location.href = "index.html"; // ou "login.html"
      });
    }
  }
};


// Verificação de login para páginas protegidas
if (window.location.pathname.includes("perfilusuario.html")) {
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  if (!usuarioLogado) {
    window.location.href = 'login.html';
  }
}


// Exibir dados do usuário no perfilusuario.html
if (window.location.pathname.includes("perfilusuario.html")) {
  const emailLogado = localStorage.getItem("usuarioLogado");

  if (!emailLogado) {
    window.location.href = "login.html";
  } else {
    const usuario = JSON.parse(localStorage.getItem(emailLogado));
    
    if (usuario) {
      document.getElementById("perfil-nome").textContent = usuario.nome;
      document.getElementById("perfil-cpf").textContent = usuario.cpf;
      document.getElementById("perfil-email").textContent = usuario.email;
      document.getElementById("perfil-telefone").textContent = usuario.telefoneuser || "Não informado";
      document.getElementById("perfil-nascimento").textContent = usuario.datanascimento;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("moderadores.html")) {
    carregarPendentes();
    carregarAprovadasParaModeracao();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("moderadores.html")) {
    carregarPendentes();
  }

  if (path.includes("listagemhistorias.html")) {
    carregarAprovadas();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("historias.html")) {
    const nomeInput = document.getElementById("nomesemcadastro");
    const usuarioLogado = localStorage.getItem("usuarioLogado");

    if (usuarioLogado && nomeInput) {
      nomeInput.parentElement.style.display = "none"; // Esconde o grupo inteiro (label + input)
    }
  }
});

function filtrarHistorias(event) {
  event.preventDefault(); // impede o reload

  const categoriaSelecionada = document.getElementById("categoria").value;
  const palavraChave = document.getElementById("palavraChave").value.toLowerCase();
  const container = document.getElementById("aprovadas-container");
  const todasHistorias = JSON.parse(localStorage.getItem("historiasAprovadas")) || [];

  const historiasFiltradas = todasHistorias.filter(historia => {
    const correspondeCategoria = !categoriaSelecionada || historia.categoria === categoriaSelecionada;
    const correspondePalavra = !palavraChave || historia.texto.toLowerCase().includes(palavraChave);
    return correspondeCategoria && correspondePalavra;
  });

  container.innerHTML = ""; // limpa

  historiasFiltradas.forEach((historia) => {
    const historiaId = historia.id;
    const card = document.createElement("div");
    card.classList.add("card-historia");

    card.innerHTML = `
      <div class="historia-card" data-id="${historiaId}">
        <h3>${historia.nome}</h3>
        <p><strong>Categoria:</strong> ${historia.categoria || "Não especificada"}</p>
        <p>${historia.datapost} ${historia.horapost || ''}</p>
        <p>${historia.texto}</p>

        <div class="botoes-historia">
          <button class="btn-historia" onclick="abrirComentario(this)">Comentar</button>
        </div>

        <div class="comentario-box" style="display: none;">
          <textarea placeholder="Digite seu comentário..."></textarea>
          <button onclick="enviarComentario(this)">Enviar</button>
        </div>

        <div class="comentarios"></div>
      </div>
    `;

    container.appendChild(card);
  });
}


function aplicarFiltros(event) {
  event.preventDefault();

  const tipoDenuncia = document.getElementById("tipo-denuncia").value;
  const dataFiltro = document.getElementById("data").value;

  const pendentes = JSON.parse(localStorage.getItem("historiasPendentes")) || [];
  const container = document.getElementById("pendentes-container");
  container.innerHTML = "";

  const filtradas = pendentes.filter(historia => {
    const correspondeTipo = tipoDenuncia === "" || historia.categoria === tipoDenuncia;
    const correspondeData = dataFiltro === "" || historia.datapost === formatarData(dataFiltro);
    return correspondeTipo && correspondeData;
  });

  filtradas.forEach((historia, index) => {
    const card = document.createElement("div");
    card.classList.add("historia-pendente");
    card.innerHTML = `
      <h3>${historia.nome} - ${historia.datapost}</h3>
      <p>${historia.texto}</p>
      <div class="botoes-moderacao">
        <button class="btn-aprovar" onclick="aprovarHistoria(${index})">Aprovar</button>
        <button class="btn-rejeitar" onclick="rejeitarHistoria(${index})">Rejeitar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}


document.addEventListener("DOMContentLoaded", () => {
  const campoHistoria = document.getElementById("campo-historia");
  const categoria = document.getElementById("categoria");
  const btnDenunciar = document.getElementById("btnDenunciar");

  function verificarCampos() {
    const texto = campoHistoria.value.trim();
    const categoriaSelecionada = categoria.value;

    if (texto.length >= 30 && categoriaSelecionada !== "") {
      btnDenunciar.disabled = false;
      btnDenunciar.classList.add("btn-ativo");
      btnDenunciar.classList.remove("btn-inativo");
    } else {
      btnDenunciar.disabled = true;
      btnDenunciar.classList.add("btn-inativo");
      btnDenunciar.classList.remove("btn-ativo");
    }
  }

  campoHistoria.addEventListener("input", verificarCampos);
  categoria.addEventListener("change", verificarCampos);

  // Verificação inicial
  verificarCampos();
});

function removerHistoriaAprovada(historiaId) {
  let aprovadas = JSON.parse(localStorage.getItem("historiasAprovadas")) || [];
  aprovadas = aprovadas.filter(historia => historia.id !== historiaId);
  localStorage.setItem("historiasAprovadas", JSON.stringify(aprovadas));

  alert("História removida com sucesso.");
  carregarAprovadasParaModeracao();
}

function sairModerador() {
    localStorage.removeItem("moderadorLogado");
    alert("Você saiu da conta de moderador.");
    window.location.href = "index.html";  // Ou outra página se preferir
}

function carregarAprovadasIndex() {
  const container = document.getElementById("aprovadas-container");
  if (!container) return; // segurança

  const historias = JSON.parse(localStorage.getItem("historiasAprovadas")) || [];
  const comentariosSalvos = JSON.parse(localStorage.getItem("comentariosPorHistoria") || "{}");

  container.innerHTML = "";

  // Ordena pela data e hora decrescente
  historias.sort((a, b) => {
    const dataHoraA = new Date(`${a.datapost} ${a.horapost}`);
    const dataHoraB = new Date(`${b.datapost} ${b.horapost}`);
    return dataHoraB - dataHoraA;
  });

  // Pega apenas as 3 mais recentes
  const ultimasTres = historias.slice(0, 3);

  ultimasTres.forEach((historia) => {
    const historiaId = historia.id;
    const card = document.createElement("div");
    card.classList.add("card-historia");

    card.innerHTML = `
      <div class="historia-card" data-id="${historiaId}">
        <h3>${historia.nome}</h3>
        <p>${historia.datapost} ${historia.horapost || ''}</p>
        <p>${historia.texto}</p>

        <div class="botoes-historia">
          
          <button class="btn-historia" onclick="abrirComentario(this)">Comentar</button>
        </div>

        <div class="comentario-box" style="display: none;">
          <textarea placeholder="Digite seu comentário..."></textarea>
          <button onclick="enviarComentario(this)">Enviar</button>
        </div>

        <div class="comentarios">
          ${
            comentariosSalvos[historiaId]?.map(
              com => `<p><strong>${com.nome}:</strong> ${com.texto}</p>`
            ).join("") || ""
          }
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("index.html")) {
    carregarAprovadasIndex();
  }
});

function acceptCookies() {
  sessionStorage.setItem('cookiesAccepted', 'true');
  document.getElementById('cookie-banner').style.display = 'none';
}

window.onload = function() {
  if (sessionStorage.getItem('cookiesAccepted') === 'true') {
    document.getElementById('cookie-banner').style.display = 'none';
  } else {
    document.getElementById('cookie-banner').style.display = 'flex';
  }

  document.getElementById('accept-cookies').addEventListener('click', acceptCookies);
};


