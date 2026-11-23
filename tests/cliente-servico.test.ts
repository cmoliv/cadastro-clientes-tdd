import { beforeEach, describe, expect, it } from 'vitest';
import { ClienteServico } from '../src/cliente-servico';
import { ClienteInvalidoError } from '../src/erros';
import { RepositorioEmMemoria } from '../src/repositorio-em-memoria';

const AGORA = new Date('2026-03-01T12:00:00Z');

function criarServico() {
  const repositorio = new RepositorioEmMemoria();
  let contador = 0;
  const servico = new ClienteServico(repositorio, {
    gerarId: () => `id-${++contador}`,
    agora: () => AGORA,
  });
  return { servico, repositorio };
}

const ANA = { nome: 'Ana Silva', email: 'ana@exemplo.com', cpf: '52998224725' };

describe('ClienteServico.criar', () => {
  let servico: ClienteServico;
  let repositorio: RepositorioEmMemoria;

  beforeEach(() => {
    ({ servico, repositorio } = criarServico());
  });

  it('cria o cliente com id, datas e dados normalizados', async () => {
    const cliente = await servico.criar({
      nome: '  Ana Silva ',
      email: 'Ana@Exemplo.com',
      cpf: '529.982.247-25',
      telefone: '(73) 99999-0000',
    });

    expect(cliente).toEqual({
      id: 'id-1',
      nome: 'Ana Silva',
      email: 'ana@exemplo.com',
      cpf: '52998224725',
      telefone: '(73) 99999-0000',
      criadoEm: AGORA,
      atualizadoEm: AGORA,
    });
  });

  it('persiste o cliente criado no repositório', async () => {
    const criado = await servico.criar(ANA);
    expect(await repositorio.buscarPorId(criado.id)).toEqual(criado);
  });
});

describe('ClienteServico.criar – validação', () => {
  let servico: ClienteServico;
  let repositorio: RepositorioEmMemoria;

  beforeEach(() => {
    ({ servico, repositorio } = criarServico());
  });

  it.each([
    ['vazio', ''],
    ['só espaços', '   '],
    ['com uma letra', 'A'],
  ])('rejeita nome %s', async (_descricao, nome) => {
    const tentativa = servico.criar({ ...ANA, nome });
    await expect(tentativa).rejects.toBeInstanceOf(ClienteInvalidoError);
    await expect(tentativa).rejects.toMatchObject({ campo: 'nome' });
  });

  it('rejeita e-mail com formato inválido', async () => {
    const tentativa = servico.criar({ ...ANA, email: 'ana.exemplo.com' });
    await expect(tentativa).rejects.toBeInstanceOf(ClienteInvalidoError);
    await expect(tentativa).rejects.toMatchObject({ campo: 'email' });
  });

  it('rejeita CPF inválido', async () => {
    const tentativa = servico.criar({ ...ANA, cpf: '52998224724' });
    await expect(tentativa).rejects.toBeInstanceOf(ClienteInvalidoError);
    await expect(tentativa).rejects.toMatchObject({ campo: 'cpf' });
  });

  it('não persiste nada quando os dados são inválidos', async () => {
    await servico.criar({ ...ANA, nome: '' }).catch(() => undefined);
    expect(await repositorio.listar()).toEqual([]);
  });
});
