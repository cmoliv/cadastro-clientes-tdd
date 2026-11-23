import { beforeEach, describe, expect, it } from 'vitest';
import { ClienteServico } from '../src/cliente-servico';
import {
  ClienteDuplicadoError,
  ClienteInvalidoError,
  ClienteNaoEncontradoError,
} from '../src/erros';
import { RepositorioEmMemoria } from '../src/repositorio-em-memoria';

const AGORA = new Date('2026-03-01T12:00:00Z');

function criarServico() {
  const repositorio = new RepositorioEmMemoria();
  let contador = 0;
  let instante = AGORA;
  const servico = new ClienteServico(repositorio, {
    gerarId: () => `id-${++contador}`,
    agora: () => instante,
  });
  const definirAgora = (novo: Date) => {
    instante = novo;
  };
  return { servico, repositorio, definirAgora };
}

const ANA = { nome: 'Ana Silva', email: 'ana@exemplo.com', cpf: '52998224725' };
const BRUNO = { nome: 'Bruno Costa', email: 'bruno@exemplo.com', cpf: '11144477735' };

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

describe('ClienteServico.criar – unicidade', () => {
  let servico: ClienteServico;
  let repositorio: RepositorioEmMemoria;

  beforeEach(async () => {
    ({ servico, repositorio } = criarServico());
    await servico.criar(ANA);
  });

  it('rejeita e-mail já cadastrado, ignorando maiúsculas', async () => {
    const tentativa = servico.criar({ ...BRUNO, email: 'ANA@exemplo.com' });
    await expect(tentativa).rejects.toBeInstanceOf(ClienteDuplicadoError);
    await expect(tentativa).rejects.toMatchObject({ campo: 'email' });
  });

  it('rejeita CPF já cadastrado, mesmo com formatação diferente', async () => {
    const tentativa = servico.criar({ ...BRUNO, cpf: '529.982.247-25' });
    await expect(tentativa).rejects.toBeInstanceOf(ClienteDuplicadoError);
    await expect(tentativa).rejects.toMatchObject({ campo: 'cpf' });
  });

  it('aceita um segundo cliente com e-mail e CPF diferentes', async () => {
    const bruno = await servico.criar(BRUNO);
    expect(bruno.id).toBe('id-2');
    expect(await repositorio.listar()).toHaveLength(2);
  });
});

describe('ClienteServico.buscarPorId', () => {
  it('devolve o cliente cadastrado', async () => {
    const { servico } = criarServico();
    const criado = await servico.criar(ANA);
    expect(await servico.buscarPorId(criado.id)).toEqual(criado);
  });

  it('lança ClienteNaoEncontradoError quando o id não existe', async () => {
    const { servico } = criarServico();
    const tentativa = servico.buscarPorId('inexistente');
    await expect(tentativa).rejects.toBeInstanceOf(ClienteNaoEncontradoError);
    await expect(tentativa).rejects.toMatchObject({ id: 'inexistente' });
  });
});

describe('ClienteServico.listar', () => {
  it('devolve lista vazia quando não há clientes', async () => {
    const { servico } = criarServico();
    expect(await servico.listar()).toEqual([]);
  });

  it('devolve os clientes ordenados pelo nome', async () => {
    const { servico } = criarServico();
    await servico.criar(BRUNO);
    await servico.criar(ANA);
    const nomes = (await servico.listar()).map((c) => c.nome);
    expect(nomes).toEqual(['Ana Silva', 'Bruno Costa']);
  });
});

describe('ClienteServico.atualizar', () => {
  const DEPOIS = new Date('2026-03-05T08:30:00Z');
  let servico: ClienteServico;
  let definirAgora: (novo: Date) => void;
  let idAna: string;

  beforeEach(async () => {
    ({ servico, definirAgora } = criarServico());
    idAna = (await servico.criar(ANA)).id;
    await servico.criar(BRUNO);
    definirAgora(DEPOIS);
  });

  it('altera apenas os campos informados e atualiza a data de alteração', async () => {
    const atualizado = await servico.atualizar(idAna, { nome: 'Ana Souza' });

    expect(atualizado).toMatchObject({
      id: idAna,
      nome: 'Ana Souza',
      email: 'ana@exemplo.com',
      cpf: '52998224725',
      criadoEm: AGORA,
      atualizadoEm: DEPOIS,
    });
    expect(await servico.buscarPorId(idAna)).toEqual(atualizado);
  });

  it('normaliza e-mail e CPF alterados', async () => {
    const atualizado = await servico.atualizar(idAna, {
      email: ' NOVA@Exemplo.com ',
      cpf: '529.982.247-25',
    });
    expect(atualizado.email).toBe('nova@exemplo.com');
    expect(atualizado.cpf).toBe('52998224725');
  });

  it('permite manter o próprio e-mail e CPF sem acusar duplicidade', async () => {
    const atualizado = await servico.atualizar(idAna, { email: 'ana@exemplo.com', cpf: '52998224725' });
    expect(atualizado.id).toBe(idAna);
  });

  it('lança ClienteNaoEncontradoError quando o cliente não existe', async () => {
    await expect(servico.atualizar('inexistente', { nome: 'Fulano' })).rejects.toBeInstanceOf(
      ClienteNaoEncontradoError,
    );
  });

  it('valida os campos alterados', async () => {
    await expect(servico.atualizar(idAna, { nome: 'A' })).rejects.toMatchObject({ campo: 'nome' });
    await expect(servico.atualizar(idAna, { email: 'x' })).rejects.toMatchObject({ campo: 'email' });
    await expect(servico.atualizar(idAna, { cpf: '123' })).rejects.toMatchObject({ campo: 'cpf' });
  });

  it('rejeita e-mail ou CPF que já pertencem a outro cliente', async () => {
    await expect(servico.atualizar(idAna, { email: 'bruno@exemplo.com' })).rejects.toMatchObject({
      campo: 'email',
    });
    await expect(servico.atualizar(idAna, { cpf: '111.444.777-35' })).rejects.toMatchObject({
      campo: 'cpf',
    });
    expect((await servico.buscarPorId(idAna)).email).toBe('ana@exemplo.com');
  });
});
