# LinguaLink - Dicionário Pessoal

Um sistema moderno de biblioteca de palavras construído com React e NodeJS.

## Funcionalidades
- **CRUD de Palavras**: Adicione, edite e exclua palavras com tradução e exemplos de uso.
- **Relacionamentos**: Conecte palavras (ex: presente/passado/futuro ou sinônimos). Ao visualizar uma palavra, você verá as conexões.
- **Busca Inteligente**: Filtre instantaneamente por palavra ou tradução.
- **Sessão de Estudo**: Flashcards animados para praticar seu vocabulário.
- **Banco de Dados Local**: Seus dados são salvos em um arquivo `data.json`, facilitando o versionamento no Git.

## Como Executar

### Pré-requisitos
- Node.js instalado.

### Passo 1: Iniciar o Servidor (Backend)
```bash
cd server
npm install
npm start
```
O servidor rodará em `http://localhost:5000`.

### Passo 2: Iniciar o Frontend (React)
```bash
cd client
npm install
npm run dev
```
O frontend rodará em `http://localhost:3000`.

## Estrutura do Projeto
- `server/`: API em Node/Express com banco de dados em arquivo JSON.
- `client/`: Aplicação React com Vite, Tailwind-like CSS, Lucide Icons e Framer Motion.
