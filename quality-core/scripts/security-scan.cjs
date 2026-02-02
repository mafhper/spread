/**
 * Security Scan - Procura por secrets e chaves expostas
 */
const { execSync } = require('child_process')

const PATTERNS = [
  'api_key =',
  'api_key:',
  'secret =',
  'secret:',
  'password =',
  'password:',
  'token =',
  'token:',
  'sk_live_',
  '-----BEGIN RSA PRIVATE KEY-----',
]

console.log('Iniciando scan de seguranca...')

let issues = 0

try {
  // Ignorar node_modules, dist, locks e arquivos de infra
  for (const pattern of PATTERNS) {
    try {
      const command =
        process.platform === 'win32'
          ? `git grep -i -F "${pattern}" -- ":!node_modules" ":!dist" ":!package-lock.json" ":!bun.lock" ":!quality-core/scripts/security-scan.cjs" ":!*.lock" ":!.github/workflows/*" ":!.gitignore" ":!*.lockb" ":!quality-core/cli/run.cjs"`
          : `grep -rEi "${pattern}" . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude="quality-core/scripts/security-scan.cjs" --exclude="*.lock" --exclude-dir=".github" --exclude=".gitignore" --exclude="run.cjs" --exclude="package-lock.json"`

      const output = execSync(command, { encoding: 'utf8' })
      if (output) {
        console.log(
          `[HIGH] Possivel segredo encontrado para padrao "${pattern}":`
        )
        console.log(output.split('\n').slice(0, 3).join('\n'))
        issues++
      }
    } catch {
      // grep retorna exit code 1 se nao encontrar nada, o que eh o esperado
    }
  }

  if (issues > 0) {
    console.log(`\nTotal de problemas: ${issues}`)
    // Nao vamos travar o build ainda, apenas reportar HIGH
    process.exit(0)
  } else {
    console.log('OK: Nenhum segredo obvio encontrado.')
    process.exit(0)
  }
} catch (err) {
  console.error('Erro ao executar scan:', err.message)
  process.exit(0)
}
