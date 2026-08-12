export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
}

export interface PessoaFisica {
  tipo: 'pf';
  nome: string;
  nacionalidade: string;
  estadoCivil: 'solteiro' | 'solteira' | 'casado' | 'casada' | 'uniao_estavel' | 'divorciado' | 'divorciada' | 'viuvo' | 'viuva';
  profissao: string;
  rg: string;
  cpf: string;
  endereco: Endereco;
}

export interface PessoaJuridica {
  tipo: 'pj';
  razaoSocial: string;
  cnpj: string;
  nire?: string;
  representante: {
    nome: string;
    cpf: string;
    cargo: string;
    rg: string;
    nacionalidade: string;
    estadoCivil: string;
    profissao: string;
    endereco: Endereco;
  };
  endereco: Endereco;
}

export type Parte = PessoaFisica | PessoaJuridica;

export interface Imovel {
  endereco: Endereco;
  matricula: string;
  cartorioRegistro: string;
  inscricaoMunicipal: string;
  area: number; // em m²
  descricao: string;
  confrontacoes?: string;
}

export type OcupacaoImovel = 
  | 'uso_proprio_vendedor'
  | 'alugado_arrendado'
  | 'financiamento_quitado'
  | 'financiamento_vendedor_quita'
  | 'financiamento_comprador_assume'
  | 'financiamento_vendedor_quita_antes';

export type DebitoImovel =
  | 'sem_debitos'
  | 'vendedor_quita_antes'
  | 'comprador_assume'
  | 'dividido_50_50';

// NOVO: Interface completa do corretor (substitui o enum antigo)
export interface CorretorInfo {
  nome: string;
  creci: string;
  tipoComissao: 'porcentagem' | 'valor_fixo';
  valorComissao: number;
  quemPaga: 'vendedor' | 'comprador' | 'dividido_50_50';
}

export type FormaPagamento =
  | 'avista'
  | 'sinal_resto_avista'
  | 'sinal_financiamento'
  | 'parcelado_vendedor';

export type CorrecaoMonetaria =
  | 'fixa'
  | 'ipca_12_meses';

export type CustoTransferencia =
  | 'comprador'
  | 'vendedor'
  | 'dividido_50_50';

export type FormaRecebimento =
  | 'pix'
  | 'transferencia'
  | 'dinheiro'
  | 'outro';

export type PosseImovel =
  | 'pagamento_concluido'
  | 'assinatura_contrato'
  | 'data_combinada';

export type Desistencia =
  | 'nao_permite'
  | 'sim_com_prazo';

export interface Parcela {
  quantidade: number;
  valor: number;
  vencimentoPrimeira: string; // data no formato yyyy-mm-dd
  periodicidade: 'mensal' | 'bimestral' | 'trimestral' | 'semestral';
}

export interface Testemunha {
  nome: string;
  cpf: string;
  rg: string;
}

export interface DadosContrato {
  vendedores: Parte[];
  compradores: Parte[];
  imovel: Imovel;
  ocupacao: OcupacaoImovel;
  debitos: DebitoImovel;
  // ALTERADO: agora é CorretorInfo | null (null = não houve corretor)
  corretor: CorretorInfo | null;
  formaPagamento: FormaPagamento;
  valorTotal: number;
  valorSinal?: number;
  parcelas?: Parcela;
  multaAtraso: number; // %
  jurosMes: number; // %
  diasToleranciaDesfazer: number;
  correcaoMonetaria: CorrecaoMonetaria;
  desistencia: Desistencia;
  prazoDesistencia?: number; // dias
  multaQuebra: number; // %
  prazoEscritura: number; // dias após quitação
  custoTransferencia: CustoTransferencia;
  formaRecebimento: FormaRecebimento;
  formaRecebimentoOutro?: string;
  posse: PosseImovel;
  dataPosseCombinada?: string;
  testemunhas: Testemunha[];
  localAssinatura: string;
  dataContrato: string;
}