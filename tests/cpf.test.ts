import { describe, expect, it } from 'vitest';
import { validarCpf } from '../src/cpf';

describe('validarCpf', () => {
  it('aceita um CPF válido (somente dígitos)', () => {
    expect(validarCpf('52998224725')).toBe(true);
  });
});
