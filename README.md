# Guardaí backend

## Requisitos e recomendações

- Certifique-se de ter Node instalado na sua máquina
- Utilize docker para facilitar a instanciação da aplicação

## Iniciando o projeto sem docker

Primeiro, encontre alguma forma de rodar um servidor de banco de dados postgres

Depois, atualize o arquivo `.env` com base no arquivo `.env.example` para configurar a applicação

Em seguida, rode os seguintes comandos com node:

```
npm run build

npm run start

# Ou

npm run serve # Para rodar a aplicação no modo de desenvolvimento
```

Se tudo ocorreu certo, a aplicação já está rodando

## Iniciando o projeto com docker

Rode o seguinte comando:

```
docker compose up -d
```

Se tudo ocorreu certo, a aplicação já está rodando