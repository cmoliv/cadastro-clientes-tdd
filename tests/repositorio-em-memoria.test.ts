import { beforeEach, describe, expect, it } from 'vitest';
import type { Cliente } from '../src/cliente';
import { RepositorioEmMemoria } from '../src/repositorio-em-memoria';

function criarCliente(sobrescritas: Partial<Cliente> = {}): Cliente {
  return {
    id: 'id-1',
    nome: 'Ana Silva',
    email: 'ana@exemplo.com',
    cpf: '52998224725',
    criadoEm: new Date('2026-01-10T10:00:00Z'),
    atualizadoEm: new Date('2026-01-10T10:00:00Z'),
    ...sobrescritas,
  };
}

describe('RepositorioEmMemoria', () => {
  let repositorio: RepositorioEmMemoria;

  beforeEach(() => {
    repositorio = new RepositorioEmMemoria();
  });

  it('salva um cliente e o encontra pelo id', async () => {
    const cliente = criarCliente();
    await repositorio.salvar(cliente);
    expect(await repositorio.buscarPorId('id-1')).toEqual(cliente);
  });

  it('devolve undefined quando o id não existe', async () => {
    expect(await repositorio.buscarPorId('inexistente')).toBeUndefined();
  });

  it('encontra um cliente pelo e-mail e pelo CPF', async () => {
    const cliente = criarCliente();
    await repositorio.salvar(cliente);
    expect(await repositorio.buscarPorEmail('ana@exemplo.com')).toEqual(cliente);
    expect(await repositorio.buscarPorCpf('52998224725')).toEqual(cliente);
    expect(await repositorio.buscarPorEmail('outro@exemplo.com')).toBeUndefined();
    expect(await repositorio.buscarPorCpf('11144477735')).toBeUndefined();
  });

  it('lista todos os clientes salvos', async () => {
    await repositorio.salvar(criarCliente({ id: 'id-1' }));
    await repositorio.salvar(criarCliente({ id: 'id-2', nome: 'Bruno Costa' }));
    const todos = await repositorio.listar();
    expect(todos.map((c) => c.id)).toEqual(['id-1', 'id-2']);
  });

  it('salvar com id existente substitui o cliente anterior', async () => {
    await repositorio.salvar(criarCliente());
    await repositorio.salvar(criarCliente({ nome: 'Ana Souza' }));
    expect(await repositorio.listar()).toHaveLength(1);
    expect((await repositorio.buscarPorId('id-1'))?.nome).toBe('Ana Souza');
  });

  it('remove um cliente existente e informa se removeu', async () => {
    await repositorio.salvar(criarCliente());
    expect(await repositorio.remover('id-1')).toBe(true);
    expect(await repositorio.buscarPorId('id-1')).toBeUndefined();
    expect(await repositorio.remover('id-1')).toBe(false);
  });

  it('não expõe o objeto armazenado: alterar a cópia não muda o repositório', async () => {
    await repositorio.salvar(criarCliente());
    const copia = await repositorio.buscarPorId('id-1');
    copia!.nome = 'Alterado por fora';
    expect((await repositorio.buscarPorId('id-1'))?.nome).toBe('Ana Silva');
  });
});
