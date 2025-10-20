// === script.js (Unificado para Painel e Formulário) ===

// O evento DOMContentLoaded garante que o HTML foi completamente carregado antes de o script rodar.
document.addEventListener('DOMContentLoaded', () => {

    // --- DETECÇÃO DE PÁGINA ---
    // Verificamos a existência de um elemento único de cada página para saber onde estamos.
    const isPaginaFormulario = document.getElementById('ferramentaForm') !== null;
    const isPaginaPainel = document.getElementById('painel') !== null;

    if (isPaginaFormulario) {
        // Se encontrarmos o formulário, inicializamos a lógica da página de retirada.
        inicializarPaginaFormulario();
    }

    if (isPaginaPainel) {
        // Se encontrarmos o painel, inicializamos a lógica da página de administração.
        inicializarPaginaPainel();
    }
});


// ===================================================================================
// === FUNÇÕES GLOBAIS PARA EXCEL ====================================================
// ===================================================================================

// Função global para baixar Excel completo
window.baixarExcelCompleto = async function() {
    try {
        // Obter dados do sistema
        const movimentacoes = await window.dbManager.movimentacoes.obterTodas();
        const ferramentas = await window.dbManager.ferramentas.obterTodas();
        const projetos = await window.dbManager.projetos.obterTodos();
        const solicitantes = await window.dbManager.solicitantes.obterTodos();

        // Criar workbook
        const wb = XLSX.utils.book_new();

        // Aba 1: Retiradas (dados das solicitações do index.html)
        const retiradasData = movimentacoes.map(mov => ({
            'Data': mov.dataRetirada || '',
            'Ferramenta': mov.ferramenta || '',
            'Patrimônio': mov.patrimonio || '',
            'Solicitante': mov.solicitante || '',
            'Projeto': mov.projeto || '',
            'Tipo': mov.tipo || '',
            'Data Devolução': mov.dataRetorno || '',
            'Hora Devolução': mov.horaRetorno || '',
            'Tem Retorno': mov.temRetorno || '',
            'Observações': mov.observacoes || ''
        }));
        const wsRetiradas = XLSX.utils.json_to_sheet(retiradasData);
        XLSX.utils.book_append_sheet(wb, wsRetiradas, 'Retiradas');

        // Aba 2: Painel (dados administrativos)
        const painelData = [];

        // Adicionar ferramentas
        ferramentas.forEach(f => {
            painelData.push({
                'Tipo': 'Ferramenta',
                'Nome': f.nome || '',
                'Patrimônios': f.patrimonios ? f.patrimonios.join(', ') : '',
                'Descrição': f.descricao || ''
            });
        });

        // Adicionar projetos
        projetos.forEach(p => {
            painelData.push({
                'Tipo': 'Projeto',
                'Nome': p.nome || '',
                'Patrimônios': '',
                'Descrição': p.descricao || ''
            });
        });

        // Adicionar solicitantes
        solicitantes.forEach(s => {
            painelData.push({
                'Tipo': 'Solicitante',
                'Nome': s.nome || '',
                'Patrimônios': '',
                'Descrição': ''
            });
        });

        const wsPainel = XLSX.utils.json_to_sheet(painelData);
        XLSX.utils.book_append_sheet(wb, wsPainel, 'Painel');

        // Aba 3: Análise Gráfica (dados agregados para gráficos)
        const analiseData = [];

        // KPIs principais
        const totalRetiradas = movimentacoes.length;
        const totalFerramentas = ferramentas.reduce((acc, f) => acc + (f.patrimonios ? f.patrimonios.length : 0), 0);
        const totalEmUso = movimentacoes.filter(mov => {
            if (mov.tipo !== 'quebrada') {
                if (mov.temRetorno === 'sim') {
                    return !mov.dataRetorno || mov.dataRetorno === '';
                }
                return true;
            }
            return false;
        }).length;
        const totalQuebradas = movimentacoes.filter(mov => mov.tipo === 'quebrada').length;

        analiseData.push({
            'Tipo': 'KPI',
            'Categoria': 'Total de Retiradas',
            'Valor': totalRetiradas,
            'Porcentagem': '',
            'Descrição': 'Número total de solicitações de retirada'
        });

        analiseData.push({
            'Tipo': 'KPI',
            'Categoria': 'Ferramentas no Estoque',
            'Valor': totalFerramentas,
            'Porcentagem': '',
            'Descrição': 'Total de ferramentas disponíveis'
        });

        analiseData.push({
            'Tipo': 'KPI',
            'Categoria': 'Ferramentas em Uso',
            'Valor': totalEmUso,
            'Porcentagem': totalFerramentas > 0 ? ((totalEmUso / totalFerramentas) * 100).toFixed(1) + '%' : '0%',
            'Descrição': 'Ferramentas atualmente emprestadas'
        });

        analiseData.push({
            'Tipo': 'KPI',
            'Categoria': 'Ferramentas Quebradas',
            'Valor': totalQuebradas,
            'Porcentagem': totalFerramentas > 0 ? ((totalQuebradas / totalFerramentas) * 100).toFixed(1) + '%' : '0%',
            'Descrição': 'Ferramentas danificadas'
        });

        // Dados para gráfico de barras: Retiradas por ferramenta
        const retiradasPorFerramenta = {};
        movimentacoes.forEach(mov => {
            if (mov.ferramenta) {
                retiradasPorFerramenta[mov.ferramenta] = (retiradasPorFerramenta[mov.ferramenta] || 0) + 1;
            }
        });

        Object.entries(retiradasPorFerramenta).forEach(([ferramenta, quantidade]) => {
            analiseData.push({
                'Tipo': 'Gráfico de Barras',
                'Categoria': 'Retiradas por Ferramenta',
                'Valor': quantidade,
                'Porcentagem': totalRetiradas > 0 ? ((quantidade / totalRetiradas) * 100).toFixed(1) + '%' : '0%',
                'Descrição': ferramenta
            });
        });

        // Dados para gráfico de pizza: Retiradas por solicitante
        const retiradasPorSolicitante = {};
        movimentacoes.forEach(mov => {
            if (mov.solicitante) {
                retiradasPorSolicitante[mov.solicitante] = (retiradasPorSolicitante[mov.solicitante] || 0) + 1;
            }
        });

        Object.entries(retiradasPorSolicitante).forEach(([solicitante, quantidade]) => {
            analiseData.push({
                'Tipo': 'Gráfico de Pizza',
                'Categoria': 'Retiradas por Solicitante',
                'Valor': quantidade,
                'Porcentagem': totalRetiradas > 0 ? ((quantidade / totalRetiradas) * 100).toFixed(1) + '%' : '0%',
                'Descrição': solicitante
            });
        });

        // Dados para gráfico de pizza: Status das ferramentas
        analiseData.push({
            'Tipo': 'Gráfico de Pizza',
            'Categoria': 'Status das Ferramentas',
            'Valor': totalFerramentas - totalEmUso - totalQuebradas,
            'Porcentagem': totalFerramentas > 0 ? (((totalFerramentas - totalEmUso - totalQuebradas) / totalFerramentas) * 100).toFixed(1) + '%' : '0%',
            'Descrição': 'Disponíveis'
        });

        analiseData.push({
            'Tipo': 'Gráfico de Pizza',
            'Categoria': 'Status das Ferramentas',
            'Valor': totalEmUso,
            'Porcentagem': totalFerramentas > 0 ? ((totalEmUso / totalFerramentas) * 100).toFixed(1) + '%' : '0%',
            'Descrição': 'Em Uso'
        });

        analiseData.push({
            'Tipo': 'Gráfico de Pizza',
            'Categoria': 'Status das Ferramentas',
            'Valor': totalQuebradas,
            'Porcentagem': totalFerramentas > 0 ? ((totalQuebradas / totalFerramentas) * 100).toFixed(1) + '%' : '0%',
            'Descrição': 'Quebradas'
        });

        // Dados para gráfico de barras: Retiradas por mês
        const retiradasPorMes = {};
        movimentacoes.forEach(mov => {
            if (mov.dataRetirada) {
                const data = new Date(mov.dataRetirada);
                const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
                retiradasPorMes[mesAno] = (retiradasPorMes[mesAno] || 0) + 1;
            }
        });

        Object.entries(retiradasPorMes).forEach(([mesAno, quantidade]) => {
            analiseData.push({
                'Tipo': 'Gráfico de Barras',
                'Categoria': 'Retiradas por Mês',
                'Valor': quantidade,
                'Porcentagem': '',
                'Descrição': mesAno
            });
        });

        const wsAnalise = XLSX.utils.json_to_sheet(analiseData);
        XLSX.utils.book_append_sheet(wb, wsAnalise, 'Análise Gráfica');

        // Baixar o arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        XLSX.writeFile(wb, `controle_ferramentas_${timestamp}.xlsx`);

    } catch (error) {
        console.error('Erro ao gerar Excel completo:', error);
        alert('Erro ao gerar o arquivo Excel. Verifique o console para mais detalhes.');
    }
};

