import { useState } from 'react';
import { Copy, FileSpreadsheet, Trash2, Users } from 'lucide-react';

import { Button, FileField, IconButton } from '../ui';
import type { LotacaoAgrupada } from '../../domain/lotacao';
import type { Setor } from '../../types/organograma';

export type LotacaoCarregada = LotacaoAgrupada & {
  arquivo: string;
  total: number;
};

type PainelLotacaoProps = {
  setor?: Setor;
  lotacao?: LotacaoCarregada;
  lendo: boolean;
  erro?: string;
  onCarregar: (arquivo: File) => void;
  onRemover: () => void;
};

/** Pessoas lotadas no setor selecionado. Os dados vivem só na memória da tela. */
export function PainelLotacao({
  setor,
  lotacao,
  lendo,
  erro,
  onCarregar,
  onRemover,
}: PainelLotacaoProps) {
  const pessoas =
    setor && lotacao ? (lotacao.porSetor.get(setor.id) ?? []) : [];
  const [copia, setCopia] = useState<{ setorId: string; mensagem: string }>();

  async function copiarEmails() {
    if (!setor) return;
    const emails = pessoas.map((pessoa) => pessoa.email).filter(Boolean);
    try {
      await navigator.clipboard.writeText(emails.join('; '));
      setCopia({
        setorId: setor.id,
        mensagem: `${emails.length} e-mails copiados.`,
      });
    } catch {
      setCopia({
        setorId: setor.id,
        mensagem: 'Não foi possível copiar. Selecione os e-mails na lista.',
      });
    }
  }

  return (
    <aside className="lotacao-painel" aria-labelledby="lotacao-titulo">
      <h2 id="lotacao-titulo" className="lotacao-painel__titulo">
        <Users size={16} aria-hidden="true" />
        Equipe do setor
      </h2>

      {!lotacao ? (
        <div className="lotacao-painel__vazio">
          <p>
            Carregue a planilha de lotação para ver as pessoas de cada setor. Os
            dados ficam só na memória desta tela: nada é salvo.
          </p>
          <FileField
            id="planilha-lotacao"
            file={null}
            placeholder={
              lendo ? 'Lendo planilha…' : 'Carregar planilha (XLSX ou CSV)…'
            }
            accept=".xlsx,.xls,.csv"
            disabled={lendo}
            aria-describedby={erro ? 'planilha-lotacao-erro' : undefined}
            // Limpa a escolha anterior: reabrir o mesmo arquivo corrigido precisa disparar a leitura.
            onClick={(event) => {
              event.currentTarget.value = '';
            }}
            onChange={(arquivo) => arquivo && onCarregar(arquivo)}
          />
          {erro && (
            <p
              id="planilha-lotacao-erro"
              className="ui-field__error"
              role="alert"
            >
              {erro}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="lotacao-painel__arquivo">
            <FileSpreadsheet size={16} aria-hidden="true" />
            <span>
              <strong>{lotacao.arquivo}</strong>
              <small>{lotacao.total} pessoas</small>
            </span>
            <IconButton
              icon={Trash2}
              label="Remover planilha"
              onClick={onRemover}
            />
          </div>

          {setor ? (
            <section aria-labelledby="lotacao-setor">
              <h3 id="lotacao-setor" className="lotacao-painel__setor">
                {setor.nome}
              </h3>
              <p className="lotacao-painel__resumo">
                {pessoas.length
                  ? `${pessoas.length} ${pessoas.length === 1 ? 'pessoa lotada' : 'pessoas lotadas'}`
                  : 'Nenhuma pessoa lotada neste setor na planilha.'}
              </p>
              {pessoas.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    icon={Copy}
                    onClick={() => void copiarEmails()}
                  >
                    Copiar e-mails
                  </Button>
                  <p className="lotacao-painel__status" role="status">
                    {copia?.setorId === setor.id ? copia.mensagem : ''}
                  </p>
                  <ul className="lotacao-lista" aria-label="Pessoas lotadas">
                    {pessoas.map((pessoa, indice) => (
                      <li key={`${pessoa.matricula}-${indice}`}>
                        <strong>{pessoa.nome}</strong>
                        {pessoa.funcao && <span>{pessoa.funcao}</span>}
                        <dl>
                          <div>
                            <dt>Matrícula</dt>
                            <dd>{pessoa.matricula || 'Não informada'}</dd>
                          </div>
                          <div>
                            <dt>E-mail</dt>
                            <dd>{pessoa.email || 'Não informado'}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          ) : (
            <p className="lotacao-painel__dica">
              Selecione um setor no organograma para ver quem está lotado nele.
            </p>
          )}

          {lotacao.foraDoOrganograma.length > 0 && (
            <details className="lotacao-fora">
              <summary>
                Lotações fora do organograma ({lotacao.foraDoOrganograma.length}
                )
              </summary>
              <p>
                Estes nomes da planilha não existem no decreto. As pessoas deles
                não aparecem em nenhum setor.
              </p>
              <ul>
                {lotacao.foraDoOrganograma.map(
                  ({ lotacao: nome, quantidade }) => (
                    <li key={nome}>
                      {nome || 'Sem lotação'} <span>{quantidade}</span>
                    </li>
                  )
                )}
              </ul>
            </details>
          )}
        </>
      )}
    </aside>
  );
}
