# TODO - Correções Críticas Identificadas

## 1. Erros de Sintaxe e Lógica
- [x] Corrigir erro de formatação de string em `gerar_excel.py` linha 147
- [x] Corrigir nome incorreto de solicitante em `config.js`
- [x] Corrigir chamada incorreta de função `atualizarFerramenta` em `script.js` (já está correto)

## 2. Inconsistências no Banco de Dados
- [ ] Padronizar funções de remoção (por nome vs por ID) em `database.js`
- [ ] Corrigir dados mock em `gerar_excel.py` para refletir estrutura real
- [ ] Unificar estrutura de dados entre IndexedDB e Google Sheets

## 3. Código Duplicado e Conflitante
- [ ] Remover JavaScript inline duplicado de `painel.html`
- [ ] Unificar lógica entre `script.js` e código inline
- [ ] Remover funções globais duplicadas

## 4. Funcionalidades Incompletas
- [ ] Corrigir abertura do modal de planilhas
- [ ] Implementar atualização automática do dashboard após ações
- [ ] Corrigir filtros de planilhas
- [ ] Implementar download individual de planilhas

## 5. Integração e Dependências
- [ ] Corrigir payload de teste em `teste_webapp.py`
- [ ] Atualizar `requirements.txt` se necessário
- [ ] Padronizar estrutura de dados entre frontend e backend

## 6. Organização e Limpeza
- [ ] Mover estilos não utilizados de `style.css`
- [ ] Melhorar estrutura de arquivos
- [ ] Adicionar comentários e documentação

## 7. Testes e Validação
- [ ] Testar todas as correções implementadas
- [ ] Verificar funcionamento completo do sistema
- [ ] Validar integração com Google Apps Script
