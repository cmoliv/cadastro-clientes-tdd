import { describe, expect, it } from 'vitest';
import { validarEmail } from '../src/email';

describe('validarEmail', () => {
  it('aceita um e-mail com formato válido', () => {
    expect(validarEmail('ana.silva@exemplo.com.br')).toBe(true);
  });

  it.each([
    ['vazio', ''],
    ['sem arroba', 'ana.exemplo.com'],
    ['sem domínio', 'ana@'],
    ['sem parte local', '@exemplo.com'],
    ['sem ponto no domínio', 'ana@exemplo'],
    ['com espaço', 'ana silva@exemplo.com'],
  ])('rejeita e-mail %s', (_descricao, email) => {
    expect(validarEmail(email)).toBe(false);
  });
});
