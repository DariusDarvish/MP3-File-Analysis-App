export function isXingHeaderFrame(
  buffer: Buffer,
  offset: number,
  frameLength: number,
  channelMode: number,
): boolean {
  const frameData = buffer.subarray(offset, offset + frameLength);

  const isMono = channelMode === 3;

  const xingOffset = isMono ? 21 : 36;

  const header = frameData
    .subarray(xingOffset, xingOffset + 4)
    .toString("ascii");

  return header === "Xing" || header === "Info";
}
