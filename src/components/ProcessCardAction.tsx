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
      aria-label={`Editar ${nome}`}
      onClick={onAbrir}
    />
  );
}
