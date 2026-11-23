/**
 * Campos de {@link Cliente} que podem ser apontados em um erro.
 */
export type CampoCliente = 'nome' | 'email' | 'cpf';

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
