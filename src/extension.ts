import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('kurilov-defence.startTraining', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const source = editor.document.getText();
      const fn = findLongestFunction(source);
      if (!fn) {
        vscode.window.showInformationMessage('No function found.');
        return;
      }

      const attempt =
        source.slice(0, fn.open + 1) +
        '\n  // Rewrite this function from memory.\n' +
        source.slice(fn.close);
      const document = await vscode.workspace.openTextDocument({
        language: editor.document.languageId,
        content: attempt,
      });

      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage(`Rewrite ${fn.name} (${fn.lines} lines).`);
    }),
  );
}

function findLongestFunction(source: string) {
  const code = source.replace(
    /\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    (part) => part.replace(/[^\r\n]/g, ' '),
  );
  const pattern = /\b([A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)\s*\([^;{}]*\)\s*(?:const\s*)?(?:noexcept\s*)?\{/g;
  const ignored = ['if', 'for', 'while', 'switch', 'catch'];
  let longest: { name: string; open: number; close: number; lines: number } | undefined;

  for (const match of code.matchAll(pattern)) {
    if (ignored.includes(match[1])) continue;

    const open = match.index! + match[0].length - 1;
    let depth = 1;
    let close = open + 1;

    while (close < code.length && depth > 0) {
      if (code[close] === '{') depth++;
      if (code[close] === '}') depth--;
      close++;
    }
    if (depth !== 0) continue;

    close--;
    const lines = source.slice(match.index, close + 1).split(/\r?\n/).length;
    if (!longest || lines > longest.lines) {
      longest = { name: match[1], open, close, lines };
    }
  }

  return longest;
}
