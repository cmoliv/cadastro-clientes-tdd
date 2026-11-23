/**
 * Cliente cadastrado no sistema.
 */
export interface Cliente {
  /** Identificador único, gerado pelo sistema. */
  id: string;
  /** Nome completo do cliente. */
  nome: string;
  /** E-mail em minúsculas; único entre os clientes. */
  email: string;
  /** CPF somente com dígitos; único entre os clientes. */
  cpf: string;
  /** Telefone de contato (opcional). */
  telefone?: string;
  /** Data e hora do cadastro. */
  criadoEm: Date;
  /** Data e hora da última alteração. */
  atualizadoEm: Date;
}
