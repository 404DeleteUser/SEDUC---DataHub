// Atalhos para os sistemas usados no dia a dia da SEDUC-MT (endereços públicos de acesso).

export type OrgaoDoSite =
  'SEDUC-MT' | 'SEPLAG-MT' | 'Governo de MT' | 'Parceiros';

export type SiteInstitucional = {
  id: string;
  nome: string;
  orgao: OrgaoDoSite;
  url: string;
};

/** Ordem das seções na tela. */
export const ORGAOS: readonly OrgaoDoSite[] = [
  'SEDUC-MT',
  'SEPLAG-MT',
  'Governo de MT',
  'Parceiros',
];

export const sitesInstitucionais: readonly SiteInstitucional[] = [
  {
    id: 'sigeduca-grh',
    nome: 'SigEduca – GRH',
    orgao: 'SEDUC-MT',
    url: 'http://sigeduca.seduc.mt.gov.br/grh/hwgrhlogout.aspx',
  },
  {
    id: 'gr-seduc',
    nome: 'GR SEDUC',
    orgao: 'SEDUC-MT',
    url: 'https://gr.seduc.mt.gov.br/',
  },
  {
    id: 'portal-de-servicos-seduc',
    nome: 'Portal de Serviços SEDUC',
    orgao: 'SEDUC-MT',
    url: 'https://portaldeservicos.seduc.mt.gov.br/',
  },
  {
    id: 'avadep',
    nome: 'AVADEP',
    orgao: 'SEDUC-MT',
    url: 'https://avadep.seduc.mt.gov.br/login/index.php',
  },
  {
    id: 'eduhub',
    nome: 'EduHub',
    orgao: 'SEDUC-MT',
    url: 'https://eduhub.seduc.mt.gov.br/',
  },
  {
    id: 'seap-ergon',
    nome: 'SEAP (Ergon)',
    orgao: 'SEPLAG-MT',
    url: 'https://seapng.seplag.mt.gov.br/Ergon/Administracao/ERGadm_mnu001.tp',
  },
  {
    id: 'sigpas',
    nome: 'SIGPAS',
    orgao: 'SEPLAG-MT',
    url: 'https://sigpas.seplag.mt.gov.br/',
  },
  {
    id: 'portal-do-servidor',
    nome: 'Portal do Servidor',
    orgao: 'SEPLAG-MT',
    url: 'https://servicos.seplag.mt.gov.br/portalservidor/',
  },
  {
    id: 'sigadoc',
    nome: 'SIGADOC',
    orgao: 'Governo de MT',
    url: 'https://www.sigadoc.mt.gov.br/siga/public/app/login?cont=https%3A%2F%2Fwww.sigadoc.mt.gov.br%2Fsiga%2Fapp%2Fprincipal%3FexibirAcessoAnterior%3Dtrue',
  },
  {
    id: 'fiplan',
    nome: 'FIPLAN',
    orgao: 'Governo de MT',
    url: 'https://www.fiplan.mt.gov.br/Fiplan.jsp',
  },
  {
    id: 'avalia-mt-caed',
    nome: 'Avaliação e Monitoramento MT (CAEd)',
    orgao: 'Parceiros',
    url: 'https://avaliacaoemonitoramentomatogrosso.caeddigital.net/?utm_source=home&utm_medium=card-avalia-mt-caed&utm_campaign=default#!/pagina-inicial',
  },
  {
    id: 'sga-municipios-fgv',
    nome: 'SGA Municípios (FGV)',
    orgao: 'Parceiros',
    url: 'https://sga.municipios.fgv.br/access/login',
  },
];
