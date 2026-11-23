# Cadastro de Clientes (TDD)

CRUD de cadastro de clientes em **TypeScript**, desenvolvido com **TDD** (Test-Driven Development)
como atividade individual da disciplina de Engenharia de Software (UESC).

O projeto é uma biblioteca de regras de negócio (sem interface gráfica nem banco de dados): o
serviço `ClienteServico` valida, cadastra, consulta, altera e remove clientes, usando um
repositório que pode ser trocado (há uma implementação em memória).

## Funcionalidades

- **Criar** cliente com nome, e-mail, CPF e telefone (opcional).
- **Buscar** cliente por `id` e **listar** clientes ordenados pelo nome.
- **Atualizar** parcialmente os dados de um cliente.
- **Remover** cliente.
- Validação de nome (mínimo de 2 caracteres), e-mail (formato) e **CPF** (dígitos verificadores).
- **Unicidade** de e-mail (sem diferenciar maiúsculas) e de CPF (com ou sem formatação).
- Erros tipados: `ClienteInvalidoError`, `ClienteDuplicadoError` e `ClienteNaoEncontradoError`.

## Tecnologias

| Ferramenta | Uso |
|---|---|
| [TypeScript](https://www.typescriptlang.org/) 5.9 | Linguagem (modo `strict`) |
| [Vitest](https://vitest.dev/) 5 | Execução dos testes e relatório de cobertura (V8) |
| [TypeDoc](https://typedoc.org/) 0.28 | Geração da documentação a partir dos comentários TSDoc |
| Node.js 20+ | Ambiente de execução |

## Instalação

```bash
git clone <url-do-repositorio>
cd cadastro-clientes-tdd
npm install
```

## Uso

```ts
import { ClienteServico, RepositorioEmMemoria } from './src/index';

const servico = new ClienteServico(new RepositorioEmMemoria());

const ana = await servico.criar({
  nome: 'Ana Silva',
  email: 'ana@exemplo.com',
  cpf: '529.982.247-25',
});

await servico.atualizar(ana.id, { telefone: '(73) 99999-0000' });
console.log(await servico.listar());
await servico.remover(ana.id);
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm test` | Executa todos os testes uma vez |
| `npm run test:watch` | Executa os testes em modo observação (ideal para o ciclo TDD) |
| `npm run coverage` | Executa os testes com cobertura; falha se ficar abaixo de 100% |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |
| `npm run docs` | Gera a documentação da API em `docs/api` |

## Documentação do código

Todo o código público é documentado com comentários [TSDoc](https://tsdoc.org/). Para gerar e
visualizar a documentação em HTML:

```bash
npm run docs
```

Depois, abra o arquivo `docs/api/index.html` no navegador (clique duas vezes nele ou use
`start docs/api/index.html` no Windows, `open docs/api/index.html` no macOS ou
`xdg-open docs/api/index.html` no Linux). A pasta `docs/api` não é versionada, pois é gerada.

O relatório de cobertura em HTML fica em `coverage/index.html` após `npm run coverage`.

## Como o projeto foi desenvolvido (TDD)

Cada funcionalidade seguiu o ciclo **Red → Green → Refactor**, e isso está registrado no histórico
do Git:

- `test(red): ...` — commit com o teste novo, que falha;
- `feat(green): ...` — commit com o código mínimo para o teste passar;
- `refactor: ...` — commit de melhoria interna, com os testes verdes.

Para ver a sequência:

```bash
git log --oneline --reverse
```

## Estrutura

```
src/
  cpf.ts                      validação e normalização de CPF
  email.ts                    validação de formato de e-mail
  cliente.ts                  modelo Cliente
  erros.ts                    erros de domínio
  repositorio.ts              interface RepositorioClientes
  repositorio-em-memoria.ts   implementação em memória
  cliente-servico.ts          regras de negócio do CRUD
  index.ts                    API pública
tests/                        testes (um arquivo por unidade)
typedoc.json                  configuração da documentação
vitest.config.ts              configuração dos testes e da cobertura
```

## Licença

MIT
