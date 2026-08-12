/* ============================================================
   TIPOS BASE
   ============================================================ */

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Documentos {
  rg: string;
  orgaoEmissor: string;
  ssp: string;
  estadoCivil: string;
  cpf: string;
}

export interface DadosBancarios {
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoConta?: string;
  chavePix?: string;
}

/* ============================================================
   LOCADOR
   ============================================================ */

export interface LocadorPF {
  tipo: "pf";
  nome: string;
  nacionalidade: string;
  profissao: string;
  documentos: Documentos;
  endereco: Endereco;
}

export interface LocadorPJ {
  tipo: "pj";
  razaoSocial: string;
  cnpj: string;
  representanteNome: string;
  representanteCargo: string;
  nome: string;
  nacionalidade: string;
  profissao: string;
  documentos: Documentos;
  endereco: Endereco;
}

export type LocadorData = LocadorPF | LocadorPJ;

/* ============================================================
   LOCATÁRIO
   ============================================================ */

export interface LocatarioPF {
  tipo: "pf";
  nome: string;
  nacionalidade: string;
  profissao: string;
  documentos: Documentos;
  endereco: Endereco;
}

export interface LocatarioMEI {
  tipo: "mei";
  nome: string;
  nacionalidade: string;
  profissao: string;
  cnpj: string;
  razaoSocial?: string;
  representanteNome?: string;
  representanteCargo?: string;
  documentos: Documentos;
  endereco: Endereco;
}

export interface LocatarioPJ {
  tipo: "pj";
  razaoSocial: string;
  cnpj: string;
  representanteNome: string;
  representanteCargo: string;
  nome: string;
  nacionalidade: string;
  profissao: string;
  documentos: Documentos;
  endereco: Endereco;
}

export type LocatarioData = LocatarioPF | LocatarioMEI | LocatarioPJ;

/* ============================================================
   FIADOR
   ============================================================ */

export interface FiadorData {
  nome: string;
  documentos: Documentos;
  endereco: Endereco;
  profissao: string;
  nacionalidade: string;
  temLimite: boolean;
  valorLimite?: number;
}

/* ============================================================
   IMÓVEL
   ============================================================ */

export interface ImovelDetalhes {
  tipoImovel: string;
  metragem: number;
  quartos: number;
  banheiros: number;
  salas: number;
  piscina: boolean;
  areaLazer: boolean;
  descricao: string;
}

export interface ImovelData {
  endereco: Endereco;
  detalhes: ImovelDetalhes;
  temMatricula: boolean;
  matricula?: string;
  cartorioRegistro?: string;
}

/* ============================================================
   PRAZO
   ============================================================ */

export interface PrazoData {
  tipo: "determinado" | "indeterminado";
  meses?: number;
  dataInicialPosse: string;
  permiteSublocar: boolean;
}

/* ============================================================
   ALUGUEL
   ============================================================ */

export interface AluguelData {
  valor: number;
  diaPagamento: number;
  meioPagamento: "pix" | "dinheiro" | "boleto" | "cheque" | "transferencia";
  indiceReajuste: "ipca" | "igpm" | "incc";
  multaAtrasoPct: number;
  dadosBancarios?: DadosBancarios;
}

/* ============================================================
   GARANTIA
   ============================================================ */

export interface GarantiaData {
  tipo: "caucao" | "fiador" | "seguro";
  valorCaucao?: number;
  tipoCaucao?: "fixo" | "meses";
  mesesCaucao?: number;
  fiador?: FiadorData;
  seguroNome?: string;
  seguroValor?: number;
}

/* ============================================================
   MELHORIAS, DESPESAS, MULTAS, CLÁUSULAS
   ============================================================ */

export interface MelhoriasData {
  essencial: "proprietario" | "inquilino";
  naoEssencial: "proprietario" | "inquilino";
}

export interface DespesasData {
  iptu: "proprietario" | "inquilino";
  seguroIncendio: "ninguem" | "proprietario" | "inquilino";
}

export interface MultaItem {
  tem: boolean;
  valor?: number;
}

export interface MultasData {
  descumprimento: MultaItem;
  rompimento: MultaItem;
}

export interface ClausulasEspeciais {
  proprietario: string[];
  inquilino: string[];
  limitePessoas?: number;
}

/* ============================================================
   ASSINATURA E TESTEMUNHAS
   ============================================================ */

export interface TestemunhaData {
  nome: string;
  rg: string;
  cpf: string;
}

export interface AssinaturaData {
  cidade: string;
  estado: string;
  dia: string;
  mes: string;
  ano: string;
}

/* ============================================================
   CONTRATO COMPLETO
   ============================================================ */

export interface ContratoAluguelFormData {
  tipoContrato: "residencial" | "comercial";
  locador: LocadorData;
  locatario: LocatarioData;
  imovel: ImovelData;
  prazo: PrazoData;
  aluguel: AluguelData;
  garantia: GarantiaData;
  melhorias: MelhoriasData;
  despesas: DespesasData;
  multas: MultasData;
  clausulas: ClausulasEspeciais;
  assinatura: AssinaturaData;
  testemunhas: TestemunhaData[];
}