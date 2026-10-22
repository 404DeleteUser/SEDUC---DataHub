/**
 * Área clicável que cobre a linha do processo (D3a): abre o modal de execução
 * sem iniciar. Editar fica só no lápis, que fica acima desta camada.
 */
export default function ProcessCardAction({
  nome,
  onAbrir,
}: {
  nome: string;
  onAbrir: () => void;
}) {
  return (
    <button
      type="button"
      className="process-card-open"
      aria-label={`Executar ${nome}`}
      onClick={onAbrir}
    />
  );
}
