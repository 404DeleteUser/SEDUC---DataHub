import { useRef } from 'react';
import { FolderOpen } from 'lucide-react';

export default function FolderPicker({
  onSelect,
}: {
  onSelect: (pasta: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function selecionarPasta(files: FileList | null) {
    const primeiroArquivo = files?.[0];
    if (!primeiroArquivo) return;

    const nomePasta = primeiroArquivo.webkitRelativePath.split('/')[0];
    onSelect(`Prévia no navegador: ${nomePasta || primeiroArquivo.name}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="botao-secundario"
      >
        <FolderOpen size={15} />
        Selecionar
      </button>
      <input
        name="pasta-destino"
        ref={(element) => {
          inputRef.current = element;
          element?.setAttribute('webkitdirectory', '');
          element?.setAttribute('directory', '');
        }}
        type="file"
        autoComplete="off"
        tabIndex={-1}
        hidden
        aria-label="Selecionar pasta de destino no explorador"
        onChange={(event) => {
          selecionarPasta(event.target.files);
          event.target.value = '';
        }}
      />
    </>
  );
}
