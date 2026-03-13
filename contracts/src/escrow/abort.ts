export function abort(message: u32, fileName: u32, lineNumber: u32, columnNumber: u32): void {
  unreachable();
}

declare function unreachable(): never;
