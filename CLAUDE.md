# quotation-hub-wms-api

## O que é esse projeto
API REST em Fastify + TypeScript que gerencia Sellers, Centros de Distribuição e
sistemas externos integrados. É o source of truth para o hub de cotações buscar
credenciais e configurações por seller_id, independente de qual warehouse for usado.

Faz parte do ecossistema da Squad Quotation (Intelipost).

## Database
PostgreSQL — banco: `quotation-hub`

### Tabelas e relacionamentos
- `sellers` — embarcadores com api_key própria (autenticação na nossa API)
- `distribution_centers` — CDs do seller, relação 1:N
  - Contém campos da API Intelipost "Criar Origem": origin_warehouse_code, nome_oficial,
    cnpj, endereço completo, tms_id
- `external_systems` — sistema externo (WMS/ERP/OMS) vinculado ao SELLER, não ao CD
  - Vinculado ao seller porque o hub precisa das credenciais por seller_id,
    independente de qual dos N warehouses origina a cotação
  - Suporta auth_type: api_key | bearer_token | basic_auth | oauth2 | custom
  - extra_fields JSONB para autenticações fora do padrão

### Query principal do hub de cotações
```sql
SELECT * FROM external_systems
WHERE seller_id = $1 AND ativo = TRUE;
```

## Stack
- Node.js + TypeScript
- Fastify (mesmo ecossistema do quotation-hub-adapter)
- PostgreSQL via `postgres` lib (sem ORM)
- Zod para validação de schemas
- Vitest para testes
- Docker para deploy no Easypanel

## Arquitetura em camadas (padrão iplink-app-lp da IP)