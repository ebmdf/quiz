
# Guia de Instalação em Hospedagem com MySQL

Este guia pressupõe que você tenha uma hospedagem que suporte **Node.js** (como cPanel com Setup Node.js App, VPS, Heroku, etc).

## Passo 1: Banco de Dados MySQL

1. Acesse o painel da sua hospedagem (cPanel, etc).
2. Vá em **Bancos de Dados MySQL** e crie um novo banco (ex: `meusite_quiz`).
3. Crie um **Usuário MySQL** e uma senha forte.
4. Adicione o usuário ao banco de dados e dê **Todos os Privilégios**.
5. Abra o **phpMyAdmin**, selecione o banco criado e vá na aba **Importar**.
6. Selecione o arquivo `database.sql` deste projeto e execute.

## Passo 2: Configurar o Backend (Node.js)

1. Envie os arquivos `server.js` e `package.json` (do backend) para uma pasta na hospedagem (ex: `/home/usuario/quiz-backend`).
2. Crie um arquivo `.env` na mesma pasta com os dados do banco:

```env
DB_HOST=localhost
DB_USER=usuario_do_banco
DB_PASSWORD=senha_do_banco
DB_NAME=nome_do_banco
PORT=3001
```

3. Instale as dependências:
   - Se tiver acesso SSH: rode `npm install` na pasta.
   - Se for cPanel: Use a ferramenta "Setup Node.js App", aponte para o arquivo `server.js`, e clique em "Run NPM Install".
4. Inicie a aplicação. Anote a URL onde a API está rodando (ex: `https://api.seusite.com` ou `https://seusite.com/api` se configurou proxy).

## Passo 3: Configurar o Frontend (React)

1. No seu computador, abra o arquivo `.env` (ou crie um) na raiz do projeto:

```env
VITE_API_URL=https://seusite.com/api
# Substitua pela URL real do seu backend
```

2. Gere a versão de produção:
   ```bash
   npm run build
   ```

3. Pegue o conteúdo da pasta `dist` gerada e envie para a pasta `public_html` da sua hospedagem.

## Passo 4: Configuração Final (.htaccess)

Se você estiver hospedando o Frontend e o Backend no mesmo domínio (ex: cPanel), você precisará configurar o `.htaccess` na `public_html` para que o Frontend funcione e, se possível, redirecionar `/api` para o Node.js.

Se não conseguir configurar o redirecionamento `/api` no mesmo domínio, hospede o backend em um subdomínio (ex: `api.seusite.com`) e use essa URL no passo 3.

**Conteúdo padrão do .htaccess para o React (Frontend):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```