// ===================================================================================
// === LÓGICA PARA A PÁGINA DO FORMULÁRIO (index.html) ===============================
// ===================================================================================
async function inicializarPaginaFormulario() {
    console.log("Modo Formulário Ativado.");

    // --- ELEMENTOS DO FORMULÁRIO ---
    const form = document.getElementById('ferramentaForm');
    const mensagemEl = document.getElementById('mensagem');
    const projetoSelect = document.getElementById('projeto');
    const ferramentaSelect = document.getElementById('ferramenta');
    const patrimonioSelect = document.getElementById('patrimonio');
    const solicitanteSelect = document.getElementById('solicitante');

    // Controles de devolução
    const btnDevolucaoHoras = document.getElementById('btnDevolucaoHoras');
    const btnDevolucaoDias = document.getElementById('btnDevolucaoDias');
    const devolucaoHorasContainer = document.getElementById('devolucaoHorasContainer');
    const devolucaoDiasContainer = document.getElementById('devolucaoDiasContainer');
    const dataDevolucaoInput = document.getElementById('dataDevolucao');
    const horaDevolucaoInput = document.getElementById('horaDevolucao');



    // --- ESTADO DA APLICAÇÃO ---
    const state = {
        ferramentas: [],
        projetos: [],
        solicitantes: []
    };

    // --- FUNÇÕES DE DADOS E UI ---
    async function carregarDados() {
        state.ferramentas = await window.dbManager.ferramentas.obterTodas();
        state.projetos = await window.dbManager.projetos.obterTodos();
        state.solicitantes = await window.dbManager.solicitantes.obterTodos();
        if (state.solicitantes.length === 0) {
            // Add default solicitantes from user list to DB
            const defaultSolicitantes = [

                { nome: "JOSÉ ADRIANO DE SIQUEIRA ARAÚJO" },
                { nome: "MANUEL PEREIRA ALENCAR JUNIOR" },
                { nome: "NEUSVALDO NOVAIS RODRIGUES" },
                { nome: "RONALDO GONÇALVES DA SILVA" },
                { nome: "TIAGO FELIPE DOS SANTOS COELHO" },
                { nome: "TERCEIRO" },
                { nome: "DENILSON DE SOUZA SANTOS" },
                { nome: "FELIPE DE LIMA PEREIRA" },
                { nome: "JOSÉ CARLOS FIGUEIRA DA SILVA" },
                { nome: "JOSÉ GENILSON MARTINS SOARES" },
                { nome: "NETANIS DOS SANTOS" },
                { nome: "THIAGO PACHECO ALMEIDA" },
                { nome: "ROBERTO CARLOS DA SILVA" },
                { nome: "WESLEY ALEKSANDER ALCANTI DA SILVA" },
                { nome: "VALDEMIRO GOMES JUNIOR" }
            ];
            for (const solicitante of defaultSolicitantes) {
                await window.dbManager.solicitantes.adicionar(solicitante);
            }
            state.solicitantes = await window.dbManager.solicitantes.obterTodos();
        }
        popularSelects();
    }

    function popularSelects() {
        projetoSelect.innerHTML = '<option value="" disabled selected>Selecione um projeto</option>';
        const projetosUnicos = [...new Set(state.projetos.map(p => p.nome))];
        projetosUnicos.forEach(nome => {
            projetoSelect.add(new Option(nome, nome));
        });

        ferramentaSelect.innerHTML = '<option value="" disabled selected>Selecione uma ferramenta</option>';
        const ferramentasAgrupadas = {};
        state.ferramentas.forEach(f => {
            if (f.patrimonios && f.patrimonios.length > 0) {
                if (!ferramentasAgrupadas[f.nome]) {
                    ferramentasAgrupadas[f.nome] = { total: 0, ids: [] };
                }
                ferramentasAgrupadas[f.nome].total += f.patrimonios.length;
                ferramentasAgrupadas[f.nome].ids.push(f.id);
            }
        });
        Object.keys(ferramentasAgrupadas).forEach(nome => {
            const total = ferramentasAgrupadas[nome].total;
            ferramentaSelect.add(new Option(`${nome} (${total} disponíveis)`, nome));
        });

        atualizarPatrimonios();

        solicitanteSelect.innerHTML = '<option value="" disabled selected>Selecione um solicitante</option>';
        state.solicitantes.forEach(s => {
            solicitanteSelect.add(new Option(s.nome, s.nome));
        });
    }

    function atualizarPatrimonios() {
        const nomeFerramenta = ferramentaSelect.value;
        patrimonioSelect.innerHTML = '<option value="">Qualquer unidade disponível</option>';
        const ferramentasComNome = state.ferramentas.filter(f => f.nome === nomeFerramenta);
        ferramentasComNome.forEach(ferramenta => {
            if (ferramenta.patrimonios) {
                ferramenta.patrimonios.forEach(p => {
                    patrimonioSelect.add(new Option(p, p));
                });
            }
        });
    }

    // --- EVENT LISTENERS ---
    ferramentaSelect.addEventListener('change', () => {
        atualizarPatrimonios();
        // Atualizar dashboard visualmente ao selecionar ferramenta
        const ferramentaNome = ferramentaSelect.value;
        if (!ferramentaNome) return;

        // Atualizar contagem no dashboard
        const estoqueCountEl = document.getElementById('estoqueCount');
        const usoCountEl = document.getElementById('usoCount');

        if (estoqueCountEl && usoCountEl) {
            let estoqueCount = parseInt(estoqueCountEl.textContent) || 0;
            let usoCount = parseInt(usoCountEl.textContent) || 0;

            // Diminuir estoque e aumentar uso se possível
            if (estoqueCount > 0) {
                estoqueCount -= 1;
                usoCount += 1;
                estoqueCountEl.textContent = estoqueCount;
                usoCountEl.textContent = usoCount;
            }
        }
    });

    btnDevolucaoHoras.addEventListener('click', () => {
        devolucaoHorasContainer.style.display = 'block';
        devolucaoDiasContainer.style.display = 'none';
        dataDevolucaoInput.value = '';
        btnDevolucaoHoras.classList.add('active');
        btnDevolucaoDias.classList.remove('active');
    });

    btnDevolucaoDias.addEventListener('click', () => {
        devolucaoHorasContainer.style.display = 'none';
        devolucaoDiasContainer.style.display = 'block';
        horaDevolucaoInput.value = '';
        btnDevolucaoDias.classList.add('active');
        btnDevolucaoHoras.classList.remove('active');
    });

    document.getElementById('submitBtn').addEventListener('click', async () => {
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.solicitante || !data.ferramenta || !data.projeto || !data.dataRetirada || !data.horaRetirada) {
            mensagemEl.textContent = 'Preencha todos os campos obrigatórios.';
            mensagemEl.className = 'mt-4 p-4 rounded-lg text-center font-semibold error-message';
            return;
        }

        // Validate return fields based on toggle
        if (btnDevolucaoHoras.classList.contains('active') && !data.horaDevolucao) {
            mensagemEl.textContent = 'Preencha a hora de devolução.';
            mensagemEl.className = 'mt-4 p-4 rounded-lg text-center font-semibold error-message';
            return;
        }
        if (btnDevolucaoDias.classList.contains('active') && !data.dataDevolucao) {
            mensagemEl.textContent = 'Preencha a data de devolução.';
            mensagemEl.className = 'mt-4 p-4 rounded-lg text-center font-semibold error-message';
            return;
        }

        // Prepare dataRetirada and dataDevolucao
        data.dataRetirada = data.dataRetirada + ' ' + data.horaRetirada;
        if (btnDevolucaoHoras.classList.contains('active')) {
            data.dataDevolucao = data.dataRetirada.split(' ')[0] + ' ' + data.horaDevolucao;
        }
        // For days, data.dataDevolucao is already the date

        // Disable button and set to "Enviando..."
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

        // Save locally first
        const movimentacao = { ...data, tipo: 'retirada', dataRegistro: new Date().toISOString() };
        await window.dbManager.movimentacoes.adicionar(movimentacao);

        if(data.patrimonio) {
            const ferramentasComNome = state.ferramentas.filter(f => f.nome === data.ferramenta);
            for (const ferramenta of ferramentasComNome) {
                const index = ferramenta.patrimonios.indexOf(data.patrimonio);
                if (index > -1) {
                    ferramenta.patrimonios.splice(index, 1);
                    await window.dbManager.ferramentas.atualizar(ferramenta.id, ferramenta);
                    break; // Remove from the first one found
                }
            }
        }

        // Try to send to Google Sheets using doPost
        let enviadoParaPlanilha = false;
        try {
            const result = await doPost({
                tipo: 'retirada',
                solicitante: data.solicitante,
                ferramenta: data.ferramenta,
                projeto: data.projeto,
                patrimonio: data.patrimonio || '',
                dataRetirada: data.dataRetirada,
                horaRetirada: data.horaRetirada,
                dataDevolucao: data.dataDevolucao || '',
                horaDevolucao: data.horaDevolucao || ''
            });
            console.log('Dados enviados para Google Sheets:', result);
            enviadoParaPlanilha = true;
        } catch (error) {
            console.error("Erro ao enviar para Google Sheets (continuando localmente):", error);
            // Continue, since local save worked
        }

        // Update dashboard with new data
        await atualizarDashboard();

        // Change to "Enviado"
        submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Enviado';

        if (enviadoParaPlanilha) {
            mensagemEl.textContent = 'Solicitação enviada com sucesso para a planilha!';
            mensagemEl.className = 'mt-4 p-4 rounded-lg text-center font-semibold success-message';
        } else {
            mensagemEl.textContent = 'Solicitação salva localmente. Verifique a conexão com a planilha.';
            mensagemEl.className = 'mt-4 p-4 rounded-lg text-center font-semibold warning-message';
        }

        // After 2 seconds, reset form and button
        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Solicitação';
            mensagemEl.textContent = '';
        }, 2000);

        await carregarDados();
    });

    async function atualizarDashboard() {
        try {
            const ferramentas = await window.dbManager.ferramentas.obterTodas();
            const movimentacoes = await window.dbManager.movimentacoes.obterTodas();

            // Ferramentas no estoque: soma dos patrimônios disponíveis
            const estoqueCount = ferramentas.reduce((acc, f) => acc + (f.patrimonios ? f.patrimonios.length : 0), 0);

            // Ferramentas em uso: movimentações ativas (sem data de retorno ou com temRetorno 'sim' e sem retorno registrado)
            const usoCount = movimentacoes.filter(mov => {
                if (mov.tipo !== 'quebrada') {
                    if (mov.temRetorno === 'sim') {
                        return !mov.dataRetorno || mov.dataRetorno === '';
                    }
                    return true; // sem retorno esperado, considera em uso
                }
                return false;
            }).length;

            // Ferramentas quebradas: movimentações do tipo 'quebrada'
            const quebradasCount = movimentacoes.filter(mov => mov.tipo === 'quebrada').length;

            document.getElementById('estoqueCount').textContent = estoqueCount;
            document.getElementById('usoCount').textContent = usoCount;
            document.getElementById('quebradasCount').textContent = quebradasCount;
        } catch (error) {
            console.error('Erro ao atualizar dashboard:', error);
        }
    }

    // --- INICIALIZAÇÃO ---
    try {
        console.log('Iniciando aplicação...');
        const dbInitResult = await window.dbManager.init();
        if (!dbInitResult) {
            console.warn('Banco de dados inicializado com avisos, mas continuando...');
        }
        await carregarDados();
        await atualizarDashboard();
        console.log('Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('Falha ao iniciar ou carregar dados:', error);
        mensagemEl.textContent = 'Erro ao carregar dados. Verifique o console e tente recarregar a página.';
        mensagemEl.className = 'mt-4 p-4 rounded-lg text-center font-semibold error-message';
        // Não travar a aplicação, permitir uso limitado
    }
}


