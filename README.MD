# ReserveTech — Frontend

Interface web para o sistema de reservas de equipamentos ReserveTech, construída em HTML, CSS e JavaScript puro (sem frameworks).

## Sobre o projeto

Frontend consumindo a [API ReserveTech](#) via `fetch`, com autenticação JWT. Duas experiências distintas, de acordo com o perfil do usuário autenticado:

- **Professor:** cria reservas com múltiplos dispositivos numa única operação, acompanha suas reservas com filtro por período.
- **TI:** painel administrativo completo — cadastro e gerenciamento de equipamentos, salas e usuários; aprovação/cancelamento de reservas pendentes; tela de relatórios com exportação em PDF e CSV.

## Funcionalidades de destaque

- Formulário de reserva com lista **dinâmica** de itens (adicionar/remover dispositivos sem recarregar a página)
- Seletor de horário em formato 24h (gerado via JavaScript, independente da configuração regional do sistema operacional)
- Edição inline nas telas de gerenciamento (sem modais ou páginas extras)
- Proteção de rota no cliente: páginas redirecionam para o login automaticamente se o token não existir, incluindo tratamento do botão "voltar" do navegador
- Relatórios com exportação em PDF e CSV

## Tecnologias

- HTML5 semântico
- CSS3 (Flexbox, Grid, responsivo)
- JavaScript (Fetch API, async/await, manipulação de DOM)
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) via CDN, para exportação de relatórios

## Estrutura

```
reservetech-frontend/
├── login.html
├── reservas.html              → dashboard do Professor
├── nova-reserva.html          → criação de reserva com itens dinâmicos
├── painel-ti.html             → dashboard do TI
├── relatorios.html            → relatórios com exportação
├── cadastro-*.html / gerenciar-*.html  → CRUD de equipamentos, salas e usuários
├── css/style.css
└── js/  (um arquivo por página, + logout.js compartilhado)
```

## Como rodar localmente

1. Clone o repositório
2. Abra a pasta no VS Code (ou editor de sua preferência)
3. Use a extensão **Live Server** para servir os arquivos (ou qualquer servidor estático simples)
4. Garanta que a [API backend](#) esteja rodando em `https://reservetech-backend.onrender.com`
5. Acesse `login.html`

## Projeto relacionado

Backend: [reservetech-backend](https://github.com/mibson-dev/reservetech-backend) — API Spring Boot que esta interface consome.
