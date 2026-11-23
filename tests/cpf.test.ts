import { describe, expect, it } from 'vitest';
import { normalizarCpf, validarCpf } from '../src/cpf';

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

  it('aceita CPF válido formatado com pontos e traço', () => {
    expect(validarCpf('529.982.247-25')).toBe(true);
  });

  it('aceita CPF cujo cálculo resulta em resto 10 (dígito verificador 0)', () => {
    expect(validarCpf('12345678909')).toBe(true);
  });
});

describe('normalizarCpf', () => {
  it('remove pontos, traços e espaços, mantendo só os dígitos', () => {
    expect(normalizarCpf(' 529.982.247-25 ')).toBe('52998224725');
  });
});
