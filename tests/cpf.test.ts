import { describe, expect, it } from 'vitest';
import { validarCpf } from '../src/cpf';

describe('validarCpf', () => {
  it('aceita um CPF válido (somente dígitos)', () => {
    expect(validarCpf('52998224725')).toBe(true);
  });

  it('rejeita CPF com dígito verificador incorreto', () => {
    expect(validarCpf('52998224724')).toBe(false);
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(validarCpf('11111111111')).toBe(false);
  });

  it('rejeita CPF com quantidade de dígitos diferente de 11', () => {
    expect(validarCpf('1234')).toBe(false);
  });
});
