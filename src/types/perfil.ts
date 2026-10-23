/** O que a pessoa personaliza e fica salvo neste computador. */
export type PerfilLocal = {
  nome: string;
  /** Foto já reduzida, como data URL (image/jpeg). */
  foto: string | null;
};

/** Dados funcionais. Por enquanto fictícios (mock/perfilMock.ts). */
export type DadosFuncionais = {
  matricula: string;
  vinculo: string;
  emailInstitucional: string;
};