// ===================================================================================
// === LÓGICA PARA A PÁGINA DO PAINEL (painel.html) ==================================
// ===================================================================================
async function inicializarPaginaPainel() {
    console.log("Modo Painel Ativado.");

    // --- ELEMENTOS DO PAINEL ---
    const estoqueDiv = document.getElementById('estoqueDiv');
    const listaProjetos = document.getElementById('listaProjetos');
    const mensagemLogin = document.getElementById('mensagemLogin');
    const loginContainer = document.getElementById('login');
    const painelContainer = document.getElementById('painel');
    const formAddFerramenta = document.getElementById('formAddFerramenta');
    const formAddProjeto = document.getElementById('formAddProjeto');
    const devolucaoForm = document.getElementById('devolucaoForm');
    const ferramentaDevolucaoSelect = document.getElementById('ferramentaDevolucaoSelect');
    const patrimonioDevolucaoSelect = document.getElementById('patrimonioDevolucaoSelect');
    const feedbackDevolucao = document.getElementById('feedbackDevolucao');

    // --- ESTADO DA APLICAÇÃO ---
    const state = {
        ferramentas: [],
        projetos: [],
        solicitantes: [],
        movimentacoes: []
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderFerramentas() {
        estoqueDiv.innerHTML = '';
        if (state.ferramentas.length === 0) {
            estoqueDiv.innerHTML = '<p class="text-white/70 text-center col-span-full">Nenhuma ferramenta cadastrada.</p>';
            return;
        }
        state.ferramentas.forEach(item => {
            const card = document.createElement('div');
            card.className = 'tool-card rounded-xl p-4 card-hover';
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-semibold gradient-text">${item.nome}</h3>
                    <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Qtd: ${item.patrimonios.length}</span>
                </div>
                <div class="mt-3 text-sm text-gray-600">
                    <p class="mb-2"><i class="fas fa-hashtag mr-1"></i>Patrimônios:</p>
                    <div class="flex flex-wrap gap-1">${item.patrimonios.map(p => `<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">${p}</span>`).join('')}</div>
                </div>
                <button class="mt-4 btn-danger text-white text-sm px-3 py-1 rounded-lg" data-id-ferramenta="${item.id}" data-nome-ferramenta="${item.nome}">
                    <i class="fas fa-trash-alt mr-1"></i>Excluir
                </button>
            `;
            estoqueDiv.appendChild(card);
        });
    }

    function renderProjetos() {
        listaProjetos.innerHTML = '';
        if (state.projetos.length === 0) {
            listaProjetos.innerHTML = '<p class="text-white/70 text-center">Nenhum projeto cadastrado.</p>';
            return;
        }
        state.projetos.forEach(proj => {
            const li = document.createElement('li');
            li.className = 'glass-effect rounded-lg p-3 flex justify-between items-center';
            li.innerHTML = `
                <span class="text-white"><i class="fas fa-folder mr-2"></i>${proj.nome}</span>
                <button class="btn-danger text-white text-sm px-3 py-1 rounded-lg" data-id-projeto="${proj.id}" data-nome-projeto="${proj.nome}">
                    <i class="fas fa-trash-alt mr-1"></i>Excluir
                </button>
            `;
            listaProjetos.appendChild(li);
        });
    }

    // --- FUNÇÕES DE DADOS ---
    async function carregarDados() {
        state.ferramentas = await window.dbManager.ferramentas.obterTodas();
        state.projetos = await window.dbManager.projetos.obterTodos();
        renderFerramentas();
        renderProjetos();
    }

    // --- MODAIS (precisam ser globais por causa do onclick no HTML) ---
    window.abrirModal = (id) => document.getElementById(id).classList.remove('hidden');
    window.fecharModais = () => {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.add('hidden'));
        formAddFerramenta.reset();
        formAddProjeto.reset();
    };

    // --- EVENT LISTENERS ---
    document.getElementById('btnLogin').addEventListener('click', async () => {
        const user = document.getElementById('usuario').value.trim();
        const pass = document.getElementById('senha').value.trim();
        if (user === "admin" && pass === "1234") {
            loginContainer.classList.add('hidden');
            painelContainer.classList.remove('hidden');
            await carregarDados();
        } else {
            mensagemLogin.textContent = "Usuário ou senha inválidos!";
        }
    });

    formAddFerramenta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nomeFerramenta').value.trim();
        const qtd = parseInt(document.getElementById('quantidadeFerramenta').value);
        const patrimonios = document.getElementById('patrimoniosFerramenta').value.trim().split("\n").filter(p => p);

        if (!nome || !qtd || patrimonios.length !== qtd) {
            alert("Verifique os dados. A quantidade deve ser igual ao número de patrimônios.");
            return;
        }

        // Verificar duplicatas
        const ferramentasExistentes = await window.dbManager.ferramentas.obterTodas();
        const ferramentaDuplicada = ferramentasExistentes.find(f => f.nome.toLowerCase() === nome.toLowerCase());
        if (ferramentaDuplicada) {
            alert("Já existe uma ferramenta com este nome. Adicione patrimônios à ferramenta existente ou use um nome diferente.");
            return;
        }

        await window.dbManager.ferramentas.adicionar({ nome, patrimonios });
        await carregarDados();
        window.fecharModais();
    });

    formAddProjeto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nomeProjeto').value.trim();
        if (!nome) return;

        // Verificar duplicatas
        const projetosExistentes = await window.dbManager.projetos.obterTodos();
        const projetoDuplicado = projetosExistentes.find(p => p.nome.toLowerCase() === nome.toLowerCase());
        if (projetoDuplicado) {
            alert("Já existe um projeto com este nome. Use um nome diferente.");
            return;
        }

        await window.dbManager.projetos.adicionar({ nome });
        await carregarDados();
        window.fecharModais();
    });

    document.body.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const idFerramenta = button.dataset.idFerramenta;
        if (idFerramenta) {
            if (confirm(`Tem certeza que deseja excluir a ferramenta "${button.dataset.nomeFerramenta}"?`)) {
                await window.dbManager.ferramentas.remover(idFerramenta);
                await carregarDados();
            }
        }

        const idProjeto = button.dataset.idProjeto;
        if (idProjeto) {
             if (confirm(`Tem certeza que deseja excluir o projeto "${button.dataset.nomeProjeto}"?`)) {
                await window.dbManager.projetos.remover(idProjeto);
                await carregarDados();
            }
        }
    });

    // --- INICIALIZAÇÃO DO PAINEL ---
    try {
        await window.dbManager.init();
        if (document.getElementById('estoqueCount')) {
            atualizarDashboard();
        }
    } catch (error) {
        console.error('Falha fatal ao iniciar o DB:', error);
        alert('Não foi possível carregar o banco de dados. A aplicação não pode continuar.');
    }

    async function atualizarDashboard() {
        try {
            const ferramentas = await window.dbManager.ferramentas.obterTodas();
            const movimentacoes = await window.dbManager.movimentacoes.obterTodas();

            // Ferramentas no estoque: soma dos patrimônios disponíveis
            const estoqueCount = ferramentas.reduce((acc, f) => acc + (f.patrimonios ? f.patrimonios.length : 0), 0);

            // Ferramentas em uso: movimentações ativas (sem data de retorno ou com temRetorno 'sim' e sem retorno registrado)
            const usoCount = movimentacoes.filter(mov => {
                if (mov.tipo !== 'quebrada') {
                    if (mov.temRetorno === 'sim') {
                        return !mov.dataRetorno || mov.dataRetorno === '';
                    }
                    return true; // sem retorno esperado, considera em uso
                }
                return false;
            }).length;

            // Ferramentas quebradas: movimentações do tipo 'quebrada'
            const quebradasCount = movimentacoes.filter(mov => mov.tipo === 'quebrada').length;

            document.getElementById('estoqueCount').textContent = estoqueCount;
            document.getElementById('usoCount').textContent = usoCount;
            document.getElementById('quebradasCount').textContent = quebradasCount;
        } catch (error) {
            console.error('Erro ao atualizar dashboard:', error);
        }
    }

    // Funções de download
    function baixarRetiradas() {
      const table = document.querySelector('#tabelaRetiradas table');
      if (!table) return;
      const wb = XLSX.utils.table_to_book(table);
      XLSX.writeFile(wb, 'retiradas.xlsx');
    }

    function baixarDevolucoes() {
      const table = document.querySelector('#tabelaDevolucoes table');
      if (!table) return;
      const wb = XLSX.utils.table_to_book(table);
      XLSX.writeFile(wb, 'devolucoes.xlsx');
    }

    function baixarQuebradas() {
      const table = document.querySelector('#tabelaQuebradas table');
      if (!table) return;
      const wb = XLSX.utils.table_to_book(table);
      XLSX.writeFile(wb, 'ferramentas_quebradas.xlsx');
    }
}
