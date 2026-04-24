# Analisar fluxo quebrado

## ORDEM (seguir exatamente)

1. FRONTEND
- request está sendo feito?
- envia project_id?

2. BACKEND
- função é chamada?
- usa project_id?
- fluxo para após salvar?

3. BANCO
- registro foi criado?
- status correto?

4. RESULTADO
- estoque mudou?
- financeiro criado?
- dashboard reflete?

---

## REGRAS

- não recriar sistema
- achar erro direto
- parar ao encontrar erro

---

## SAÍDA

retornar apenas:
- erro
- causa
- correção