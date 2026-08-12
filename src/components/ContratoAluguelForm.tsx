 "use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Printer, Home, KeyRound } from "lucide-react";
import { ContratoAluguelFormData, TestemunhaData } from "@/types/aluguel";
import { gerarTextoContratoAluguel } from "@/templates/contrato-aluguel";

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
const estados = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const estadosCivis = [
  "Solteiro(a)","Casado(a)","Divorciado(a)","Viúvo(a)","União Estável",
];

const opcoesClausulasProprietario = [
  { id: "proibir_animais", label: "Proibir animais de estimação" },
  { id: "proibir_som_alto", label: "Proibir som alto / perturbação do sossego" },
  { id: "limite_pessoas", label: "Definir limite máximo de pessoas no imóvel" },
  { id: "proibir_sublocacao", label: "Proibir sublocação (caso permitida no contrato)" },
  { id: "vistoria_periodica", label: "Permitir vistoria periódica pelo proprietário" },
];

const opcoesClausulasInquilino = [
  { id: "manter_limpo", label: "Manter o imóvel limpo e conservado" },
  { id: "nao_alterar", label: "Não realizar alterações sem autorização escrita" },
  { id: "informar_danos", label: "Informar imediatamente qualquer dano ou defeito" },
  { id: "respeitar_condominio", label: "Respeitar normas de condomínio e vizinhança" },
  { id: "devolver_igual", label: "Devolver o imóvel nas mesmas condições de recebimento" },
];

function maskCPF(v?: string | null) {
  if (!v) return "";
  let s = v.replace(/\D/g, "").slice(0, 11);
  s = s.replace(/(\d{3})(\d)/, "$1.$2");
  s = s.replace(/(\d{3})(\d)/, "$1.$2");
  s = s.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return s;
}

function maskCNPJ(v?: string | null) {
  if (!v) return "";
  let s = v.replace(/\D/g, "").slice(0, 14);
  s = s.replace(/^(\d{2})(\d)/, "$1.$2");
  s = s.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  s = s.replace(/\.(\d{3})(\d)/, ".$1/$2");
  s = s.replace(/(\d{4})(\d)/, "$1-$2");
  return s;
}

function maskCEP(v?: string | null) {
  if (!v) return "";
  let s = v.replace(/\D/g, "").slice(0, 8);
  s = s.replace(/(\d{5})(\d)/, "$1-$2");
  return s;
}

