import { LogIn } from 'lucide-react';

import brasaoMT from '../assets/brasao-mt.png';
import { Button, SimulationNotice } from './ui';

/** Tela depois de "Sair da conta". Ainda não há login: é uma Simulação. */
export default function TelaSaida({ onEntrar }: { onEntrar: () => void }) {
  return (
    <main id="conteudo-principal" tabIndex={-1} className="tela-saida">
      <div className="tela-saida__cartao">
        <img
          src={brasaoMT}
          alt="Brasão de Mato Grosso"
          width={56}
          height={56}
        />
        <h1>Você saiu do DataHub</h1>
        <p>Para continuar, entre novamente.</p>
        <SimulationNotice detail="Ainda não há login: entrar de novo só reabre o app." />
        <Button variant="primary" icon={LogIn} onClick={onEntrar} autoFocus>
          Entrar novamente
        </Button>
      </div>
    </main>
  );
}
