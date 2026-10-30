// Copies the PHP backend into the static export and zips it → site.zip (ready for Hostinger).
import { execSync } from 'child_process';
import { cpSync, existsSync, rmSync } from 'fs';

if (!existsSync('out')) {
  console.error('✗ out/ not found — run `next build` first');
  process.exit(1);
}
cpSync('backend', 'out', { recursive: true });
// Never ship real settings; the server keeps its own api/config.php.
rmSync('out/api/config.php', { force: true });

try {
  rmSync('site.zip', { force: true });
  execSync('cd out && zip -rq ../site.zip . -x "*.DS_Store"', { stdio: 'inherit' });
  console.log('\n✓ site.zip جاهز — ارفعه في public_html وفكّه (Extract).\n');
} catch {
  console.log('\n✓ Ready: اضغط محتويات مجلد "out" في ملف zip وارفعه في public_html.\n');
}
