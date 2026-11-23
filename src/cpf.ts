export function validarCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digitos = cpf.split('').map(Number);

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += digitos[i]! * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== digitos[9]) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += digitos[i]! * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === digitos[10];
}
