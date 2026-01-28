# ANTIGRAVITY — Centro de Gravidade

## 🎯 Sistema Completo de Acompanhamento Operacional

**Um espaço diário para manter a operação sob controle, sem peso mental.**

Clareza, direção e impacto — sem ruído, sem culpa, sem caos.

---

## ✅ Status: 100% Funcional

O sistema está rodando em **http://localhost:3000**

### O que foi implementado:

#### 🟢 Tela 1 — Check Diário (Consciência)
- ✅ "Antes de fazer mais, entenda como o dia realmente está."
- ✅ 5 perguntas fixas com seleção visual
- ✅ Limite de 140 caracteres no gargalo
- ✅ Contador de caracteres em tempo real
- ✅ Mensagem de encerramento: "Você não precisa resolver tudo hoje. Só enxergar com clareza."

#### 🟡 Tela 2 — Semana Viva (Direção)
- ✅ "Uma boa semana não é a que faz tudo. É a que move o que importa."
- ✅ Centro da semana obrigatório
- ✅ Alerta "Sem foco definido" quando vazio
- ✅ Gestão de projetos com dependências
- ✅ Mensagem de encerramento: "Se tudo é prioridade, nada é."

#### 🔵 Tela 3 — Impacto (Prova de Valor)
- ✅ "Nem todo valor aparece em métricas. Aqui, ele fica visível."
- ✅ Checklists de impacto (Operação, Conteúdo, Comercial)
- ✅ Campo de reflexão: "O que não teria acontecido sem sua atuação?"
- ✅ Exportação para clipboard
- ✅ Histórico de registros

#### 🔴 Tela 4 — Alertas Humanos (Proteção)
- ✅ "Alertas não são cobranças. São sinais de cuidado."
- ✅ 8 alertas inteligentes baseados em padrões
- ✅ Tom sempre cuidadoso, nunca acusatório
- ✅ Sistema de dispensar alertas

---

## 🎨 Design Premium

### Estética
- ✅ Dark theme elegante (slate profundo)
- ✅ Tipografia Inter (Google Fonts via next/font)
- ✅ Glassmorphism com backdrop blur
- ✅ Animações suaves (fadeIn, slideIn)
- ✅ Transições de 150-350ms
- ✅ Scrollbar customizado

### Cores
- 🟢 Emerald (#10b981) - Positivo, progresso
- 🟡 Amber (#f59e0b) - Atenção, cautela
- 🔴 Rose (#f43f5e) - Alerta, urgência
- ⚪ Slate (gradiente) - Backgrounds e textos

### Responsividade
- ✅ Mobile-first design
- ✅ Breakpoints: 375px, 768px, 1440px
- ✅ Grid adaptativo
- ✅ Touch-friendly

---

## 💾 Persistência

### LocalStorage
- `antigravity_daily_checks` - Últimos 90 dias
- `antigravity_weekly_plans` - Últimas 12 semanas
- `antigravity_impact_logs` - Sem limite
- `antigravity_dismissed_alerts` - Sem limite

### Funcionalidades
- ✅ Auto-save em todas as telas
- ✅ Validação de dados
- ✅ Exportação JSON
- ✅ Importação de backup

---

## 🧠 Inteligência

### Alertas Baseados em Padrões

1. **Sustentando demais sozinha** - ≥3 dias vermelhos em 2 semanas
2. **Foco mudando muito** - ≥3 focos diferentes em 4 semanas
3. **Dependência comercial** - >50% checks desalinhados
4. **Conteúdo sem propósito** - ≥3 semanas sem tema
5. **Modo crise** - ≥5 gargalos em 2 semanas
6. **Sem planejamento** - Nenhum plano recente
7. **Tendência negativa** - ≥3 previsões "pior"
8. **Projetos travados** - >50% não avançando

---

## 🚀 Como Usar

### Primeira Vez
1. Acesse http://localhost:3000
2. Faça seu primeiro Check Diário (5-7 min)
3. Planeje sua Semana Viva (20-30 min)
4. Registre seu Impacto (10-15 min)
5. Veja os Alertas conforme usa o sistema

### Rotina Recomendada
- **Diário**: Check ao final do dia
- **Semanal**: Planejamento toda segunda
- **Quinzenal**: Registro de impacto
- **Quando necessário**: Revisar alertas

---

## 📁 Estrutura Técnica

```
ferramenta-antigravity/
├── app/
│   ├── layout.tsx          # Inter font + metadata
│   ├── page.tsx            # Dashboard com navegação
│   └── globals.css         # Design system
├── components/
│   ├── CheckDiario.tsx     # Tela 1
│   ├── SemanaViva.tsx      # Tela 2
│   ├── Impacto.tsx         # Tela 3
│   └── AlertasHumanos.tsx  # Tela 4
├── lib/
│   ├── storage.ts          # Persistência
│   ├── date-utils.ts       # Datas em PT-BR
│   └── alert-engine.ts     # Análise de padrões
└── package.json
```

### Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- date-fns (PT-BR)
- Lucide React (ícones)

---

## ✨ Princípios Cumpridos

### ✅ Sem Culpa
- Linguagem acolhedora em todo o sistema
- Alertas são sugestões, não cobranças
- Foco em consciência, não punição

### ✅ Rápido
- Check diário: <7 minutos
- Planejamento semanal: <30 minutos
- Impacto: <15 minutos
- Total: <10 min/dia em média

### ✅ Simples
- Zero configuração
- Zero integrações
- Zero complexidade
- Apenas abrir e usar

### ✅ Humano
- Português em todo o sistema
- Tom respeitoso e cuidadoso
- Emojis para clareza visual
- Mensagens que acolhem

### ✅ Premium
- Design elegante e moderno
- Atenção aos detalhes
- Animações suaves
- Experiência fluida

---

## 🎯 Resultado Final

Este sistema:
- ✅ Reduz peso mental
- ✅ Cria clareza diária
- ✅ Organiza sem engessar
- ✅ Protege energia
- ✅ Gera argumento racional de valor

**Ele existe para sustentar quem sustenta a empresa.**

---

## 🔧 Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Limpar cache
rm -rf .next

# Instalar dependências
npm install
```

---

## 📝 Notas Importantes

1. **Dados locais**: Tudo fica no navegador (localStorage)
2. **Sem sync**: Não sincroniza entre dispositivos
3. **Privacidade total**: Nenhum dado sai do seu computador
4. **Backup manual**: Use a função de exportar dados

---

**Acesse agora**: http://localhost:3000

Sistema criado para sustentar quem sustenta o negócio. 💚
