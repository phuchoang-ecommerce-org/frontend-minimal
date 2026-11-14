import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = mkdtempSync(join(tmpdir(), 'market-contract-'));
try {
  const output = join(dir, 'contract.generated.ts');
  const result = spawnSync('pnpm', ['exec', 'openapi-typescript', '../docs-minimal/SolutionArchitecture/api-contract/openapi.yaml', '-o', output], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  if (readFileSync(output, 'utf8') !== readFileSync('src/lib/contract.generated.ts', 'utf8')) { console.error('Generated contract differs. Run pnpm contract:generate.'); process.exit(1); }
} finally { rmSync(dir, { recursive: true, force: true }); }
