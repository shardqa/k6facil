# K6Facil

K6Facil é um framework que simplifica a criação e execução de testes de performance usando k6. Ele permite que você defina seus testes de carga usando arquivos JSON simples, sem precisar escrever código JavaScript diretamente.

## Pré-requisitos

1. Node.js (versão 16 ou superior)
2. K6 instalado no sistema

### Instalando o K6

**Linux (usando Homebrew):**
```bash
brew install k6
```

**Windows (usando Chocolatey):**
```bash
choco install k6
```

**Outras opções de instalação:** [Documentação oficial do K6](https://k6.io/docs/get-started/installation/)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/k6facil.git
cd k6facil
```

2. Instale as dependências:
```bash
npm install
```

3. Faça o link do comando global:
```bash
npm link
```

## Uso

1. Crie um arquivo JSON com sua configuração de teste. Exemplo (`teste.json`):

```json
{
  "endpoint": {
    "url": "https://api.exemplo.com/endpoint",
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "*/*"
    }
  },
  "loadTest": {
    "startVUs": 1,
    "maxVUs": 5,
    "stages": [
      { "duration": "30s", "target": 5 }
    ],
    "thresholds": {
      "http_req_duration": ["p(95)<500"],
      "http_req_failed": ["rate<0.01"]
    }
  }
}
```

2. Execute o teste:
```bash
k6facil teste.json
```

## Configuração do JSON

### Estrutura Básica

- **endpoint**: Configurações da API a ser testada
  - `url`: URL completa do endpoint
  - `method`: Método HTTP (GET, POST, PUT, DELETE)
  - `headers`: Headers da requisição
  - `body`: Corpo da requisição (para POST/PUT)

- **loadTest**: Configurações do teste de carga
  - `startVUs`: Número inicial de usuários virtuais
  - `maxVUs`: Número máximo de usuários virtuais
  - `stages`: Configuração das etapas do teste
  - `thresholds`: Critérios de sucesso do teste

### Exemplos de Configuração

#### GET sem autenticação:
```json
{
  "endpoint": {
    "url": "https://api.exemplo.com/users",
    "method": "GET",
    "headers": {
      "Accept": "*/*"
    }
  },
  "loadTest": {
    "startVUs": 1,
    "maxVUs": 5,
    "stages": [
      { "duration": "30s", "target": 5 }
    ],
    "thresholds": {
      "http_req_duration": ["p(95)<500"]
    }
  }
}
```

#### POST com autenticação:
```json
{
  "endpoint": {
    "url": "https://api.exemplo.com/users",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer seu-token-aqui"
    },
    "body": {
      "name": "Usuario Teste",
      "email": "usuario@teste.com"
    }
  },
  "loadTest": {
    "startVUs": 1,
    "maxVUs": 3,
    "stages": [
      { "duration": "1m", "target": 3 }
    ],
    "thresholds": {
      "http_req_duration": ["p(95)<500"],
      "http_req_failed": ["rate<0.01"]
    }
  }
}
```

## Thresholds (Critérios de Sucesso)

Os thresholds definem os critérios de sucesso do seu teste:

- `http_req_duration`: Tempo de resposta das requisições
  - Exemplo: `"p(95)<500"` - 95% das requisições devem responder em menos de 500ms
- `http_req_failed`: Taxa de falha aceitável
  - Exemplo: `"rate<0.01"` - menos de 1% das requisições podem falhar

## Interpretando os Resultados

Após a execução, o k6facil mostrará:
- Estatísticas de execução
- Status dos thresholds
- Métricas de performance

O teste será considerado bem-sucedido se todos os thresholds forem atendidos.

## Contribuindo

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
