import { randomUUID } from 'node:crypto';
import type { Cliente } from './cliente';
import { normalizarCpf } from './cpf';
import type { RepositorioClientes } from './repositorio';

/** Dados necessários para cadastrar um cliente. */
export interface NovoCliente {
  /** Nome completo. */
  nome: string;
  /** E-mail (o formato é validado). */
  email: string;
  /** CPF com ou sem formatação. */
  cpf: string;
  /** Telefone de contato (opcional). */
  telefone?: string;
}

/**
 * Dependências opcionais do serviço, úteis para tornar os testes
 * determinísticos (injeção de dependência).
 */
export interface OpcoesClienteServico {
  /** Gera o identificador de um novo cliente. Padrão: UUID v4. */
  gerarId?: () => string;
  /** Devolve o instante atual. Padrão: `new Date()`. */
  agora?: () => Date;
}

/**
 * Regras de negócio do cadastro de clientes (CRUD).
 */
export class ClienteServico {
  private readonly gerarId: () => string;
  private readonly agora: () => Date;

  /**
   * @param repositorio - Onde os clientes são persistidos.
   * @param opcoes - Geradores de id e de data (opcionais).
   */
  constructor(
    private readonly repositorio: RepositorioClientes,
    opcoes: OpcoesClienteServico = {},
  ) {
    this.gerarId = opcoes.gerarId ?? randomUUID;
    this.agora = opcoes.agora ?? (() => new Date());
  }

  /**
   * Cadastra um novo cliente.
   *
   * @param dados - Dados do cliente.
   * @returns O cliente criado, já com `id` e datas.
   */
  async criar(dados: NovoCliente): Promise<Cliente> {
    const instante = this.agora();
    const cliente: Cliente = {
      id: this.gerarId(),
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
      cpf: normalizarCpf(dados.cpf),
      ...(dados.telefone !== undefined && { telefone: dados.telefone }),
      criadoEm: instante,
      atualizadoEm: instante,
    };
    await this.repositorio.salvar(cliente);
    return cliente;
  }
}
