/**
 * Calcula um dígito verificador do CPF.
 *
 * @param digitos - Dígitos já conhecidos (9 para o 1º verificador, 10 para o 2º).
 * @returns O dígito verificador (0 a 9).
 */
function calcularDigito(digitos: number[]): number {
  const pesoInicial = digitos.length + 1;
  const soma = digitos.reduce((acc, d, i) => acc + d * (pesoInicial - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/**
 * Remove todos os caracteres que não são dígitos de um CPF.
 *
 * @param cpf - CPF com ou sem formatação (ex.: `529.982.247-25`).
 * @returns O CPF contendo apenas dígitos (ex.: `52998224725`).
 */
export function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida um CPF pelo número de dígitos, pela sequência repetida e pelos
 * dois dígitos verificadores. Aceita CPF com ou sem formatação.
 *
 * @param cpf - CPF com ou sem pontos e traço.
 * @returns `true` se o CPF for válido; `false` caso contrário.
 */
export function validarCpf(cpf: string): boolean {
  const numero = normalizarCpf(cpf);
  if (!/^\d{11}$/.test(numero)) return false;
  if (/^(\d)\1{10}$/.test(numero)) return false;

  const digitos = numero.split('').map(Number);
  return (
    calcularDigito(digitos.slice(0, 9)) === digitos[9] &&
    calcularDigito(digitos.slice(0, 10)) === digitos[10]
  );
}
