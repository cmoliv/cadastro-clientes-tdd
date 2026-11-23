/**
 * Campos de {@link Cliente} que podem ser apontados em um erro.
 */
export type CampoCliente = 'nome' | 'email' | 'cpf';

/**
 * Lançado quando nenhum cliente existe com o identificador informado.
 */
export class ClienteNaoEncontradoError extends Error {
  /**
   * @param id - Identificador que não foi encontrado.
   */
  constructor(public readonly id: string) {
    super(`Cliente não encontrado: ${id}`);
    this.name = 'ClienteNaoEncontradoError';
  }
}

/**
 * Lançado quando um valor que deve ser único já pertence a outro cliente.
 */
export class ClienteDuplicadoError extends Error {
  /**
   * @param campo - Campo que já está em uso (`email` ou `cpf`).
   * @param mensagem - Explicação legível do problema.
   */
  constructor(
    public readonly campo: 'email' | 'cpf',
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ClienteDuplicadoError';
  }
}

/**
 * Lançado quando os dados informados não atendem às regras de validação.
 */
export class ClienteInvalidoError extends Error {
  /**
   * @param campo - Campo que falhou na validação.
   * @param mensagem - Explicação legível do problema.
   */
  constructor(
    public readonly campo: CampoCliente,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ClienteInvalidoError';
  }
}
