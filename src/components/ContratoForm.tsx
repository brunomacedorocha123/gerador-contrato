"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contratoSchema, ContratoFormData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { gerarTextoContrato } from "@/templates/contrato-imovel";
import { gerarPDF } from "@/components/PdfGenerator";

const steps = [
  "Vendedor(es)",
  "Comprador(es)",
  "Imóvel",
  "Situação",
  "Pagamento",
  "Cláusulas",
  "Assinatura",
  "Preview",
];

const estadosCivis = [
  { value: "solteiro", label: "Solteiro" },
  { value: "solteira", label: "Solteira" },
  { value: "casado", label: "Casado" },
  { value: "casada", label: "Casada" },
  { value: "uniao_estavel", label: "Em União Estável" },
  { value: "divorciado", label: "Divorciado" },
  { value: "divorciada", label: "Divorciada" },
  { value: "viuvo", label: "Viúvo" },
  { value: "viuva", label: "Viúva" },
];

const estados = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function maskCPF(v: string) {
  v = v.replace(/\D/g, "").slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
}

function maskCNPJ(v: string) {
  v = v.replace(/\D/g, "").slice(0, 14);
  v = v.replace(/^(\d{2})(\d)/, "$1.$2");
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
  v = v.replace(/(\d{4})(\d)/, "$1-$2");
  return v;
}

function maskCEP(v: string) {
  v = v.replace(/\D/g, "").slice(0, 8);
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v;
}

