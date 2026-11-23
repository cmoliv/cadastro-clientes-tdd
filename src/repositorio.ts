import type { Cliente } from './cliente';

/**
 * Contrato de persistência de clientes.
 *
 * O serviço depende desta interface (e não de uma implementação concreta),
 * o que permite trocar o armazenamento (memória, arquivo, banco de dados)
 * sem alterar as regras de negócio.
 */
export interface RepositorioClientes {
  /** Insere o cliente ou substitui o existente com o mesmo `id`. */
  salvar(cliente: Cliente): Promise<void>;
  /** Busca um cliente pelo `id`; `undefined` se não existir. */
  buscarPorId(id: string): Promise<Cliente | undefined>;
  /** Busca um cliente pelo e-mail; `undefined` se não existir. */
  buscarPorEmail(email: string): Promise<Cliente | undefined>;
  /** Busca um cliente pelo CPF (somente dígitos); `undefined` se não existir. */
  buscarPorCpf(cpf: string): Promise<Cliente | undefined>;
  /** Lista todos os clientes, na ordem de inserção. */
  listar(): Promise<Cliente[]>;
  /** Remove o cliente; devolve `true` se ele existia. */
  remover(id: string): Promise<boolean>;
}
