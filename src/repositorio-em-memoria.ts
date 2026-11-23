import type { Cliente } from './cliente';
import type { RepositorioClientes } from './repositorio';

/**
 * Implementação de {@link RepositorioClientes} que guarda os clientes em
 * memória. Indicada para testes e demonstrações: os dados se perdem quando
 * o processo termina.
 *
 * Guarda e devolve cópias dos clientes, de modo que alterar um objeto
 * recebido não modifica o que está armazenado.
 */
export class RepositorioEmMemoria implements RepositorioClientes {
  private readonly clientes = new Map<string, Cliente>();

  async salvar(cliente: Cliente): Promise<void> {
    this.clientes.set(cliente.id, copiar(cliente));
  }

  async buscarPorId(id: string): Promise<Cliente | undefined> {
    return this.procurar((c) => c.id === id);
  }

  async buscarPorEmail(email: string): Promise<Cliente | undefined> {
    return this.procurar((c) => c.email === email);
  }

  async buscarPorCpf(cpf: string): Promise<Cliente | undefined> {
    return this.procurar((c) => c.cpf === cpf);
  }

  async listar(): Promise<Cliente[]> {
    return [...this.clientes.values()].map(copiar);
  }

  async remover(id: string): Promise<boolean> {
    return this.clientes.delete(id);
  }

  private procurar(criterio: (cliente: Cliente) => boolean): Cliente | undefined {
    for (const cliente of this.clientes.values()) {
      if (criterio(cliente)) return copiar(cliente);
    }
    return undefined;
  }
}

function copiar(cliente: Cliente): Cliente {
  return { ...cliente, criadoEm: new Date(cliente.criadoEm), atualizadoEm: new Date(cliente.atualizadoEm) };
}
