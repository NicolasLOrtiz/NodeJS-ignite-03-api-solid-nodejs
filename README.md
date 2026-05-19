# API SOLID Node.js

API de uma aplicação no estilo GymPass desenvolvida em Node.js com TypeScript, Fastify e Prisma, seguindo os princípios SOLID para um código limpo, escalável e de fácil manutenção. A aplicação conta com documentação interativa integrada e suporte completo a testes automatizados (unitários e E2E).

## Principais Funcionalidades da Aplicação

- **Usuários (Users):** Podem se cadastrar, autenticar e visualizar seus perfis.
- **Academias (Gyms):** Podem ser cadastradas, buscadas por nome ou proximidade.
- **Check-ins:** Usuários podem realizar check-in em academias, com regras de negócio como validação de distância e limite de check-ins por dia.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza as ferramentas mais modernas e consolidadas do ecossistema Node.js:

- **[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript de alto desempenho no servidor.
- **[TypeScript](https://www.typescriptlang.org/) (v5.8):** Superset do JavaScript que adiciona tipagem estática e suporte a recursos modernos.
- **[Fastify](https://fastify.dev/) (v5.3):** Framework web focado em altíssima performance, velocidade e baixo overhead.
- **[Prisma ORM](https://www.prisma.io/) (v7.8):** ORM de última geração utilizado para mapeamento e comunicação com o banco de dados.
- **[Zod](https://zod.dev/) (v4.4):** Biblioteca de validação de esquemas e inferência de tipos em tempo de execução.
- **[Fastify Type Provider Zod](https://github.com/turkerdev/fastify-type-provider-zod):** Integração perfeita de validação do Zod no Fastify, garantindo tipagem estática ponta a ponta nas rotas.
- **[Scalar API Reference](https://scalar.com/) & [@fastify/swagger](https://github.com/fastify/fastify-swagger):** Geração automática de documentação interativa e bonita para a API em tempo real.
- **[Vitest](https://vitest.dev/) (v4.1):** Framework de testes extremamente rápido, integrado com Vite, para testes unitários e de integração/E2E.
- **[Docker](https://www.docker.com/):** Containerização do banco de dados PostgreSQL, permitindo rodar o banco de dados facilmente de forma isolada.
- **[ESLint](https://eslint.org/) & [@antfu/eslint-config](https://github.com/antfu/eslint-config):** Padronização e qualidade de código robusta com regras modernas do ESLint Flat Config.
- **[TSX](https://github.com/privateatr/tsx) & [TSUP](https://github.com/egoist/tsup):** Ferramentas ágeis para execução (em desenvolvimento) e empacotamento/build (em produção) de código TypeScript.
- **[Supertest](https://github.com/ladjs/supertest):** Biblioteca utilizada para realizar as requisições HTTP simuladas em nossos testes de ponta a ponta (E2E).
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js) & [@fastify/jwt](https://github.com/fastify/fastify-jwt):** Criptografia segura de senhas com algoritmo Bcrypt e autenticação de usuários via JSON Web Token (JWT) e cookies (Refresh Token).

---

## 🚀 Como Iniciar a Aplicação

Siga o passo a passo abaixo para configurar e rodar o projeto localmente:

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- **Node.js** (versão 20 ou superior recomendada)
- **Docker** e **Docker Compose**
- Um gerenciador de pacotes como **npm**

### 2. Configurando o Ambiente
Instale as dependências do projeto:
```bash
npm install
```

Crie o arquivo de variáveis de ambiente com base no arquivo de exemplo:
```bash
cp .env.example .env
```
*(Abra o arquivo `.env` gerado e configure o `JWT_SECRET` se desejar. Por padrão, a string de conexão do banco de dados `DATABASE_URL` já vem configurada para funcionar com o Docker)*

### 3. Subindo o Banco de Dados (Docker)
Inicie o container do PostgreSQL em segundo plano:
```bash
docker compose up -d
```

#### Comandos Úteis para Validação do Docker:
- **Verificar se o container está rodando e saudável:**
  ```bash
  docker ps
  ```
- **Visualizar os logs do container:**
  ```bash
  docker compose logs -f
  ```
- **Parar os containers do docker:**
  ```bash
  docker compose down
  ```

### 4. Executando as Migrations e Prisma Studio
Com o banco de dados rodando, execute as migrations do Prisma para criar as tabelas necessárias:
```bash
npx prisma migrate dev
```

#### Comandos Úteis para Validação do Banco de Dados:
- **Abrir a interface visual do banco (Prisma Studio):**
  ```bash
  npx prisma studio
  ```
  *(O Prisma Studio abrirá por padrão em http://localhost:51212, permitindo que você visualize, crie e edite registros no banco de dados de maneira totalmente visual)*

### 5. Rodando a Aplicação
Inicie o servidor de desenvolvimento:
```bash
npm run start:dev
```
A API estará rodando por padrão em `http://localhost:3333`.

### 6. Executando os Testes Automatizados
O projeto conta com uma robusta suíte de testes unitários e de integração (E2E):

- **Executar testes unitários:**
  ```bash
  npm run test
  ```
- **Executar testes unitários em modo de observação (watch):**
  ```bash
  npm run test:watch
  ```
- **Executar testes de ponta a ponta (E2E):**
  ```bash
  npm run test:e2e
  ```
- **Executar testes E2E em modo de observação (watch):**
  ```bash
  npm run test:e2e:watch
  ```
- **Verificar a cobertura de testes da aplicação:**
  ```bash
  npm run test:coverage
  ```
- **Abrir a interface gráfica interativa do Vitest:**
  ```bash
  npm run test:ui
  ```

### 7. Linting do Código
- **Verificar erros de padronização:**
  ```bash
  npm run lint
  ```
- **Corrigir automaticamente os erros de padronização:**
  ```bash
  npm run lint:fix
  ```

---

## 🗺️ Rotas da Aplicação

Esta aplicação possui uma documentação de API interativa e moderna integrada em tempo de execução via **Scalar**.
Para acessar a documentação interativa detalhada e poder testar os endpoints diretamente do navegador, inicie a aplicação (`npm run start:dev`) e abra o seguinte endereço:

👉 **[http://localhost:3333/docs](http://localhost:3333/docs)**

Abaixo está o resumo dos endpoints divididos por contextos:

### 👤 Usuários (Users & Sessions)

| Método | Rota | Descrição | Autenticação | Papel |
| :--- | :--- | :--- | :---: | :---: |
| **POST** | `/users` | Cadastro de um novo usuário | Livre | Qualquer |
| **POST** | `/sessions` | Autenticação (Login) - Retorna JWT Token e define Refresh Token nos Cookies | Livre | Qualquer |
| **PATCH** | `/token/refresh` | Renovação do JWT Token por meio do Refresh Token nos Cookies | Livre | Qualquer |
| **GET** | `/me` | Obtenção do perfil do usuário logado | JWT | Qualquer |

### 🏋️ Academias (Gyms)

| Método | Rota | Descrição | Autenticação | Papel |
| :--- | :--- | :--- | :---: | :---: |
| **POST** | `/gyms` | Cadastro de uma nova academia | JWT | **ADMIN** |
| **GET** | `/gyms/search` | Busca de academias filtrando pelo nome (`q`) com paginação (`page`) | JWT | Qualquer |
| **GET** | `/gyms/nearby` | Busca de academias próximas a até 10km (requer `latitude` e `longitude`) | JWT | Qualquer |

### 📝 Check-ins

| Método | Rota | Descrição | Autenticação | Papel |
| :--- | :--- | :--- | :---: | :---: |
| **POST** | `/gyms/:gymId/check-ins` | Realiza um check-in em uma academia específica (fornecendo `latitude` e `longitude`) | JWT | Qualquer |
| **PATCH** | `/check-ins/:checkInId/validate` | Validação manual de um check-in realizado (limite de 20 minutos) | JWT | **ADMIN** |
| **GET** | `/check-ins/history` | Histórico de check-ins realizados pelo usuário logado com paginação (`page`) | JWT | Qualquer |
| **GET** | `/check-ins/metrics` | Obtenção do número total de check-ins realizados pelo usuário | JWT | Qualquer |

---

## RFs (Requisitos funcionais)

- [x] Deve ser possível se cadastrar;
- [x] Deve ser possível se autenticar;
- [x] Deve ser possível obter o perfil de um usuário logado;
- [x] Deve ser possível obter o número de check-ins realizados pelo usuário logado;
- [x] Deve ser possível o usuário obter o seu histórico de check-ins;
- [x] Deve ser possível o usuário buscar academias próximas (até 10km);
- [x] Deve ser possível o usuário buscar academias pelo nome;
- [x] Deve ser possível o usuário realizar check-in em uma academia;
- [x] Deve ser possível validar o check-in de um usuário;
- [x] Deve ser possível cadastrar uma academia;

## RNs (Regras de negócio)

- [x] O usuário não deve poder se cadastrar com um e-mail duplicado;
- [x] O usuário não pode fazer 2 check-ins no mesmo dia;
- [x] O usuário não pode fazer check-in se não estiver perto (100m) da academia;
- [x] O check-in só pode ser validado até 20 minutos após ser criado;
- [x] O check-in só pode ser validado por administradores;
- [x] A academia só pode ser cadastrada por administradores;

## RNFs (Requisitos não-funcionais)

- [x] A senha do usuário precisa estar criptografada;
- [x] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [x] Todas listas de dados precisam estar paginadas com 20 itens por página;
- [x] O usuário deve ser identificado por um JWT (JSON Web Token);

<!--START_SECTION:footer-->

<br />
<br />

<p align="center">
  <a href="https://discord.gg/rocketseat" target="_blank">
    <img align="center" src="https://storage.googleapis.com/golden-wind/comunidade/rodape.svg" alt="banner"/>
  </a>
</p>

<!--END_SECTION:footer-->
