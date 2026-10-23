import { TriangleAlert } from 'lucide-react';
import { formatarDuracao } from '../../domain/logsExecucao';
import type { EtapaDoDetalhe } from '../../types/logExecucao';
import { ROTULOS_DA_SITUACAO } from './constantes';

const numero = (valor: number) => valor.toLocaleString('pt-BR');
export default function EtapaDaExecucao({ etapa }: { etapa: EtapaDoDetalhe }) {
  return (
    <li>
      <h4>
        {etapa.indice + 1}. {etapa.nome}
      </h4>
      <p
        className={`logs-etapa__situacao logs-etapa__situacao--${etapa.situacao}`}
      >
        {ROTULOS_DA_SITUACAO[etapa.situacao]}
      </p>
      {etapa.parametros.length > 0 && (
        <dl>
          {etapa.parametros.map((p) => (
            <div key={p.rotulo}>
              <dt>{p.rotulo}</dt>
              <dd>{p.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {etapa.linhasAntes !== null && etapa.linhasDepois !== null && (
        <p>
          Linhas: {numero(etapa.linhasAntes)} → {numero(etapa.linhasDepois)}
        </p>
      )}
      {etapa.resumo.map((r) => (
        <p key={r.rotulo}>
          {r.rotulo}: {r.valor}
        </p>
      ))}
      <p>Duração: {formatarDuracao(etapa.duracaoMs)}</p>
      {etapa.logs.map((log, i) => (
        <p
          className={log.nivel === 'aviso' ? 'logs-aviso' : undefined}
          key={`${i}-${log.mensagem}`}
        >
          {log.nivel === 'aviso' && (
            <TriangleAlert size={14} aria-hidden="true" />
          )}
          {log.mensagem}
        </p>
      ))}
    </li>
  );
}