function maskMoney(v: string) {
  v = v.replace(/\D/g, "");
  const n = parseFloat(v) / 100;
  if (isNaN(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function unmaskMoney(v: string) {
  return parseFloat(v.replace(/\D/g, "")) / 100 || 0;
}

export default function ContratoForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [contratoHTML, setContratoHTML] = useState("");

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      vendedores: [{ tipo: "pf", nome: "", nacionalidade: "Brasileiro(a)", estadoCivil: "solteiro", profissao: "", rg: "", cpf: "", endereco: { rua: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", estado: "SP" } }],
      compradores: [{ tipo: "pf", nome: "", nacionalidade: "Brasileiro(a)", estadoCivil: "solteiro", profissao: "", rg: "", cpf: "", endereco: { rua: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", estado: "SP" } }],
      imovel: { endereco: { rua: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", estado: "SP" }, matricula: "", cartorioRegistro: "", inscricaoMunicipal: "", area: 0, descricao: "" },
      ocupacao: "uso_proprio_vendedor",
      debitos: "sem_debitos",
      corretor: null,
      formaPagamento: "avista",
      valorTotal: 0,
      multaAtraso: 2,
      jurosMes: 1,
      diasToleranciaDesfazer: 90,
      correcaoMonetaria: "fixa",
      desistencia: "nao_permite",
      multaQuebra: 10,
      prazoEscritura: 30,
      custoTransferencia: "comprador",
      formaRecebimento: "pix",
      posse: "assinatura_contrato",
      testemunhas: [],
      localAssinatura: "",
      dataContrato: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    },
  });

  const { fields: vendedoresFields, append: appendVendedor, remove: removeVendedor } = useFieldArray({ control, name: "vendedores" });
  const { fields: compradoresFields, append: appendComprador, remove: removeComprador } = useFieldArray({ control, name: "compradores" });

  const formaPagamento = watch("formaPagamento");
  const desistencia = watch("desistencia");
  const posse = watch("posse");
  const formaRecebimento = watch("formaRecebimento");
  const testemunhas = watch("testemunhas") || [];
  const corretor = watch("corretor");

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit: SubmitHandler<ContratoFormData> = (data) => {
    const html = gerarTextoContrato(data as any);
    setContratoHTML(html);
  };

  const addVendedor = () => {
    if (vendedoresFields.length < 2) {
      appendVendedor({ tipo: "pf", nome: "", nacionalidade: "Brasileiro(a)", estadoCivil: "solteiro", profissao: "", rg: "", cpf: "", endereco: { rua: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", estado: "SP" } });
    }
  };

  const addComprador = () => {
    if (compradoresFields.length < 2) {
      appendComprador({ tipo: "pf", nome: "", nacionalidade: "Brasileiro(a)", estadoCivil: "solteiro", profissao: "", rg: "", cpf: "", endereco: { rua: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", estado: "SP" } });
    }
  };

  const setTestemunhas = (qtd: number) => {
    const arr = [];
    for (let i = 0; i < qtd; i++) arr.push({ nome: "", cpf: "", rg: "" });
    setValue("testemunhas", arr);
  };

  const temCorretor = corretor !== null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-xl">Gerador de Contrato - Compra e Venda de Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between mb-6 text-xs sm:text-sm gap-1">
            {steps.map((step, idx) => (
              <div key={idx} className={`flex-1 text-center px-1 py-2 rounded cursor-pointer ${idx === currentStep ? "bg-blue-600 text-white" : idx < currentStep ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`} onClick={() => setCurrentStep(idx)}>
                {idx + 1}. {step}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Dados do(s) Vendedor(es)</h3>
                  <Button type="button" onClick={addVendedor} disabled={vendedoresFields.length >= 2} variant="outline" size="sm">+ Adicionar Vendedor</Button>
                </div>
                {vendedoresFields.map((field, index) => (
                  <ParteForm key={field.id} prefix={`vendedores.${index}`} control={control} register={register} setValue={setValue} watch={watch} index={index} remove={() => removeVendedor(index)} canRemove={vendedoresFields.length > 1} tipo="Vendedor" />
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Dados do(s) Comprador(es)</h3>
                  <Button type="button" onClick={addComprador} disabled={compradoresFields.length >= 2} variant="outline" size="sm">+ Adicionar Comprador</Button>
                </div>
                {compradoresFields.map((field, index) => (
                  <ParteForm key={field.id} prefix={`compradores.${index}`} control={control} register={register} setValue={setValue} watch={watch} index={index} remove={() => removeComprador(index)} canRemove={compradoresFields.length > 1} tipo="Comprador" />
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Dados do Imóvel</h3>
                <EnderecoForm prefix="imovel.endereco" register={register} setValue={setValue} watch={watch} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Matrícula do Imóvel</Label>
                    <Input {...register("imovel.matricula")} placeholder="Ex: 12345" />
                  </div>
                  <div>
                    <Label>Cartório de Registro</Label>
                    <Input {...register("imovel.cartorioRegistro")} placeholder="Ex: 1º Ofício de Registro de Imóveis" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Inscrição Municipal (IPTU)</Label>
                    <Input {...register("imovel.inscricaoMunicipal")} placeholder="Ex: 123.456.7890" />
                  </div>
                  <div>
                    <Label>Área (m²)</Label>
                    <Input type="number" step="0.01" {...register("imovel.area", { valueAsNumber: true })} placeholder="Ex: 250" />
                  </div>
                </div>
                <div>
                  <Label>Descrição do Imóvel</Label>
                  <textarea {...register("imovel.descricao")} className="w-full p-2 border rounded min-h-[80px]" placeholder="Descreva o imóvel (casa, terreno, etc.)" />
                </div>
                <div>
                  <Label>Confrontações (opcional)</Label>
                  <Input {...register("imovel.confrontacoes")} placeholder="Ex: Norte: Rua X, Sul: Terreno de Fulano..." />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Situação de Ocupação</h3>
                  <Select onValueChange={(v) => setValue("ocupacao", v as any)} defaultValue={watch("ocupacao")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uso_proprio_vendedor">Em uso próprio do vendedor</SelectItem>
                      <SelectItem value="alugado_arrendado">Alugado ou arrendado a terceiros</SelectItem>
                      <SelectItem value="financiamento_quitado">Em financiamento, já quitado</SelectItem>
                      <SelectItem value="financiamento_vendedor_quita">Em financiamento, vendedor quita com parte da venda</SelectItem>
                      <SelectItem value="financiamento_comprador_assume">Em financiamento, comprador assume o saldo</SelectItem>
                      <SelectItem value="financiamento_vendedor_quita_antes">Em financiamento, vendedor quita antes da assinatura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Débitos do Imóvel</h3>
                  <Select onValueChange={(v) => setValue("debitos", v as any)} defaultValue={watch("debitos")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sem_debitos">Não há débitos pendentes</SelectItem>
                      <SelectItem value="vendedor_quita_antes">Há débitos, vendedor quita antes</SelectItem>
                      <SelectItem value="comprador_assume">Há débitos, comprador assume</SelectItem>
                      <SelectItem value="dividido_50_50">Há débitos, dividem 50/50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">Intermediação (Corretor)</h3>
                  <div className="flex gap-4 mb-3">
                    <Button
                      type="button"
                      onClick={() => setValue("corretor", null)}
                      variant={!temCorretor ? "default" : "outline"}
                      size="sm"
                    >
                      Não houve corretor
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setValue("corretor", { nome: "", creci: "", tipoComissao: "porcentagem", valorComissao: 0, quemPaga: "vendedor" })}
                      variant={temCorretor ? "default" : "outline"}
                      size="sm"
                    >
                      Houve corretor
                    </Button>
                  </div>

                  {temCorretor && corretor && (
                    <div className="border p-4 rounded space-y-4 bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome do Corretor</Label>
                          <Input
                            value={corretor.nome}
                            onChange={(e) => setValue("corretor", { ...corretor, nome: e.target.value })}
                            placeholder="Nome completo do corretor"
                          />
                        </div>
                        <div>
                          <Label>CRECI</Label>
                          <Input
                            value={corretor.creci}
                            onChange={(e) => setValue("corretor", { ...corretor, creci: e.target.value })}
                            placeholder="Ex: 12345-SP"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo de Comissão</Label>
                          <Select
                            onValueChange={(v) => setValue("corretor", { ...corretor, tipoComissao: v as "porcentagem" | "valor_fixo" })}
                            defaultValue={corretor.tipoComissao}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="porcentagem">Porcentagem (%)</SelectItem>
                              <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>
                            {corretor.tipoComissao === "porcentagem" ? "Percentual da Comissão (%)" : "Valor da Comissão (R$)"}
                          </Label>
                          {corretor.tipoComissao === "porcentagem" ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={corretor.valorComissao}
                              onChange={(e) => setValue("corretor", { ...corretor, valorComissao: parseFloat(e.target.value) || 0 })}
                              placeholder="Ex: 5"
                            />
                          ) : (
                            <Input
                              value={corretor.valorComissao ? maskMoney(String(corretor.valorComissao * 100)) : ""}
                              onChange={(e) => setValue("corretor", { ...corretor, valorComissao: unmaskMoney(e.target.value) })}
                              placeholder="R$ 0,00"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Quem paga a comissão?</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={corretor.quemPaga === "vendedor"}
                              onChange={() => setValue("corretor", { ...corretor, quemPaga: "vendedor" })}
                            />
                            Vendedor
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={corretor.quemPaga === "comprador"}
                              onChange={() => setValue("corretor", { ...corretor, quemPaga: "comprador" })}
                            />
                            Comprador
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={corretor.quemPaga === "dividido_50_50"}
                              onChange={() => setValue("corretor", { ...corretor, quemPaga: "dividido_50_50" })}
                            />
                            Dividido 50/50
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Forma de Pagamento</h3>
                  <Select onValueChange={(v) => setValue("formaPagamento", v as any)} defaultValue={watch("formaPagamento")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avista">À vista</SelectItem>
                      <SelectItem value="sinal_resto_avista">Sinal + resto à vista</SelectItem>
                      <SelectItem value="sinal_financiamento">Sinal + financiamento bancário</SelectItem>
                      <SelectItem value="parcelado_vendedor">Parcelado direto com o vendedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Total do Imóvel</Label>
                    <Input
                      value={watch("valorTotal") ? maskMoney(String(watch("valorTotal") * 100)) : ""}
                      onChange={(e) => setValue("valorTotal", unmaskMoney(e.target.value))}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  {(formaPagamento === "sinal_resto_avista" || formaPagamento === "sinal_financiamento") && (
                    <div>
                      <Label>Valor do Sinal</Label>
                      <Input
                        value={watch("valorSinal") ? maskMoney(String((watch("valorSinal") || 0) * 100)) : ""}
                        onChange={(e) => setValue("valorSinal", unmaskMoney(e.target.value))}
                        placeholder="R$ 0,00"
                      />
                    </div>
                  )}
                </div>

                {formaPagamento === "parcelado_vendedor" && (
                  <div className="space-y-4 border p-4 rounded bg-gray-50">
                    <h4 className="font-bold">Dados das Parcelas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Quantidade de Parcelas</Label>
                        <Input type="number" {...register("parcelas.quantidade", { valueAsNumber: true })} placeholder="Ex: 12" />
                      </div>
                      <div>
                        <Label>Valor de Cada Parcela</Label>
                        <Input
                          value={watch("parcelas.valor") ? maskMoney(String((watch("parcelas.valor") || 0) * 100)) : ""}
                          onChange={(e) => setValue("parcelas.valor", unmaskMoney(e.target.value))}
                          placeholder="R$ 0,00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Vencimento da 1ª Parcela</Label>
                        <Input type="date" {...register("parcelas.vencimentoPrimeira")} />
                      </div>
                      <div>
                        <Label>Periodicidade</Label>
                        <Select onValueChange={(v) => setValue("parcelas.periodicidade", v as any)} defaultValue={watch("parcelas.periodicidade") || "mensal"}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="bimestral">Bimestral</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Multa por Atraso (%)</Label>
                        <Input type="number" step="0.1" {...register("multaAtraso", { valueAsNumber: true })} />
                      </div>
                      <div>
                        <Label>Juros ao Mês (%)</Label>
                        <Input type="number" step="0.1" {...register("jurosMes", { valueAsNumber: true })} />
                      </div>
                      <div>
                        <Label>Dias p/ Desfazer Venda</Label>
                        <Input type="number" {...register("diasToleranciaDesfazer", { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div>
                      <Label>Correção Monetária</Label>
                      <Select onValueChange={(v) => setValue("correcaoMonetaria", v as any)} defaultValue={watch("correcaoMonetaria")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixa">Fixa, sem correção</SelectItem>
                          <SelectItem value="ipca_12_meses">Corrigida pelo IPCA a cada 12 meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold mb-2">Forma de Recebimento</h3>
                  <Select onValueChange={(v) => setValue("formaRecebimento", v as any)} defaultValue={watch("formaRecebimento")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro em Espécie</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {formaRecebimento === "outro" && (
                    <div className="mt-2">
                      <Input {...register("formaRecebimentoOutro")} placeholder="Especifique a forma de recebimento" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Multa por Quebra de Contrato (%)</Label>
                    <Input type="number" step="0.1" {...register("multaQuebra", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Prazo p/ Escritura (dias)</Label>
                    <Input type="number" {...register("prazoEscritura", { valueAsNumber: true })} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">Desistência da Negociação</h3>
                  <Select onValueChange={(v) => setValue("desistencia", v as any)} defaultValue={watch("desistencia")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao_permite">Não, negócio firme</SelectItem>
                      <SelectItem value="sim_com_prazo">Sim, com prazo para desistir</SelectItem>
                    </SelectContent>
                  </Select>
                  {desistencia === "sim_com_prazo" && (
                    <div className="mt-2">
                      <Label>Prazo para Desistir (dias)</Label>
                      <Input type="number" {...register("prazoDesistencia", { valueAsNumber: true })} placeholder="Ex: 7" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">Custos de Transferência (ITBI + Cartório)</h3>
                  <Select onValueChange={(v) => setValue("custoTransferencia", v as any)} defaultValue={watch("custoTransferencia")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprador">Pago pelo Comprador</SelectItem>
                      <SelectItem value="vendedor">Pago pelo Vendedor</SelectItem>
                      <SelectItem value="dividido_50_50">Dividido Igualmente (50/50)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">Quando o Comprador Recebe a Posse</h3>
                  <Select onValueChange={(v) => setValue("posse", v as any)} defaultValue={watch("posse")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagamento_concluido">Após pagamento concluído</SelectItem>
                      <SelectItem value="assinatura_contrato">Na assinatura do contrato</SelectItem>
                      <SelectItem value="data_combinada">Em data combinada</SelectItem>
                    </SelectContent>
                  </Select>
                  {posse === "data_combinada" && (
                    <div className="mt-2">
                      <Input type="date" {...register("dataPosseCombinada")} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Testemunhas</h3>
                  <div className="flex gap-4 mb-4">
                    <Button type="button" onClick={() => setTestemunhas(0)} variant={testemunhas.length === 0 ? "default" : "outline"} size="sm">Nenhuma</Button>
                    <Button type="button" onClick={() => setTestemunhas(1)} variant={testemunhas.length === 1 ? "default" : "outline"} size="sm">1 Testemunha</Button>
                    <Button type="button" onClick={() => setTestemunhas(2)} variant={testemunhas.length === 2 ? "default" : "outline"} size="sm">2 Testemunhas</Button>
                  </div>
                  {testemunhas.map((t: any, index: number) => {
                    const { onChange: onChangeNome, ...nomeRest } = register(`testemunhas.${index}.nome`);
                    const { onChange: onChangeCpf, ...cpfRest } = register(`testemunhas.${index}.cpf`);
                    const { onChange: onChangeRg, ...rgRest } = register(`testemunhas.${index}.rg`);
                    return (
                      <div key={index} className="border p-4 rounded mb-2 space-y-2">
                        <h4 className="font-bold">Testemunha {index + 1}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input {...nomeRest} onChange={onChangeNome} placeholder="Nome completo" />
                          <Input {...cpfRest} onChange={(e) => { e.target.value = maskCPF(e.target.value); onChangeCpf(e); }} placeholder="CPF" />
                          <Input {...rgRest} onChange={onChangeRg} placeholder="RG" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Local de Assinatura</Label>
                    <Input {...register("localAssinatura")} placeholder="Ex: São Paulo/SP" />
                  </div>
                  <div>
                    <Label>Data do Contrato</Label>
                    <Input {...register("dataContrato")} placeholder="Ex: 10 de agosto de 2026" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Preview do Contrato</h3>
                  <Button type="button" onClick={() => gerarPDF(contratoHTML)} className="bg-green-600 hover:bg-green-700">
                    📄 Gerar PDF
                  </Button>
                </div>
                <div id="contrato-preview" className="border rounded p-4 bg-white overflow-auto max-h-[600px]">
                  <div dangerouslySetInnerHTML={{ __html: contratoHTML }} />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button type="button" onClick={prevStep} disabled={currentStep === 0} variant="outline">← Anterior</Button>
              {currentStep === 6 && (
               <Button type="button" onClick={handleSubmit((data) => {
                  const html = gerarTextoContrato(data as any);
                  setContratoHTML(html);
                  nextStep();
                })} className="bg-blue-600 hover:bg-blue-700">
                  Gerar Contrato →
                </Button>
              )}
              {currentStep < 6 && (
                <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                  Próximo →
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ParteForm({ prefix, control, register, setValue, watch, index, remove, canRemove, tipo }: any) {
  const watchTipo = useWatch({ control, name: `${prefix}.tipo` }) || "pf";

  return (
    <div className="border p-4 rounded space-y-3 bg-gray-50">
      <div className="flex justify-between items-center">
        <h4 className="font-bold">{tipo} {index + 1}</h4>
        {canRemove && <Button type="button" onClick={remove} variant="destructive" size="sm">Remover</Button>}
      </div>
      
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="pf" {...register(`${prefix}.tipo`)} defaultChecked />
          Pessoa Física
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="pj" {...register(`${prefix}.tipo`)} />
          Pessoa Jurídica
        </label>
      </div>

      {watchTipo === "pf" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input {...register(`${prefix}.nome`)} placeholder="Nome completo" />
            <Input {...register(`${prefix}.nacionalidade`)} placeholder="Nacionalidade" defaultValue="Brasileiro(a)" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select {...register(`${prefix}.estadoCivil`)} className="border rounded p-2">
              {estadosCivis.map((ec) => <option key={ec.value} value={ec.value}>{ec.label}</option>)}
            </select>
            <Input {...register(`${prefix}.profissao`)} placeholder="Profissão" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input {...register(`${prefix}.rg`)} placeholder="RG" />
            <MaskedInput register={register} setValue={setValue} name={`${prefix}.cpf`} mask={maskCPF} placeholder="CPF" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input {...register(`${prefix}.razaoSocial`)} placeholder="Razão Social" />
            <MaskedInput register={register} setValue={setValue} name={`${prefix}.cnpj`} mask={maskCNPJ} placeholder="CNPJ" />
          </div>
          <Input {...register(`${prefix}.nire`)} placeholder="NIRE (opcional)" />
          <Separator className="my-2" />
          <p className="text-sm font-bold text-gray-600">Representante Legal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input {...register(`${prefix}.representante.nome`)} placeholder="Nome do representante" />
            <Input {...register(`${prefix}.representante.cargo`)} placeholder="Cargo" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <MaskedInput register={register} setValue={setValue} name={`${prefix}.representante.cpf`} mask={maskCPF} placeholder="CPF" />
            <Input {...register(`${prefix}.representante.rg`)} placeholder="RG" />
            <Input {...register(`${prefix}.representante.nacionalidade`)} placeholder="Nacionalidade" defaultValue="Brasileiro(a)" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input {...register(`${prefix}.representante.estadoCivil`)} placeholder="Estado civil" />
            <Input {...register(`${prefix}.representante.profissao`)} placeholder="Profissão" />
          </div>
        </>
      )}

      <Separator className="my-2" />
      <p className="text-sm font-bold text-gray-600">Endereço</p>
      <EnderecoForm prefix={`${prefix}.endereco`} register={register} setValue={setValue} watch={watch} />
    </div>
  );
}

function EnderecoForm({ prefix, register, setValue, watch }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Input {...register(`${prefix}.rua`)} placeholder="Rua" />
      <Input {...register(`${prefix}.numero`)} placeholder="Número" />
      <Input {...register(`${prefix}.complemento`)} placeholder="Complemento (opcional)" />
      <Input {...register(`${prefix}.bairro`)} placeholder="Bairro" />
      <MaskedInput register={register} setValue={setValue} name={`${prefix}.cep`} mask={maskCEP} placeholder="CEP" />
      <Input {...register(`${prefix}.cidade`)} placeholder="Cidade" />
      <select {...register(`${prefix}.estado`)} className="border rounded p-2">
        {estados.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
      </select>
    </div>
  );
}

function MaskedInput({ register, setValue, name, mask, placeholder }: any) {
  const { onChange, ...rest } = register(name);
  return (
    <Input
      {...rest}
      placeholder={placeholder}
      onChange={(e) => {
        const v = mask(e.target.value);
        e.target.value = v;
        onChange(e);
        setValue(name, v, { shouldValidate: false, shouldDirty: true });
      }}
    />
  );
}