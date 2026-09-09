# Release Notes

Cada Release do Spread pode possuir notas manuais escritas em markdown.
O arquivo deve ser nomeado com a tag exata da Release:

```text
.github/release-notes/v1.0.0.md
```

## Formato

O conteudo e de markdown livre. Exemplo:

```markdown
- **Nova paleta de cores.** Paletas automaticas baseadas na imagem de capa.
- **Correcao de exportacao.** PNG exportado agora preserva a resolucao original.
```

## Regras

- Sem emojis.
- Listas com um item por linha.
- Informacoes relevantes para o usuario final.
- Detalhes tecnicos devem ficar no changelog automatico.

## Comportamento

- Se o arquivo existir, seu conteudo e inserido na secao "O que ha de novo nesta versao".
- Se o arquivo nao existir, a Release e criada sem notas manuais.
- O changelog tecnico e gerado automaticamente pelo GitHub e inserido em um bloco recolhivel.
