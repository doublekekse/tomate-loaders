type LineConsumer = (line: string) => void;

export function liner(lineConsumer: LineConsumer) {
  let buffer = ''; // TODO Is there a StringBuilder in js?
  return (data: string) => {
    buffer += data;

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for(let i = 0; i < lines.length; i++) {
      lineConsumer(lines[i]);
    }
  }
}
