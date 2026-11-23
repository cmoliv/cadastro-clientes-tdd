/**
 * Cadastro de clientes (CRUD) desenvolvido com TDD.
 *
 * Este é o ponto de entrada da biblioteca: tudo o que está exportado aqui
 * compõe a API pública e aparece na documentação gerada pelo TypeDoc.
 *
 * @packageDocumentation
 */
export type { Cliente } from './cliente';
export { ClienteServico } from './cliente-servico';
export type { NovoCliente, OpcoesClienteServico } from './cliente-servico';
export { normalizarCpf, validarCpf } from './cpf';
export { validarEmail } from './email';
export {
  ClienteDuplicadoError,
  ClienteInvalidoError,
  ClienteNaoEncontradoError,
} from './erros';
export type { CampoCliente } from './erros';
export type { RepositorioClientes } from './repositorio';
export { RepositorioEmMemoria } from './repositorio-em-memoria';
