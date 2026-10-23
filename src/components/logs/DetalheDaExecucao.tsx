import { Copy, TriangleAlert } from 'lucide-react';
import { Button } from '../ui';
import { formatarDataHora, formatarDuracao } from '../../domain/logsExecucao';
import type { DetalheDaExecucao as Detalhe } from '../../types/logExecucao';
import StatusDaExecucao from './StatusDaExecucao';
import EtapaDaExecucao from './EtapaDaExecucao';
import { ROTULOS_DA_ORIGEM } from './constantes';

const numero = (valor: number) => valor.toLocaleString('pt-BR');
type Props = {
  detalhe: Detalhe;
  copia: string;
  aoCopiar: (caminho: string) => void;
};

function Metadados({ detalhe }: { detalhe: Detalhe }) {
  const { resumo } = detalhe;
  const itens = [
    ['Início', formatarDataHora(resumo.inicio)],
    ['Duração', formatarDuracao(resumo.duracao_ms)],
    ['Usuário', resumo.usuario],
    ['Máquina', detalhe.maquina],
    ['Origem', ROTULOS_DA_ORIGEM[resumo.origem]],
    ['Etapas', String(resumo.etapas)],
  ];
  return (
    <dl className="logs-metadados">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo}>
          <dt>{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Entradas({ detalhe }: { detalhe: Detalhe }) {
  return (
    <>
      <h3>Entradas</h3>
      {detalhe.entradas.length ? (
        detalhe.entradas.map((entrada) => (
          <p key={entrada.arquivo}>
            <code>{entrada.arquivo}</code>
            <br />
            {numero(entrada.linhas)} linhas · {numero(entrada.colunas)} colunas
            {entrada.abas > 1 && <> · só a primeira aba foi lida</>}
          </p>
        ))
      ) : (
        <p>Nenhuma entrada lida.</p>
      )}
    </>
  );
}

function Resultado({ detalhe }: { detalhe: Detalhe }) {
  const { resumo, saidaGravada, erro } = detalhe;
  return (
    <>
      <h3>Resultado</h3>
      <p>
        {saidaGravada
          ? `Arquivo gravado: ${saidaGravada.nome} (${numero(saidaGravada.abas)} abas, ${numero(saidaGravada.linhas)} linhas)`
          : 'Nenhum arquivo gravado.'}
      </p>
      {erro && (
        <div className="logs-erro">
          <strong>Erro</strong>
          <p>{erro.mensagem}</p>
          {erro.etapa !== null && <p>Na etapa {erro.etapa + 1}</p>}
        </div>
      )}
      {resumo.status === 'em_andamento' && (
        <p>A execução ainda está em andamento.</p>
      )}
      {resumo.status === 'interrompido' && (
        <p>
          A execução foi interrompida antes de terminar (o app ou o computador
          foi fechado).
        </p>
      )}
    </>
  );
}

function Rodape({ detalhe, copia, aoCopiar }: Props) {
  return (
    <footer className="logs-rodape">
      <code>{detalhe.resumo.arquivo}</code>
      <Button
        variant="ghost"
        size="sm"
        icon={Copy}
        onClick={() => aoCopiar(detalhe.resumo.arquivo)}
      >
        Copiar caminho do log
      </Button>
      <span role="status">{copia}</span>
    </footer>
  );
}

export default function DetalheDaExecucao(props: Props) {
  const { detalhe } = props;
  return (
    <section className="logs-detalhe" aria-labelledby="logs-detalhe-titulo">
      <h2 id="logs-detalhe-titulo">{detalhe.resumo.nome}</h2>
      <StatusDaExecucao status={detalhe.resumo.status} />
      <Metadados detalhe={detalhe} />
      <Entradas detalhe={detalhe} />
      <h3>Etapas</h3>
      <ol className="logs-etapas">
        {detalhe.etapas.map((etapa) => (
          <EtapaDaExecucao key={etapa.indice} etapa={etapa} />
        ))}
      </ol>
      {detalhe.avisosGerais.length > 0 && (
        <>
          <h3>Avisos gerais</h3>
          {detalhe.avisosGerais.map((aviso) => (
            <p className="logs-aviso" key={aviso}>
              <TriangleAlert size={14} aria-hidden="true" />
              {aviso}
            </p>
          ))}
        </>
      )}
      <Resultado detalhe={detalhe} />
      <Rodape {...props} />
    </section>
  );
}
