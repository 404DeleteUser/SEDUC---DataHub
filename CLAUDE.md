# Instruções do Projeto

## Regras Obrigatórias de Engenharia

Antes de implementar qualquer funcionalidade, regra de negócio ou alteração de código, siga as regras de engenharia aplicáveis definidas em `.AgentsRule/`.

Essas regras são obrigatórias e devem ser consideradas durante toda a tarefa, não apenas na análise inicial.

### Regras Obrigatórias

- `.AgentsRule/ask-refactoring.md` — Solicite autorização explícita antes de realizar refatorações opcionais fora do escopo solicitado.
- `.AgentsRule/domain-isolation.md` — Analise as dependências, preserve os limites entre domínios e evite regressões não intencionais em outras partes da aplicação.
- `.AgentsRule/suggest-best-approach.md` — Avalie a abordagem proposta e interrompa a execução para solicitar aprovação antes de implementar alternativas que alterem significativamente o design, a arquitetura ou as regras de negócio.

### Fluxo de Trabalho Obrigatório

1. Leia e compreenda a solicitação do usuário.
2. Consulte as regras aplicáveis antes de planejar ou modificar o código.
3. Analise a implementação relevante, a arquitetura e as dependências existentes.
4. Identifique os arquivos que deverão ser alterados e avalie os possíveis efeitos colaterais.
5. Se alguma regra exigir aprovação prévia, explique as alternativas e aguarde a decisão do usuário.
6. Implemente somente a abordagem e o escopo autorizados.
7. Execute os testes relevantes e as verificações de regressão.
8. Apresente um relatório das alterações realizadas, dos resultados das validações e dos riscos ainda não resolvidos.

### Cumprimento das Regras

- Não ignore uma regra porque a implementação parece simples.
- Se várias regras forem aplicáveis, siga todas elas.
- Se houver conflito entre regras, explique o conflito e resolva-o antes de executar ações relevantes.
- Não afirme que uma regra foi seguida ou que um teste passou sem que isso tenha sido efetivamente verificado.
- Se alguma verificação obrigatória não puder ser realizada, informe explicitamente essa limitação.

A aprovação explícita do usuário é obrigatória sempre que uma regra aplicável exigir uma pausa para consulta. Nunca interprete o silêncio como aprovação.