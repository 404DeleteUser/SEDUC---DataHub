import { useRef } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './ui';

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
      <Button icon={FolderOpen} onClick={() => inputRef.current?.click()}>
        Selecionar
      </Button>
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
