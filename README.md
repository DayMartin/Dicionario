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
- Docker e Docker Compose instalados.

### Usando Docker Compose (Recomendado)
```bash
docker compose up --build
```

- **Frontend**: `http://localhost:3148`
- **Backend**: `http://localhost:4830`

### Manualmente (Sem Docker)

1. **Backend**: 
   ```bash
   cd server && npm install && npm start
   ```
   (Rodará em `http://localhost:4830`)

2. **Frontend**:
   ```bash
   cd client && npm install && npm run dev
   ```
   (Rodará em `http://localhost:3148`)

## Estrutura do Projeto
- `server/`: API em Node/Express com banco de dados em arquivo JSON.
- `client/`: Aplicação React com Vite, Tailwind-like CSS, Lucide Icons e Framer Motion.

<img width="1216" height="838" alt="image" src="https://github.com/user-attachments/assets/478bbbba-1f33-4a5b-9c86-292c6751a9f3" />
<img width="1216" height="838" alt="image" src="https://github.com/user-attachments/assets/b221078e-f23f-4ae7-a181-6a89d3a92c7d" />
<img width="1216" height="838" alt="image" src="https://github.com/user-attachments/assets/57f9505e-8107-46d8-aac1-7265e5b8bae1" />



