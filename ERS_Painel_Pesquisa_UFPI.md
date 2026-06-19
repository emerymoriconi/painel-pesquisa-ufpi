# Especificação de Requisitos de Software (ERS)
## Painel de Pesquisa, Desenvolvimento e Inovação — UFPI

> **Versão:** 1.0 | **Stack:** FastAPI · PostgreSQL · React · Docker | **Tipo:** Sistema Web de Dashboard Analítico

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Requisitos Funcionais](#2-requisitos-funcionais)
3. [Funcionalidades Sugeridas](#3-funcionalidades-sugeridas)
4. [Requisitos Não Funcionais](#4-requisitos-não-funcionais)
5. [Arquitetura e Stack Tecnológica](#5-arquitetura-e-stack-tecnológica)
6. [Estratégia de Testes](#6-estratégia-de-testes)

---

## 1. Visão Geral do Sistema

O Painel de Pesquisa, Desenvolvimento e Inovação da UFPI é uma aplicação web que converte um painel Power BI institucional em um sistema acessível via navegador, sem dependência de licenças proprietárias. O sistema centraliza indicadores de pesquisa e inovação da universidade, permitindo consultas interativas, filtros dinâmicos e visualizações gráficas por módulo temático.

### 1.1 Módulos do Sistema

| # | Módulo | Descrição |
|---|--------|-----------|
| 1 | Home / Geral | 9 cards com KPIs gerais da instituição e data de atualização |
| 2 | Projetos PD&I | Projetos cadastrados com filtros por ano, centro, área e situação |
| 3 | Projetos FINEP | Projetos financiados com valor total agregado e análise por centro |
| 4 | Produção Intelectual | Patentes, softwares, marcas e desenhos com vitrine detalhada |
| 5 | Bolsistas de Produtividade | Bolsistas CNPq e UFPI com distribuição por campus |
| 6 | Núcleos de Pesquisa | Núcleos ativos e inativos com análise por centro/campi |
| 7 | Grupos de Pesquisa | Grupos DGP/CNPq com distribuição por área predominante |
| 8 | Empresas Incubadas | Empresas em incubação, graduadas e incubadoras |
| 9 | Pós-Graduação | Programas com conceito CAPES, nível e centro |
| 10 | Laboratórios (PNIPE/MCTI) | Laboratórios com responsável, sigla e localização |

---

## 2. Requisitos Funcionais

### RF01 — Autenticação e Controle de Acesso

| ID | Descrição |
|----|-----------|
| RF01.1 | O sistema deve exibir uma tela de login com campos de usuário e senha antes de qualquer acesso ao conteúdo. |
| RF01.2 | O backend deve validar as credenciais e emitir um token JWT com prazo de expiração configurável. |
| RF01.3 | O frontend deve armazenar o token em memória (não em localStorage) e enviá-lo no header `Authorization` de cada requisição. |
| RF01.4 | Rotas protegidas da API devem retornar HTTP 401 quando acessadas sem token válido. |
| RF01.5 | O sistema deve exibir botão de logout que invalida a sessão no frontend. |
| RF01.6 | Após expiração do token, o sistema deve redirecionar o usuário para a tela de login automaticamente. |

---

### RF02 — Dashboard Home

| ID | Descrição |
|----|-----------|
| RF02.1 | O sistema deve exibir 9 cards de KPIs na página Home: Projetos PD&I, Projetos FINEP (valor em Mi), Produção Intelectual, Bolsistas, Núcleos, Grupos, Empresas Incubadas, Pós-Graduação e Laboratórios. |
| RF02.2 | O card de Projetos FINEP deve exibir o valor total em milhões, não a contagem de registros. |
| RF02.3 | O sistema deve exibir a data de última atualização dos dados no rodapé da página Home. |
| RF02.4 | Cada card deve ser clicável e redirecionar para o módulo correspondente. |

---

### RF03 — Filtros e Navegação

| ID | Descrição |
|----|-----------|
| RF03.1 | Cada módulo deve disponibilizar filtros (selects) que atualizam gráficos e tabelas simultaneamente sem recarregar a página. |
| RF03.2 | Os selects de filtro devem ser populados dinamicamente com valores únicos do banco de dados via endpoint `/filtros`. |
| RF03.3 | Deve haver botão "Limpar Filtros" que restaura todos os filtros ao estado padrão ("Todos"). |
| RF03.4 | A sidebar de navegação deve destacar visualmente o módulo ativo. |
| RF03.5 | **Projetos PD&I:** filtros por Ano de Início, Ano de Término, Centro/Campi, Natureza, Área do Conhecimento, Situação. |
| RF03.6 | **Projetos FINEP:** filtros por Ano de Início, Ano de Término, Centro/Campi, Natureza, Situação. |
| RF03.7 | **Produção Intelectual:** filtros por Inventores (busca textual), Ano, Tipo. |
| RF03.8 | **Bolsistas:** filtros por Modalidade, Órgão, Centro/Campus, Nome. |
| RF03.9 | **Núcleos de Pesquisa:** filtros por Centro/Campi, Vinculação, Ano, Denominação (nome do núcleo). |
| RF03.10 | **Grupos de Pesquisa:** filtros por Nome do Grupo, Área de Conhecimento, Ano de Atualização. |
| RF03.11 | **Empresas Incubadas:** filtros por Incubadora, Situação. |
| RF03.12 | **Pós-Graduação:** filtros por Programa, Conceito CAPES, Centro/Campi, Nível, Tipo. |
| RF03.13 | **Laboratórios:** filtros por Nome do Laboratório, Centro/Campi. |

---

### RF04 — Visualizações Gráficas

| ID | Descrição |
|----|-----------|
| RF04.1 | **PD&I:** gráfico de barras verticais (projetos por área do conhecimento) e barras verticais (projetos por centro/campus). |
| RF04.2 | **FINEP:** gráfico donut (projetos internos vs externos) e barras verticais (valor de fomento por centro/campi em R$ Mi). |
| RF04.3 | **Produção Intelectual:** barras horizontais (patentes depositadas por ano) e pizza (softwares registrados por ano). |
| RF04.4 | **Bolsistas:** gráfico de pizza (bolsistas por campus/centro). |
| RF04.5 | **Núcleos:** gráfico de barras verticais (núcleos por centro/campi). |
| RF04.6 | **Grupos:** gráfico de barras horizontais (grupos por área predominante). |
| RF04.7 | **Incubadas:** gráfico donut (empresas por incubadora). |
| RF04.8 | **Pós-Graduação:** gráfico de barras verticais (programas por centro). |
| RF04.9 | **Laboratórios:** gráfico de pizza (laboratórios por centro/campi). |
| RF04.10 | Todos os gráficos devem responder aos filtros aplicados na página. |

---

### RF05 — Tabelas de Dados

| ID | Descrição |
|----|-----------|
| RF05.1 | Cada módulo deve exibir uma tabela de dados paginada com as colunas relevantes ao módulo. |
| RF05.2 | A paginação deve suportar navegação por página anterior/próxima com indicação da página atual. |
| RF05.3 | As tabelas devem refletir os filtros aplicados nos selects da página. |
| RF05.4 | **Produção Intelectual:** colunas Pedido, Título, Inventores, Descrição. |
| RF05.5 | **Projetos PD&I:** coluna com lista de títulos dos projetos. |
| RF05.6 | **Núcleos:** colunas Denominação, Centro/Campus, Coordenador, Ano da Resolução. |
| RF05.7 | **Grupos:** colunas Nome do Grupo, Nome do Líder, Área Predominante, Último Envio. |
| RF05.8 | **Incubadas:** colunas Nome do Projeto, Objetivo, Equipe do Projeto. |
| RF05.9 | **Pós-Graduação:** colunas Programa, Fone, Email, Centro, Nível. |
| RF05.10 | **Laboratórios:** colunas Nome, Sigla, Centro/Campi, Responsável, Email. |

---

### RF06 — Exportação de Dados

| ID | Descrição |
|----|-----------|
| RF06.1 | Cada módulo deve disponibilizar botão de exportação dos dados da tabela em formato CSV. |
| RF06.2 | O CSV exportado deve refletir os filtros ativos no momento da exportação. |
| RF06.3 | O nome do arquivo deve seguir o padrão: `modulo_dd-mm-aaaa.csv` (ex: `projetos_pdi_13-06-2026.csv`). |

---

### RF07 — Importação de Dados

| ID | Descrição |
|----|-----------|
| RF07.1 | O sistema deve possuir script de importação que leia arquivos `.xlsx` e popule o banco PostgreSQL. |
| RF07.2 | O script deve processar os 9 arquivos xlsx correspondentes aos módulos do sistema. |
| RF07.3 | O script deve ser idempotente: verificar registros existentes antes de inserir para evitar duplicatas. |
| RF07.4 | O script deve gerar log de erros por linha indicando arquivo, linha e descrição do erro. |
| RF07.5 | Colunas ausentes no xlsx devem ser tratadas como `NULL` sem interromper a importação. |

---

## 3. Funcionalidades Sugeridas

Funcionalidades adicionais de baixa a média complexidade que agregam valor acadêmico e profissional ao sistema.

| Funcionalidade | O que faz | Esforço |
|----------------|-----------|---------|
| **Modo claro/escuro (Dark Mode)** | Alterna o tema visual entre claro e escuro. Tailwind suporta nativamente com a classe `dark:`. | 🟢 Baixo |
| **Skeleton loading** | Placeholder animado nas tabelas e gráficos enquanto carregam. Melhor UX que spinner genérico. | 🟢 Baixo |
| **Exportar gráfico como PNG** | Botão que salva o gráfico atual como imagem. Recharts expõe o SVG nativamente para isso. | 🟢 Baixo |
| **Tooltip enriquecido nos gráficos** | Ao passar o mouse em barra/fatia, mostra valor absoluto e percentual do total. | 🟢 Baixo |
| **Filtros refletidos na URL** | Filtros aplicados aparecem na URL (`?ano=2023&status=ativo`). Permite compartilhar e salvar visões específicas. Implementado com `useSearchParams` do React Router. | 🟡 Médio |
| **Busca global** | Campo no header que pesquisa em todos os módulos e exibe resultados agrupados. | 🟡 Médio |
| **Página de status do sistema** | Rota `/status` que exibe versão da API, status do banco e data da última importação. | 🟢 Baixo |
| **Responsividade mobile** | Layout adaptado para telas menores com sidebar recolhível. Tailwind facilita com breakpoints `md:` e `lg:`. | 🟡 Médio |
| **Indicador de dados desatualizados** | Alerta visual quando a data de última atualização for superior a 30 dias. | 🟢 Baixo |
| **Animação nos cards da Home** | Contagem animada dos números ao carregar a página. Biblioteca `framer-motion` ou CSS puro. | 🟢 Baixo |

---

## 4. Requisitos Não Funcionais

### RNF — Desempenho

| ID | Descrição |
|----|-----------|
| RNF01 | Os endpoints da API devem responder em menos de 2 segundos para consultas sem filtros complexos com dados reais. |
| RNF02 | A página Home deve carregar todos os 9 KPIs em uma única requisição ao endpoint `/dashboard/kpis`. |

---

### RNF — Segurança

| ID | Descrição |
|----|-----------|
| RNF03 | Senhas de usuários devem ser armazenadas com hash `bcrypt` — nunca em texto puro. |
| RNF04 | Tokens JWT devem ter prazo de expiração de no máximo 8 horas. |
| RNF05 | A API deve ter CORS configurado para aceitar requisições apenas do domínio do frontend. |
| RNF06 | Variáveis sensíveis (senhas, chaves JWT) devem ser lidas de variáveis de ambiente — nunca hardcoded no código. |

---

### RNF — Disponibilidade

| ID | Descrição |
|----|-----------|
| RNF07 | O sistema deve funcionar integralmente a partir de um único comando: `docker compose up`. |
| RNF08 | Os dados do banco devem persistir entre reinicializações dos containers via volume Docker nomeado. |

---

### RNF — Manutenibilidade

| ID | Descrição |
|----|-----------|
| RNF09 | O schema do banco deve ser gerenciado por migrações Alembic versionadas e rastreáveis. |
| RNF10 | O código do backend deve ter cobertura mínima de 70% medida via `pytest-cov`. |
| RNF11 | Cada módulo do backend deve ter arquivo de teste dedicado em `tests/`. |
| RNF12 | O código do frontend deve ter testes de componentes com Vitest e React Testing Library. |
| RNF13 | O pipeline de CI (GitHub Actions) deve rodar testes de backend e frontend automaticamente a cada push. |

---

### RNF — Portabilidade

| ID | Descrição |
|----|-----------|
| RNF14 | O sistema deve ser executável em qualquer máquina com Docker instalado, independente do sistema operacional. |
| RNF15 | O projeto deve conter um `README.md` com instruções completas para executar o sistema do zero. |

---

### RNF — Usabilidade

| ID | Descrição |
|----|-----------|
| RNF16 | A interface deve ser utilizável em telas com largura mínima de 768px (tablets). |
| RNF17 | Todos os filtros devem fornecer feedback visual (loading state) enquanto os dados recarregam. |
| RNF18 | A navegação entre módulos deve ocorrer sem recarregamento completo da página (SPA). |

---

### RNF — Rastreabilidade

| ID | Descrição |
|----|-----------|
| RNF19 | A API deve gerar documentação interativa automática via Swagger UI no endpoint `/docs`. |
| RNF20 | O script de importação deve gerar log completo de registros inseridos e erros por arquivo. |

---

## 5. Arquitetura e Stack Tecnológica

### 5.1 Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND  React 18 + Vite + Recharts + Tailwind CSS        │
│  Servido pelo Nginx dentro do Docker (porta 3000)           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / JSON
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND   FastAPI + Pydantic + SQLAlchemy + Alembic        │
│  Uvicorn (ASGI) dentro do Docker (porta 8000)               │
│  Documentação automática em /docs (Swagger UI)              │
└────────────────────────┬────────────────────────────────────┘
                         │ SQLAlchemy ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BANCO     PostgreSQL 16                                    │
│  Volume persistente Docker (porta 5432 interna)             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Stack Completa

| Tecnologia | Versão | Camada | Função |
|------------|--------|--------|--------|
| Python | 3.13+ | Backend | Linguagem principal |
| FastAPI | 0.111+ | Backend | Framework web assíncrono |
| Pydantic v2 | 2.x | Backend | Validação de dados entrada/saída |
| SQLAlchemy | 2.x | Backend | ORM para acesso ao banco |
| Alembic | 1.x | Backend | Migrações de schema do banco |
| Pandas + openpyxl | 2.x | Script | Leitura e importação dos `.xlsx` |
| Pytest | 8.x | Testes | Testes do backend |
| HTTPX | 0.27+ | Testes | Cliente HTTP para testes da API |
| pytest-cov | 5.x | Testes | Relatório de cobertura |
| python-jose | 3.x | Backend | Geração e validação de tokens JWT |
| passlib[bcrypt] | 1.x | Backend | Hash seguro de senhas |
| PostgreSQL | 16 | Banco | Banco de dados relacional |
| React | 18+ | Frontend | Biblioteca de UI |
| Vite | 5.x | Frontend | Bundler e servidor de desenvolvimento |
| Recharts | 2.x | Frontend | Gráficos declarativos |
| Tailwind CSS | 3.x | Frontend | Estilização por classes utilitárias |
| Axios | 1.x | Frontend | Cliente HTTP para chamadas à API |
| React Router | 6.x | Frontend | Navegação SPA entre módulos |
| Vitest | 1.x | Testes | Testes unitários do frontend |
| React Testing Library | 14+ | Testes | Testes de componentes React |
| Docker | 25+ | Infra | Containerização dos serviços |
| Docker Compose | 2.x | Infra | Orquestração multi-container |
| Nginx | 1.25 | Infra | Servidor web para o frontend |

### 5.3 Padrão de Endpoints da API

| Método | Rota | Função |
|--------|------|--------|
| `POST` | `/auth/login` | Autenticação — retorna token JWT |
| `GET` | `/{modulo}` | Listagem paginada com filtros via query params |
| `GET` | `/{modulo}/{id}` | Detalhe de registro específico (404 se não encontrar) |
| `GET` | `/{modulo}/kpis` | Totais e agregações para os cards do topo |
| `GET` | `/{modulo}/por-centro` | Agrupamento por centro/campi para gráficos |
| `GET` | `/{modulo}/filtros` | Valores únicos para popular os selects |
| `GET` | `/dashboard/kpis` | KPIs gerais da Home (todos os módulos em uma chamada) |
| `GET` | `/health` | Status da API |

---

## 6. Estratégia de Testes

| Tipo | Tecnologia | O que cobre |
|------|------------|-------------|
| Unitários (Backend) | Pytest | Schemas Pydantic, models SQLAlchemy, funções utilitárias dos importers |
| Integração (Backend) | Pytest + HTTPX + SQLite in-memory | Todos os endpoints REST: status codes, filtros, paginação, 404, autenticação |
| Componente (Frontend) | Vitest + Testing Library | `CardMetrica`, `Sidebar`, `TabelaPaginada`, `FiltroSelect` |
| Integração (Frontend) | Vitest + axios-mock-adapter | Páginas completas: carregamento de dados, aplicação de filtros |
| CI Automatizado | GitHub Actions | Roda backend + frontend a cada push/PR |

**Meta:** cobertura mínima de **70%** das linhas de código da pasta `app/`, medida com `pytest-cov`.

### Exemplo de casos de teste por módulo (backend)

Para cada router, os testes devem cobrir:

- `GET /modulo` retorna `200` e uma lista
- `GET /modulo` com cada filtro disponível retorna `200`
- `GET /modulo/{id}` com ID inexistente retorna `404`
- `GET /modulo?limit=5` retorna no máximo 5 registros
- `GET /modulo/kpis` retorna todos os campos esperados
- `GET /modulo/filtros` retorna dicionário com listas não vazias (após importação)
- Endpoint protegido sem token retorna `401`