function maskMoney(v?: string | null) {
  if (!v) return "";
  const n = parseFloat(v.replace(/\D/g, "")) / 100;
  if (isNaN(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function unmaskMoney(v?: string | null) {
  if (!v) return 0;
  return parseFloat(v.replace(/\D/g, "")) / 100 || 0;
}

/* ============================================================
   SUB-COMPONENTES
   ============================================================ */
function EnderecoForm({ prefix, register, setValue }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input {...register(`${prefix}.rua`)} placeholder="Rua" />
      <Input {...register(`${prefix}.numero`)} placeholder="Número" />
      <Input {...register(`${prefix}.complemento`)} placeholder="Complemento (opcional)" />
      <Input {...register(`${prefix}.bairro`)} placeholder="Bairro" />
      <Input {...register(`${prefix}.cidade`)} placeholder="Cidade" />
      <select {...register(`${prefix}.estado`)} className="border rounded p-2 h-10">
        <option value="">UF</option>
        {estados.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
      </select>
      <Input
        {...register(`${prefix}.cep`)}
        placeholder="CEP"
        onChange={(e) => {
          const v = maskCEP(e.target.value);
          e.target.value = v;
          setValue(`${prefix}.cep`, v);
        }}
      />
    </div>
  );
}

function DocumentosForm({ prefix, register, setValue }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input {...register(`${prefix}.rg`)} placeholder="Identidade (RG)" />
      <Input {...register(`${prefix}.orgaoEmissor`)} placeholder="Órgão Emissor" />
      <Input {...register(`${prefix}.ssp`)} placeholder="SSP/Estado" />
      <select {...register(`${prefix}.estadoCivil`)} className="border rounded p-2 h-10">
        <option value="">Estado Civil</option>
        {estadosCivis.map((ec) => <option key={ec} value={ec}>{ec}</option>)}
      </select>
      <Input
        {...register(`${prefix}.cpf`)}
        placeholder="CPF"
        onChange={(e) => {
          const v = maskCPF(e.target.value);
          e.target.value = v;
          setValue(`${prefix}.cpf`, v);
        }}
      />
    </div>
  );
}

function PessoaForm({ prefix, register, setValue, watch, tipos }: any) {
  const tipo = (watch(`${prefix}.tipo`) as string) || tipos[0].value;

  return (
    <div className="space-y-3">
      <div className="flex gap-4 mb-2">
        {tipos.map((t: any) => (
          <label key={t.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value={t.value}
              {...register(`${prefix}.tipo`)}
              defaultChecked={t.value === tipos[0].value}
            />
            {t.label}
          </label>
        ))}
      </div>

      {tipo === "pf" || tipo === "mei" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input {...register(`${prefix}.nome`)} placeholder="Nome completo" />
            <Input {...register(`${prefix}.nacionalidade`)} placeholder="Nacionalidade" defaultValue="Brasileiro(a)" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input {...register(`${prefix}.profissao`)} placeholder="Profissão" />
            {tipo === "mei" && (
              <Input
                {...register(`${prefix}.cnpj`)}
                placeholder="CNPJ (MEI)"
                onChange={(e) => {
                  const v = maskCNPJ(e.target.value);
                  e.target.value = v;
                  setValue(`${prefix}.cnpj`, v);
                }}
              />
            )}
          </div>
          <Separator className="my-2" />
          <p className="text-sm font-bold text-gray-600">Documentos</p>
          <DocumentosForm prefix={`${prefix}.documentos`} register={register} setValue={setValue} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input {...register(`${prefix}.razaoSocial`)} placeholder="Razão Social" />
            <Input
              {...register(`${prefix}.cnpj`)}
              placeholder="CNPJ"
              onChange={(e) => {
                const v = maskCNPJ(e.target.value);
                e.target.value = v;
                setValue(`${prefix}.cnpj`, v);
              }}
            />
          </div>
          <Separator className="my-2" />
          <p className="text-sm font-bold text-gray-600">Representante Legal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input {...register(`${prefix}.representanteNome`)} placeholder="Nome do representante" />
            <Input {...register(`${prefix}.representanteCargo`)} placeholder="Cargo" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Input {...register(`${prefix}.nome`)} placeholder="Nome do representante (para contrato)" />
            <Input {...register(`${prefix}.nacionalidade`)} placeholder="Nacionalidade" defaultValue="Brasileiro(a)" />
            <Input {...register(`${prefix}.profissao`)} placeholder="Profissão" />
          </div>
          <Separator className="my-2" />
          <p className="text-sm font-bold text-gray-600">Documentos do Representante</p>
          <DocumentosForm prefix={`${prefix}.documentos`} register={register} setValue={setValue} />
        </>
      )}

      <Separator className="my-2" />
      <p className="text-sm font-bold text-gray-600">Endereço</p>
      <EnderecoForm prefix={`${prefix}.endereco`} register={register} setValue={setValue} />
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
const steps = [
  "Tipo",
  "Proprietário",
  "Inquilino",
  "Imóvel",
  "Prazo",
  "Aluguel",
  "Garantia",
  "Melhorias",
  "Despesas",
  "Multas",
  "Cláusulas",
  "Assinatura",
  "Preview",
];

export default function ContratoAluguelForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [contratoHTML, setContratoHTML] = useState("");

  const { register, handleSubmit, watch, setValue, getValues } = useForm<ContratoAluguelFormData>({
    defaultValues: {
      tipoContrato: "residencial",
      locador: {
        tipo: "pf",
        nome: "",
        nacionalidade: "Brasileiro(a)",
        profissao: "",
        documentos: { rg: "", orgaoEmissor: "", ssp: "", estadoCivil: "", cpf: "" },
        endereco: { rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "SP", cep: "" },
      },
      locatario: {
        tipo: "pf",
        nome: "",
        nacionalidade: "Brasileiro(a)",
        profissao: "",
        documentos: { rg: "", orgaoEmissor: "", ssp: "", estadoCivil: "", cpf: "" },
        endereco: { rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "SP", cep: "" },
      },
      imovel: {
        endereco: { rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "SP", cep: "" },
        detalhes: { tipoImovel: "casa", metragem: 0, quartos: 0, banheiros: 0, salas: 0, piscina: false, areaLazer: false, descricao: "" },
        temMatricula: false,
      },
      prazo: { tipo: "determinado", meses: 12, dataInicialPosse: "", permiteSublocar: false },
      aluguel: { valor: 0, diaPagamento: 5, meioPagamento: "pix", indiceReajuste: "igpm", multaAtrasoPct: 2, dadosBancarios: { banco: "", agencia: "", conta: "", tipoConta: "", chavePix: "" } },
      garantia: { tipo: "caucao", tipoCaucao: "meses", mesesCaucao: 1 },
      melhorias: { essencial: "proprietario", naoEssencial: "inquilino" },
      despesas: { iptu: "proprietario", seguroIncendio: "inquilino" },
      multas: { descumprimento: { tem: false, valor: 0 }, rompimento: { tem: false, valor: 0 } },
      clausulas: { proprietario: [], inquilino: [], limitePessoas: undefined },
      assinatura: { cidade: "", estado: "SP", dia: "", mes: "", ano: "2026" },
      testemunhas: [],
    },
  });

  const tipoContrato = (watch("tipoContrato") as string) || "residencial";
  const prazoTipo = (watch("prazo.tipo") as string) || "determinado";
  const meioPagamento = (watch("aluguel.meioPagamento") as string) || "";
  const garantiaTipo = (watch("garantia.tipo") as string) || "";
  const tipoCaucao = (watch("garantia.tipoCaucao") as string) || "";
  const temLimiteFiador = (watch("garantia.fiador.temLimite") as boolean) || false;
  const temMatricula = (watch("imovel.temMatricula") as boolean) || false;
  const temMultaDesc = (watch("multas.descumprimento.tem") as boolean) || false;
  const temMultaRomp = (watch("multas.rompimento.tem") as boolean) || false;
  const testemunhas = (watch("testemunhas") || []) as any[];
  const clausulasProp = (watch("clausulas.proprietario") || []) as string[];
  const clausulasInq = (watch("clausulas.inquilino") || []) as string[];

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const setTestemunhas = (qtd: number) => {
    const arr: TestemunhaData[] = [];
    for (let i = 0; i < qtd; i++) arr.push({ nome: "", rg: "", cpf: "" });
    setValue("testemunhas", arr);
  };

  const toggleClausula = (tipo: "proprietario" | "inquilino", id: string) => {
    const atual = getValues(`clausulas.${tipo}`) || [];
    const novo = (atual as string[]).includes(id) ? (atual as string[]).filter((x) => x !== id) : [...(atual as string[]), id];
    setValue(`clausulas.${tipo}`, novo as any);
  };

  const onSubmit = (data: ContratoAluguelFormData) => {
    const html = gerarTextoContratoAluguel(data);
    setContratoHTML(html);
    nextStep();
  };

  const gerarPDF = () => {
    if (!contratoHTML) {
      alert("Gere o contrato primeiro antes de imprimir.");
      return;
    }
    const win = window.open("", "_blank");
    if (!win) {
      alert("Permita pop-ups para gerar o PDF.");
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Contrato de Locação</title>
        <style>
          @page { size: A4; margin: 10mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; text-align: justify; }
          h1 { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 20px; }
          h2 { text-align: center; font-size: 12pt; font-weight: bold; margin: 15px 0; }
          p { margin-bottom: 10px; }
          strong { font-weight: bold; }
        </style>
      </head>
      <body onload="setTimeout(() => window.print(), 500)">
        ${contratoHTML}
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
            <KeyRound className="w-6 h-6 text-emerald-600" />
            Gerador de Contrato - Locação de Imóvel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Steps */}
          <div className="flex flex-wrap justify-between mb-6 text-xs sm:text-sm gap-1">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex-1 text-center px-1 py-2 rounded cursor-pointer transition-colors ${
                  idx === currentStep ? "bg-emerald-600 text-white" : idx < currentStep ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                }`}
                onClick={() => setCurrentStep(idx)}
              >
                {idx + 1}. {step}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ========== PASSO 0: TIPO ========== */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Tipo do Contrato</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-xl p-6 cursor-pointer text-center transition-all ${
                      tipoContrato === "residencial" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"
                    }`}
                    onClick={() => setValue("tipoContrato", "residencial")}
                  >
                    <Home className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                    <p className="font-bold text-lg">Residencial</p>
                    <p className="text-sm text-gray-500">Casa, apartamento, kitnet, chácara...</p>
                  </div>
                  <div
                    className={`border-2 rounded-xl p-6 cursor-pointer text-center transition-all ${
                      tipoContrato === "comercial" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"
                    }`}
                    onClick={() => setValue("tipoContrato", "comercial")}
                  >
                    <KeyRound className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                    <p className="font-bold text-lg">Comercial</p>
                    <p className="text-sm text-gray-500">Loja, escritório, galpão, sala...</p>
                  </div>
                </div>
              </div>
            )}

            {/* ========== PASSO 1: PROPRIETÁRIO ========== */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Dados do Proprietário (Locador)</h3>
                <PessoaForm
                  prefix="locador"
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  tipos={[
                    { value: "pf", label: "Pessoa Física" },
                    { value: "pj", label: "Pessoa Jurídica" },
                  ]}
                />
              </div>
            )}

            {/* ========== PASSO 2: INQUILINO ========== */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Dados do Inquilino (Locatário)</h3>
                <PessoaForm
                  prefix="locatario"
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  tipos={[
                    { value: "pf", label: "Pessoa Física" },
                    { value: "mei", label: "MEI" },
                    { value: "pj", label: "Pessoa Jurídica" },
                  ]}
                />
              </div>
            )}

            {/* ========== PASSO 3: IMÓVEL ========== */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Endereço do Imóvel Alugado</h3>
                <EnderecoForm prefix="imovel.endereco" register={register} setValue={setValue} />

                <Separator className="my-4" />
                <h3 className="text-lg font-bold">Detalhes do Imóvel</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo do Imóvel</Label>
                    <Select
                      value={String(watch("imovel.detalhes.tipoImovel") ?? "casa")}
                      onValueChange={(v) => setValue("imovel.detalhes.tipoImovel", v as any)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
                        <SelectItem value="chacara">Chácara</SelectItem>
                        <SelectItem value="kitnet">Kitnet</SelectItem>
                        <SelectItem value="loja">Loja</SelectItem>
                        <SelectItem value="sala_comercial">Sala Comercial</SelectItem>
                        <SelectItem value="galpao">Galpão</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Metragem (m²)</Label>
                    <Input type="number" step="0.01" {...register("imovel.detalhes.metragem", { valueAsNumber: true })} placeholder="Ex: 120" />
                  </div>
                  <div>
                    <Label>Quartos</Label>
                    <Input type="number" {...register("imovel.detalhes.quartos", { valueAsNumber: true })} placeholder="Ex: 3" />
                  </div>
                  <div>
                    <Label>Banheiros</Label>
                    <Input type="number" {...register("imovel.detalhes.banheiros", { valueAsNumber: true })} placeholder="Ex: 2" />
                  </div>
                  <div>
                    <Label>Salas</Label>
                    <Input type="number" {...register("imovel.detalhes.salas", { valueAsNumber: true })} placeholder="Ex: 1" />
                  </div>
                </div>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register("imovel.detalhes.piscina")} />
                    Possui piscina
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register("imovel.detalhes.areaLazer")} />
                    Possui área de lazer
                  </label>
                </div>
                <div>
                  <Label>Descrição / Outros detalhes</Label>
                  <textarea {...register("imovel.detalhes.descricao")} className="w-full p-2 border rounded min-h-[80px]" placeholder="Descreva o imóvel (piso, armários, etc.)" />
                </div>

                <Separator className="my-4" />
                <h3 className="text-lg font-bold">Matrícula do Imóvel (opcional)</h3>
                <div className="flex gap-4 mb-3">
                  <Button type="button" onClick={() => setValue("imovel.temMatricula", false)} variant={!temMatricula ? "default" : "outline"} size="sm">Não possui</Button>
                  <Button type="button" onClick={() => setValue("imovel.temMatricula", true)} variant={temMatricula ? "default" : "outline"} size="sm">Possui matrícula</Button>
                </div>
                {temMatricula && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input {...register("imovel.matricula")} placeholder="Número da matrícula" />
                    <Input {...register("imovel.cartorioRegistro")} placeholder="Cartório de Registro" />
                  </div>
                )}
              </div>
            )}

            {/* ========== PASSO 4: PRAZO ========== */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Prazo da Locação</h3>
                <div className="flex gap-4 mb-4">
                  <Button type="button" onClick={() => setValue("prazo.tipo", "determinado")} variant={prazoTipo === "determinado" ? "default" : "outline"}>Determinado</Button>
                  <Button type="button" onClick={() => setValue("prazo.tipo", "indeterminado")} variant={prazoTipo === "indeterminado" ? "default" : "outline"}>Indeterminado</Button>
                </div>

                {prazoTipo === "determinado" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Duração (meses)</Label>
                      <Input type="number" {...register("prazo.meses", { valueAsNumber: true })} placeholder="Ex: 12" />
                    </div>
                    <div>
                      <Label>Data Inicial de Posse</Label>
                      <Input type="date" {...register("prazo.dataInicialPosse")} />
                    </div>
                  </div>
                )}

                {prazoTipo === "indeterminado" && (
                  <div>
                    <Label>Data Inicial de Posse</Label>
                    <Input type="date" {...register("prazo.dataInicialPosse")} />
                  </div>
                )}

                <div className="mt-4">
                  <Label className="mb-2 block font-bold">Permite sublocar o imóvel?</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={!watch("prazo.permiteSublocar")} onChange={() => setValue("prazo.permiteSublocar", false)} />
                      Não
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={!!watch("prazo.permiteSublocar")} onChange={() => setValue("prazo.permiteSublocar", true)} />
                      Sim
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ========== PASSO 5: ALUGUEL ========== */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Informações do Aluguel</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor do Aluguel Mensal</Label>
                    <Input
                      value={watch("aluguel.valor") ? maskMoney(String((Number(watch("aluguel.valor") ?? 0)) * 100)) : ""}
                      onChange={(e) => setValue("aluguel.valor", unmaskMoney(e.target.value))}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div>
                    <Label>Dia do Pagamento (de cada mês)</Label>
                    <Input type="number" min={1} max={31} {...register("aluguel.diaPagamento", { valueAsNumber: true })} placeholder="Ex: 5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Meio de Pagamento</Label>
                    <Select
                      value={String(watch("aluguel.meioPagamento") ?? "")}
                      onValueChange={(v) => setValue("aluguel.meioPagamento", v as any)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="boleto">Boleto Bancário</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Índice de Reajuste Anual</Label>
                    <Select
                      value={String(watch("aluguel.indiceReajuste") ?? "")}
                      onValueChange={(v) => setValue("aluguel.indiceReajuste", v as any)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ipca">IPCA</SelectItem>
                        <SelectItem value="igpm">IGP-M</SelectItem>
                        <SelectItem value="incc">INCC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Multa por Atraso (%)</Label>
                  <Input type="number" step="0.1" {...register("aluguel.multaAtrasoPct", { valueAsNumber: true })} placeholder="Ex: 2" />
                </div>

                {meioPagamento === "transferencia" && (
                  <div className="border p-4 rounded bg-gray-50 space-y-3">
                    <h4 className="font-bold">Dados Bancários para Transferência</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input {...register("aluguel.dadosBancarios.banco" as any)} placeholder="Nome do Banco" />
                      <Input {...register("aluguel.dadosBancarios.agencia" as any)} placeholder="Agência" />
                      <Input {...register("aluguel.dadosBancarios.conta" as any)} placeholder="Conta" />
                      <Input {...register("aluguel.dadosBancarios.tipoConta" as any)} placeholder="Tipo de Conta (Corrente/Poupança)" />
                    </div>
                  </div>
                )}

                {meioPagamento === "pix" && (
                  <div className="border p-4 rounded bg-gray-50 space-y-3">
                    <h4 className="font-bold">Chave PIX</h4>
                    <Input {...register("aluguel.dadosBancarios.chavePix" as any)} placeholder="CPF, CNPJ, E-mail, Celular ou Chave Aleatória" />
                  </div>
                )}
              </div>
            )}

            {/* ========== PASSO 6: GARANTIA ========== */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Garantia da Locação</h3>
                <div className="flex gap-3 flex-wrap">
                  <Button type="button" onClick={() => setValue("garantia.tipo", "caucao")} variant={garantiaTipo === "caucao" ? "default" : "outline"}>Caução</Button>
                  <Button type="button" onClick={() => setValue("garantia.tipo", "fiador")} variant={garantiaTipo === "fiador" ? "default" : "outline"}>Fiador</Button>
                  <Button type="button" onClick={() => setValue("garantia.tipo", "seguro")} variant={garantiaTipo === "seguro" ? "default" : "outline"}>Seguro Fiança</Button>
                </div>

                {garantiaTipo === "caucao" && (
                  <div className="border p-4 rounded bg-gray-50 space-y-4">
                    <h4 className="font-bold">Caução</h4>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={tipoCaucao === "fixo"} onChange={() => setValue("garantia.tipoCaucao", "fixo")} />
                        Valor Fixo (R$)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={tipoCaucao === "meses"} onChange={() => setValue("garantia.tipoCaucao", "meses")} />
                        X meses de aluguel
                      </label>
                    </div>
                    {tipoCaucao === "fixo" ? (
                      <Input
                        value={watch("garantia.valorCaucao") ? maskMoney(String((Number(watch("garantia.valorCaucao") ?? 0)) * 100)) : ""}
                        onChange={(e) => setValue("garantia.valorCaucao", unmaskMoney(e.target.value))}
                        placeholder="R$ 0,00"
                      />
                    ) : (
                      <Input type="number" {...register("garantia.mesesCaucao", { valueAsNumber: true })} placeholder="Ex: 2 meses" />
                    )}
                  </div>
                )}

                {garantiaTipo === "seguro" && (
                  <div className="border p-4 rounded bg-gray-50 space-y-4">
                    <h4 className="font-bold">Seguro Fiança</h4>
                    <Input {...register("garantia.seguroNome" as any)} placeholder="Nome da Seguradora" />
                    <Input
                      value={watch("garantia.seguroValor") ? maskMoney(String((Number(watch("garantia.seguroValor") ?? 0)) * 100)) : ""}
                      onChange={(e) => setValue("garantia.seguroValor", unmaskMoney(e.target.value))}
                      placeholder="Valor da Cobertura (R$)"
                    />
                  </div>
                )}

                {garantiaTipo === "fiador" && (
                  <div className="border p-4 rounded bg-gray-50 space-y-4">
                    <h4 className="font-bold">Fiador</h4>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!temLimiteFiador} onChange={() => setValue("garantia.fiador.temLimite", false)} />
                        Sem limite (responde por tudo)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!!temLimiteFiador} onChange={() => setValue("garantia.fiador.temLimite", true)} />
                        Com limite de valor
                      </label>
                    </div>
                    {temLimiteFiador && (
                      <Input
                        value={watch("garantia.fiador.valorLimite") ? maskMoney(String((Number(watch("garantia.fiador.valorLimite") ?? 0)) * 100)) : ""}
                        onChange={(e) => setValue("garantia.fiador.valorLimite", unmaskMoney(e.target.value))}
                        placeholder="Valor limite do fiador (R$)"
                      />
                    )}

                    <Separator className="my-2" />
                    <p className="text-sm font-bold text-gray-600">Dados Pessoais do Fiador</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input {...register("garantia.fiador.nome" as any)} placeholder="Nome completo" />
                      <Input {...register("garantia.fiador.nacionalidade" as any)} placeholder="Nacionalidade" defaultValue="Brasileiro(a)" />
                      <Input {...register("garantia.fiador.profissao" as any)} placeholder="Profissão" />
                    </div>
                    <DocumentosForm prefix="garantia.fiador.documentos" register={register} setValue={setValue} />
                    <Separator className="my-2" />
                    <p className="text-sm font-bold text-gray-600">Endereço do Fiador</p>
                    <EnderecoForm prefix="garantia.fiador.endereco" register={register} setValue={setValue} />
                  </div>
                )}
              </div>
            )}

            {/* ========== PASSO 7: MELHORIAS ========== */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Melhorias e Construção</h3>
                <div>
                  <Label className="mb-2 block">Melhoria Essencial - quem assume?</Label>
                  <Select
                    value={String(watch("melhorias.essencial") ?? "proprietario")}
                    onValueChange={(v) => setValue("melhorias.essencial", v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietario">Proprietário (Locador)</SelectItem>
                      <SelectItem value="inquilino">Inquilino (Locatário)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Obras Não Essenciais - quem assume?</Label>
                  <Select
                    value={String(watch("melhorias.naoEssencial") ?? "inquilino")}
                    onValueChange={(v) => setValue("melhorias.naoEssencial", v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietario">Proprietário (Locador)</SelectItem>
                      <SelectItem value="inquilino">Inquilino (Locatário)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ========== PASSO 8: DESPESAS ========== */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Despesas do Imóvel</h3>
                <div>
                  <Label className="mb-2 block">Quem pagará o IPTU?</Label>
                  <Select
                    value={String(watch("despesas.iptu") ?? "proprietario")}
                    onValueChange={(v) => setValue("despesas.iptu", v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietario">Proprietário (Locador)</SelectItem>
                      <SelectItem value="inquilino">Inquilino (Locatário)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Quem pagará o Seguro contra Incêndio?</Label>
                  <Select
                    value={String(watch("despesas.seguroIncendio") ?? "inquilino")}
                    onValueChange={(v) => setValue("despesas.seguroIncendio", v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguem">Ninguém (não será contratado)</SelectItem>
                      <SelectItem value="proprietario">Proprietário (Locador)</SelectItem>
                      <SelectItem value="inquilino">Inquilino (Locatário)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ========== PASSO 9: MULTAS ========== */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Multas Contratuais</h3>

                <div className="border p-4 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Multa por descumprimento de cláusulas?</Label>
                    <div className="flex gap-3">
                      <Button type="button" size="sm" onClick={() => setValue("multas.descumprimento.tem", true)} variant={temMultaDesc ? "default" : "outline"}>Sim</Button>
                      <Button type="button" size="sm" onClick={() => setValue("multas.descumprimento.tem", false)} variant={!temMultaDesc ? "default" : "outline"}>Não</Button>
                    </div>
                  </div>
                  {temMultaDesc && (
                    <Input
                      value={watch("multas.descumprimento.valor") ? maskMoney(String((Number(watch("multas.descumprimento.valor") ?? 0)) * 100)) : ""}
                      onChange={(e) => setValue("multas.descumprimento.valor", unmaskMoney(e.target.value))}
                      placeholder="Valor da multa (R$)"
                    />
                  )}
                </div>

                <div className="border p-4 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Multa por rompimento antes do prazo?</Label>
                    <div className="flex gap-3">
                      <Button type="button" size="sm" onClick={() => setValue("multas.rompimento.tem", true)} variant={temMultaRomp ? "default" : "outline"}>Sim</Button>
                      <Button type="button" size="sm" onClick={() => setValue("multas.rompimento.tem", false)} variant={!temMultaRomp ? "default" : "outline"}>Não</Button>
                    </div>
                  </div>
                  {temMultaRomp && (
                    <Input
                      value={watch("multas.rompimento.valor") ? maskMoney(String((Number(watch("multas.rompimento.valor") ?? 0)) * 100)) : ""}
                      onChange={(e) => setValue("multas.rompimento.valor", unmaskMoney(e.target.value))}
                      placeholder="Valor da multa (R$)"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ========== PASSO 10: CLÁUSULAS ESPECIAIS ========== */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Cláusulas e Obrigações Especiais</h3>

                <div className="border p-4 rounded bg-gray-50">
                  <h4 className="font-bold mb-3">Obrigações / Restrições ao Proprietário (Locador)</h4>
                  <div className="space-y-2">
                    {opcoesClausulasProprietario.map((op) => (
                      <label key={op.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clausulasProp.includes(op.id)}
                          onChange={() => toggleClausula("proprietario", op.id)}
                        />
                        {op.label}
                      </label>
                    ))}
                  </div>
                  {clausulasProp.includes("limite_pessoas") && (
                    <div className="mt-2">
                      <Input type="number" {...register("clausulas.limitePessoas" as any, { valueAsNumber: true })} placeholder="Máximo de pessoas no imóvel" />
                    </div>
                  )}
                </div>

                <div className="border p-4 rounded bg-gray-50">
                  <h4 className="font-bold mb-3">Obrigações / Restrições ao Inquilino (Locatário)</h4>
                  <div className="space-y-2">
                    {opcoesClausulasInquilino.map((op) => (
                      <label key={op.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clausulasInq.includes(op.id)}
                          onChange={() => toggleClausula("inquilino", op.id)}
                        />
                        {op.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== PASSO 11: ASSINATURA ========== */}
            {currentStep === 11 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Local e Data da Assinatura</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input {...register("assinatura.cidade")} placeholder="Cidade" />
                  <select {...register("assinatura.estado")} className="border rounded p-2 h-10">
                    {estados.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                  <Input {...register("assinatura.dia")} placeholder="Dia (ex: 31)" />
                  <Input {...register("assinatura.mes")} placeholder="Mês por extenso (ex: Setembro)" />
                  <Input {...register("assinatura.ano")} placeholder="Ano (ex: 2026)" />
                </div>

                <Separator className="my-4" />
                <h3 className="text-lg font-bold">Testemunhas</h3>
                <div className="flex gap-4 mb-4">
                  <Button type="button" onClick={() => setTestemunhas(0)} variant={testemunhas.length === 0 ? "default" : "outline"} size="sm">Nenhuma</Button>
                  <Button type="button" onClick={() => setTestemunhas(1)} variant={testemunhas.length === 1 ? "default" : "outline"} size="sm">1 Testemunha</Button>
                  <Button type="button" onClick={() => setTestemunhas(2)} variant={testemunhas.length === 2 ? "default" : "outline"} size="sm">2 Testemunhas</Button>
                </div>

                {testemunhas.map((_: any, index: number) => (
                  <div key={index} className="border p-4 rounded mb-2 space-y-2">
                    <h4 className="font-bold">Testemunha {index + 1}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input {...register(`testemunhas.${index}.nome` as any)} placeholder="Nome completo" />
                      <Input {...register(`testemunhas.${index}.rg`)} placeholder="RG" />
                      <Input
                        {...register(`testemunhas.${index}.cpf`)}
                        placeholder="CPF"
                        onChange={(e) => {
                          const v = maskCPF(e.target.value);
                          e.target.value = v;
                          setValue(`testemunhas.${index}.cpf`, v);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========== PASSO 12: PREVIEW ========== */}
            {currentStep === 12 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Preview do Contrato</h3>
                  <Button
                    type="button"
                    onClick={gerarPDF}
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir / PDF
                  </Button>
                </div>
                <div
                  id="contrato-preview"
                  className="border rounded p-4 bg-white overflow-auto max-h-[600px]"
                >
                  <div dangerouslySetInnerHTML={{ __html: contratoHTML }} />
                </div>
              </div>
            )}

            {/* ========== BOTÕES DE NAVEGAÇÃO ========== */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              {currentStep === steps.length - 2 && (
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Gerar Contrato
                </Button>
              )}

              {currentStep < steps.length - 2 && (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <Button
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    setContratoHTML("");
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Novo Contrato
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}