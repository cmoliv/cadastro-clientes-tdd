import { randomUUID } from 'node:crypto';
import type { Cliente } from './cliente';
import { normalizarCpf, validarCpf } from './cpf';
import { validarEmail } from './email';
import { ClienteDuplicadoError, ClienteInvalidoError, ClienteNaoEncontradoError } from './erros';
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

/** Campos obrigatórios já normalizados (sem espaços, e-mail minúsculo, CPF só com dígitos). */
interface DadosNormalizados {
  nome: string;
  email: string;
  cpf: string;
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
   * @throws {@link ClienteInvalidoError} Se nome, e-mail ou CPF forem inválidos.
   * @throws {@link ClienteDuplicadoError} Se o e-mail ou CPF já estiverem cadastrados.
   */
  async criar(dados: NovoCliente): Promise<Cliente> {
    const normalizados = normalizar(dados);
    validar(normalizados);
    await this.garantirUnicidade(normalizados);

    const instante = this.agora();
    const cliente: Cliente = {
      id: this.gerarId(),
      ...normalizados,
      ...(dados.telefone !== undefined && { telefone: dados.telefone }),
      criadoEm: instante,
      atualizadoEm: instante,
    };
    await this.repositorio.salvar(cliente);
    return cliente;
  }

  /**
   * Busca um cliente pelo identificador.
   *
   * @param id - Identificador do cliente.
   * @returns O cliente encontrado.
   * @throws {@link ClienteNaoEncontradoError} Se não existir cliente com o `id`.
   */
  async buscarPorId(id: string): Promise<Cliente> {
    const cliente = await this.repositorio.buscarPorId(id);
    if (!cliente) throw new ClienteNaoEncontradoError(id);
    return cliente;
  }

  /**
   * Altera os dados de um cliente. Apenas os campos informados são modificados.
   *
   * @param id - Identificador do cliente.
   * @param alteracoes - Campos a alterar.
   * @returns O cliente atualizado.
   * @throws {@link ClienteNaoEncontradoError} Se não existir cliente com o `id`.
   * @throws {@link ClienteInvalidoError} Se algum campo alterado for inválido.
   * @throws {@link ClienteDuplicadoError} Se o e-mail ou CPF pertencer a outro cliente.
   */
  async atualizar(id: string, alteracoes: Partial<NovoCliente>): Promise<Cliente> {
    const atual = await this.buscarPorId(id);
    const normalizados = normalizar({ ...atual, ...alteracoes });
    validar(normalizados);
    await this.garantirUnicidade(normalizados, id);

    const atualizado: Cliente = {
      ...atual,
      ...normalizados,
      ...(alteracoes.telefone !== undefined && { telefone: alteracoes.telefone }),
      atualizadoEm: this.agora(),
    };
    await this.repositorio.salvar(atualizado);
    return atualizado;
  }

  /**
   * Lista todos os clientes ordenados pelo nome.
   *
   * @returns Os clientes cadastrados, em ordem alfabética.
   */
  async listar(): Promise<Cliente[]> {
    const clientes = await this.repositorio.listar();
    return clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  /**
   * Garante que e-mail e CPF não pertencem a outro cliente.
   *
   * @param dados - Dados já normalizados.
   * @param idIgnorado - Cliente que está sendo atualizado (não conta como duplicado).
   */
  private async garantirUnicidade(dados: DadosNormalizados, idIgnorado?: string): Promise<void> {
    const comEmail = await this.repositorio.buscarPorEmail(dados.email);
    if (comEmail && comEmail.id !== idIgnorado) {
      throw new ClienteDuplicadoError('email', 'Já existe um cliente com este e-mail.');
    }
    const comCpf = await this.repositorio.buscarPorCpf(dados.cpf);
    if (comCpf && comCpf.id !== idIgnorado) {
      throw new ClienteDuplicadoError('cpf', 'Já existe um cliente com este CPF.');
    }
  }
}

function normalizar(dados: DadosNormalizados): DadosNormalizados {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    cpf: normalizarCpf(dados.cpf),
  };
}

function validar(dados: DadosNormalizados): void {
  if (dados.nome.length < 2) {
    throw new ClienteInvalidoError('nome', 'O nome deve ter pelo menos 2 caracteres.');
  }
  if (!validarEmail(dados.email)) {
    throw new ClienteInvalidoError('email', 'O e-mail informado é inválido.');
  }
  if (!validarCpf(dados.cpf)) {
    throw new ClienteInvalidoError('cpf', 'O CPF informado é inválido.');
  }
}
