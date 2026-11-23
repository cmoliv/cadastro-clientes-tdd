const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Verifica se um texto tem formato de e-mail: parte local, arroba e um
 * domínio com pelo menos um ponto, sem espaços.
 *
 * Valida apenas o formato; não confirma que a caixa postal existe.
 *
 * @param email - Texto a validar.
 * @returns `true` se o formato for válido; `false` caso contrário.
 */
export function validarEmail(email: string): boolean {
  return FORMATO_EMAIL.test(email);
}
